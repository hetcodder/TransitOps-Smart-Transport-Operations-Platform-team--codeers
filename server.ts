import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { connectDB, getDatabaseStatus } from "./backend/src/config/db";
import { apiRoutes } from "./backend/src/routes";

const PORT = 3000;

async function startServer() {
  const app = express();

  // Trust reverse proxy headers (e.g. X-Forwarded-For)
  app.set("trust proxy", 1);

  // 1. Establish database connection (with automatic fallback)
  await connectDB();
  const dbStatus = getDatabaseStatus();
  console.log(`📡 TransitOps running in database mode: ${dbStatus.mode}`);

  // 2. Global Security and Utility Middlewares
  
  // Custom Helmet config to prevent blocking the AI Studio preview iframe
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      frameguard: false, // Disabled so AI Studio can render in iframe safely
    })
  );

  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());

  // 3. API Rate Limiting (applied to /api endpoints)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { error: "Too many operational telemetry requests. Rate limit exceeded." }
  });
  app.use("/api", apiLimiter);

  // 4. Register Layered API routes
  app.use("/api", apiRoutes);

  // 5. Serve Frontend via Vite in Development or Express Static in Production
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Starting development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Serving compiled production bundle...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 6. Centralized Error Handling Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("🚨 Centralized Server Exception:", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "An unexpected operational error occurred inside the TransitOps core server."
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🟩 TransitOps Full-Stack Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("🛑 Critical error starting TransitOps server:", error);
});
