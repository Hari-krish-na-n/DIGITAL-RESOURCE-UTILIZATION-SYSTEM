# DRUS - Digital Resource Utilization System

A comprehensive tracking and analytics platform for student coding activity across LeetCode, HackerRank, GitHub, and more.

## Project Structure

```
drus/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── platforms/   # PlatformCard, PlatformGrid
│   │   │   └── ui/          # Button, Card, Input
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── utils.js
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
│
└── backend/           # Express + SQLite backend
    ├── server/
    │   ├── routes/
    │   │   ├── auth.js       # Register, login, Google OAuth
    │   │   ├── platforms.js  # Platform connections & sync
    │   │   ├── learning.js   # Udemy/Coursera courses
    │   │   └── stats.js      # Analytics & GitHub repos
    │   ├── middleware/
    │   │   └── auth.js       # JWT authentication middleware
    │   ├── services/
    │   │   └── platformFetchers.js  # External API scrapers
    │   └── db.js             # SQLite database setup
    ├── server.js             # Entry point
    └── package.json
```

## Setup & Running

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Fill in your keys
node server.js         # Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_URL=http://localhost:3000
npm run dev            # Runs on http://localhost:5173
```

### Environment Variables

**Backend `.env`:**
- `JWT_SECRET` — Secret key for signing JWTs
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — For Google OAuth
- `APP_URL` — Your app's public URL (e.g. `http://localhost:3000`)
- `GEMINI_API_KEY` — For Gemini AI features

**Frontend `.env`:**
- `GEMINI_API_KEY` — For client-side AI features
- `VITE_API_URL` — Backend URL (default: `http://localhost:3000`)
