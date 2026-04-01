import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LabelList
} from "recharts";
import { cn } from "../utils";
import { motion } from "motion/react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { usePlatforms } from "../context/PlatformContext";
import client from "../api/client";

export const AnalyticsPage = () => {
  const { syncAllPlatforms } = usePlatforms();
  const [analytics, setAnalytics] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [difficultyData, setDifficultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7D");

  const fetchData = async () => {
    try {
      const [anData, distData, diffData] = await Promise.all([
        client("/stats/analytics"),
        client("/stats/distribution"),
        client("/stats/difficulty-breakdown")
      ]);

      // Transform analytics data for multi-line chart
      const analyticsArray = Array.isArray(anData) ? anData : [];
      const grouped = analyticsArray.reduce((acc, curr) => {
        if (!acc[curr.sync_date]) {
          acc[curr.sync_date] = {
            sync_date: curr.sync_date,
            total: 0,
            avgAccuracy: 0,
            avgSpeed: 0,
            count: 0
          };
        }
        acc[curr.sync_date][curr.platform] = curr.solved;
        acc[curr.sync_date][`${curr.platform}_accuracy`] = curr.accuracy;
        acc[curr.sync_date][`${curr.platform}_speed`] = curr.speed;

        acc[curr.sync_date].total += curr.solved;
        acc[curr.sync_date].avgAccuracy += curr.accuracy;
        acc[curr.sync_date].avgSpeed += curr.speed;
        acc[curr.sync_date].count += 1;

        return acc;
      }, {});

      const finalAnalytics = Object.values(grouped).map(day => ({
        ...day,
        avgAccuracy: day.count > 0 ? day.avgAccuracy / day.count : 0,
        avgSpeed: day.count > 0 ? day.avgSpeed / day.count : 0
      }));

      setAnalytics(finalAnalytics);
      setDistribution(Array.isArray(distData) ? distData : []);
      setDifficultyData(Array.isArray(diffData) ? diffData : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setAnalytics([]);
      setDistribution([]);
      setDifficultyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAllPlatforms();
      await fetchData();
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-accent-emerald animate-spin" />
        <p className="text-text-secondary text-sm font-medium animate-pulse">Analyzing your performance patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-text-primary mb-2 tracking-tight">Analytics Error</h2>
        <p className="text-text-secondary mb-8 max-w-md">{error}</p>
        <Button
          onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
          className="px-8"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const platforms = distribution.map(d => d.platform);
  const latestStats = analytics[analytics.length - 1] || {};

  const filteredAnalytics = timeRange === "7D" ? analytics.slice(-7)
    : timeRange === "30D" ? analytics.slice(-30)
    : analytics;

  // Platform color standardizer to avoid sharing single metric colors
  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'leetcode': return '#f59e0b'; // amber-500
      case 'codeforces': return '#3b82f6'; // blue-500
      case 'hackerrank': return '#10b981'; // emerald-500
      case 'github': return '#6ee7b7'; // mint-300
      case 'codechef': return '#10b981'; // emerald-500
      case 'geeksforgeeks': return '#059669'; // emerald-600
      case 'atcoder': return '#064e3b'; // forest-900
      case 'unstop': return '#34d399'; // mint-400
      default: return '#10b981'; // emerald-500
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Background Effect */}
      <div className="fixed inset-0 mesh-bg -z-10 opacity-30 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10 transition-all duration-500">
        <div className="space-y-4">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full"
          >
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-[11px] font-black text-accent-primary uppercase tracking-[0.2em] leading-none">Intelligence Node 02</span>
          </motion.div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tighter leading-[1.1] mb-2">
              Performance <span className="text-gradient">Insights</span>.
            </h1>
            <p className="text-base text-text-secondary max-w-2xl font-medium leading-relaxed">
              Multi-dimensional analysis of platform-wide trends and resource utilization patterns across your technical ecosystem.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={handleSync}
            loading={syncing}
            variant="outline"
            className="h-14 px-8 rounded-2xl glass hover:bg-bg-card-alt transition-all border-white/40 shadow-xl group"
          >
            <RefreshCw className={cn("w-5 h-5 mr-3 text-accent-primary group-hover:rotate-180 transition-transform duration-700", syncing && "animate-spin")} />
            <span className="font-black text-xs uppercase tracking-widest">{syncing ? "Analyzing Matrix..." : "Refresh Signal"}</span>
          </Button>

          <div className="flex items-center gap-2 glass p-2 rounded-2xl border-white/40 shadow-2xl overflow-hidden backdrop-blur-xl">
            {["7D", "30D", "90D", "ALL"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  timeRange === range
                    ? "bg-accent-primary text-white shadow-xl shadow-accent-primary/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/40"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {[
          { label: "Overall Accuracy", value: `${latestStats.avgAccuracy?.toFixed(1) || 0}%`, icon: Activity, color: "accent-primary", gradient: "from-emerald-400 to-emerald-600" },
          { label: "Solving Velocity", value: `${latestStats.avgSpeed?.toFixed(2) || 0}`, subValue: "prob/hr", icon: TrendingUp, color: "accent-emerald", gradient: "from-mint-400 to-emerald-500" },
          { label: "Technical Yield", value: latestStats.total || 0, subValue: "SOLVED", icon: BarChart3, color: "accent-mint", gradient: "from-emerald-500 to-forest-800" },
          { label: "Linked Systems", value: distribution.length, subValue: "NODES", icon: RefreshCw, color: "accent-sage", gradient: "from-emerald-200 to-emerald-400" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
          >
            <Card className="glass-card border-white/30 dark:border-white/5 group overflow-hidden h-full">
              <div className={cn("absolute inset-x-0 top-0 h-1 opacity-60 bg-gradient-to-r", stat.gradient)} />
              <CardContent className="p-8 flex items-center gap-6">
                <div className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                  stat.color === 'accent-primary' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-xl shadow-emerald-500/10' :
                    stat.color === 'accent-emerald' ? 'bg-mint-500/10 border-mint-500/20 text-emerald-600 shadow-xl shadow-emerald-600/10' :
                      stat.color === 'accent-mint' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-500 shadow-xl shadow-emerald-500/10' :
                        'bg-emerald-900/10 border-emerald-900/20 text-emerald-800 shadow-xl shadow-emerald-800/10'
                )}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40 mb-1 leading-none">{stat.label}</p>
                  <h4 className="text-4xl font-black text-text-primary flex items-baseline gap-2 tracking-tighter">
                    {stat.value}
                    {stat.subValue && <span className="text-[10px] font-black text-text-secondary opacity-30 tracking-widest">{stat.subValue}</span>}
                  </h4>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Medium Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <Card className="lg:col-span-1 glass-card border-white/30 dark:border-white/5 group overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight">Difficulty Matrix</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50 mt-1">Resource Complexity Allocation</p>
              </div>
              <PieIcon className="w-5 h-5 text-accent-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="h-[300px] w-full relative group/pie">
              {difficultyData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={105}
                      paddingAngle={10}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                      animationBegin={400}
                      animationDuration={2000}
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className="hover:opacity-80 transition-opacity cursor-pointer outline-none" 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg-card)', 
                        border: '1px solid var(--color-border-subtle)', 
                        borderRadius: '1.25rem', 
                        fontSize: '11px', 
                        boxShadow: 'var(--shadow-hover)' 
                      }}
                      itemStyle={{ fontWeight: 800 }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{ 
                        fontSize: '9px', 
                        fontWeight: '900', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em', 
                        paddingTop: '30px' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-30">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-text-secondary mb-4 flex items-center justify-center">
                    <PieIcon className="w-6 h-6" />
                  </div>
                  <p className="text-text-secondary text-sm font-black uppercase tracking-widest leading-tight">Listening for<br/>Signal</p>
                </div>
              )}
              {difficultyData.some(d => d.value > 0) && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45px] text-center pointer-events-none transition-transform group-hover/pie:scale-110 duration-500">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none mb-1 opacity-50">Total</p>
                  <p className="text-4xl font-black text-text-primary tracking-tighter">{difficultyData.reduce((a, b) => a + b.value, 0)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/30 dark:border-white/5 group overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight">System Benchmark</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-50 mt-1">Cross-Platform Efficiency Score</p>
              </div>
              <BarChart3 className="w-5 h-5 text-accent-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="h-[300px] w-full transform group-hover:scale-[1.005] transition-transform duration-700">
              <ResponsiveContainer width="100%" height="100%">
                {distribution.length > 0 ? (
                  <BarChart data={distribution} margin={{ top: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="platform" 
                      stroke="var(--color-text-secondary)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      fontWeight="700" 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="var(--color-text-secondary)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-10} 
                      fontWeight="700"
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: [8, 8, 0, 0] }}
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg-card)', 
                        border: '1px solid var(--color-border-subtle)', 
                        borderRadius: '1.25rem', 
                        boxShadow: 'var(--shadow-hover)' 
                      }}
                    />
                    <Bar
                      dataKey="value"
                      name="Yield Output"
                      radius={[8, 8, 4, 4]}
                      barSize={28}
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPlatformColor(entry.platform)} />
                      ))}
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        fill="var(--color-text-primary)" 
                        fontSize={11} 
                        fontWeight="900" 
                        dy={-10}
                      />
                    </Bar>
                  </BarChart>
                ) : (
                  <div className="flex flex-col gap-2 items-center justify-center h-full text-text-secondary text-sm font-black uppercase tracking-widest opacity-30 border border-dashed border-text-secondary/20 rounded-[2rem]">
                    <p>No Active Nodes</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Precision Vector Card (Moves into 3-column row) */}
        <Card className="glass-card border-white/30 dark:border-white/5 group overflow-hidden">
          <CardContent className="p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight">Precision Vector</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Accuracy Modulation over Time</p>
              </div>
              <Activity className="w-5 h-5 text-accent-indigo opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="h-[300px] w-full mt-2 transform group-hover:scale-[1.005] transition-transform duration-700">
              <ResponsiveContainer width="100%" height="100%">
                {filteredAnalytics.length > 0 ? (
                  <LineChart data={filteredAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis 
                       dataKey="sync_date" 
                       stroke="var(--color-text-secondary)" 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                       tickFormatter={(val) => val.split('-').slice(1).join('/')} 
                       dy={10} 
                       fontWeight="700"
                    />
                    <YAxis 
                       stroke="var(--color-text-secondary)" 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                       domain={[0, 100]} 
                       dx={-10} 
                       fontWeight="700"
                    />
                    <Tooltip
                      contentStyle={{ 
                         backgroundColor: 'var(--color-bg-card)', 
                         border: '1px solid var(--color-border-subtle)', 
                         borderRadius: '1.25rem', 
                         boxShadow: 'var(--shadow-hover)' 
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgAccuracy"
                      name="System Accuracy"
                      stroke="var(--color-accent-primary)"
                      strokeWidth={4}
                      dot={{ r: 4, fill: "var(--color-accent-primary)", stroke: "var(--color-bg-card)", strokeWidth: 2 }}
                      activeDot={{ r: 8, strokeWidth: 3, fill: "var(--color-accent-indigo)", stroke: "var(--color-bg-card)" }}
                      animationDuration={2000}
                    />
                  </LineChart>
                ) : (
                  <div className="flex flex-col gap-2 items-center justify-center h-full text-text-secondary text-sm font-black uppercase tracking-widest opacity-30 border border-dashed border-text-secondary/20 rounded-[2rem]">
                    <p>No History Logged</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <Card className="glass-card border-white/30 dark:border-white/5 group overflow-hidden lg:col-span-1">
          <CardContent className="p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight">Kinetic Throughput</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Solving Frequency Calibration</p>
              </div>
              <TrendingUp className="w-5 h-5 text-accent-forest opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="h-[300px] w-full mt-2 transform group-hover:scale-[1.005] transition-transform duration-700">
              <ResponsiveContainer width="100%" height="100%">
                {filteredAnalytics.length > 0 ? (
                  <BarChart data={filteredAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis 
                       dataKey="sync_date" 
                       stroke="var(--color-text-secondary)" 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                       tickFormatter={(val) => val.split('-').slice(1).join('/')} 
                       dy={10} 
                       fontWeight="700"
                    />
                    <YAxis 
                       stroke="var(--color-text-secondary)" 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                       dx={-10} 
                       fontWeight="700"
                    />
                    <Tooltip
                      contentStyle={{ 
                         backgroundColor: 'var(--color-bg-card)', 
                         border: '1px solid var(--color-border-subtle)', 
                         borderRadius: '1.25rem', 
                         boxShadow: 'var(--shadow-hover)' 
                      }}
                    />
                    <Bar
                      dataKey="avgSpeed"
                      name="Throughput rate"
                      fill="var(--color-accent-emerald)"
                      radius={[8, 8, 4, 4]}
                      barSize={28}
                    >
                      <LabelList 
                         dataKey="avgSpeed" 
                         position="top" 
                         fill="var(--color-text-primary)" 
                         fontSize={11} 
                         fontWeight="900" 
                         dy={-10}
                         formatter={(val) => val > 0 ? val.toFixed(1) : ''} 
                      />
                    </Bar>
                  </BarChart>
                ) : (
                  <div className="flex flex-col gap-2 items-center justify-center h-full text-text-secondary text-sm font-black uppercase tracking-widest opacity-30 border border-dashed border-text-secondary/20 rounded-[2rem]">
                    <p>No Velocity Mapped</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/30 dark:border-white/5 overflow-hidden relative z-10 group/pulse">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none group-hover/pulse:bg-accent-primary/10 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-indigo/5 blur-[120px] -ml-48 -mb-48 rounded-full pointer-events-none group-hover/pulse:bg-accent-indigo/10 transition-all duration-700" />

        <CardContent className="p-12 space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black text-text-primary tracking-tighter">Technical Ecosystem Heartbeat</h3>
              <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40 mt-1">Holistic Distributed Solving Signal</p>
            </div>
            <div className="flex items-center gap-4 px-6 py-2.5 bg-bg-card-alt/50 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_12px_var(--color-accent-emerald)]" />
              <span className="text-[11px] font-black text-text-primary uppercase tracking-widest">Global Sync Locked</span>
            </div>
          </div>

          <div className="h-[400px] w-full transform group-hover:scale-[1.002] transition-transform duration-1000">
            <ResponsiveContainer width="100%" height="100%">
              {platforms.length > 0 && filteredAnalytics.length > 0 ? (
                <LineChart data={filteredAnalytics}>
                  <defs>
                    {platforms.map((p) => (
                      <linearGradient key={`grad-${p}`} id={`color-${p}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getPlatformColor(p)} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={getPlatformColor(p)} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="sync_date" 
                    stroke="var(--color-text-secondary)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val.split('-').slice(1).join('/')} 
                    dy={12} 
                    fontWeight="800"
                  />
                  <YAxis 
                    stroke="var(--color-text-secondary)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dx={-12} 
                    fontWeight="800"
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-card)', 
                      border: '1px solid var(--color-border-subtle)', 
                      borderRadius: '1.5rem', 
                      color: 'var(--color-text-primary)', 
                      boxShadow: 'var(--shadow-premium)',
                      padding: '1.25rem'
                    }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ paddingTop: '60px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }} 
                  />
                  {platforms.map((p) => (
                    <Line
                      key={p}
                      type="monotone"
                      dataKey={p}
                      stroke={getPlatformColor(p)}
                      strokeWidth={3}
                      dot={{ r: 3, fill: getPlatformColor(p), stroke: "var(--color-bg-card)", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: getPlatformColor(p), stroke: "var(--color-bg-card)", strokeWidth: 2.5 }}
                      connectNulls
                      animationDuration={3000}
                    />
                  ))}
                </LineChart>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 glass rounded-[3rem] border-dashed border-2 border-white/20">
                  <Activity className="w-16 h-16 text-text-secondary opacity-10 mb-8" />
                  <p className="text-text-secondary text-base font-black uppercase tracking-[0.3em]">
                    Awaiting Signal Uplink
                  </p>
                  <p className="text-text-secondary text-xs font-medium opacity-40 mt-3 max-w-sm leading-relaxed">
                    Link at least one system node to initiate technical pulse visualization across the distributed matrix.
                  </p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

};
