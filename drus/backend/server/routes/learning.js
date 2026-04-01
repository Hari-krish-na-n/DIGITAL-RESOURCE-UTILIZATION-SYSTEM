import express from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";
import { fetchLearningPlatformData } from "../services/platformFetchers.js";

const router = express.Router();

const SUPPORTED_LEARNING_PLATFORMS = [
  { id: "udemy", name: "Udemy" },
  { id: "coursera", name: "Coursera" },
  { id: "fcc", name: "freeCodeCamp" },
  { id: "codecademy", name: "Codecademy" },
  { id: "unstop", name: "Unstop" }
];

router.get("/", authenticateToken, (req, res) => {
  try {
    const resources = db.prepare("SELECT * FROM user_learning_resources WHERE user_id = ?").all(req.user.id);
    const stats = db.prepare(`
      SELECT 
        provider,
        COUNT(*) as completedCourses,
        SUM(CASE WHEN certificate_url IS NOT NULL AND certificate_url != '' THEN 1 ELSE 0 END) as certCount,
        SUM(COALESCE(hours, 0)) as hoursWatched
      FROM learning_courses
      WHERE user_id = ?
      GROUP BY provider
    `).all(req.user.id);

    const result = SUPPORTED_LEARNING_PLATFORMS.map(p => {
      const r = resources.find(res => res.platform_id.toLowerCase() === p.id);
      const platformStats = stats.find(s => s.provider.toLowerCase() === p.name.toLowerCase()) || {
        completedCourses: 0,
        certCount: 0,
        hoursWatched: 0
      };

      return {
        platform_id: p.id,
        name: p.name,
        profile_url: r?.profile_url || "",
        connected: !!r?.connected,
        last_synced: r?.last_synced || null,
        stats: r?.stats ? JSON.parse(r.stats) : {
          totalCourses: platformStats.completedCourses,
          completedCourses: platformStats.completedCourses,
          certificates: Array(platformStats.certCount).fill({}),
          hoursWatched: platformStats.hoursWatched,
          inProgressCourses: 0
        }
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/summary", authenticateToken, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        provider,
        COUNT(*) as courses,
        SUM(CASE WHEN certificate_url IS NOT NULL AND certificate_url != '' THEN 1 ELSE 0 END) as certificates,
        SUM(COALESCE(hours, 0)) as hours
      FROM learning_courses
      WHERE user_id = ?
      GROUP BY provider
    `).all(req.user.id);

    const summary = {
      udemyCourses: 0,
      udemyCertificates: 0,
      udemyHours: 0,
      courseraCourses: 0,
      courseraCertificates: 0,
      courseraHours: 0
    };

    stats.forEach(s => {
      if (s.provider === 'Udemy') {
        summary.udemyCourses = s.courses;
        summary.udemyCertificates = s.certificates;
        summary.udemyHours = s.hours;
      } else if (s.provider === 'Coursera') {
        summary.courseraCourses = s.courses;
        summary.courseraCertificates = s.certificates;
        summary.courseraHours = s.hours;
      }
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:platformId", authenticateToken, (req, res) => {
  const { platformId } = req.params;
  const provider = platformId.charAt(0).toUpperCase() + platformId.slice(1).toLowerCase();

    try {
      const resource = db.prepare("SELECT stats, connected FROM user_learning_resources WHERE user_id = ? AND platform_id = ?").get(req.user.id, platformId);
      const dbCourses = db.prepare("SELECT * FROM learning_courses WHERE user_id = ? AND provider = ? ORDER BY completion_date DESC").all(req.user.id, provider);

      let virtualCourses = [];
      if (resource?.stats) {
          try {
              const stats = JSON.parse(resource.stats);
              if (stats.certificates && Array.isArray(stats.certificates)) {
                  virtualCourses = stats.certificates.map(cert => ({
                      id: `v-${platformId}-${cert.title}`,
                      title: cert.title,
                      instructor: cert.issuedBy || provider,
                      hours: 0,
                      completion_date: cert.issuedOn,
                      certificate_url: cert.certificateUrl,
                      provider: provider,
                      isVirtual: true
                  }));
              }
          } catch {}
      }

      const allCourses = [...dbCourses, ...virtualCourses];

      res.json({
        connected: !!resource?.connected,
        courses: allCourses.map((c) => ({
          ...c,
          tags: JSON.parse(c.tags || '[]')
        }))
      });
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:platformId/connect", authenticateToken, (req, res) => {
  const { platformId } = req.params;
  const { connected } = req.body;
  try {
    const existing = db.prepare("SELECT id FROM user_learning_resources WHERE user_id = ? AND platform_id = ?").get(req.user.id, platformId);
    if (existing) {
      db.prepare("UPDATE user_learning_resources SET connected = ? WHERE id = ?").run(connected ? 1 : 0, existing.id);
    } else {
      db.prepare("INSERT INTO user_learning_resources (user_id, platform_id, connected) VALUES (?, ?, ?)").run(req.user.id, platformId, connected ? 1 : 0);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:platformId/courses", authenticateToken, async (req, res) => {
  const { platformId } = req.params;
  const provider = platformId.charAt(0).toUpperCase() + platformId.slice(1).toLowerCase();
  let { title, instructor, hours, completionDate, certificateUrl, tags } = req.body;

  if (!title || title.trim() === "") return res.status(400).json({ error: "Title is required" });

  try {
    const stmt = db.prepare(`
      INSERT INTO learning_courses (user_id, provider, title, instructor, hours, completion_date, certificate_url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      req.user.id,
      provider,
      title,
      instructor || null,
      hours || null,
      completionDate || null,
      certificateUrl || null,
      JSON.stringify(tags || [])
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:platformId/courses/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, instructor, hours, completionDate, certificateUrl, tags } = req.body;

  if (!title || title.trim() === "") return res.status(400).json({ error: "Title is required" });

  try {
    const stmt = db.prepare(`
      UPDATE learning_courses 
      SET title = ?, instructor = ?, hours = ?, completion_date = ?, certificate_url = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(
      title,
      instructor || null,
      hours || null,
      completionDate || null,
      certificateUrl || null,
      JSON.stringify(tags || []),
      id,
      req.user.id
    );

    if (result.changes === 0) return res.status(404).json({ error: "Course not found or unauthorized" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:platformId/courses/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare("DELETE FROM learning_courses WHERE id = ? AND user_id = ?").run(id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: "Course not found or unauthorized" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:platformId/connect", authenticateToken, (req, res) => {
  const { platformId } = req.params;
  const { profileUrl } = req.body;

  if (!profileUrl) return res.status(400).json({ error: "Profile URL is required" });

  try {
    const existing = db.prepare("SELECT * FROM user_learning_resources WHERE user_id = ? AND platform_id = ?").get(req.user.id, platformId);

    if (existing) {
      db.prepare("UPDATE user_learning_resources SET profile_url = ?, connected = 1 WHERE id = ?").run(profileUrl, existing.id);
    } else {
      db.prepare("INSERT INTO user_learning_resources (user_id, platform_id, profile_url, connected) VALUES (?, ?, ?, 1)").run(req.user.id, platformId, profileUrl);
    }

    const updated = db.prepare("SELECT * FROM user_learning_resources WHERE user_id = ? AND platform_id = ?").get(req.user.id, platformId);
    res.json({
      ...updated,
      connected: !!updated.connected,
      stats: JSON.parse(updated.stats || '{}')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:platformId/sync", authenticateToken, async (req, res) => {
  const { platformId } = req.params;
  const resource = db.prepare("SELECT * FROM user_learning_resources WHERE user_id = ? AND platform_id = ?").get(req.user.id, platformId);

  if (!resource) return res.status(404).json({ error: "Resource not connected" });

  try {
    const stats = await fetchLearningPlatformData(platformId, resource.profile_url);

    db.prepare("UPDATE user_learning_resources SET stats = ?, last_synced = CURRENT_TIMESTAMP WHERE id = ?")
      .run(JSON.stringify(stats), resource.id);

    const updated = db.prepare("SELECT * FROM user_learning_resources WHERE user_id = ? AND platform_id = ?").get(req.user.id, platformId);
    res.json({
      ...updated,
      connected: !!updated.connected,
      stats: JSON.parse(updated.stats || '{}')
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch real-time data from the platform." });
  }
});

router.delete("/:platformId", authenticateToken, (req, res) => {
  const { platformId } = req.params;
  db.prepare("DELETE FROM user_learning_resources WHERE user_id = ? AND platform_id = ?").run(req.user.id, platformId);
  res.json({ message: "Disconnected successfully" });
});

export default router;
