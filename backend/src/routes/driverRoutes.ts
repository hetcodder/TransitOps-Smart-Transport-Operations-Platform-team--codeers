import { Router } from "express";
import { DriverController } from "../controllers/driverController";

const router = Router();
const driverController = new DriverController();

router.get("/", (req, res, next) => {
  driverController.getDrivers(req, res).catch(next);
});

router.post("/", (req, res, next) => {
  driverController.createDriver(req, res).catch(next);
});

router.put("/:id", (req, res, next) => {
  driverController.updateDriver(req, res).catch(next);
});

router.delete("/:id", (req, res, next) => {
  driverController.deleteDriver(req, res).catch(next);
});

export const driverRoutes = router;
