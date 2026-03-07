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
    
    try {
      const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(decoded.id);
      if (!userExists) {
        console.warn("[Auth] User not found in database:", decoded.id);
        return res.status(403).json({ error: "User no longer exists" });
      }
      
      req.user = decoded;
      next();
    } catch (dbErr) {
      console.error("[Auth] Database error during verification:", dbErr.message);
      return res.status(500).json({ error: "Internal server error during authentication" });
    }
  });
};
