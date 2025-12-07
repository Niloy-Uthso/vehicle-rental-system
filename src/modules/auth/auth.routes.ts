import { Router } from "express";
import { authController } from "./auth.controler";

const router = Router();

router.post("/",authController.loginUser)

export const authRoutes = router;