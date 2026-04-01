import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "drus-secret-key-2026";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });
}

function safeUser(user) {
  return { 
    id: user.id, 
    username: user.username, 
    email: user.email,
    avatar_url: user.avatar_url 
  };
}

// Ensure username is unique; append random suffix if needed
function uniqueUsername(base) {
  let username = base.replace(/[^a-zA-Z0-9_]/g, "_").substring(0, 30);
  let existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  while (existing) {
    username = `${base.substring(0, 24)}_${Math.random().toString(36).substring(2, 6)}`;
    existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  }
  return username;
}

// ─── Register ─────────────────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email and password are required" });
  }

  try {
    // Check for existing email or username
    const existing = db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email, username);
    if (existing) {
      return res.status(409).json({ error: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
    ).run(username, email.toLowerCase().trim(), hashedPassword);

    res.status(201).json({ message: "Account created. You can now sign in." });
  } catch (error) {
    console.error("[Auth] Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }



    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = makeToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── Current user / Profile ─────────────────────────────────────────────────

router.get("/me", authenticateToken, (req, res) => {
  res.json(safeUser(req.user));
});

router.put("/me", authenticateToken, async (req, res) => {
  const { username, email, password } = req.body;

  const updates = [];
  const params = [];

  try {
    // Validate unique username/email if provided
    if (username) {
      const existing = db.prepare("SELECT id FROM users WHERE username = ? AND id != ?").get(username.trim(), req.user.id);
      if (existing) return res.status(409).json({ error: "Username is already taken" });
      updates.push("username = ?");
      params.push(username.trim());
    }

    if (email) {
      const existing = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email.toLowerCase().trim(), req.user.id);
      if (existing) return res.status(409).json({ error: "Email is already used" });
      updates.push("email = ?");
      params.push(email.toLowerCase().trim());
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      params.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    res.json({ user: safeUser(updated) });
  } catch (error) {
    console.error("[Auth] Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});



export default router;
