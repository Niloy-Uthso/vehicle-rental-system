import { Request, Response } from "express";
 
import { vehicleService } from "./vehicles.service";
import { get } from "http";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

     
    if (!vehicle_name || !type || !registration_number || !daily_rent_price || !availability_status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

     
    const allowedTypes = ["car", "bike", "van", "SUV"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be car, bike, van or SUV",
      });
    }

     
    const allowedStatus = ["available", "booked"];
    if (!allowedStatus.includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability_status. Must be available or booked",
      });
    }

    const result = await vehicleService.createVehicle(
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    );

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicles();

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error fetching vehicles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
 

if (!vehicleId) {
  return res.status(400).json({
    success: false,
    message: "Vehicle ID is required",
  });
}
    const id = parseInt(vehicleId, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const result = await vehicleService.getVehicleById(id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error fetching vehicle by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

 const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required",
      });
    }

    const id = parseInt(vehicleId, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const updateData = req.body;

     
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided to update",
      });
    }

    const result = await vehicleService.updateVehicle(id, updateData);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Error updating vehicle:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
 
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required",
      });
    }

    const id = parseInt(vehicleId, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

     
    const vehicle = await vehicleService.getVehicleById(id);
    if (vehicle.rows.length === 0) {
      
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

     
    const activeBookings = await vehicleService.checkActiveBookings(id);
    if (activeBookings.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Vehicle cannot be deleted because it has active bookings",
      });
    }

     
    await vehicleService.deleteVehicle(id);

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const vehicleController = {
  createVehicle,
  getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    
};
