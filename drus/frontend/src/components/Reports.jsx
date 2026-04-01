import React, { useState, useEffect } from "react";
import {
    FileText,
    Download,
    Printer,
    ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePlatforms } from "../context/PlatformContext";
import { useUser } from "../context/UserContext";
import client from "../api/client";
import { ReportModal } from "./ReportModal";
import { Button } from "./ui/Button";
import { cn } from "../utils";

export const Reports = () => {
    const { platforms } = usePlatforms();
    const { user } = useUser();
    const [recentLogs, setRecentLogs] = useState([]);
    const [recentBadges, setRecentBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const summary = await client("/platforms/summary");
                if (summary) {
                    if (summary.recentActivity) setRecentLogs(summary.recentActivity);
                    if (summary.badges) setRecentBadges(summary.badges);
                }
            } catch (err) {
                console.error("Failed to fetch logs for report:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const connectedPlatforms = platforms.filter(p => p.connected);

    // Filter platforms into requested columns
    const leftColumnPlatforms = connectedPlatforms.filter(p =>
        ['leetcode', 'github'].includes(p.id.toLowerCase())
    );
    const rightColumnPlatforms = connectedPlatforms.filter(p =>
        ['hackerrank', 'codechef'].includes(p.id.toLowerCase())
    );
    // Any remaining platforms go to a shared list or distributed
    const otherPlatforms = connectedPlatforms.filter(p =>
        !['leetcode', 'github', 'hackerrank', 'codechef'].includes(p.id.toLowerCase())
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style>{`
                @media screen {
                    .report-body {
                        margin: 0;
                        padding: 60px 24px;
                        background: var(--color-bg-main);
                        min-height: 100vh;
                        font-family: 'Inter', system-ui, sans-serif;
                    }
                    .report-container {
                        max-width: 960px;
                        margin: 0 auto;
                        background: var(--color-bg-card);
                        padding: 64px 80px;
                        box-shadow: var(--shadow-premium);
                        border-radius: 2rem;
                        border: 1px solid var(--color-border-subtle);
                        position: relative;
                        overflow: hidden;
                    }
                    .report-container::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 6px;
                        background: linear-gradient(to right, var(--color-accent-primary), var(--color-accent-emerald));
                    }
                    .actions-bar {
                        max-width: 960px;
                        margin: 0 auto 32px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                }

                @media print {
                    body * { visibility: hidden; }
                    .report-container, .report-container * { visibility: visible; }
                    .report-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 40px;
                        box-shadow: none;
                        border-radius: 0;
                        background: #fff !important;
                        border: none !important;
                    }
                    .report-container::before { display: none; }
                    header, nav, .actions-bar, button { display: none !important; }
                    .report-body { background: #fff !important; padding: 0 !important; }
                }

                .report-header {
                    text-align: center;
                    margin-bottom: 48px;
                    border-bottom: 2px solid var(--color-border-subtle);
                    padding-bottom: 32px;
                }

                .report-title {
                    font-size: 42px;
                    font-weight: 900;
                    color: var(--color-text-primary);
                    margin-bottom: 12px;
                    letter-spacing: -3px;
                }

                .report-meta {
                    font-size: 15px;
                    color: var(--color-text-secondary);
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }

                .section-title {
                    font-size: 16px;
                    font-weight: 900;
                    color: var(--color-text-primary);
                    margin: 48px 0 24px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid var(--color-accent-emerald);
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                }

                .platform-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .platform-card {
                    border: 1px solid var(--color-border-subtle);
                    border-radius: 1.5rem;
                    padding: 24px;
                    background: var(--color-bg-card-alt);
                    transition: all 0.3s ease;
                }
                .platform-card:hover {
                    box-shadow: var(--shadow-hover);
                    transform: translateY(-2px);
                    border-color: var(--color-border-hover);
                }

                .platform-name {
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .platform-leetcode { color: #f59e0b; }
                .platform-github { color: #1a202c; }
                .platform-hackerrank { color: #10b981; }
                .platform-codechef { color: #5b4638; }
                .platform-unstop { color: #3b82f6; }

                .metric-row {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    column-gap: 12px;
                    font-size: 13px;
                    margin: 6px 0;
                    align-items: center;
                }

                .metric-label {
                    color: var(--color-text-secondary);
                    font-weight: 700;
                    min-width: 100px;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.05em;
                }

                .metric-value {
                    color: var(--color-text-primary);
                    font-weight: 900;
                    text-align: right;
                    font-size: 14px;
                }

                .badge-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 12px;
                }

                .badge-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--color-bg-card-alt);
                    border-radius: 1.25rem;
                    border: 1px solid var(--color-border-subtle);
                }

                .badge-icon {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                }

                .badge-info h4 {
                    font-size: 13px;
                    font-weight: 900;
                    margin: 0;
                    color: var(--color-text-primary);
                    letter-spacing: -0.01em;
                }

                .badge-info p {
                    font-size: 11px;
                    margin: 4px 0 0;
                    color: var(--color-text-secondary);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }

                .activity-log {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    margin-top: 8px;
                }

                .activity-log th {
                    background: var(--color-accent-emerald);
                    color: #fff;
                    font-weight: 900;
                    padding: 16px 20px;
                    text-align: left;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 11px;
                }

                .activity-log td {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--color-border-subtle);
                    color: var(--color-text-primary);
                    font-weight: 600;
                }

                .activity-log tr:nth-child(even) {
                    background: var(--color-bg-card-alt);
                }

                .text-right { text-align: right; }

                .report-footer {
                    margin-top: 60px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .platform-grid { grid-template-columns: 1fr; }
                    .report-container { padding: 32px 24px; }
                }
            `}</style>

            <div className="report-body">
                {/* Dashboard Actions (Hidden on Print) */}
                <div className="actions-bar no-print">
                    <Link to="/">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl glass hover:bg-bg-card-alt transition-all border-white/40 shadow-xl gap-2 font-black text-xs uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> Back to Base
                        </Button>
                    </Link>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setShowReportModal(true)} className="h-12 px-6 rounded-2xl glass hover:bg-bg-card-alt transition-all border-white/40 shadow-xl gap-2 font-black text-xs uppercase tracking-widest">
                            <Download className="w-4 h-4" /> Data Dump
                        </Button>
                        <Button onClick={handlePrint} className="h-12 px-8 rounded-2xl bg-accent-emerald hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 gap-2 font-black text-xs uppercase tracking-widest">
                            <Printer className="w-4 h-4" /> Deploy Report
                        </Button>
                    </div>
                </div>

                <div className="report-container">
                    {/* Header */}
                    <header className="report-header">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-accent-emerald rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-500/20">D</div>
                            <span className="text-3xl font-black tracking-tighter text-text-primary">DRUS.</span>
                        </div>
                        <h1 className="report-title">Performance Analytics Report</h1>
                        <p className="report-meta">
                            {user?.username || 'Authenticated User'} • {user?.email}
                        </p>
                        <p className="report-meta" style={{ marginTop: '4px' }}>
                            Snapshot Date: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </header>

                    {/* Content Section: Platform Summary */}
                    <h2 className="section-title">Connected Platforms Summary</h2>
                    <div className="platform-grid">
                        {/* Left Column Platforms */}
                        <div className="space-y-4">
                            {[...leftColumnPlatforms, ...otherPlatforms.filter((_, i) => i % 2 === 0)].map(p => (
                                <div key={p.id} className="platform-card">
                                    <div className={cn("platform-name", `platform-${p.id.toLowerCase()}`)}>
                                        {p.name}
                                    </div>
                                    <div className="metric-row">
                                        <span className="metric-label">{p.id === 'unstop' ? 'Registered' : p.id === 'github' ? 'Repos' : 'Solved'}</span>
                                        <span className="metric-value">{p.stats?.solved || 0}</span>
                                    </div>
                                    <div className="metric-row">
                                        <span className="metric-label">{p.id === 'unstop' ? 'Participated' : p.id === 'github' ? 'Followers' : 'Accuracy'}</span>
                                        <span className="metric-value">{p.id === 'unstop' ? (p.stats?.contests || 0) : p.id === 'github' ? (p.stats?.contests || 0) : (p.stats?.accuracy ? `${p.stats.accuracy.toFixed(1)}%` : 'N/A')}</span>
                                    </div>
                                    {p.id !== 'unstop' && p.id !== 'github' && (
                                        <div className="metric-row">
                                            <span className="metric-label">Speed</span>
                                            <span className="metric-value">{p.stats?.speed ? `${p.stats.speed.toFixed(2)}/hr` : 'N/A'}</span>
                                        </div>
                                    )}
                                    <div className="metric-row">
                                        <span className="metric-label">{p.id === 'unstop' ? 'Won' : p.id === 'github' ? 'Stars' : 'Rank'}</span>
                                        <span className="metric-value">{p.stats?.rank || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right Column Platforms */}
                        <div className="space-y-4">
                            {[...rightColumnPlatforms, ...otherPlatforms.filter((_, i) => i % 2 !== 0)].map(p => (
                                <div key={p.id} className="platform-card">
                                    <div className={cn("platform-name", `platform-${p.id.toLowerCase()}`)}>
                                        {p.name}
                                    </div>
                                    <div className="metric-row">
                                        <span className="metric-label">{p.id === 'unstop' ? 'Registered' : p.id === 'github' ? 'Repos' : 'Solved'}</span>
                                        <span className="metric-value">{p.stats?.solved || 0}</span>
                                    </div>
                                    <div className="metric-row">
                                        <span className="metric-label">{p.id === 'unstop' ? 'Participated' : p.id === 'github' ? 'Followers' : 'Accuracy'}</span>
                                        <span className="metric-value">{p.id === 'unstop' ? (p.stats?.contests || 0) : p.id === 'github' ? (p.stats?.contests || 0) : (p.stats?.accuracy ? `${p.stats.accuracy.toFixed(1)}%` : 'N/A')}</span>
                                    </div>
                                    {p.id !== 'unstop' && p.id !== 'github' && (
                                        <div className="metric-row">
                                            <span className="metric-label">Speed</span>
                                            <span className="metric-value">{p.stats?.speed ? `${p.stats.speed.toFixed(2)}/hr` : 'N/A'}</span>
                                        </div>
                                    )}
                                    <div className="metric-row">
                                        <span className="metric-label">{p.id === 'unstop' ? 'Won' : p.id === 'github' ? 'Stars' : 'Rank'}</span>
                                        <span className="metric-value">{p.stats?.rank || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Section: Badges */}
                    {recentBadges.length > 0 && (
                        <>
                            <h2 className="section-title">Badges & Achievements</h2>
                            <div className="badge-grid">
                                {recentBadges.map((badge, i) => (
                                    <div key={i} className="badge-item">
                                        {badge.icon ? (
                                            <img src={badge.icon} alt={badge.badge_name} className="badge-icon" />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                                                ★
                                            </div>
                                        )}
                                        <div className="badge-info">
                                            <h4>{badge.badge_name}</h4>
                                            <p>{badge.platform} {badge.stars ? `• ${badge.stars}★` : ''}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Content Section: Activity Log */}
                    <h2 className="section-title">Recent Activity Log</h2>
                    <table className="activity-log">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Platform</th>
                                <th className="text-right">Solved</th>
                                <th className="text-right">Accuracy</th>
                                <th className="text-right">Speed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLogs.length > 0 ? recentLogs.slice(0, 10).map((log, i) => (
                                <tr key={i}>
                                    <td>{new Date(log.sync_date).toLocaleDateString()}</td>
                                    <td>{log.platform}</td>
                                    <td className="text-right font-bold">+{log.problems_solved}</td>
                                    <td className="text-right">{log.accuracy ? `${log.accuracy.toFixed(1)}%` : '—'}</td>
                                    <td className="text-right">{log.speed ? `${log.speed.toFixed(2)}` : '—'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-400 italic font-medium">No activity data found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <footer className="report-footer">
                        Generated on: {new Date().toLocaleString()} • Powered by DRUS System Hub
                    </footer>
                </div>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                platforms={connectedPlatforms}
            />
        </>
    );
};


const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
