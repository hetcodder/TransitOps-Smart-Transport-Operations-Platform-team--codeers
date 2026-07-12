import { Router } from "express";
import { VehicleController } from "../controllers/vehicleController";

const router = Router();
const vehicleController = new VehicleController();

router.get("/", (req, res, next) => {
  vehicleController.getVehicles(req, res).catch(next);
});

router.post("/", (req, res, next) => {
  vehicleController.createVehicle(req, res).catch(next);
});

router.put("/:id", (req, res, next) => {
  vehicleController.updateVehicle(req, res).catch(next);
});

router.delete("/:id", (req, res, next) => {
  vehicleController.deleteVehicle(req, res).catch(next);
});

export const vehicleRoutes = router;
