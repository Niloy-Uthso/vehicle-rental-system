
import express, { Request, Response } from 'express'


import initDB, { pool } from './config/db';
import { userRouter } from './modules/user/user.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { vehicleRoutes } from './modules/vehicle/vehicles.routes';
import { bookingRoutes } from './modules/booking/booking.routes';



const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

 


initDB();
 
app.use('/api/v1/auth/signup', userRouter)
app.use('/api/v1/users', userRouter);

app.use('/api/v1/auth/signin',authRoutes)
 
app.use("/api/v1/vehicles", vehicleRoutes);
 
app.use("/api/v1/bookings", bookingRoutes)

 

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

export default app;
 

