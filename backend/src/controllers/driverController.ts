import { Request, Response } from "express";
import { DriverService } from "../services/driverService";

const driverService = new DriverService();

export class DriverController {
  async getDrivers(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await driverService.getAllDrivers();
      res.json(drivers);
    } catch (error: any) {
      console.error("🚨 Controller GetDrivers Exception:", error);
      res.status(500).json({ error: "Failed to extract driver registry from operational databases." });
    }
  }

  async createDriver(req: Request, res: Response): Promise<void> {
    try {
      const driver = await driverService.createDriver(req.body);
      res.status(201).json(driver);
    } catch (error: any) {
      console.error("🚨 Controller CreateDriver Exception:", error);
      res.status(400).json({ error: error.message || "Failed to register new driver in tactical networks." });
    }
  }

  async updateDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const driver = await driverService.updateDriver(id, req.body);
      if (!driver) {
        res.status(404).json({ error: "Target driver not found in database." });
        return;
      }
      res.json(driver);
    } catch (error: any) {
      console.error("🚨 Controller UpdateDriver Exception:", error);
      res.status(400).json({ error: error.message || "Failed to update driver registry details." });
    }
  }

  async deleteDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await driverService.suspendDriver(id);
      if (!success) {
        res.status(404).json({ error: "Driver not found." });
        return;
      }
      res.json({ success: true, message: "Driver suspended successfully." });
    } catch (error: any) {
      console.error("🚨 Controller DeleteDriver Exception:", error);
      res.status(500).json({ error: "Failed to suspend target driver." });
    }
  }
}
