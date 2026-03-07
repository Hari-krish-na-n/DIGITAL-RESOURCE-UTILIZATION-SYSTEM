import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/summary", authenticateToken, (req, res) => {
  const summary = db.prepare(`
    SELECT platform, problems_solved, rank, contests, sync_date 
    FROM activity_logs 
    WHERE user_id = ? 
    ORDER BY sync_date DESC 
    LIMIT 10
  `).all(req.user.id);
  res.json(summary);
});

router.get("/analytics", authenticateToken, (req, res) => {
  try {
    const analytics = db.prepare(`
      SELECT sync_date, platform, SUM(problems_solved) as solved, AVG(accuracy) as accuracy, AVG(speed) as speed
      FROM activity_logs
      WHERE user_id = ?
      GROUP BY sync_date, platform
      ORDER BY sync_date ASC
    `).all(req.user.id);
    res.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/distribution", authenticateToken, (req, res) => {
  try {
    const distribution = db.prepare(`
      SELECT platform, SUM(problems_solved) as value
      FROM activity_logs
      WHERE user_id = ?
      GROUP BY platform
    `).all(req.user.id);
    res.json(distribution);
  } catch (error) {
    console.error("Distribution error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/repos", authenticateToken, (req, res) => {
  const repos = db.prepare("SELECT * FROM github_repos WHERE user_id = ? ORDER BY updatedAt DESC").all(req.user.id);
  res.json(repos);
});

export default router;
