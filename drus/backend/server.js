import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./server/routes/auth.js";
import platformRoutes from "./server/routes/platforms.js";
import learningRoutes from "./server/routes/learning.js";
import statsRoutes from "./server/routes/stats.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5001;

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
