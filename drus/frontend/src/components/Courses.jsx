import React, { useState, useEffect } from "react";
import {
    GraduationCap,
    Award,
    Clock,
    Search,
    ExternalLink,
    RefreshCw,
    Filter,
    CheckCircle2,
    BookOpen,
    Star
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import client from "../api/client";
import { cn } from "../utils";

export const Courses = () => {
    const [platforms, setPlatforms] = useState([]);
    const [selectedPlatform, setSelectedPlatform] = useState("all");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const platformsData = await client("/learning");
                setPlatforms(platformsData || []);

                // Fetch detailed courses for all connected platforms
                const connectedPlatforms = (platformsData || []).filter(p => p.connected);
                const allCourses = [];

                for (const p of connectedPlatforms) {
                    try {
                        const detail = await client(`/learning/${p.platform_id}`);
                        if (detail && detail.courses) {
                            allCourses.push(...detail.courses.map(c => ({ ...c, provider: c.provider || p.name })));
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch courses for ${p.platform_id}:`, e);
                    }
                }

                setCourses(allCourses);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = selectedPlatform === "all" || course.provider?.toLowerCase() === selectedPlatform.toLowerCase();
        return matchesSearch && matchesPlatform;
    });

    const stats = {
        total: courses.length,
        completed: courses.length,
        certificates: courses.filter(c => c.certificate_url).length,
        hours: courses.reduce((acc, c) => acc + (c.hours || 0), 0)
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <RefreshCw className="w-10 h-10 text-accent-primary animate-spin" />
                <p className="text-text-secondary text-sm font-medium animate-pulse">Loading your learning journey...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-purple flex items-center justify-center shadow-lg shadow-accent-primary/20">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-text-primary tracking-tight">Courses & Certificates</h1>
                    </div>
                    <p className="text-text-secondary max-w-md ml-[52px]">
                        Track your professional growth across Udemy, Coursera, and other learning platforms.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Total Courses</p>
                        <p className="text-3xl font-black text-accent-primary">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Completed</p>
                        <p className="text-3xl font-black text-accent-emerald">{stats.completed}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Certificates</p>
                        <p className="text-3xl font-black text-amber-500">{stats.certificates}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Total Hours</p>
                        <p className="text-3xl font-black text-accent-purple">{stats.hours.toFixed(0)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Connected Platforms */}
            {platforms.filter(p => p.connected).length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-text-primary tracking-tight">Connected Platforms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {platforms.filter(p => p.connected).map(p => (
                            <Card key={p.platform_id}>
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm",
                                            p.platform_id === 'udemy' ? 'bg-purple-600' :
                                                p.platform_id === 'coursera' ? 'bg-blue-600' :
                                                    'bg-accent-primary'
                                        )}>
                                            {p.name?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-text-primary">{p.name}</p>
                                            <p className="text-[10px] text-text-secondary font-bold">Connected</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 rounded-xl bg-bg-main">
                                            <p className="text-lg font-black text-accent-primary">{p.stats?.completedCourses || 0}</p>
                                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Courses</p>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-bg-main">
                                            <p className="text-lg font-black text-amber-500">{p.stats?.certificates?.length || 0}</p>
                                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Certs</p>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-bg-main">
                                            <p className="text-lg font-black text-accent-emerald">{p.stats?.hoursWatched || 0}</p>
                                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Hours</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent-primary transition-colors" />
                        <Input
                            placeholder="Search courses or instructors..."
                            className="pl-12 h-14 bg-bg-card border-border-subtle focus:border-accent-primary/30 rounded-2xl shadow-sm text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="md:col-span-4">
                    <div className="relative group h-full">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <select
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            className="w-full h-14 pl-11 pr-4 bg-bg-card border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:outline-none focus:border-accent-primary/30 appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="all">All Platforms</option>
                            {platforms.filter(p => p.connected).map(p => (
                                <option key={p.platform_id} value={p.name.toLowerCase()}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Course Cards */}
            <div>
                <h2 className="text-lg font-black text-text-primary tracking-tight mb-4">
                    Your Courses ({filteredCourses.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course, idx) => (
                            <motion.div
                                key={course.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                className="flex"
                            >
                                <Card className="hover:border-accent-primary/20 transition-all shadow-sm flex flex-col w-full overflow-hidden group">
                                    {/* Course Image Header */}
                                    <div className="aspect-video bg-bg-main border-b border-border-subtle flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {course.provider === 'Udemy' ? (
                                            <div className="p-8 w-full h-full flex items-center justify-center bg-zinc-900">
                                                <img
                                                    src={course.title.includes('Next.js') ? "https://logo.clearbit.com/nextjs.org" :
                                                        course.title.includes('Python') ? "https://logo.clearbit.com/python.org" :
                                                            course.title.includes('Java') ? "https://logo.clearbit.com/java.com" :
                                                                course.title.includes('AutoCAD') ? "https://logo.clearbit.com/autodesk.com" : ""}
                                                    className="w-16 h-16 object-contain opacity-80 brightness-0 invert"
                                                    alt=""
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                />
                                                <GraduationCap className="w-12 h-12 text-accent-primary hidden" />
                                            </div>
                                        ) : (
                                            <GraduationCap className="w-12 h-12 text-accent-primary opacity-20" />
                                        )}

                                        {course.certificate_url && (
                                            <div className="absolute top-3 right-3 bg-bg-card/90 backdrop-blur-sm p-1.5 rounded-lg border border-border-subtle shadow-xl">
                                                <Award className="w-4 h-4 text-amber-500" />
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="text-[9px] font-black text-accent-primary uppercase tracking-[0.2em] bg-accent-primary/5 px-2 py-0.5 rounded shrink-0">
                                                    {course.provider}
                                                </span>
                                                {course.certificate_url && (
                                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.15em] bg-amber-500/10 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                                                        <Award className="w-3 h-3" /> Certified
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-sm font-black text-text-primary tracking-tight leading-snug line-clamp-2 group-hover:text-accent-primary transition-colors h-10">
                                                {course.title}
                                            </h3>

                                            <p className="text-[11px] font-bold text-text-secondary truncate">
                                                {course.instructor}
                                            </p>

                                            {course.hours && (
                                                <div className="flex items-center gap-1.5 text-text-secondary">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">{course.hours} hours</span>
                                                </div>
                                            )}

                                            <div className="pt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-text-secondary/40">100% complete</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-border-subtle space-y-3">
                                            <div className="h-1.5 bg-bg-main rounded-full overflow-hidden">
                                                <div className="h-full bg-accent-emerald w-full shadow-[0_0_8px_rgba(16,185,129,0.4)] rounded-full" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-accent-emerald uppercase tracking-widest flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                                </span>
                                                {course.certificate_url && (
                                                    <a
                                                        href={course.certificate_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                                    >
                                                        Certificate <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-bg-card rounded-[2.5rem] border-2 border-dashed border-border-subtle">
                            <div className="w-16 h-16 bg-bg-main rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-border-subtle">
                                <BookOpen className="w-8 h-8 text-text-secondary opacity-20" />
                            </div>
                            <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">No courses found</h3>
                            <p className="text-text-secondary text-sm max-w-xs mx-auto mb-8 font-medium">
                                {courses.length > 0
                                    ? "Try adjusting your search or filter criteria."
                                    : "Connect a learning platform like Udemy or Coursera in Platforms to see your courses here."
                                }
                            </p>
                            {courses.length === 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/platforms'}
                                    className="rounded-xl uppercase tracking-widest text-[10px] px-8"
                                >
                                    Add Learning Platform
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};