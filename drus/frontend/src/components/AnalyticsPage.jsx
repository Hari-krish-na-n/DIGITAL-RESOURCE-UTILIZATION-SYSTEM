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
  Legend
} from "recharts";
import { COLORS, cn } from "../utils";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import client from "../api/client";

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anData, distData] = await Promise.all([
          client("/stats/analytics"),
          client("/stats/distribution")
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
      } catch (err) {
        console.error(err);
        setError(err.message || "An unexpected error occurred");
        setAnalytics([]);
        setDistribution([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // Filter distribution for PieChart to prevent Recharts crash when total is 0
  const pieData = distribution.filter(d => d.value > 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-text-primary tracking-tight">Performance Analytics</h1>
          <p className="text-text-secondary max-w-2xl">
            Deep dive into your digital resource utilization patterns and track your growth across all connected coding platforms.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-bg-card p-1.5 rounded-2xl border border-border-subtle shadow-lg">
          {["7D", "30D", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                timeRange === range
                  ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {range === "ALL" ? "All Time" : range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
              <Activity className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Overall Accuracy</p>
              <h4 className="text-2xl font-black text-text-primary">{latestStats.avgAccuracy?.toFixed(1) || 0}%</h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-emerald/10 flex items-center justify-center border border-accent-emerald/20">
              <TrendingUp className="w-6 h-6 text-accent-emerald" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Solving Speed</p>
              <h4 className="text-2xl font-black text-text-primary">{latestStats.avgSpeed?.toFixed(2) || 0} <span className="text-xs font-medium text-text-secondary">prob/hr</span></h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
              <BarChart3 className="w-6 h-6 text-accent-purple" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Total Solved</p>
              <h4 className="text-2xl font-black text-text-primary">{latestStats.total || 0}</h4>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <RefreshCw className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Active Platforms</p>
              <h4 className="text-2xl font-black text-text-primary">{distribution.length}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Distribution */}
        <Card className="lg:col-span-1">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-accent-emerald" />
                Resource Allocation
              </h3>
            </div>
            <div className="h-[300px] w-full relative">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="platform"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '1rem', color: 'var(--color-text-primary)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-border-subtle mb-4 flex items-center justify-center opacity-50">
                    <PieIcon className="w-6 h-6 text-text-secondary" />
                  </div>
                  <p className="text-text-secondary text-sm font-medium">Insufficient data for chart</p>
                  <p className="text-text-secondary text-xs opacity-50 mt-1">Check back once you've solved more problems!</p>
                </div>
              )}
            </div>
            <p className="text-text-secondary text-[10px] font-bold text-center uppercase tracking-widest opacity-50">
              Distribution of solved problems
            </p>
          </CardContent>
        </Card>

        {/* Comparison Bar Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-primary" />
                Platform Comparison
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {distribution.length > 0 ? (
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="platform" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                    <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '1rem', color: 'var(--color-text-primary)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar
                      dataKey="value"
                      name="Solved Problems"
                      radius={[6, 6, 0, 0]}
                      label={{ position: 'top', fill: 'var(--color-text-primary)', fontSize: 10, fontWeight: 'bold', offset: 10 }}
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="value"
                      name="Performance Weight"
                      radius={[6, 6, 0, 0]}
                      opacity={0.2}
                      barSize={10}
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-sec-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-text-secondary text-sm font-medium border-2 border-dashed border-border-subtle rounded-xl">
                    No platform data available
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Platform Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-primary" />
                Accuracy Trends
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="sync_date" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '1rem', color: 'var(--color-text-primary)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgAccuracy"
                    name="Avg Accuracy"
                    stroke="var(--color-accent-primary)"
                    strokeWidth={4}
                    dot={{ r: 4, fill: "var(--color-accent-primary)", strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-emerald" />
                Solving Speed (Prob/Hr)
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="sync_date" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '1rem', color: 'var(--color-text-primary)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar
                    dataKey="avgSpeed"
                    name="Avg Speed"
                    fill="var(--color-accent-emerald)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-purple" />
              Utilization Trends by Platform
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Real-time Data</span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {platforms.length > 0 ? (
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="sync_date" stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '1rem', color: 'var(--color-text-primary)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  {platforms.map((p, i) => (
                    <Line
                      key={p}
                      type="monotone"
                      dataKey={p}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary text-sm font-medium">
                  Connect a platform to view utilization trends
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
