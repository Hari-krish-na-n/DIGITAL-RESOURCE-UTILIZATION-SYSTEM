import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./server/routes/auth.js";
import platformRoutes from "./server/routes/platforms.js";
import learningRoutes from "./server/routes/learning.js";
import statsRoutes from "./server/routes/stats.js";
import reportRoutes from "./server/routes/reports.js";
import competitionRoutes from "./server/routes/competitions.js";
import aiRoutes from "./server/routes/ai.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 10000;

  // ─── CORS ──────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    process.env.FRONTEND_URL || "https://digital-resource-utilization-system.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Handle pre-flight OPTIONS requests for all routes
  app.options("*", cors());

  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url} - Host: ${req.headers.host}`);
    next();
  });

  app.use(express.json());

  app.use("/api", (req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  const apiRouter = express.Router();
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/profiles", platformRoutes);
  apiRouter.use("/platforms", platformRoutes);
  apiRouter.use("/dashboard", platformRoutes);
  apiRouter.use("/learning", learningRoutes);
  apiRouter.use("/learning-resources", learningRoutes);
  apiRouter.use("/stats", statsRoutes);
  apiRouter.use("/github", statsRoutes);
  apiRouter.use("/reports", reportRoutes);
  apiRouter.use("/competitions", competitionRoutes);
  apiRouter.use("/ai", aiRoutes);

  app.use("/api", apiRouter);

  // 404 for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Optional error handling middleware could be here

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DRUS Server running on http://localhost:${PORT}`);
  });
}

startServer();
