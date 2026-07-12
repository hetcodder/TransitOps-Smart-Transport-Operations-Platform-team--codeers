import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { vehicleRoutes } from "./vehicleRoutes";
import { driverRoutes } from "./driverRoutes";
import { statsRoutes } from "./statsRoutes";
import { additionalRoutes } from "./additionalRoutes";

const router = Router();

// Mount sub-routers under standard API routes
router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/stats", statsRoutes);
router.use("/", additionalRoutes); // Mount extra routes directly at /api

export const apiRoutes = router;
