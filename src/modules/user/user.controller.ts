import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userService } from "./user.service";
import { get } from "http";
// import { pool } from "../config/db";
// import { userService } from "./user/user.service";

const createUser =  async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

     
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, password, phone, role) are required",
      });
    }

    
    const lowerEmail = email.toLowerCase();

    
    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'customer'",
      });
    }

     
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [lowerEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const result = await  userService.createUser( name, email, password, phone, role)

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users.rows,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const loggedInUser = req.user;  

    const id = parseInt(userId!, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
if (!loggedInUser) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized",
  });
}
     
    if (loggedInUser.role !== "admin" && Number(loggedInUser.id) !== id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this user",
      });
    }

     
    if (loggedInUser.role !== "admin" && req.body.role) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update user role",
      });
    }

    const updatedUser = await userService.updateUser(id, req.body);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await userService.deleteUser(Number(userId));

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const userController = {
createUser,
getAllUsers,
updateUser,
deleteUser,
}