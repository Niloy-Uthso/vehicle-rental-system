
import express, { Request, Response } from 'express'
import { Pool } from 'pg'
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path:path.join(process.cwd(),".env")});
const app = express()
const port = 5000;
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const pool = new Pool({
    connectionString:`${process.env.CONNECTION_STRING}`
});
 
const initDB = async () => {

    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
    )
`);

await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('car','bike','van','SUV')),
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
        availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available','booked'))
    );
`);
await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
        total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned'))
    );
`);


}
initDB();
 
app.get('/tables', async (req, res) => {
    const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public';
    `);

    res.json(result.rows);
});

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

// app.post()
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
