import Database from "better-sqlite3";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./server/models/User.js";

dotenv.config();

const db = new Database("drus.db");
db.pragma('foreign_keys = OFF');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/drus");
        console.log("Connected to MongoDB");

        // Use the default mock google user or fallback
        const user = await User.findOne({ email: "testuser@gmail.com" }) || await User.findOne();

        if (!user) {
            console.error("No MongoDB testuser found to attach courses to.");
            process.exit(1);
        }

        const uid = user._id.toString();
        console.log(`Using MongoDB User ID: ${uid}`);

        // Clear existing Udemy courses for this user
        db.prepare("DELETE FROM learning_courses WHERE user_id = ? AND provider = 'Udemy'").run(uid);

        // Add Real Udemy Courses from Screenshot with Mock Certificates
        const stmt = db.prepare(`
            INSERT INTO learning_courses (user_id, provider, title, instructor, hours, completion_date, certificate_url, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(uid, 'Udemy', 'Practical Next.js & React - Build a real WebApp with Next.js', 'Nick Ovchinnikov', 12.5, '2026-01-20', 'https://ude.my/cert-next', JSON.stringify(['Next.js', 'React', 'Frontend']));
        stmt.run(uid, 'Udemy', 'Python Programming Mastery: From Beginner to Pro', 'Mehmood Khalil, Eman Aslam', 18.0, '2026-02-15', 'https://ude.my/cert-python', JSON.stringify(['Python', 'Basics']));
        stmt.run(uid, 'Udemy', 'Java And PHP Complete Course For Java And PHP Beginners', 'Crunch Coding Institute', 22.0, '2026-03-01', 'https://ude.my/cert-javaphp', JSON.stringify(['Java', 'PHP', 'Fullstack']));
        stmt.run(uid, 'Udemy', 'Learn AutoCAD 2D & 3D : From Zero to Hero', 'Ashish Pandit', 15.5, '2026-03-05', 'https://ude.my/cert-autocad', JSON.stringify(['AutoCAD', 'Design', '2D/3D']));

        // Ensure the connection is marked active in user_learning_resources
        const rscExists = db.prepare("SELECT id FROM user_learning_resources WHERE user_id = ? AND platform_id = 'udemy'").get(uid);
        if (!rscExists) {
            db.prepare("INSERT INTO user_learning_resources (user_id, platform_id, profile_url, connected) VALUES (?, 'udemy', 'https://www.udemy.com/user/testuser/', 1)").run(uid);
        } else {
            db.prepare("UPDATE user_learning_resources SET connected = 1 WHERE id = ?").run(rscExists.id);
        }

        console.log("Udemy data with certificates updated from screenshot for MongoDB user (ID:", uid, ")");
        process.exit(0);
    } catch (err) {
        console.error("Error updating Udemy data:", err.message);
        process.exit(1);
    }
};

run();
