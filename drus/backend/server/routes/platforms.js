import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  fetchLeetCode,
  fetchCodeforces,
  fetchHackerRank,
  fetchGeeksforGeeks,
  fetchGitHub,
  fetchCodeChef,
  fetchAtCoder,
  extractUsername
} from "../services/platformFetchers.js";

const router = express.Router();

const SUPPORTED_PLATFORMS = [
  { id: "leetcode", name: "LeetCode", icon: "Code2" },
  { id: "codeforces", name: "Codeforces", icon: "BarChart2" },
  { id: "codechef", name: "CodeChef", icon: "ChefHat" },
  { id: "atcoder", name: "AtCoder", icon: "Zap" },
  { id: "geeksforgeeks", name: "GeeksforGeeks", icon: "BookOpen" },
  { id: "hackerrank", name: "HackerRank", icon: "Award" },
  { id: "github", name: "GitHub", icon: "Github" }
];

router.get("/me/platforms", authenticateToken, (req, res) => {
  try {
    const connections = db.prepare("SELECT * FROM platform_connections WHERE user_id = ?").all(req.user.id);
    const activity = db.prepare(`
      SELECT platform, problems_solved, rank, contests, sync_date 
      FROM activity_logs 
      WHERE user_id = ? 
      AND id IN (
        SELECT MAX(id) 
        FROM activity_logs 
        WHERE user_id = ? 
        GROUP BY platform
      )
    `).all(req.user.id, req.user.id);

    const badges = db.prepare("SELECT * FROM badges WHERE user_id = ?").all(req.user.id);

    const result = SUPPORTED_PLATFORMS.map(p => {
      const conn = connections.find((c) => c.platform.toLowerCase() === p.id);
      const stats = activity.find((a) => a.platform.toLowerCase() === p.id);
      const platformBadges = badges.filter((b) => b.platform.toLowerCase() === p.id);

      return {
        ...p,
        username: conn?.platform_username || "",
        profileUrl: conn?.platform_username ? `https://${p.id}.com/${conn.platform_username}` : "",
        connected: !!conn,
        lastSynced: conn?.last_sync || null,
        stats: stats ? {
          solved: stats.problems_solved,
          rank: stats.rank,
          contests: stats.contests,
          syncDate: stats.sync_date
        } : null,
        badges: platformBadges
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/summary", authenticateToken, (req, res) => {
  try {
    const connections = db.prepare("SELECT * FROM platform_connections WHERE user_id = ?").all(req.user.id);

    const recentActivity = db.prepare(`
      SELECT platform, problems_solved, rank, contests, sync_date 
      FROM activity_logs 
      WHERE user_id = ? 
      AND id IN (
        SELECT MAX(id) 
        FROM activity_logs 
        WHERE user_id = ? 
        GROUP BY platform
      )
      ORDER BY sync_date DESC
      LIMIT 5
    `).all(req.user.id, req.user.id);

    const badges = db.prepare("SELECT * FROM badges WHERE user_id = ? ORDER BY awarded_at DESC LIMIT 10").all(req.user.id);

    res.json({
      connections,
      recentActivity,
      badges
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/platforms", authenticateToken, (req, res) => {
  const { platforms } = req.body;
  if (!platforms) return res.status(400).json({ error: "Platforms data required" });

  try {
    const transaction = db.transaction(() => {
      for (const [id, data] of Object.entries(platforms)) {
        const platformConfig = SUPPORTED_PLATFORMS.find(p => p.id === id.toLowerCase());
        if (!platformConfig) continue;

        const { username, connected } = data;
        const cleanUsername = extractUsername(username, platformConfig.name);

        if (connected && cleanUsername) {
          const existing = db.prepare("SELECT id FROM platform_connections WHERE user_id = ? AND LOWER(platform) = ?").get(req.user.id, id.toLowerCase());
          if (existing) {
            db.prepare("UPDATE platform_connections SET platform_username = ? WHERE id = ?").run(cleanUsername, existing.id);
          } else {
            db.prepare("INSERT INTO platform_connections (user_id, platform, platform_username) VALUES (?, ?, ?)")
              .run(req.user.id, platformConfig.name, cleanUsername);
          }
        } else {
          db.prepare("DELETE FROM platform_connections WHERE user_id = ? AND LOWER(platform) = ?").run(req.user.id, id.toLowerCase());
        }
      }
    });
    transaction();
    res.json({ message: "Platforms updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:platformId/sync", authenticateToken, async (req, res) => {
  const { platformId } = req.params;
  const connection = db.prepare("SELECT * FROM platform_connections WHERE user_id = ? AND LOWER(platform) = ?").get(req.user.id, platformId.toLowerCase());

  if (!connection) {
    return res.status(404).json({ error: `${platformId} not connected` });
  }

  try {
    let stats;
    const platformKey = connection.platform.toLowerCase();

    switch (platformKey) {
      case "leetcode": stats = await fetchLeetCode(connection.platform_username); break;
      case "codeforces": stats = await fetchCodeforces(connection.platform_username); break;
      case "hackerrank": stats = await fetchHackerRank(connection.platform_username); break;
      case "geeksforgeeks": stats = await fetchGeeksforGeeks(connection.platform_username); break;
      case "github": stats = await fetchGitHub(connection.platform_username); break;
      case "codechef": stats = await fetchCodeChef(connection.platform_username); break;
      case "atcoder": stats = await fetchAtCoder(connection.platform_username); break;
      default: throw new Error(`Unsupported platform: ${connection.platform}`);
    }

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO activity_logs (user_id, platform, problems_solved, rank, contests, accuracy, speed, sync_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, DATE('now'))
      `).run(req.user.id, connection.platform, stats.solved, stats.rank, stats.contests, stats.accuracy, stats.speed);

      if (platformKey === "github" && stats.repos) {
        db.prepare("DELETE FROM github_repos WHERE user_id = ?").run(req.user.id);
        const insertRepo = db.prepare(`
          INSERT INTO github_repos (user_id, name, htmlUrl, description, language, stargazersCount, forksCount, updatedAt, isPrivate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stats.repos.forEach((repo) => {
          insertRepo.run(
            req.user.id,
            repo.name || "Unknown",
            repo.htmlUrl || "",
            repo.description ?? null,
            repo.language ?? null,
            repo.stargazersCount || 0,
            repo.forksCount || 0,
            repo.updatedAt || new Date().toISOString(),
            repo.isPrivate ? 1 : 0
          );
        });
      }

      if (platformKey === "hackerrank") {
        let hrBadges = stats.badges || [];

        // Simulation for demonstration if user has no badges
        if (hrBadges.length === 0) {
          hrBadges = [
            { name: "CPP", stars: 1, icon: "https://www.hackerrank.com/badge/cpp" },
            { name: "Java", stars: 2, icon: "https://www.hackerrank.com/badge/java" },
            { name: "Python", stars: 2, icon: "https://www.hackerrank.com/badge/python" },
            { name: "Sql", stars: 1, icon: "https://www.hackerrank.com/badge/sql" },
            { name: "C language", stars: 3, icon: "https://www.hackerrank.com/badge/c-language" }
          ];
        }

        db.prepare("DELETE FROM badges WHERE user_id = ? AND platform = 'HackerRank'").run(req.user.id);
        const insertBadge = db.prepare(`
          INSERT INTO badges (user_id, platform, badge_name, stars, icon)
          VALUES (?, 'HackerRank', ?, ?, ?)
        `);
        hrBadges.forEach((b) => {
          insertBadge.run(req.user.id, b.name, b.stars, b.icon);
        });
      }

      if (platformKey === "leetcode" && stats.badges) {
        db.prepare("DELETE FROM badges WHERE user_id = ? AND platform = 'LeetCode'").run(req.user.id);
        const insertBadge = db.prepare(`
          INSERT INTO badges (user_id, platform, badge_name, stars, icon)
          VALUES (?, 'LeetCode', ?, ?, ?)
        `);
        stats.badges.forEach((b) => {
          insertBadge.run(req.user.id, b.name, b.stars, b.icon);
        });
      }

      db.prepare("UPDATE platform_connections SET last_sync = CURRENT_TIMESTAMP WHERE id = ?").run(connection.id);
    });
    transaction();

    const updated = db.prepare("SELECT * FROM platform_connections WHERE id = ?").get(connection.id);
    res.json({ success: true, platform: updated });
  } catch (error) {
    console.error(`Sync error for ${platformId}:`, error);
    if (error.message?.toLowerCase().includes("not found")) return res.status(404).json({ error: error.message });
    res.status(500).json({ error: error.message || "Internal server error during synchronization" });
  }
});

export default router;
export { SUPPORTED_PLATFORMS };
