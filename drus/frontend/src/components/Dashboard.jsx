import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Activity,
  RefreshCw,
  Trophy,
  Star,
  Github as GitHubIcon,
  ChevronRight,
  ExternalLink,
  Folder,
  GitFork,
  GraduationCap,
  FileText,
  Swords,
  Medal,
  Target,
  Flame,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Brain
} from "lucide-react";
import { motion } from "motion/react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { usePlatforms } from "../context/PlatformContext";
import { useAI } from "../context/AIContext";
import client from "../api/client";
import { animate, useMotionValue } from "motion/react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { cn } from "../utils";
import { HackerRankBadge } from "./platforms/HackerRankBadge";
import { ReportModal } from "./ReportModal";

// Module-level helper — must be outside any component to avoid TDZ errors
const getPlatformColorClasses = (platformId) => {
  switch (platformId) {
    case "leetcode": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "codeforces": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    case "hackerrank": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "github": return "text-[var(--color-text-primary)] bg-[var(--color-text-primary)]/10 border-[var(--color-text-primary)]/20";
    case "codechef": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "atcoder": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case "unstop": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    default: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  }
};

const Counter = ({ value }) => {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1,
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, count]);

  return <span className="font-mono"><>{displayValue.toLocaleString()}</></span>;
};

const CompactPlatformCard = ({ platform }) => {
  const colorClasses = getPlatformColorClasses(platform?.id ?? "");

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="group glass-card overflow-hidden relative border-white/20 dark:border-white/5">
        <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-12 -mt-12 bg-current transition-opacity group-hover:opacity-30",
          platform.id === 'leetcode' ? 'text-accent-amber' :
            platform.id === 'codeforces' ? 'bg-accent-blue' :
              platform.id === 'hackerrank' ? 'text-accent-emerald' :
                platform.id === 'github' ? 'text-accent-purple' : 
                  platform.id === 'unstop' ? 'text-blue-500' : 'text-accent-primary'
        )} />

        <CardContent className="p-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border text-base font-black shadow-inner transition-all group-hover:rotate-12 group-hover:scale-110", colorClasses)}>
                {platform.name[0]}
              </div>
              <div>
                <span className="text-lg font-black text-text-primary block leading-none mb-1 group-hover:text-accent-primary transition-colors">{platform.name}</span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-60">System Node</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-50">
                {platform.id === 'github' ? "Repos" : platform.id === 'unstop' ? "Registrations" : "Solved"}
              </p>
              <p className="text-2xl font-black text-text-primary tabular-nums tracking-tighter">
                {platform.stats?.solved || 0}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-50">
                {platform.id === 'unstop' ? 'Won' : platform.id === 'github' ? 'Stars' : 'Rank'}
              </p>
              <p className="text-2xl font-black text-text-primary truncate tracking-tighter">
                {platform.stats?.rank || "—"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle/30 flex items-center justify-between group-hover:border-accent-primary/20 transition-colors mt-auto">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">
              {platform.lastSynced ? new Date(platform.lastSynced.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB') : "Never"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-bg-card-alt border border-border-subtle/50 flex items-center justify-center group-hover:bg-accent-primary group-hover:border-accent-primary group-hover:text-white transition-all shadow-sm">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const Dashboard = () => {
  const { platforms, loading: platformsLoading, syncAllPlatforms } = usePlatforms();
  const { score: aiScore, fetchAIScore } = useAI();
  const [analytics, setAnalytics] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);
  const [learningSummary, setLearningSummary] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchAIScore();
  }, [fetchAIScore]);

  const fetchData = useCallback(async () => {
    try {
      // Run all fetches concurrently; individual failures won't crash the whole dashboard
      const [analyticsResult, summaryResult, reposResult, learningResult, competitionsResult] = await Promise.allSettled([
        client("/stats/analytics"),
        client("/dashboard/summary"),
        client("/stats/repos"),
        client("/learning/summary"),
        client("/competitions")
      ]);

      // Analytics — group by date across platforms
      if (analyticsResult.status === "fulfilled" && Array.isArray(analyticsResult.value)) {
        const grouped = analyticsResult.value.reduce((acc, curr) => {
          if (!acc[curr.sync_date]) {
            acc[curr.sync_date] = { sync_date: curr.sync_date, total_solved: 0 };
          }
          acc[curr.sync_date].total_solved += (curr.solved || 0);
          return acc;
        }, {});
        setAnalytics(Object.values(grouped));
      }

      // Summary — backend returns { connections, recentActivity, badges }
      if (summaryResult.status === "fulfilled" && summaryResult.value) {
        const summary = summaryResult.value;
        // recentActivity is a flat array of { platform, problems_solved, sync_date }
        const logs = Array.isArray(summary.recentActivity)
          ? summary.recentActivity
          : Array.isArray(summary)
            ? summary   // fallback if endpoint returns plain array
            : [];
        setRecentLogs(logs);
      }

      // GitHub repos — separate endpoint /api/stats/repos
      if (reposResult.status === "fulfilled" && Array.isArray(reposResult.value)) {
        setGithubRepos(reposResult.value);
      }

      // Learning summary — may 404 if not connected; that's fine
      if (learningResult.status === "fulfilled" && learningResult.value) {
        setLearningSummary(learningResult.value);
      }

      // Competitions
      if (competitionsResult.status === "fulfilled" && Array.isArray(competitionsResult.value)) {
        setCompetitions(competitionsResult.value);
      }
    } catch (err) {
      // Unexpected top-level error
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      await syncAllPlatforms();
      await fetchData();
    } finally {
      setSyncingAll(false);
    }
  };

  const connectedPlatforms = platforms.filter(p => p.connected);
  const totalSolved = platforms.filter(p => p.id !== 'github').reduce((acc, p) => acc + (p.stats?.solved || 0), 0);
  const totalBadges = platforms.reduce((acc, p) => acc + (p.badges?.length || 0), 0);
  const totalContests = platforms.reduce((acc, p) => acc + (p.stats?.contests || 0), 0);
  const totalRepos = platforms.find(p => p.id === 'github')?.stats?.solved || 0;

  const lastSyncTime = platforms.reduce((latest, p) => {
    if (!p.lastSynced) return latest;
    const current = new Date(p.lastSynced.replace(' ', 'T') + 'Z').getTime();
    return current > latest ? current : latest;
  }, 0);

  const formatLastSynced = (timestamp) => {
    if (timestamp === 0) return "Never synced";
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  if (loading || platformsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-accent-primary animate-spin" />
        <p className="text-text-secondary text-sm font-medium animate-pulse">Aggregating your data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 relative">
      {/* Mesh background effect (can be scoped or global) */}
      <div className="fixed inset-0 mesh-bg -z-10 opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10 transition-all duration-500">
        <div className="space-y-4">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] leading-none">Telemetry Active</span>
          </motion.div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tighter leading-[1.1] mb-2">
              Welcome back, <span className="text-gradient">Explorer</span>.
            </h1>
            <p className="text-base text-text-secondary max-w-xl font-medium leading-relaxed">
              Real-time synchronization active across all <span className="text-text-primary font-bold">{connectedPlatforms.length} nodes</span>. Overall utilization score optimized.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/ai-profile">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-mint-500 rounded-2xl shadow-xl shadow-emerald-500/20 text-white flex items-center gap-4 border border-white/20"
            >
              <div className="p-2 bg-white/20 rounded-xl">
                <Brain className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-80">Sync Health / AI Score</span>
                <span className="text-2xl font-black tracking-tighter leading-none">{aiScore?.overall || '—'}<span className="text-xs ml-1 opacity-60">/ 10</span></span>
              </div>
            </motion.div>
          </Link>

          <Button
            variant="outline"
            onClick={() => setShowReportModal(true)}
            className="h-14 px-8 rounded-2xl glass hover:bg-bg-card-alt hover:shadow-xl transition-all group border-white/40"
          >
            <FileText className="w-5 h-5 mr-3 text-accent-primary group-hover:scale-110 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">Growth Report</span>
          </Button>

          <Button
            onClick={handleSyncAll}
            loading={syncingAll}
            disabled={syncingAll || connectedPlatforms.length === 0}
            className="h-14 px-10 rounded-2xl glow-primary shadow-2xl shadow-accent-primary/30 bg-accent-primary text-white hover:bg-accent-primary hover:scale-105 active:scale-95 transition-all border-none"
          >
            <RefreshCw className={cn("w-5 h-5 mr-3", syncingAll && "animate-spin")} />
            <span className="font-black text-xs uppercase tracking-widest">{syncingAll ? "Syncing Nodes..." : "Sync Systems"}</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {[
          { label: "Total Solved", value: totalSolved, icon: Trophy, color: "accent-emerald", gradient: "from-emerald-400 to-emerald-600", link: "/analytics" },
          { label: "Active Nodes", value: connectedPlatforms.length, icon: Activity, color: "accent-primary", gradient: "from-mint-400 to-emerald-600", link: "/platforms" },
          { label: "Achievements", value: totalBadges, icon: Star, color: "accent-sage", gradient: "from-emerald-300 to-emerald-500", link: "/analytics" },
          { label: "Code Footprint", value: totalRepos, icon: GitHubIcon, color: "accent-forest", gradient: "from-emerald-700 to-forest-900", link: "/repositories" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
          >
            <Link to={stat.link}>
              <Card className="h-full glass-card border-white/30 dark:border-white/5 overflow-hidden group cursor-pointer active:scale-95 transition-all duration-300">
                <div className={cn("absolute inset-x-0 bottom-0 h-1 opacity-40 bg-gradient-to-r", stat.gradient)} />
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                      stat.color === 'accent-emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-xl shadow-emerald-500/10' :
                        stat.color === 'accent-primary' ? 'bg-mint-500/10 border-mint-500/20 text-emerald-500 shadow-xl shadow-emerald-500/10' :
                          stat.color === 'accent-sage' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 shadow-xl shadow-emerald-400/10' :
                            'bg-emerald-900/10 border-emerald-900/20 text-emerald-800 shadow-xl shadow-emerald-800/10'
                    )}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-30">Node 0{i + 1}</div>
                  </div>

                  <h3 className="text-6xl font-black text-text-primary tracking-tighter mb-2 group-hover:text-accent-primary transition-colors">
                    {typeof stat.value === 'number' ? <Counter value={stat.value} /> : <span className="font-mono">{stat.value}</span>}
                  </h3>
                  <p className="text-[13px] font-black text-text-secondary uppercase tracking-[0.3em] mb-6 opacity-60">
                    {stat.label}
                  </p>

                  <div className="flex items-center gap-3 pt-6 border-t border-border-subtle/30 group-hover:border-border-subtle/60 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full animate-bounce",
                      stat.color === 'accent-emerald' ? 'bg-emerald-500' :
                        stat.color === 'accent-primary' ? 'bg-mint-400' :
                          stat.color === 'accent-sage' ? 'bg-emerald-300' : 'bg-forest-900'
                    )} />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                      Sync: {formatLastSynced(lastSyncTime)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Growth & Breakdown (Left) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Growth Chart */}
          <Card className="glass border-white/40 overflow-hidden group rounded-2xl">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">Growth Trajectory</h3>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Aggregate Solve Pattern • Last 7 Days</p>
                </div>
                <div className="flex gap-2 glass p-1 rounded-xl border-white/50">
                  <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 rounded-lg">Real-Time</button>
                  <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors">Historical</button>
                </div>
              </div>

              <div className="h-[400px] w-full mt-4 transform group-hover:scale-[1.005] transition-transform duration-700">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics}>
                    <defs>
                      <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis
                      dataKey="sync_date"
                      stroke="var(--color-text-secondary)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                      dy={10}
                      tick={{ fill: 'var(--color-text-secondary)', fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="var(--color-text-secondary)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickCount={5}
                      dx={-10}
                      tick={{ fill: 'var(--color-text-secondary)', fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg-card)', 
                        border: '1px solid var(--color-border-subtle)', 
                        borderRadius: '1.25rem', 
                        fontSize: '11px', 
                        color: 'var(--color-text-primary)', 
                        boxShadow: 'var(--shadow-hover)' 
                      }}
                      itemStyle={{ color: 'var(--color-accent-primary)', fontWeight: '900' }}
                      cursor={{ stroke: 'var(--color-accent-primary)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 'bold', marginBottom: '6px' }}
                      formatter={(value) => [value, 'Solved']}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_solved"
                      stroke="var(--color-accent-primary)"
                      fillOpacity={1}
                      fill="url(#colorSolved)"
                      strokeWidth={3}
                      activeDot={{ r: 8, fill: "var(--color-accent-primary)", stroke: "var(--color-bg-card)", strokeWidth: 3 }}
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-border-subtle/30">
                {connectedPlatforms.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex flex-col gap-1.5 group/source">
                    <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 group-hover/source:opacity-100 transition-opacity">{p.name} Source</span>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-2 h-2 rounded-full shadow-sm group-hover/source:scale-125 transition-transform",
                        p.id === 'leetcode' ? 'bg-accent-amber' :
                          p.id === 'codeforces' ? 'bg-accent-blue' :
                            p.id === 'hackerrank' ? 'bg-accent-emerald' :
                              p.id === 'github' ? 'bg-accent-purple' : 'bg-accent-primary'
                      )} />
                      <span className="text-lg font-black text-text-primary group-hover/source:text-accent-primary transition-colors">{p.stats?.solved || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">Connected Nodes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectedPlatforms.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <CompactPlatformCard platform={p} />
                </motion.div>
              ))}
              {connectedPlatforms.length === 0 && (
                <div className="col-span-full py-16 text-center glass border-dashed border-2 rounded-[2.5rem]">
                  <p className="text-text-secondary font-bold text-sm">
                    No active connections detected.
                    <Link to="/platforms" className="text-accent-primary ml-2 hover:underline">Link Systems →</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learning & Activity (Right) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Learning Progress Card */}
          <Card className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] text-white border-none shadow-2xl overflow-hidden relative rounded-[2.5rem] group/hub">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none group-hover/hub:bg-accent-primary/30 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-emerald/10 blur-[100px] -ml-32 -mb-32 rounded-full pointer-events-none group-hover/hub:bg-accent-emerald/20 transition-all duration-700" />

            <CardContent className="p-10 space-y-10 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-1 text-white">Learning Hub</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Synaptic Progress Monitor</p>
                </div>
                <motion.div 
                   whileHover={{ rotate: 360 }}
                   transition={{ duration: 0.8 }}
                   className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl"
                >
                  <GraduationCap className="w-7 h-7 text-emerald-400" />
                </motion.div>
              </div>

              <div className="grid gap-6">
                {/* Udemy Segment */}
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group/item">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#A435F0] shadow-[0_0_10px_#A435F0]" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/90">Udemy Subnet</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 group-hover/item:text-emerald-300 transition-colors">ACTIVE SYNC</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6 border-b border-white/5 pb-6 mb-3">
                    <div className="space-y-1">
                      <p className="text-3xl font-black leading-none tracking-tighter group-hover/item:scale-110 transition-transform origin-left">{learningSummary?.udemyCourses || 0}</p>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Enrollments</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-3xl font-black leading-none tracking-tighter group-hover/item:scale-110 transition-transform origin-right">{learningSummary?.udemyCertificates || 0}</p>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Awards</p>
                    </div>
                  </div>
                </div>

                {/* Coursera Segment */}
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group/item">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0056D2] shadow-[0_0_10px_#0056D2]" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#93c5fd]">Coursera Subnet</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 group-hover/item:text-emerald-300 transition-colors">ACTIVE SYNC</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6 border-b border-white/5 pb-6 mb-3">
                    <div className="space-y-1">
                      <p className="text-3xl font-black leading-none tracking-tighter group-hover/item:scale-110 transition-transform origin-left">{learningSummary?.courseraCourses || 0}</p>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Curriculum</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-3xl font-black leading-none tracking-tighter group-hover/item:scale-110 transition-transform origin-right text-blue-400">{learningSummary?.courseraCertificates || 0}</p>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Milestones</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/courses" className="block">
                <Button className="w-full h-14 rounded-2xl bg-white text-[#0f172a] hover:bg-emerald-400 hover:text-white transition-all duration-500 font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl">
                  Full Portfolio Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Achievement Matrix */}
          <Card className="glass border-white/40 overflow-hidden group rounded-2xl">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">Achievement Matrix</h3>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Platform-Wide Milestones</p>
                </div>
                <Trophy className="w-5 h-5 text-accent-amber animate-bounce" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {platforms
                  .flatMap(p => (p.badges || []).map(b => ({ ...b, platform: p.id })))
                  .sort((a, b) => new Date(b.awarded_at) - new Date(a.awarded_at))
                  .slice(0, 8)
                  .map((badge, idx) => (
                    badge.platform === 'hackerrank' ? (
                      <HackerRankBadge key={idx} badge={badge} />
                    ) : (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className="p-4 rounded-2xl bg-white/40 border border-white/60 hover:border-accent-amber/30 transition-all flex flex-col items-center text-center gap-3 group/badge"
                      >
                        <div className="w-12 h-12 relative flex items-center justify-center">
                          <div className="absolute inset-0 bg-accent-amber/10 blur-xl opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                          {badge.icon ? (
                            <img
                              src={badge.icon.startsWith('http') || badge.icon.startsWith('/') ? badge.icon : `https://hrcdn.net/fcore/assets/badges/${badge.icon}.svg`}
                              alt={badge.name}
                              className="w-full h-full object-contain relative z-10 drop-shadow-md"
                              onError={(e) => { e.target.src = 'https://hrcdn.net/fcore/assets/badges/problem-solving.svg' }}
                            />
                          ) : (
                            <Star className="w-6 h-6 text-accent-amber" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-text-primary uppercase tracking-wider line-clamp-1">{badge.badge_name || badge.name}</p>
                          <p className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">{badge.platform}</p>
                        </div>
                      </motion.div>
                    )
                  ))
                }
                {totalBadges === 0 && (
                  <div className="col-span-2 py-8 text-center opacity-30 italic text-xs font-bold uppercase tracking-widest">
                    Awaiting First Milestone
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowReportModal(true)}
                className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-border-subtle hover:border-accent-amber transition-all"
              >
                View Achievement Log
              </Button>
            </CardContent>
          </Card>

          {/* Activity Logs Card */}
          <Card className="glass border-white/40 overflow-hidden rounded-2xl">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">Recent Signals</h3>
                <Activity className="w-5 h-5 text-accent-primary animate-pulse" />
              </div>

              <div className="space-y-6">
                {recentLogs.length === 0 ? (
                  <div className="text-center py-10 opacity-40 italic text-sm font-medium">Listening for platform activity...</div>
                ) : recentLogs.slice(0, 5).map((log, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-4 items-center group cursor-default">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-bg-main border border-border-subtle flex items-center justify-center font-black text-xs text-text-primary group-hover:border-accent-emerald transition-colors">
                        {log.platform?.[0] || 'S'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-primary group-hover:text-emerald-500 transition-colors">
                        {log.platform ?? "System sync"}
                      </p>
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                        {log.sync_date ? new Date(log.sync_date).toLocaleDateString('en-GB') : "Real-time"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn("text-base font-black tabular-nums", (log.problems_solved || 0) > 0 ? "text-emerald-500" : "text-text-primary")}>
                        {(log.problems_solved || 0) > 0 ? `+${log.problems_solved}` : '0'}
                      </span>
                      <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">Delta</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/analytics" className="block">
                <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-border-subtle group hover:border-accent-primary transition-all">
                  Full Evolution Logs <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Repositories Overlay (Optional/Bottom) */}
      {githubRepos.length > 0 && (
        <div className="space-y-6 relative z-10 py-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">Code Ecosystem</h3>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">GitHub Technical Footprint</p>
            </div>
            <a
              href={`https://github.com/${platforms.find(p => p.id === 'github')?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-accent-primary transition-colors"
            >
              Open Main Terminal <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {githubRepos.slice(0, 4).map((repo, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="h-48 glass border-white/50 group hover:border-purple-500/30 transition-all flex flex-col justify-between p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <GitHubIcon className="w-5 h-5 text-text-primary group-hover:text-purple-500 transition-colors" />
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-bold">{repo.stargazersCount}</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-text-primary truncate">{repo.name}</h4>
                  </div>

                  <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest text-[#a78bfa]">
                        {repo.language || 'Code'} · LIVE
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Competitions & Hackathons Section */}
      {(() => {
        const competitionPlatforms = connectedPlatforms.filter(p =>
          ['unstop', 'codeforces', 'leetcode'].includes(p.id)
        );
        if (competitionPlatforms.length === 0) return null;

        const totalParticipated = competitionPlatforms.reduce((acc, p) => acc + (p.stats?.contests || 0), 0);

        return (
          <div className="space-y-6 relative z-10 py-6">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">Competitions & Hackathons</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.3em]">Contest Participation Tracker</p>
              </div>
              <div className="flex items-center gap-3 px-5 py-2 glass rounded-2xl border-white/40 shadow-inner">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-[11px] font-black text-text-primary uppercase tracking-widest">
                  {totalParticipated} Participated
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitionPlatforms.map((p, idx) => {
                const isUnstop = p.id === 'unstop';
                const colorMap = {
                  unstop: { bg: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-500/20', text: 'text-blue-500', glow: 'shadow-blue-500/10', icon: Target },
                  codeforces: { bg: 'from-blue-600/10 to-cyan-500/10', border: 'border-blue-600/20', text: 'text-blue-600', glow: 'shadow-blue-600/10', icon: Swords },
                  leetcode: { bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20', text: 'text-amber-500', glow: 'shadow-amber-500/10', icon: Trophy }
                };
                const style = colorMap[p.id] || colorMap.leetcode;
                const PlatformIcon = style.icon;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15, type: 'spring', bounce: 0.3 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <Card className={cn("group glass-card overflow-hidden relative border-white/20 dark:border-white/5 hover:shadow-2xl transition-all duration-500", style.border)}>
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity", style.bg)} />
                      <CardContent className="p-8 space-y-6 relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6", style.text, style.border, style.glow)}>
                              <PlatformIcon className="w-7 h-7" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-text-primary leading-none mb-1">{p.name}</h4>
                              <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-50">
                                {isUnstop ? 'Hackathon & Competition Hub' : 'Competitive Programming'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", style.text.replace('text-', 'bg-'))} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-60">Live</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className={cn("grid gap-4", isUnstop ? 'grid-cols-3' : 'grid-cols-2')}>
                          {isUnstop ? (
                            <>
                              <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/50 dark:border-white/5 text-center group/s hover:border-blue-500/30 transition-all">
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-40 group-hover/s:opacity-100 transition-opacity">Registered</p>
                                <p className="text-2xl font-black text-text-primary tracking-tighter">{p.stats?.solved || 0}</p>
                              </div>
                              <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/50 dark:border-white/5 text-center group/s hover:border-purple-500/30 transition-all">
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-40 group-hover/s:opacity-100 transition-opacity">Participated</p>
                                <p className="text-2xl font-black text-text-primary tracking-tighter">{p.stats?.contests || 0}</p>
                              </div>
                              <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/50 dark:border-white/5 text-center group/s hover:border-amber-500/30 transition-all">
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-40 group-hover/s:opacity-100 transition-opacity">Won</p>
                                <p className="text-2xl font-black text-text-primary tracking-tighter">{p.stats?.rank || 0}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/50 dark:border-white/5 text-center group/s hover:border-emerald-500/30 transition-all">
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-40 group-hover/s:opacity-100 transition-opacity">Contests</p>
                                <p className="text-2xl font-black text-text-primary tracking-tighter">{p.stats?.contests || 0}</p>
                              </div>
                              <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/50 dark:border-white/5 text-center group/s hover:border-amber-500/30 transition-all">
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-40 group-hover/s:opacity-100 transition-opacity">Rating</p>
                                <p className="text-2xl font-black text-text-primary tracking-tighter">{p.stats?.rank || 'N/A'}</p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-border-subtle/30 flex items-center justify-between group-hover:border-border-subtle/60 transition-colors">
                          <div className="flex items-center gap-2">
                            <Medal className={cn("w-3.5 h-3.5", style.text)} />
                            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                              {p.lastSynced ? new Date(p.lastSynced.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB') : 'Awaiting Sync'}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-bg-card-alt border border-border-subtle/50 flex items-center justify-center group-hover:bg-accent-primary group-hover:border-accent-primary group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        platforms={platforms.filter(p => p.connected)}
      />
    </div>
  );

};
