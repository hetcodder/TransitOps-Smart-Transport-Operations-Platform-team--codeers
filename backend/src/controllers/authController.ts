import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role, name, phone, employeeId, shift, certificationNumber, department } = req.body;
      
      if (!email || !password || !role || !name) {
        res.status(400).json({ success: false, error: "Required fields are missing." });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
        return;
      }

      const user = await authService.register({
        email,
        passwordRaw: password,
        role,
        name,
        phone,
        employeeId,
        shift,
        certificationNumber,
        department
      });

      const token = authService.generateToken(user);

      res.status(201).json({
        success: true,
        token,
        user: {
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone,
          employeeId: user.employeeId,
          shift: user.shift,
          certificationNumber: user.certificationNumber,
          department: user.department
        }
      });
    } catch (error: any) {
      if (error.message === "Duplicate email") {
        console.warn("Controller Registration Warning: Duplicate email");
        res.status(400).json({ success: false, error: "Duplicate email. This address is already registered." });
      } else {
        console.error("🚨 Controller Registration Exception:", error);
        res.status(500).json({ success: false, error: "Internal server registration failure." });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        res.status(400).json({ success: false, error: "Corporate Email, Secure Password, and Role are required." });
        return;
      }

      const session = await authService.login(email, password, role);

      res.json({
        success: true,
        token: session.token,
        user: {
          email: session.user.email,
          role: session.user.role,
          name: session.user.name,
          phone: session.user.phone,
          employeeId: session.user.employeeId,
          shift: session.user.shift,
          certificationNumber: session.user.certificationNumber,
          department: session.user.department
        }
      });
    } catch (error: any) {
      const msg = error.message;
      const expectedErrors = ["Invalid Email", "Incorrect Password", "Account Disabled", "Unauthorized Access"];
      if (expectedErrors.includes(msg)) {
        console.warn(`Controller Login Warning: ${msg}`);
        if (msg === "Invalid Email") {
          res.status(401).json({ success: false, error: "Invalid Email" });
        } else if (msg === "Incorrect Password") {
          res.status(401).json({ success: false, error: "Incorrect Password" });
        } else if (msg === "Account Disabled") {
          res.status(403).json({ success: false, error: "Account Disabled" });
        } else if (msg === "Unauthorized Access") {
          res.status(403).json({ success: false, error: "Unauthorized Access" });
        }
      } else {
        console.error("🚨 Controller Login Exception:", error);
        res.status(500).json({ success: false, error: "Internal server handshake failure." });
      }
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "Access token missing or malformed." });
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = authService.verifyToken(token);

      if (!decoded) {
        res.status(401).json({ success: false, error: "Session token expired or compromised." });
        return;
      }

      res.json({
        success: true,
        user: {
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
          phone: decoded.phone,
          employeeId: decoded.employeeId,
          shift: decoded.shift,
          certificationNumber: decoded.certificationNumber,
          department: decoded.department
        }
      });
    } catch (error: any) {
      console.error("🚨 Controller Session Retrieval Exception:", error);
      res.status(500).json({ success: false, error: "Internal server error parsing authorization matrix." });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Tokens are stateless in pure JWT; we can log clients out client-side.
      // We will acknowledge the logout successfully here.
      res.json({ success: true, message: "Corporate session terminated successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Internal logout failure." });
    }
  }
}
