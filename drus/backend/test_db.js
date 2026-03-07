import Database from "better-sqlite3";
try {
    const db = new Database("drus.db");
    console.log("Database opened successfully");
    const users = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Tables:", users.map(u => u.name).join(", "));
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    console.log("User count:", userCount.count);
} catch (err) {
    console.error("Database test failed:", err.message);
}
