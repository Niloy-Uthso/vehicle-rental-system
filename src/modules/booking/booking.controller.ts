import { Request, Response } from "express";
import { bookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

     
    const booking = await bookingService.createBooking({
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    console.error("Error creating booking:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getAllBookings = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const bookings = await bookingService.getAllBookings(user);

    return res.status(200).json({
      success: true,
      message:
        user.role === "admin"
          ? "Bookings retrieved successfully"
          : "Your bookings retrieved successfully",
      data: bookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

  const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingIdStr = req.params.bookingId;

if (!bookingIdStr) {
  return res.status(400).json({
    success: false,
    message: "Booking ID is required",
    errors: "Missing booking ID",
  });
}
    const bookingId = parseInt(bookingIdStr, 10);
    const { status } = req.body;
    const user = req.user!;  

    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
        errors: "Booking ID must be a number",
      });
    }

    const updatedBooking = await bookingService.updateBooking({ bookingId, status, user });

    let message = "";
    if (status === "cancelled") message = "Booking cancelled successfully";
    if (status === "returned") message = "Booking marked as returned. Vehicle is now available";

    return res.status(200).json({
      success: true,
      message,
      data: updatedBooking,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Cannot update booking",
      errors: err.message,
    });
  }
};


export const bookingController = {
  createBooking,
    getAllBookings,
    updateBooking,
};
