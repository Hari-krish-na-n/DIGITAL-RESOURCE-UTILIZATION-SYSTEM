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

    // OAuth-only users have no password
    if (!user.password) {
      return res.status(401).json({ error: "This account uses Google sign-in. Please use Google to log in." });
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

// ─── Google OAuth: get redirect URL ───────────────────────────────────────────

router.get("/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  // If using mock credentials just use the mock flow directly
  if (!clientId || clientId === "mock_google_client_id_for_local_testing") {
    // No real OAuth: redirect straight to the mock callback
    return res.json({ url: `${appUrl}/api/auth/google/callback?code=mock_code` });
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const origin = req.query.origin || appUrl;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state: origin,
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  });

  res.json({ url: `${rootUrl}?${params.toString()}` });
});

// ─── Google OAuth: callback ────────────────────────────────────────────────────

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const stateStr = req.query.state || appUrl;
  const redirectUri = `${stateStr}/api/auth/google/callback`;

  const sendSuccess = (token, user) => {
    // Escape components to prevent URL injection
    const targetUrl = `${stateStr}/login?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(safeUser(user)))}`;
    res.redirect(targetUrl);
  };

  // ── Mock path (no real Google credentials) ──
  if (!code || process.env.GOOGLE_CLIENT_ID === "mock_google_client_id_for_local_testing") {
    try {
      const mockEmail = "testuser@gmail.com";
      const mockBase = "testuser";

      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(mockEmail);
      if (!user) {
        const username = uniqueUsername(mockBase);
        db.prepare("INSERT INTO users (username, email) VALUES (?, ?)").run(username, mockEmail);
        user = db.prepare("SELECT * FROM users WHERE email = ?").get(mockEmail);
      }

      return sendSuccess(makeToken(user), user);
    } catch (err) {
      console.error("[Auth] Mock Google callback error:", err);
      return res.status(500).send("Mock authentication failed");
    }
  }

  // ── Real Google OAuth path ──
  if (!code) return res.status(400).send("No code provided");

  try {
    const params = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
    console.log("[Auth] Google token exchange request params (masked):", { 
      ...params, 
      client_id: params.client_id.substring(0, 5) + "...",
      client_secret: params.client_secret.substring(0, 10) + "..." 
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[Auth] Google token exchange failed:", tokenRes.status, errText);
      // Log more details about the request to help debug
      console.error("[Auth] Request was using Redirect URI:", redirectUri);
      return res.status(400).send(`Google OAuth error: ${errText}`);
    }

    const { id_token, access_token } = await tokenRes.json();

    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${id_token}` } }
    );

    const googleUser = await userRes.json();
    if (!googleUser.email) return res.status(403).send("Google account has no email");

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(googleUser.email.toLowerCase());
    
    if (!user) {
      const username = uniqueUsername(googleUser.name || googleUser.email.split("@")[0]);
      db.prepare("INSERT INTO users (username, email, avatar_url) VALUES (?, ?, ?)")
        .run(username, googleUser.email.toLowerCase(), googleUser.picture || null);
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(googleUser.email.toLowerCase());
    } else if (googleUser.picture && googleUser.picture !== user.avatar_url) {
      // Update avatar if it changed
      db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(googleUser.picture, user.id);
      user.avatar_url = googleUser.picture;
    }

    sendSuccess(makeToken(user), user);
  } catch (error) {
    console.error("[Auth] Google OAuth error:", error);
    res.status(500).send("Authentication failed");
  }
});

export default router;
