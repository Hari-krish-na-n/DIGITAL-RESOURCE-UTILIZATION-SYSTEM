import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import XLSX from 'xlsx';
import db from '../db.js';

export const aggregateUserData = (userId, filters = {}) => {
    console.log(`[ReportService] Aggregating data for user ${userId}`, filters);
    const { dateFrom, dateTo, platforms = [] } = filters;

    // Build platform filter strings and shared parameters
    let platformSql = '';
    const platformParams = [];
    if (platforms && platforms.length > 0) {
        platformSql = `AND LOWER(platform) IN (${platforms.map(() => 'LOWER(?)').join(',')})`;
        platformParams.push(...platforms);
    }

    let dateSql = '';
    const dateParams = [];
    if (dateFrom && dateTo) {
        dateSql = 'AND sync_date BETWEEN ? AND ?';
        dateParams.push(dateFrom, dateTo);
    }

    try {
        // 1. Get user profile
        const user = db.prepare("SELECT username, email FROM users WHERE id = ?").get(userId);

        // 2. Get latest platform stats
        const latestStatsParams = [userId, userId, ...platformParams];
        const latestStats = db.prepare(`
      SELECT platform, problems_solved, easy_solved, medium_solved, hard_solved, rank, contests, accuracy, speed, sync_date
      FROM activity_logs
      WHERE user_id = ?
      AND id IN (
        SELECT MAX(id)
        FROM activity_logs
        WHERE user_id = ?
        GROUP BY platform
      )
      ${platformSql}
    `).all(...latestStatsParams);

        // 3. Get history for trends (filtered)
        const historyParams = [userId, ...platformParams, ...dateParams];
        const history = db.prepare(`
      SELECT platform, problems_solved, easy_solved, medium_solved, hard_solved, accuracy, speed, rank, sync_date
      FROM activity_logs
      WHERE user_id = ?
      ${platformSql}
      ${dateSql}
      ORDER BY sync_date DESC
      LIMIT 100
    `).all(...historyParams);

        // 4. Get connected profiles
        const connections = db.prepare("SELECT platform, platform_username, last_sync FROM platform_connections WHERE user_id = ?").all(userId);

        // 5. Get learning resources
        const learningCourses = db.prepare("SELECT provider, title, instructor, hours, completion_date FROM learning_courses WHERE user_id = ?").all(userId);
        const learningStats = db.prepare("SELECT platform_id, stats FROM user_learning_resources WHERE user_id = ?").all(userId);

        // 6. Get GitHub repos
        const githubRepos = db.prepare("SELECT name, language, stargazersCount, forksCount, updatedAt FROM github_repos WHERE user_id = ? ORDER BY updatedAt DESC LIMIT 5").all(userId);

        // 7. Get Badges/Achievements
        const badges = db.prepare("SELECT platform, badge_name, stars, icon, awarded_at FROM badges WHERE user_id = ? ORDER BY platform, awarded_at DESC").all(userId);

        console.log(`[ReportService] Aggregated ${latestStats.length} platforms, ${learningCourses.length} courses, and ${badges.length} badges`);

        return {
            user,
            stats: latestStats,
            history,
            connections,
            learningCourses,
            learningStats,
            githubRepos,
            badges,
            generatedAt: new Date().toISOString()
        };
    } catch (err) {
        console.error("[ReportService] Error during aggregation:", err);
        throw err;
    }
};

export const generatePDF = (data, res) => {
    console.log("[ReportService] Generating PDF...");
    try {
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=DRUS_Report_${Date.now()}.pdf`);

        doc.pipe(res);

        // Styling
        doc.fillColor('#10b981').fontSize(24).text('DRUS Performance Report', { align: 'center' });
        doc.fillColor('#6b7280').fontSize(10).text(`Generated for ${data.user?.username || 'User'} (${data.user?.email || 'No email'})`, { align: 'center' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Platform Summary
        doc.fillColor('#111827').fontSize(16).text('Connected Platforms Summary', { underline: true });
        doc.moveDown();

        if (data.stats.length === 0) {
            doc.fontSize(10).text("No platform data found for the selected filters.");
        }

        data.stats.forEach(stat => {
            doc.fillColor('#111827').fontSize(12).text(`${stat.platform}`, { oblique: true });
            doc.fontSize(10).fillColor('#374151');
            if (stat.platform.toLowerCase() === 'unstop') {
                doc.text(`  • Registered: ${stat.problems_solved || 0}`);
                doc.text(`  • Participated: ${stat.contests || 0} | Accuracy/Win Rate: ${(stat.accuracy || 0).toFixed(1)}%`);
                doc.text(`  • Competitions Won: ${stat.rank || 0}`);
            } else if (stat.platform.toLowerCase() === 'github') {
                doc.text(`  • Repositories: ${stat.problems_solved || 0}`);
                doc.text(`  • Followers: ${stat.contests || 0}`);
                doc.text(`  • Total Repository Stars: ${stat.rank || 0}`);
            } else {
                doc.text(`  • Solved: ${stat.problems_solved || 0} (E: ${stat.easy_solved || 0}, M: ${stat.medium_solved || 0}, H: ${stat.hard_solved || 0})`);
                doc.text(`  • Accuracy: ${(stat.accuracy || 0).toFixed(1)}% | Speed: ${(stat.speed || 0).toFixed(2)} prob/hr`);
                doc.text(`  • Current Rank/Rating: ${stat.rank || 'N/A'}`);
            }
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fillColor('#111827').fontSize(16).text('Recent Activity Log', { underline: true });
        doc.moveDown();

        doc.fontSize(10).fillColor('#374151');
        data.history.slice(0, 20).forEach(log => {
            doc.text(`${log.sync_date} | ${(log.platform || '').padEnd(15)} | Solved: ${log.problems_solved || 0} | Acc: ${(log.accuracy || 0).toFixed(1)}%`);
        });

        // Learning Resources
        if (data.learningCourses.length > 0) {
            doc.addPage();
            doc.font('Helvetica-Bold').fillColor('#10b981').fontSize(22).text('Educational Resource Utilization', { align: 'center' });
            doc.moveDown();

            doc.font('Helvetica-Bold').fillColor('#111827').fontSize(16).text('Courses & Certifications', { underline: true });
            doc.moveDown(0.5);

            data.learningCourses.forEach(course => {
                doc.font('Helvetica-Bold').fillColor('#111827').fontSize(11).text(`${course.title}`);
                doc.font('Helvetica').fontSize(9).fillColor('#374151');
                doc.text(`  Provider: ${course.provider} | Instructor: ${course.instructor || 'N/A'}`);
                doc.text(`  Duration: ${course.hours || 0}h | Completed: ${course.completion_date || 'N/A'}`);
                doc.moveDown(0.5);
            });
        }

        // GitHub Repositories
        if (data.githubRepos.length > 0) {
            if (data.learningCourses.length === 0) doc.addPage();
            else doc.moveDown();

            doc.font('Helvetica-Bold').fillColor('#111827').fontSize(16).text('Technical Contributions (GitHub)', { underline: true });
            doc.moveDown(0.5);

            data.githubRepos.forEach(repo => {
                doc.font('Helvetica-Bold').fillColor('#111827').fontSize(11).text(`${repo.name}`);
                doc.font('Helvetica').fontSize(9).fillColor('#374151');
                doc.text(`  Language: ${repo.language || 'Multiple/Unknown'} | Stars: ${repo.stargazersCount || 0} | Forks: ${repo.forksCount || 0}`);
                doc.text(`  Last Updated: ${new Date(repo.updatedAt).toLocaleDateString()}`);
                doc.moveDown(0.5);
            });
        }

        // Badges & Achievements
        if (data.badges.length > 0) {
            doc.addPage();
            doc.font('Helvetica-Bold').fillColor('#f59e0b').fontSize(22).text('Badges & Achievements', { align: 'center' });
            doc.moveDown();

            const platformsWithBadges = [...new Set(data.badges.map(b => b.platform))];

            platformsWithBadges.forEach(platform => {
                doc.font('Helvetica-Bold').fillColor('#111827').fontSize(16).text(platform, { underline: true });
                doc.moveDown(0.5);

                const platformBadges = data.badges.filter(b => b.platform === platform);
                platformBadges.forEach(badge => {
                    doc.font('Helvetica-Bold').fillColor('#111827').fontSize(11).text(`• ${badge.badge_name}`);
                    if (badge.stars) {
                        doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`  Rating: ${badge.stars} Stars`);
                    }
                    doc.moveDown(0.2);
                });
                doc.moveDown();
            });
        }

        doc.moveDown(2);
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#9ca3af').text('Developer Resource & User Statistics System - Build your legacy through code.', { align: 'center' });

        doc.end();
        console.log("[ReportService] PDF Generation finished");
    } catch (err) {
        console.error("[ReportService] PDF Generation Error:", err);
        if (!res.headersSent) {
            res.status(500).send("Error generating PDF");
        }
    }
};

export const generateCSV = (data) => {
    console.log("[ReportService] Generating CSV...");
    const fields = ['sync_date', 'platform', 'problems_solved', 'easy_solved', 'medium_solved', 'hard_solved', 'accuracy', 'speed', 'rank'];
    try {
        const parser = new Parser({ fields });
        return parser.parse(data.history);
    } catch (err) {
        console.error("[ReportService] CSV error:", err);
        throw err;
    }
};

export const generateExcel = (data) => {
    console.log("[ReportService] Generating Excel...");
    try {
        const wb = XLSX.utils.book_new();

        // Stats Sheet
        const statsWs = XLSX.utils.json_to_sheet(data.stats);
        XLSX.utils.book_append_sheet(wb, statsWs, "Current Stats");

        // History Sheet
        const historyWs = XLSX.utils.json_to_sheet(data.history);
        XLSX.utils.book_append_sheet(wb, historyWs, "Activity History");

        // Learning Sheet
        if (data.learningCourses.length > 0) {
            const learningWs = XLSX.utils.json_to_sheet(data.learningCourses);
            XLSX.utils.book_append_sheet(wb, learningWs, "Learning Resources");
        }

        // GitHub Sheet
        if (data.githubRepos.length > 0) {
            const githubWs = XLSX.utils.json_to_sheet(data.githubRepos);
            XLSX.utils.book_append_sheet(wb, githubWs, "GitHub Projects");
        }

        // Badges Sheet
        if (data.badges.length > 0) {
            const badgesWs = XLSX.utils.json_to_sheet(data.badges);
            XLSX.utils.book_append_sheet(wb, badgesWs, "Badges & Achievements");
        }

        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    } catch (err) {
        console.error("[ReportService] Excel error:", err);
        throw err;
    }
};
