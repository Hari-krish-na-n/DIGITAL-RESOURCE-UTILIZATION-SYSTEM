import db from '../db.js';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * AI Service for DRUS
 * Handles scoring, report generation, and career recommendations
 */
const aiService = {
  /**
   * Calculate AI Performance Score (out of 10)
   * Formula: (0.40C + 0.15B + 0.20Cert + 0.15W + 0.10S)
   */
  async calculateScore(userId) {
    try {
      // 1. Fetch coding progress (C)
      const activity = db.prepare(`
        SELECT SUM(problems_solved) as total_solved, 
               AVG(accuracy) as avg_accuracy,
               COUNT(*) as sync_count
        FROM activity_logs 
        WHERE user_id = ?
      `).get(userId);
      
      const totalSolved = activity?.total_solved || 0;
      const avgAccuracy = activity?.avg_accuracy || 0;
      
      // Fetch GitHub data for Coding Score (C)
      const githubStats = db.prepare(`
        SELECT COUNT(*) as repo_count, 
               SUM(stargazersCount) as total_stars,
               SUM(forksCount) as total_forks
        FROM github_repos WHERE user_id = ?
      `).get(userId);

      const repoCount = githubStats?.repo_count || 0;
      const totalStars = githubStats?.total_stars || 0;
      
      // Refined Coding Score (C): 70% Competitive Programming, 30% Open Source/GitHub
      const compScore = Math.min(10, (totalSolved / 500) * 8 + (avgAccuracy / 100) * 2);
      const osScore = Math.min(10, (repoCount / 10) * 6 + (totalStars * 1) + (githubStats?.total_forks * 2));
      const codingScore = (compScore * 0.7) + (osScore * 0.3);

      // 2. Fetch badges (B)
      const badgesCount = db.prepare(`
        SELECT COUNT(*) as count FROM badges WHERE user_id = ?
      `).get(userId).count;
      // Normalization: 10 badges = 10 score
      const badgeScore = Math.min(10, badgesCount);

      // 3. Fetch certificates (Cert)
      const manualCerts = db.prepare('SELECT COUNT(*) as count FROM learning_courses WHERE user_id = ?').get(userId).count;
      const syncedResources = db.prepare('SELECT stats FROM user_learning_resources WHERE user_id = ?').all(userId);
      let syncedCerts = 0;
      syncedResources.forEach(r => {
        if (r.stats) {
          try {
            const stats = JSON.parse(r.stats);
            syncedCerts += stats.certificates?.length || 0;
          } catch {}
        }
      });
      const certsCount = manualCerts + syncedCerts;
      // Normalization: 5 certificates = 10 score
      const certScore = Math.min(10, certsCount * 2);

      // 4. Fetch wins/competitions (W)
      const compStats = db.prepare(`
        SELECT 
          COUNT(CASE WHEN status = 'Won' THEN 1 END) as wins,
          COUNT(CASE WHEN status = 'Participated' THEN 1 END) as participation
        FROM competitions WHERE user_id = ?
      `).get(userId);
      // Normalization: 3 wins = 10 score, or 10 participations = 10 score
      const winScore = Math.min(10, (compStats.wins * 3.33) + (compStats.participation * 0.5));

      // 5. Fetch consistency/streak (S)
      // We'll calculate consistency based on activity logs over the last 30 days
      const activeDays = db.prepare(`
        SELECT COUNT(DISTINCT sync_date) as active_days 
        FROM activity_logs 
        WHERE user_id = ? AND sync_date >= date('now', '-30 days')
      `).get(userId).active_days;
      // Normalization: 20 active days in a month = 10 score
      const consistencyScore = Math.min(10, (activeDays / 20) * 10);

      // Final score calculation
      const finalScore = (
        (0.40 * codingScore) + 
        (0.15 * badgeScore) + 
        (0.20 * certScore) + 
        (0.15 * winScore) + 
        (0.10 * consistencyScore)
      ).toFixed(2);

      return {
        overall: parseFloat(finalScore),
        breakdown: {
          coding: parseFloat(codingScore.toFixed(2)),
          badges: parseFloat(badgeScore.toFixed(2)),
          certificates: parseFloat(certScore.toFixed(2)),
          wins: parseFloat(winScore.toFixed(2)),
          consistency: parseFloat(consistencyScore.toFixed(2))
        },
        raw: {
          totalSolved,
          badgesCount,
          certsCount,
          wins: compStats.wins,
          activeDays,
          github: {
            repos: repoCount,
            stars: totalStars,
            forks: githubStats?.total_forks || 0
          }
        }
      };
    } catch (error) {
      console.error("AI Score Error:", error);
      throw error;
    }
  },

  /**
   * Generate AI Analytical Report using Gemini
   */
  async generateReport(userId) {
    const scoreData = await this.calculateScore(userId);
    const repos = db.prepare('SELECT name, language, stargazersCount FROM github_repos WHERE user_id = ?').all(userId);
    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);

    const prompt = `
      Generate a professional AI analytical report for user ${user.username} based on their performance data:
      - AI Score: ${scoreData.overall}/10
      - Coding Activity: ${scoreData.raw.totalSolved} problems solved
      - Badges: ${scoreData.raw.badgesCount}
      - Certificates: ${scoreData.raw.certsCount}
      - Competition Wins: ${scoreData.raw.wins}
      - Consistency: ${scoreData.raw.activeDays} days active in the last 30 days
      - GitHub Impact: ${scoreData.raw.github.repos} projects, ${scoreData.raw.github.stars} stars, ${scoreData.raw.github.forks} forks
      - GitHub Details: ${JSON.stringify(repos.map(r => ({ name: r.name, lang: r.language, stars: r.stargazersCount })))}

      The report should include:
      1. Overall Summary
      2. Key Strengths
      3. Areas for Improvement
      4. Learning Trends
      5. Practical Suggestions for Career Growth
      
      Format the output as a clean JSON object with these keys: summary, strengths (array), weaknesses (array), trends (text), suggestions (array).
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Basic JSON cleaning if Gemini adds markdown markers
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.warn("Gemini API not available/configured, using Fallback", error);
      return this.generateFallbackReport(scoreData);
    }
  },

  generateFallbackReport(scoreData) {
    return {
      summary: `You have an AI Score of ${scoreData.overall}/10. Your performance is solid in ${scoreData.breakdown.coding > 7 ? 'coding' : 'initial learning phases'}.`,
      strengths: [
        scoreData.breakdown.coding > 7 ? "Strong problem solving skills" : "Good initial engagement",
        scoreData.breakdown.consistency > 7 ? "High consistency in learning" : "Developing learning habits"
      ],
      weaknesses: [
        scoreData.breakdown.wins < 3 ? "Low competitive participation" : "Could aim for higher-tier wins",
        scoreData.breakdown.certificates < 5 ? "Certification path can be improved" : "Diversify certifications"
      ],
      trends: "Your activity suggests a steady growth in technical proficiency with periodic spikes in problem-solving.",
      suggestions: [
        "Participate in more backend-focused hackathons",
        "Target more medium and hard problems to boost your coding score",
        "Complete specialized certifications in Cloud or DevOps"
      ]
    };
  },

  /**
   * AI Career Recommendation Engine
   */
  async getCareerRecommendations(userId) {
    const scoreData = await this.calculateScore(userId);
    const languages = db.prepare(`
      SELECT language, COUNT(*) as count FROM github_repos WHERE user_id = ? AND language IS NOT NULL GROUP BY language
    `).all(userId);

    const roles = [];
    
    // Simple logic-based suggestions (can be enhanced with Gemini)
    if (scoreData.breakdown.coding > 7) roles.push({ role: "Competitive Programmer", fit: "High" });
    
    const isFrontend = languages.some(l => ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'React'].includes(l.language));
    const isBackend = languages.some(l => ['Python', 'Java', 'Node.js', 'Go', 'PHP'].includes(l.language));

    if (isFrontend && isBackend) roles.push({ role: "Full-stack Developer", fit: "Excellent" });
    else if (isFrontend) roles.push({ role: "Frontend Developer", fit: "High" });
    else if (isBackend) roles.push({ role: "Backend Developer", fit: "High" });

    if (scoreData.raw.totalSolved > 300) roles.push({ role: "Software Engineer", fit: "Strong" });
    
    return roles.length > 0 ? roles : [{ role: "Technical Trainee", fit: "Moderate" }];
  },

  /**
   * AI Resume Generation Data
   */
  async getResumeData(userId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const repos = db.prepare('SELECT * FROM github_repos WHERE user_id = ? LIMIT 5').all(userId);
    const certs = db.prepare('SELECT * FROM learning_courses WHERE user_id = ?').all(userId);
    const activity = await this.calculateScore(userId);

    return {
      personalInfo: {
        name: user.username,
        email: user.email,
        github: `github.com/${user.username}` // Estimated
      },
      summary: `Technically driven Software Developer with an AI performance score of ${activity.overall}/10. Proven track record in solving over ${activity.raw.totalSolved} algorithmic problems.`,
      skills: Array.from(new Set(repos.map(r => r.language).filter(Boolean))),
      achievements: [
        `${activity.raw.totalSolved}+ Coding Problems Solved`,
        `${activity.raw.wins} Competition Wins`,
        `${activity.raw.badgesCount} Technical Badges Earned`
      ],
      certifications: certs.map(c => ({ title: c.title, provider: c.provider, date: c.completion_date })),
      projects: repos.map(r => ({ name: r.name, description: r.description, link: r.htmlUrl }))
    };
  },

  /**
   * Comparative Insights for Growth
   */
  async getInsights(userId) {
    const weeklyActivity = db.prepare(`
      SELECT sync_date, SUM(problems_solved) as solved
      FROM activity_logs
      WHERE user_id = ? AND sync_date >= date('now', '-7 days')
      GROUP BY sync_date
    `).all(userId);

    const platformPerformance = db.prepare(`
      SELECT platform, SUM(problems_solved) as solved, AVG(accuracy) as accuracy
      FROM activity_logs
      WHERE user_id = ?
      GROUP BY platform
    `).all(userId);

    return {
      weeklyTrend: weeklyActivity,
      platformPerformance: platformPerformance,
      growth: {
        lastWeek: weeklyActivity.reduce((a, b) => a + b.solved, 0),
        status: "Increasing"
      }
    };
  },

  /**
   * AI Learning Path Generator
   */
  async getLearningPath(userId) {
    const scoreData = await this.calculateScore(userId);
    const repos = db.prepare('SELECT language FROM github_repos WHERE user_id = ?').all(userId);
    const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean)));

    const roadmapPrompt = `
      Based on the user's data:
      - Current AI Score: ${scoreData.overall}/10
      - Weak Areas: ${Object.entries(scoreData.breakdown).filter(([_, v]) => v < 6).map(([k]) => k).join(', ')}
      - Existing Languages: ${languages.join(', ')}
      - Problems Solved: ${scoreData.raw.totalSolved}

      Generate a personalized 4-week learning roadmap to reach an AI score of 9.0.
      Format the output as a JSON array of 4 objects, each with 'week', 'focus', and 'tasks' (array of strings).
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(roadmapPrompt);
      const output = (await result.response).text().replace(/```json|```/g, "").trim();
      return JSON.parse(output);
    } catch (error) {
      return [
        { week: 1, focus: "Problem Solving Mastery", tasks: ["Solve 15 Medium problems", "Focus on Data Structures"] },
        { week: 2, focus: "Project Impact", tasks: ["Add stars to 2 projects", "Write documentation for main repo"] },
        { week: 3, focus: "Certification Boost", tasks: ["Complete a Cloud certification", "Watch 5 hours of specialized content"] },
        { week: 4, focus: "Competition Participation", tasks: ["Participate in 2 contests", "Aim for top 20% in one"] }
      ];
    }
  },

  /**
   * AI Skill Gap Analysis
   */
  async getSkillGapAnalysis(userId) {
    const repos = db.prepare('SELECT language FROM github_repos WHERE user_id = ?').all(userId);
    const userSkills = Array.from(new Set(repos.map(r => r.language).filter(Boolean)));
    
    // Define industry requirements for roles
    const skillSets = {
      "Fullstack Developer": ["Node.js", "React", "Docker", "AWS", "SQL", "TypeScript"],
      "Backend Engineer": ["Python", "Go", "PostgreSQL", "Redis", "Kafka", "Kubernetes"],
      "Data Analyst": ["Python", "SQL", "Pandas", "Tableau", "PowerBI", "Statistics"]
    };

    const gaps = Object.entries(skillSets).map(([role, requirements]) => {
      const missing = requirements.filter(s => !userSkills.includes(s));
      const match = Math.round(((requirements.length - missing.length) / requirements.length) * 100);
      return { role, match, missing };
    });

    return gaps;
  },

  /**
   * AI Motivation & Productivity Booster
   */
  async getMotivation(userId) {
    const stats = await this.calculateScore(userId);
    const lastActivity = db.prepare('SELECT sync_date FROM activity_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(userId);
    const daysSince = lastActivity ? Math.floor((new Date() - new Date(lastActivity.sync_date)) / (1000 * 60 * 60 * 24)) : 7;

    const messages = {
      active: [
        "You're in the elite flow! Your consistency is in the top 5%.",
        "Legend status approaching. Keep this momentum for 3 more days.",
        "Your AI Score is surging. The ecosystem is responding well."
      ],
      stale: [
        "The signals are fading. Time to push one new problem.",
        "Consistency is king. Don't let your streak break today.",
        "Your score dropped slightly. A quick session will fix it!"
      ]
    };

    const pool = daysSince <= 1 ? messages.active : messages.stale;
    return {
      message: pool[Math.floor(Math.random() * pool.length)],
      streak: stats.raw.activeDays,
      status: daysSince <= 1 ? "Blazing" : "Cooling Down"
    };
  },

  /**
   * AI Chat Assistant for Digital Performance
   */
  async chat(userId, message) {
    try {
      const scoreData = await this.calculateScore(userId);
      const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
      const username = user?.username || "Learner";
      
      const context = `
        User ${username} has an AI Score of ${scoreData.overall}/10.
        Breakdown: Coding: ${scoreData.breakdown.coding}, Badges: ${scoreData.breakdown.badges}, Certificates: ${scoreData.breakdown.certificates}, Wins: ${scoreData.breakdown.wins}, Consistency: ${scoreData.breakdown.consistency}.
        Total Solved: ${scoreData.raw.totalSolved}.
        GitHub: ${scoreData.raw.github.repos} repos, ${scoreData.raw.github.stars} stars.
        Recent Activity: ${scoreData.raw.activeDays} days in the last month.
      `;

      const prompt = `
        Context: ${context}
        User Question: ${message}
        
        Instructions: Answer as high-tier TECHNICAL AI PERFORMANCE COACH for the DRUS.
        Use data from the context to justify your answer. Be extremely specific about numbers.
      `;

      // Check if API key is the default placeholder or empty
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
          throw new Error("PLACEHOLDER_KEY");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return (await result.response).text();
    } catch (error) {
      console.error("AI Assistant Logic Node:", error.message);
      
      // Intelligent data-driven fallback if Gemini is unreachable/unconfigured
      const scoreData = await this.calculateScore(userId);
      if (message.toLowerCase().includes('score') || message.toLowerCase().includes('performance')) {
          return `My neural uplink to Gemini is currently offline, but I can still read your telemetry: Your overall AI Score is ${scoreData.overall}/10. Your strongest area is ${Object.entries(scoreData.breakdown).sort((a,b) => b[1]-a[1])[0][0]} and you should focus on ${Object.entries(scoreData.breakdown).sort((a,b) => a[1]-b[1])[0][0]}. Update your GEMINI_API_KEY in .env to unlock full analytical chat!`;
      }
      return "Local subnet active: To unlock full AI-driven reasoning and deep-dive analysis, please configure a valid GEMINI_API_KEY in the backend .env file. Your performance metrics are currently synced and visible on the dashboard.";
    }
  }
};

export default aiService;
