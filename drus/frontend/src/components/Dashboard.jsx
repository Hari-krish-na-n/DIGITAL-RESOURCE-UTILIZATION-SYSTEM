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
  GraduationCap
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
import client from "../api/client";
import { animate, useMotionValue } from "motion/react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { cn } from "../utils";
import { HackerRankBadge } from "./platforms/HackerRankBadge";

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
  const getPlatformColor = () => {
    switch (platform.id) {
      case "leetcode": return "text-accent-amber bg-accent-amber/10 border-accent-amber/20";
      case "codeforces": return "text-accent-blue bg-accent-blue/10 border-accent-blue/20";
      case "hackerrank": return "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20";
      case "github": return "text-accent-purple bg-accent-purple/10 border-accent-purple/20";
      case "codechef": return "text-accent-amber bg-accent-amber/10 border-accent-amber/20";
      case "atcoder": return "text-accent-rose bg-accent-rose/10 border-accent-rose/20";
      default: return "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20";
    }
  };

  const colorClasses = getPlatformColor();

  return (
    <Link to="/platforms" className="block">
      <Card className="group hover:border-accent-primary/30 transition-all hover:shadow-xl hover:shadow-accent-primary/5">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-black", colorClasses)}>
                {platform.name[0]}
              </div>
              <span className="text-sm font-bold text-text-primary">{platform.name}</span>
            </div>
            <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border", colorClasses)}>
              Live
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-text-secondary">{platform.id === 'github' ? "Repositories" : "Solved"}</span>
              <span className="text-text-primary font-bold">{platform.stats?.solved || 0}</span>
            </div>
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-text-secondary">Rank/Rating</span>
              <span className="text-text-primary font-bold">{platform.stats?.rank || "N/A"}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest">
              {platform.lastSynced ? new Date(platform.lastSynced.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB') : "Never"}
            </span>
            <ChevronRight className="w-3 h-3 text-text-secondary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export const Dashboard = () => {
  const { platforms, loading: platformsLoading, syncAllPlatforms } = usePlatforms();
  const [analytics, setAnalytics] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);
  const [learningSummary, setLearningSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsData, summaryData, learningData] = await Promise.all([
        client("/stats/analytics"),
        client("/dashboard/summary"),
        client("/learning/summary")
      ]);

      const grouped = analyticsData.reduce((acc, curr) => {
        if (!acc[curr.sync_date]) {
          acc[curr.sync_date] = { sync_date: curr.sync_date, total_solved: 0 };
        }
        acc[curr.sync_date].total_solved += curr.solved;
        return acc;
      }, {});
      setAnalytics(Object.values(grouped));
      setRecentLogs(summaryData.recentActivity || []);
      setGithubRepos(summaryData.github?.repos || []);
      setLearningSummary(learningData);
    } catch (err) {
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
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-text-secondary text-sm font-medium animate-pulse">Aggregating your data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-text-primary tracking-tight">
            System Overview
          </h1>
          <p className="text-text-secondary max-w-md">
            Aggregated performance metrics across all your connected coding resources.
          </p>
        </div>

        <Button
          onClick={handleSyncAll}
          loading={syncingAll}
          disabled={syncingAll || connectedPlatforms.length === 0}
          className="h-12 px-8"
        >
          <RefreshCw className={cn("w-4 h-4", syncingAll && "animate-spin")} />
          {syncingAll ? "Syncing All..." : "Sync All Platforms"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Total Solved", value: totalSolved, icon: Trophy, color: "accent-emerald" },
          { label: "Active Platforms", value: connectedPlatforms.length, icon: Activity, color: "accent-primary" },
          { label: "Total Badges", value: totalBadges, icon: Star, color: "accent-amber" },
          { label: "Total Repositories", value: totalRepos, icon: GitHubIcon, color: "accent-purple" },
          { label: "Total Contests", value: totalContests, icon: TrendingUp, color: "accent-rose" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden group">
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                stat.color === "accent-emerald" ? "from-accent-emerald to-accent-primary" :
                  stat.color === "accent-primary" ? "from-accent-primary to-accent-purple" :
                    stat.color === "accent-amber" ? "from-accent-amber to-accent-rose" :
                      stat.color === "accent-purple" ? "from-accent-purple to-accent-rose" :
                        "from-accent-rose to-red-500"
              )} />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                    {stat.label}
                  </p>
                  <stat.icon className={cn("w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity", `text-${stat.color}`)} />
                </div>
                <h3 className="text-3xl font-black text-text-primary">
                  {/* Counter already has font-mono */}
                  {typeof stat.value === 'number' ? <Counter value={stat.value} /> : <span className="font-mono">{stat.value}</span>}
                </h3>
                <div className="mt-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className={cn("w-3 h-3", `text-${stat.color}`)} />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Live Data</span>
                  </div>
                  <span className="text-[8px] font-black text-text-secondary/40 uppercase tracking-widest ml-4">
                    Synced {formatLastSynced(lastSyncTime)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Platform Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border-subtle" />
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] whitespace-nowrap">
            Platform Breakdown
          </span>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {connectedPlatforms.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to="/platforms" className="block h-full">
                <CompactPlatformCard platform={p} />
              </Link>
            </motion.div>
          ))}
          {connectedPlatforms.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border-subtle rounded-[2rem] bg-bg-main/20">
              <p className="text-text-secondary font-medium italic">
                No platforms connected. <Link to="/platforms" className="text-emerald-500 font-bold hover:underline ml-1">Connect Platforms →</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Technical Achievements */}
      {(() => {
        const hrPlatform = platforms.find(p => p.id === 'hackerrank');
        const lcPlatform = platforms.find(p => p.id === 'leetcode');
        const hrBadges = hrPlatform?.badges || [];
        const lcBadges = lcPlatform?.badges || [];

        if (hrBadges.length === 0 && lcBadges.length === 0) return null;

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border-subtle" />
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] whitespace-nowrap">
                Technical Achievements
              </span>
              <div className="h-px flex-1 bg-border-subtle" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* HackerRank Hero Card */}
              {hrBadges.length > 0 && (
                <Card className="overflow-hidden border-accent-emerald/20 hover:border-accent-emerald/40 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 flex items-center justify-center border border-accent-emerald/20">
                          <Trophy className="w-6 h-6 text-accent-emerald" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-text-primary tracking-tight">HackerRank Skillset</h3>
                          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Certified Proficiencies</p>
                        </div>
                      </div>
                      <Link to="/platforms">
                        <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">View All</Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-y-12 gap-x-4">
                      {hrBadges.slice(0, 5).map((badge, i) => (
                        <div key={i} className="scale-90">
                          <HackerRankBadge badge={badge} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* LeetCode Achievements Card */}
              {lcBadges.length > 0 && (
                <Card className="overflow-hidden border-accent-amber/20 hover:border-accent-amber/40 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-amber/10 flex items-center justify-center border border-accent-amber/20">
                          <Star className="w-6 h-6 text-accent-amber" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-text-primary tracking-tight">LeetCode Achievements</h3>
                          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Milestones & Streaks</p>
                        </div>
                      </div>
                      <Link to="/platforms">
                        <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest">View All</Button>
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                      {lcBadges.slice(0, 6).map((badge, i) => (
                        <div key={i} className="group/lc-badge relative">
                          <div className="w-16 h-16 rounded-2xl bg-bg-main border border-border-subtle p-3 flex items-center justify-center hover:border-accent-amber/30 hover:scale-110 transition-all cursor-default shadow-lg shadow-black/5">
                            {badge.icon ? (
                              <img src={badge.icon} alt={badge.badge_name || badge.name} className="w-full h-full object-contain drop-shadow-md" />
                            ) : (
                              <Trophy className="w-full h-full text-text-secondary/20" />
                            )}
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-black/90 backdrop-blur-md text-[10px] text-white font-bold rounded-lg opacity-0 group-hover/lc-badge:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl border border-white/10 scale-90 group-hover/lc-badge:scale-100">
                            {badge.badge_name || badge.name || "Achievement"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
      })()}

      {/* Featured Repositories */}
      {githubRepos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
              <GitHubIcon className="w-6 h-6 text-[#6e5494]" />
              Featured Repositories
            </h2>
            <a
              href={`https://github.com/${platforms.find(p => p.id === 'github')?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#6e5494] hover:underline flex items-center gap-1"
            >
              View All <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {githubRepos.slice(0, 4).map((repo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full flex flex-col hover:border-[#6e5494]/30">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <Folder className="w-5 h-5 text-[#6e5494] opacity-50" />
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-text-secondary">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-bold">{repo.stargazersCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-secondary">
                          <GitFork className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{repo.forksCount}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-text-primary hover:text-[#6e5494] transition-colors mb-2 block"
                    >
                      {repo.name}
                    </a>

                    <p className="text-xs text-text-secondary line-clamp-2 mb-6 flex-1">
                      {repo.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#6e5494]" />
                          <span className="text-[10px] font-bold text-text-secondary">{repo.language}</span>
                        </div>
                      )}
                      <span className="text-[9px] font-bold text-text-secondary uppercase">
                        Updated {new Date(repo.updatedAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Charts & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-text-primary tracking-tight">Growth Trajectory</h3>
                <div className="flex gap-2 bg-bg-main p-1 rounded-lg border border-border-subtle">
                  <button className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-bg-card text-emerald-500 rounded-md shadow-sm border border-border-subtle">7D</button>
                  <button className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors">30D</button>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics}>
                    <defs>
                      <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="sync_date"
                      stroke="var(--color-text-secondary)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '1rem', fontSize: '12px', color: 'var(--color-text-primary)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: 'var(--color-accent-primary)', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="total_solved" stroke="var(--color-accent-primary)" fillOpacity={1} fill="url(#colorSolved)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 pt-4 border-t border-border-subtle">
                {connectedPlatforms.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full",
                      p.id === 'leetcode' ? 'bg-accent-amber' :
                        p.id === 'codeforces' ? 'bg-accent-blue' :
                          p.id === 'hackerrank' ? 'bg-accent-emerald' :
                            p.id === 'github' ? 'bg-accent-purple' :
                              p.id === 'atcoder' ? 'bg-accent-rose' : 'bg-accent-primary'
                    )} />
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{p.name}</span>
                    <span className="text-[10px] font-mono font-bold text-text-primary">({p.stats?.solved || 0})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-text-primary tracking-tight">Learning Progress</h3>
                <GraduationCap className="w-5 h-5 text-[#A435F0]" />
              </div>

              <div className="space-y-4">
                {/* Udemy */}
                <div className="p-4 rounded-2xl bg-[#A435F0]/5 border border-[#A435F0]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-text-primary uppercase tracking-wider">Udemy</span>
                    <span className="text-[10px] font-bold text-[#A435F0] uppercase tracking-widest">Linked</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-lg font-black text-text-primary">{learningSummary?.udemyCourses || 0}</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Courses</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-text-primary">{learningSummary?.udemyCertificates || 0}</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Certs</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-text-primary">{learningSummary?.udemyHours || 0}h</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Hours</p>
                    </div>
                  </div>
                </div>

                {/* Coursera */}
                <div className="p-4 rounded-2xl bg-[#0056D2]/5 border border-[#0056D2]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-text-primary uppercase tracking-wider">Coursera</span>
                    <span className="text-[10px] font-bold text-[#0056D2] uppercase tracking-widest">Linked</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-lg font-black text-text-primary">{learningSummary?.courseraCourses || 0}</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Courses</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-text-primary">{learningSummary?.courseraCertificates || 0}</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Certs</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-text-primary">{learningSummary?.courseraHours || 0}h</p>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/courses">
                <Button variant="outline" className="w-full h-11 uppercase tracking-[0.2em] text-[10px] mt-2">
                  View All Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent className="p-8 space-y-8">
              <h3 className="text-xl font-black text-text-primary tracking-tight">Recent Logs</h3>
              <div className="space-y-6">
                {recentLogs.slice(0, 6).map((log, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div>
                        <p className="text-sm font-bold text-text-primary group-hover:text-emerald-500 transition-colors">{log.platform}</p>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                          {new Date(log.sync_date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-text-primary">+{log.problems_solved}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full h-11 uppercase tracking-[0.2em] text-[10px]">
                View Full History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
