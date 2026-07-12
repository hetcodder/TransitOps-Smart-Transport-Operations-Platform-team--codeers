import { Router, Request, Response, NextFunction } from "express";
import { VehicleRepository } from "../repositories/vehicleRepository";
import { DriverRepository } from "../repositories/driverRepository";

const router = Router();
const vehicleRepository = new VehicleRepository();
const driverRepository = new DriverRepository();

router.get("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicles = await vehicleRepository.findAll();
    const drivers = await driverRepository.findAll();

    // Dynamically calculate statuses
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
    const maintenanceVehicles = vehicles.filter((v) => v.status === "Maintenance").length;
    const inactiveVehicles = vehicles.filter((v) => v.status === "Inactive").length;

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((d) => d.status === "On Duty").length;
    const offDutyDrivers = drivers.filter((d) => d.status === "Off Duty").length;
    const suspendedDrivers = drivers.filter((d) => d.status === "Suspended").length;

    res.json({
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        maintenance: maintenanceVehicles,
        inactive: inactiveVehicles
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
        offDuty: offDutyDrivers,
        suspended: suspendedDrivers
      }
    });
  } catch (error) {
    next(error);
  }
});

export const statsRoutes = router;
