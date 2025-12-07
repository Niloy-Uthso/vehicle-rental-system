import { pool } from "../../config/db";

interface BookingInput {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}
interface UpdateBookingInput {
  bookingId: number;
  status: "cancelled" | "returned";
  user: Express.Request["user"];
}

const createBooking = async (data: BookingInput) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = data;

   
  const vehicleResult = await pool.query(
    `SELECT vehicle_name, daily_rent_price FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );

  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];

  
  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);

  const diffDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) {
    throw new Error("Invalid date range");
  }

  const total_price = diffDays * Number(vehicle.daily_rent_price);

  
  const bookingResult = await pool.query(
    `
    INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
    VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
  `,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  const booking = bookingResult.rows[0];

   
  await pool.query(
    `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
    [vehicle_id]
  );

   
  return {
    ...booking,
    rent_start_date,
    rent_end_date,
    total_price,
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: Number(vehicle.daily_rent_price),
    },
  };
};
const getAllBookings = async (user: any) => {
  if (user.role === "admin") {
     
    const result = await pool.query(`
      SELECT 
        b.id, b.customer_id, b.vehicle_id, 
        TO_CHAR(b.rent_start_date, 'YYYY-MM-DD') AS rent_start_date,
        TO_CHAR(b.rent_end_date, 'YYYY-MM-DD') AS rent_end_date,
        b.total_price, b.status,
        
        u.name AS customer_name,
        u.email AS customer_email,

        v.vehicle_name,
        v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id ASC
    `);

    return result.rows.map((row) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: Number(row.total_price),
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    }));
  }

  
  const result = await pool.query(
    `
    SELECT 
      b.id, b.vehicle_id,
      TO_CHAR(b.rent_start_date, 'YYYY-MM-DD') AS rent_start_date,
      TO_CHAR(b.rent_end_date, 'YYYY-MM-DD') AS rent_end_date,
      b.total_price, b.status,

      v.vehicle_name,
      v.registration_number,
      v.type
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.id ASC
  `,
    [user.id]
  );

  return result.rows.map((row) => ({
    id: row.id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: Number(row.total_price),
    status: row.status,
    vehicle: {
      vehicle_name: row.vehicle_name,
      registration_number: row.registration_number,
      type: row.type,
    },
  }));
};



  const updateBooking = async ({ bookingId, status, user }: UpdateBookingInput) => {
  
  const bookingRes = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
  if (bookingRes.rows.length === 0) throw new Error("Booking not found");

  const booking = bookingRes.rows[0];

   
  if (user?.role === "customer" && booking.customer_id !== user.id) {
    throw new Error("You can only modify your own bookings");
  }

  const today = new Date();
  const rentStart = new Date(booking.rent_start_date);

   
  if (user?.role === "customer") {
    if (status === "cancelled" && today >= rentStart) {
      throw new Error("Cannot cancel booking after start date");
    }
    if (status === "returned") {
      throw new Error("Customers cannot mark booking as returned");
    }
  }

  if (user?.role === "admin") {
    if (status === "cancelled") {
      throw new Error("Admin cannot cancel booking; use 'returned' instead");
    }
  }

   
  await pool.query(`UPDATE bookings SET status = $1 WHERE id = $2`, [status, bookingId]);

   
  if (status === "cancelled" || status === "returned") {
    await pool.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [
      booking.vehicle_id,
    ]);
  }

  
  const response: any = {
    id: booking.id,
    customer_id: booking.customer_id,
    vehicle_id: booking.vehicle_id,
    rent_start_date: booking.rent_start_date.toISOString().split("T")[0],
    rent_end_date: booking.rent_end_date.toISOString().split("T")[0],
    total_price: Number(booking.total_price),
    status,
  };

  if (status === "returned") {
    response.vehicle = { availability_status: "available" };
  }

  return response;
};

export const bookingService = {
  createBooking,
    getAllBookings,
    updateBooking
};
