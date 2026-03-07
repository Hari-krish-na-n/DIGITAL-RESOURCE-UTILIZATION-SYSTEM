import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js"; // Keep for other SQLite queries if needed locally
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "drus-secret-key-2026";

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ id: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
});

router.get("/google/url", (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  res.json({ url: `${rootUrl}?${qs.toString()}` });
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    // Mock authentication path if placeholder credentials are used
    if (process.env.GOOGLE_CLIENT_ID === 'mock_google_client_id_for_local_testing') {
      const mockEmail = "testuser@gmail.com";
      const mockUsername = "testuser";

      let user = await User.findOne({ email: mockEmail });
      if (!user) {
        let username = mockUsername;
        let exists = await User.findOne({ username });
        while (exists) {
          username = `${mockUsername}_${Math.random().toString(36).substring(7)}`;
          exists = await User.findOne({ username });
        }
        user = await User.create({ username, email: mockEmail });
      }

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  token: '${token}', 
                  user: ${JSON.stringify({ id: user._id, username: user.username, email: user.email })} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Mock Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    }

    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    };

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(values).toString(),
    });

    const { id_token, access_token } = await tokenRes.json();

    const userRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: { Authorization: `Bearer ${id_token}` },
      }
    );

    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return res.status(403).send("Google account has no email");
    }

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      let username = googleUser.name || googleUser.email.split("@")[0];
      let exists = await User.findOne({ username });
      while (exists) {
        username = `${googleUser.name || googleUser.email.split("@")[0]}_${Math.random().toString(36).substring(7)}`;
        exists = await User.findOne({ username });
      }

      user = await User.create({ username, email: googleUser.email });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                token: '${token}', 
                user: ${JSON.stringify({ id: user._id, username: user.username, email: user.email })} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).send("Authentication failed");
  }
});

export default router;
