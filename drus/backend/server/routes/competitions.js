import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET all competitions for the authenticated user
router.get("/", authenticateToken, (req, res) => {
  try {
    const competitions = db.prepare(
      "SELECT * FROM competitions WHERE user_id = ? ORDER BY registered_on DESC"
    ).all(req.user.id);
    res.json(competitions);
  } catch (error) {
    console.error("[Competitions] Fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST a new competition
router.post("/", authenticateToken, (req, res) => {
  const { platform, name, team_name, registered_on, deadline, status, logo_url, competition_url } = req.body;
  if (!name || !platform) {
    return res.status(400).json({ error: "Competition name and platform are required" });
  }
  try {
    const result = db.prepare(`
      INSERT INTO competitions (user_id, platform, name, team_name, registered_on, deadline, status, logo_url, competition_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, platform, name, team_name || null, registered_on || null, deadline || null, status || 'Registered', logo_url || null, competition_url || null);
    res.json({ id: result.lastInsertRowid, message: "Competition added" });
  } catch (error) {
    console.error("[Competitions] Insert error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE a competition
router.delete("/:id", authenticateToken, (req, res) => {
  try {
    db.prepare("DELETE FROM competitions WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ message: "Competition removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
