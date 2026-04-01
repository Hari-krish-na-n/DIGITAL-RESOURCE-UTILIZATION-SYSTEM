import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/summary", authenticateToken, (req, res) => {
  const summary = db.prepare(`
    SELECT platform, problems_solved, rank, contests, sync_date 
    FROM activity_logs 
    WHERE user_id = ? 
    AND id IN (
      SELECT MAX(id) 
      FROM activity_logs 
      WHERE user_id = ? 
      GROUP BY platform
    )
    ORDER BY sync_date DESC
  `).all(req.user.id, req.user.id);
  res.json(summary);
});

router.get("/analytics", authenticateToken, (req, res) => {
  try {
    const analytics = db.prepare(`
      SELECT sync_date, platform, MAX(problems_solved) as solved, AVG(accuracy) as accuracy, AVG(speed) as speed
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
      SELECT platform, problems_solved as value, easy_solved, medium_solved, hard_solved
      FROM activity_logs
      WHERE user_id = ?
      AND id IN (
        SELECT MAX(id)
        FROM activity_logs
        WHERE user_id = ?
        GROUP BY platform
      )
    `).all(req.user.id, req.user.id);
    res.json(distribution);
  } catch (error) {
    console.error("Distribution error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/difficulty-breakdown", authenticateToken, (req, res) => {
  try {
    const breakdown = db.prepare(`
      SELECT 
        SUM(easy_solved) as easy,
        SUM(medium_solved) as medium,
        SUM(hard_solved) as hard
      FROM (
        SELECT easy_solved, medium_solved, hard_solved
        FROM activity_logs
        WHERE user_id = ?
        AND id IN (
          SELECT MAX(id)
          FROM activity_logs
          WHERE user_id = ?
          GROUP BY platform
        )
      )
    `).get(req.user.id, req.user.id);

    const result = [
      { name: 'Easy', value: breakdown.easy || 0, color: '#10b981' },
      { name: 'Medium', value: breakdown.medium || 0, color: '#f59e0b' },
      { name: 'Hard', value: breakdown.hard || 0, color: '#ef4444' }
    ];
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/repos", authenticateToken, (req, res) => {
  const repos = db.prepare("SELECT * FROM github_repos WHERE user_id = ? ORDER BY updatedAt DESC").all(req.user.id);
  res.json(repos);
});

export default router;
