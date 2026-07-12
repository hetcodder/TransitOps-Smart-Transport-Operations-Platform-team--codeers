import { Request, Response } from "express";
import { VehicleService } from "../services/vehicleService";

const vehicleService = new VehicleService();

export class VehicleController {
  async getVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      res.json(vehicles);
    } catch (error: any) {
      console.error("🚨 Controller GetVehicles Exception:", error);
      res.status(500).json({ error: "Failed to extract active vehicles registry." });
    }
  }

  async createVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json(vehicle);
    } catch (error: any) {
      console.error("🚨 Controller CreateVehicle Exception:", error);
      res.status(400).json({ error: error.message || "Failed to commit new vehicle to fleet registry." });
    }
  }

  async updateVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.updateVehicle(id, req.body);
      if (!vehicle) {
        res.status(404).json({ error: "Target vehicle not found in registry." });
        return;
      }
      res.json(vehicle);
    } catch (error: any) {
      console.error("🚨 Controller UpdateVehicle Exception:", error);
      res.status(400).json({ error: error.message || "Failed to update target vehicle configurations." });
    }
  }

  async deleteVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await vehicleService.archiveVehicle(id);
      if (!success) {
        res.status(404).json({ error: "Vehicle not found." });
        return;
      }
      res.json({ success: true, message: "Vehicle archived successfully." });
    } catch (error: any) {
      console.error("🚨 Controller DeleteVehicle Exception:", error);
      res.status(500).json({ error: "Failed to archive target vehicle from active fleets." });
    }
  }
}
