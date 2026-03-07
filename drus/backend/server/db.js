import Database from "better-sqlite3";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("drus.db");
db.pragma('foreign_keys = OFF'); // Disabled to allow MongoDB _id strings as user_id

// MongoDB Initialization
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/drus";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB for User data"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS platform_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    platform TEXT,
    platform_username TEXT,
    last_sync DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    platform TEXT,
    problems_solved INTEGER,
    rank INTEGER,
    contests INTEGER,
    accuracy REAL, -- Percentage
    speed REAL, -- Problems per hour or similar
    sync_date DATE,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    platform TEXT,
    badge_name TEXT,
    stars INTEGER,
    icon TEXT,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS github_repos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    htmlUrl TEXT,
    description TEXT,
    language TEXT,
    stargazersCount INTEGER,
    forksCount INTEGER,
    updatedAt TEXT,
    isPrivate INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_learning_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    platform_id TEXT,
    profile_url TEXT,
    connected INTEGER DEFAULT 0,
    last_synced DATETIME,
    stats TEXT, -- JSON string
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, platform_id)
  );

  CREATE TABLE IF NOT EXISTS learning_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    provider TEXT NOT NULL, -- 'Udemy' or 'Coursera'
    title TEXT NOT NULL,
    instructor TEXT,
    hours REAL,
    completion_date DATE,
    certificate_url TEXT,
    tags TEXT, -- JSON string array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Copy data from udemy_courses to learning_courses if it exists
try {
  const tableExists = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='udemy_courses'").get();
  if (tableExists) {
    db.exec(`
      INSERT INTO learning_courses (user_id, provider, title, instructor, hours, completion_date, certificate_url, tags, created_at, updated_at)
      SELECT user_id, 'Udemy', title, instructor, hours, completion_date, certificate_url, tags, created_at, updated_at
      FROM udemy_courses;
    `);
  }
} catch (err) {
  console.log("Migration skip or error:", err.message);
}

// Drop old table if migration was successful
try {
  const count = db.prepare("SELECT COUNT(*) as count FROM learning_courses WHERE provider = 'Udemy'").get().count;
  const oldCount = db.prepare("SELECT COUNT(*) as count FROM udemy_courses").get().count;
  if (count === oldCount && count > 0) {
    db.exec("DROP TABLE udemy_courses;");
  }
} catch (err) {
  // Tables might not exist yet or migration already done
  console.log("Migration skip or error:", err.message);
}


// Migration: Add accuracy and speed to activity_logs if they don't exist
try {
  db.exec("ALTER TABLE activity_logs ADD COLUMN accuracy REAL;");
} catch {
  // Column might already exist
}
try {
  db.exec("ALTER TABLE activity_logs ADD COLUMN speed REAL;");
} catch {
  // Column might already exist
}

export default db;
