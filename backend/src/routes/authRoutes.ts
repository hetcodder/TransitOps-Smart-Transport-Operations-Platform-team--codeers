import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

router.post("/login", (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.post("/register", (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.get("/session", (req, res, next) => {
  authController.getSession(req, res).catch(next);
});

router.post("/logout", (req, res, next) => {
  authController.logout(req, res).catch(next);
});

export const authRoutes = router;
