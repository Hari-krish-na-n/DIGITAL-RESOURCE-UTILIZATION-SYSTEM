import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
    aggregateUserData,
    generatePDF,
    generateCSV,
    generateExcel
} from "../services/reportService.js";

const router = express.Router();

router.post("/generate", authenticateToken, async (req, res) => {
    const { format, filters } = req.body;
    const userId = req.user.id;

    try {
        const data = aggregateUserData(userId, filters);

        if (data.stats.length === 0) {
            return res.status(404).json({ error: "No data found for the selected criteria." });
        }

        switch (format?.toLowerCase()) {
            case 'pdf':
                generatePDF(data, res);
                break;

            case 'csv':
                const csv = generateCSV(data);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=DRUS_Report_${Date.now()}.csv`);
                res.send(csv);
                break;

            case 'excel':
            case 'xlsx':
                const excel = generateExcel(data);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=DRUS_Report_${Date.now()}.xlsx`);
                res.send(excel);
                break;

            default:
                res.status(400).json({ error: "Invalid report format. Supported: PDF, CSV, Excel" });
        }
    } catch (error) {
        console.error("[Reports] Generation error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
});

export default router;
