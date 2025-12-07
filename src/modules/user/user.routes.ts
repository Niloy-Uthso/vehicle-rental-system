import express, { Request, Response } from 'express';
import { pool } from '../../config/db';
import { userController } from './user.controller';
import auth from '../../middleware/auth';
 
const router = express.Router();


router.post("/",userController.createUser);

router.get("/", auth("admin"),userController.getAllUsers);
  
router.put("/:userId", auth("admin", "customer"), userController.updateUser);
router.delete("/:userId",auth("admin"),userController.deleteUser);
export const userRouter = router;