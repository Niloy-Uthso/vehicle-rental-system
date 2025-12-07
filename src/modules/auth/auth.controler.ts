import { Request, Response } from "express";
import { authService } from "./auth.service";

const loginUser = async (req:Request,res:Response) => {
    const { email, password } = req.body;
   
     try {
             const result = await authService.loginUser(email, password);

             res.status(200).json({
                success: true,
                message: "Login successful",
                data: result
             });
     }
     catch(err:any){
        console.error("Error logging in user:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error",
            });
     }
}

export const authController = {
    loginUser,
}
