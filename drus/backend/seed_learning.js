import Database from "better-sqlite3";
const db = new Database("drus.db");

try {
    const userId = 1; // Assuming testuser has ID 1 or 2. Let's find first.
    const user = db.prepare("SELECT id FROM users WHERE username = 'testuser'").get();
    if (!user) {
        console.error("testuser not found");
        process.exit(1);
    }
    const uid = user.id;

    // Connect Udemy and Coursera
    db.prepare("INSERT OR REPLACE INTO user_learning_resources (user_id, platform_id, profile_url, connected) VALUES (?, 'udemy', 'https://www.udemy.com/user/testuser/', 1)").run(uid);
    db.prepare("INSERT OR REPLACE INTO user_learning_resources (user_id, platform_id, profile_url, connected) VALUES (?, 'coursera', 'https://www.coursera.org/user/testuser/', 1)").run(uid);

    // Add Udemy Courses
    const stmt = db.prepare(`
        INSERT INTO learning_courses (user_id, provider, title, instructor, hours, completion_date, certificate_url, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(uid, 'Udemy', 'React Redux Professional', 'John Doe', 25.5, '2025-12-20', 'https://ude.my/UC-123', JSON.stringify(['React', 'Redux', 'Frontend']));
    stmt.run(uid, 'Udemy', 'Advanced Node.js Patterns', 'Jane Smith', 15.0, '2026-01-15', null, JSON.stringify(['Node.js', 'Backend']));
    stmt.run(uid, 'Udemy', 'UI/UX Design Masterclass', 'Design Guru', 10.0, '2026-02-10', 'https://ude.my/UC-456', JSON.stringify(['Design', 'UI/UX']));
    stmt.run(uid, 'Coursera', 'Google Data Analytics', 'Google', 40.0, '2026-03-01', 'https://coursera.org/verify/789', JSON.stringify(['Data Science', 'Analytics']));

    console.log("Mock Udemy data populated for testuser (ID:", uid, ")");
} catch (err) {
    console.error("Error populating mock data:", err.message);
}
