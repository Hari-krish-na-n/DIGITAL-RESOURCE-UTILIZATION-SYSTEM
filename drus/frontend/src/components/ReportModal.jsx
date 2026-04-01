import React, { useState } from "react";
import {
    FileText,
    Download,
    Calendar,
    Filter,
    X,
    ChevronRight,
    Layout,
    CheckCircle2,
    FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { cn } from "../utils";
import client from "../api/client";

export const ReportModal = ({ isOpen, onClose, platforms }) => {
    const [format, setFormat] = useState("pdf");
    const [loading, setLoading] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [dateRange, setDateRange] = useState({ from: "", to: "" });

    const togglePlatform = (id) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    format,
                    filters: {
                        dateFrom: dateRange.from,
                        dateTo: dateRange.to,
                        platforms: selectedPlatforms
                    }
                })
            });

            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DRUS_Report_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Error generating report: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-bg-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-border-subtle"
                >
                    <div className="p-8 space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                        <FileText className="w-5 h-5 text-accent-primary" />
                                    </div>
                                    User Report Generation
                                </h2>
                                <p className="text-text-secondary text-xs font-bold uppercase tracking-widest px-1">
                                    Configure your performance export
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-xl hover:bg-bg-main text-text-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Formats & Platforms */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Layout className="w-3 h-3" /> Report Format
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: "pdf", icon: FileText, label: "PDF" },
                                            { id: "csv", icon: FileSpreadsheet, label: "CSV" },
                                            { id: "excel", icon: Download, label: "Excel" }
                                        ].map((fmt) => (
                                            <button
                                                key={fmt.id}
                                                onClick={() => setFormat(fmt.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                                                    format === fmt.id
                                                        ? "bg-accent-primary/5 border-accent-primary shadow-lg shadow-accent-primary/10"
                                                        : "bg-bg-main border-transparent hover:border-border-subtle"
                                                )}
                                            >
                                                <fmt.icon className={cn("w-6 h-6", format === fmt.id ? "text-accent-primary" : "text-text-secondary")} />
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", format === fmt.id ? "text-text-primary" : "text-text-secondary")}>
                                                    {fmt.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Filter className="w-3 h-3" /> Filter by Platforms
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {platforms.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => togglePlatform(p.id)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2",
                                                    selectedPlatforms.includes(p.id)
                                                        ? "bg-accent-emerald/10 border-accent-emerald text-accent-emerald"
                                                        : "bg-bg-main border-border-subtle text-text-secondary hover:border-text-secondary"
                                                )}
                                            >
                                                {selectedPlatforms.includes(p.id) && <CheckCircle2 className="w-3 h-3" />}
                                                {p.name}
                                            </button>
                                        ))}
                                        {platforms.length === 0 && <span className="text-[10px] text-text-secondary italic">No connected platforms</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Date Filters */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Date Range
                                    </label>
                                    <div className="space-y-3 p-4 bg-bg-main rounded-2xl border border-border-subtle">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest px-1">From</span>
                                            <input
                                                type="date"
                                                value={dateRange.from}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                                className="w-full bg-bg-card border-none rounded-xl p-3 text-xs text-text-primary focus:ring-2 focus:ring-accent-primary"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest px-1">To</span>
                                            <input
                                                type="date"
                                                value={dateRange.to}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                                className="w-full bg-bg-card border-none rounded-xl p-3 text-xs text-text-primary focus:ring-2 focus:ring-accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Card className="bg-accent-primary/5 border-accent-primary/20">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <div className="p-2 bg-accent-primary/10 rounded-lg">
                                            <ChevronRight className="w-4 h-4 text-accent-primary" />
                                        </div>
                                        <p className="text-[10px] font-medium text-text-secondary leading-relaxed">
                                            Reports include aggregated solving counts, accuracy trends, and profile summaries based on the selected filters.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                loading={loading}
                                className="flex-[2] h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-accent-primary/20"
                            >
                                Generate & Export
                                <Download className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
