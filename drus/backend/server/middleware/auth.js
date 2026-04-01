import jwt from "jsonwebtoken";
import db from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "drus-secret-key-2026";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn("[Auth] No token provided");
    return res.status(401).json({ error: "Authentication token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("[Auth] Token verification failed:", err.message);
      return res.status(403).json({ error: "Invalid or expired token", details: err.message });
    }

    // Verify user still exists in SQLite (fast, synchronous, no external dependency)
    const user = db.prepare("SELECT id, username, email, avatar_url FROM users WHERE id = ?").get(decoded.id);
    if (!user) {
      console.warn("[Auth] User not found in SQLite:", decoded.id);
      return res.status(403).json({ error: "User no longer exists" });
    }

    req.user = { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      avatar_url: user.avatar_url 
    };
    next();
  });
};
