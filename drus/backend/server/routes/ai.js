import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Get AI performance score
router.get('/score', authenticateToken, async (req, res) => {
  try {
    const score = await aiService.calculateScore(req.user.id);
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate AI analytical report
router.get('/report', authenticateToken, async (req, res) => {
  try {
    const report = await aiService.generateReport(req.user.id);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get career recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const recommendations = await aiService.getCareerRecommendations(req.user.id);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export profile/report as PDF
router.get('/export-pdf', authenticateToken, async (req, res) => {
  try {
    const report = await aiService.generateReport(req.user.id);
    const resumeData = await aiService.getResumeData(req.user.id);
    const scoreData = await aiService.calculateScore(req.user.id);

    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DRUS_AI_Profile_${req.user.username}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#10b981').text('DRUS AI PERFORMANCE PROFILE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).fillColor('black').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // User Info
    doc.fontSize(16).text(`User: ${req.user.username}`);
    doc.fontSize(12).text(`Email: ${req.user.email}`);
    doc.moveDown();

    // AI Score
    doc.fontSize(18).fillColor('#059669').text(`AI Performance Score: ${scoreData.overall}/10`);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('black').text(`- Coding Score: ${scoreData.breakdown.coding}/10`);
    doc.text(`- Badges Score: ${scoreData.breakdown.badges}/10`);
    doc.text(`- Certificates Score: ${scoreData.breakdown.certificates}/10`);
    doc.text(`- Win/Participate Score: ${scoreData.breakdown.wins}/10`);
    doc.text(`- Consistency Score: ${scoreData.breakdown.consistency}/10`);
    doc.moveDown();

    // Summary
    doc.fontSize(14).fillColor('#10b981').text('AI Analytical Summary');
    doc.fontSize(10).fillColor('black').text(report.summary || 'Summary not available');
    doc.moveDown();

    // Strengths
    doc.fontSize(14).fillColor('#10b981').text('Key Strengths');
    report.strengths?.forEach(s => doc.fontSize(10).fillColor('black').text(`• ${s}`));
    doc.moveDown();

    // Resume Summary
    doc.addPage();
    doc.fontSize(20).fillColor('#047857').text('PROFESSIONAL RESUME DRAFT', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).fillColor('#10b981').text('Executive Summary');
    doc.fontSize(10).fillColor('black').text(resumeData.summary);
    doc.moveDown();

    doc.fontSize(14).fillColor('#10b981').text('Technical Skills');
    doc.fontSize(10).fillColor('black').text(resumeData.skills.join(', '));
    doc.moveDown();

    doc.fontSize(14).fillColor('#10b981').text('Projects');
    resumeData.projects.forEach(p => {
      doc.fontSize(11).fillColor('#10b981').text(p.name);
      doc.fontSize(9).fillColor('black').text(p.description || 'No description provided');
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get comparative insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const insights = await aiService.getInsights(req.user.id);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get personalized learning path
router.get('/learning-path', authenticateToken, async (req, res) => {
  try {
    const path = await aiService.getLearningPath(req.user.id);
    res.json(path);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get skill gap analysis
router.get('/skill-gap', authenticateToken, async (req, res) => {
  try {
    const gaps = await aiService.getSkillGapAnalysis(req.user.id);
    res.json(gaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI coaching/motivation
router.get('/motivation', authenticateToken, async (req, res) => {
  try {
    const motivation = await aiService.getMotivation(req.user.id);
    res.json(motivation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Chat Assistant
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    const reply = await aiService.chat(req.user.id, message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
