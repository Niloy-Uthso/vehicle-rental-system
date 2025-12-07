import { pool } from "../../config/db";
import bcrypt from 'bcryptjs';
const createUser = async (name :string, lowerEmail:string,password:string,phone:string,role:string) => {
const hashedPassword =  await bcrypt.hash(password as string,10)
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role`,
      [name, lowerEmail, hashedPassword, phone, role]
    );

    return result;
}

const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT id, name, email, phone, role
    FROM users
    ORDER BY id ASC
  `);

  return result;
};

const updateUser = async (id: number, data: any) => {
  const { name, email, phone, role } = data;

  const result = await pool.query(
    `
    UPDATE users
    SET 
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      phone = COALESCE($3, phone),
      role = COALESCE($4, role)
    WHERE id = $5
    RETURNING id, name, email, phone, role
    `,
    [name, email, phone, role, id]
  );

  return result;
};
const deleteUser = async (userId: number) => {
   
  const userCheck = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [userId]
  );

  if (userCheck.rows.length === 0) {
    throw new Error("User not found");
  }

   
  const activeBooking = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [userId]
  );

  if (activeBooking.rows.length > 0) {
    throw new Error("User cannot be deleted because active bookings exist");
  }

   
  await pool.query(
    `DELETE FROM users WHERE id = $1`,
    [userId]
  );

  return true;
};

export const userService = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser
}