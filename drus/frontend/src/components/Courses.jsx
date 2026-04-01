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
    Star,
    ChevronRight
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
        certificates: courses.filter(c => c.certificate_url || c.isVirtual).length,
        hours: courses.reduce((acc, c) => acc + (c.hours || 0), 0)
    };
    const udemyCertificates = courses.filter(c => c.provider === 'Udemy' && (c.certificate_url || c.isVirtual));
    const unstopCertificates = courses.filter(c => c.provider === 'Unstop' && (c.certificate_url || c.isVirtual));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <RefreshCw className="w-10 h-10 text-accent-primary animate-spin" />
                <p className="text-text-secondary text-sm font-medium animate-pulse">Loading your learning journey...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 relative">
            <div className="fixed inset-0 mesh-bg -z-10 opacity-30 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
                <div className="space-y-4">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full"
                    >
                        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                        <span className="text-[11px] font-black text-accent-primary uppercase tracking-[0.2em] leading-none">Curriculum Node 04</span>
                    </motion.div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tighter leading-[1.1] mb-2">
                            Courses & <span className="text-gradient-purple">Certificates</span>.
                        </h1>
                        <p className="text-base text-text-secondary max-w-2xl font-medium leading-relaxed">
                            Architecting your professional growth across distributed knowledge networks including Udemy and Coursera.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {[
                    { label: "Total Courses", value: stats.total, color: "text-accent-primary", bg: "bg-accent-primary/5", border: "border-accent-primary/10" },
                    { label: "Completed", value: stats.completed, color: "text-accent-emerald", bg: "bg-accent-emerald/5", border: "border-accent-emerald/10" },
                    { label: "Certificates", value: stats.certificates, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" },
                    { label: "Total Hours", value: stats.hours.toFixed(0), color: "text-accent-purple", bg: "bg-accent-purple/5", border: "border-accent-purple/10" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
                    >
                        <Card className="glass-card hover:border-white/40 transition-all group h-full">
                            <CardContent className="p-8 text-center flex flex-col items-center gap-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40 group-hover:opacity-100 transition-opacity leading-none">{stat.label}</p>
                                <p className={cn("text-4xl font-black tracking-tighter transition-transform group-hover:scale-110 duration-500", stat.color)}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Connected Platforms */}
            {platforms.filter(p => p.connected).length > 0 && (
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase mb-2">Connected <span className="text-gradient">Networks</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {platforms.filter(p => p.connected).map(p => (
                            <Card key={p.platform_id} className="glass-card hover:border-white/40 transition-all group overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl transition-transform group-hover:scale-110 duration-500",
                                            p.platform_id === 'udemy' ? 'bg-[#A435F0] shadow-[#A435F0]/20' :
                                                p.platform_id === 'coursera' ? 'bg-[#0056D2] shadow-[#0056D2]/20' :
                                                    'bg-accent-primary shadow-accent-primary/20'
                                        )}>
                                            {p.name?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-text-primary tracking-tight leading-none mb-1.5">{p.name}</p>
                                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active Sync
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/5 transition-colors hover:bg-white/60">
                                            <p className="text-2xl font-black text-accent-primary tracking-tighter">{p.stats?.completedCourses || 0}</p>
                                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-50">Units</p>
                                        </div>
                                        <div className="text-center p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/5 transition-colors hover:bg-white/60">
                                            <p className="text-2xl font-black text-amber-500 tracking-tighter">{p.stats?.certificates?.length || 0}</p>
                                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-50">Certs</p>
                                        </div>
                                        <div className="text-center p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/5 transition-colors hover:bg-white/60">
                                            <p className="text-2xl font-black text-accent-emerald tracking-tighter">{p.stats?.hoursWatched || 0}</p>
                                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-50">Hours</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                <div className="md:col-span-8">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent-primary transition-all duration-300" />
                        <Input
                            placeholder="Universal Search Node..."
                            className="pl-14 h-16 bg-white/40 dark:bg-black/20 border-white/60 dark:border-white/5 focus:border-accent-primary/50 rounded-2xl shadow-xl text-sm font-bold transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="md:col-span-4">
                    <div className="relative group h-full">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <select
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/5 rounded-2xl text-sm font-black text-text-primary focus:outline-none focus:border-accent-primary/50 appearance-none cursor-pointer shadow-xl transition-all uppercase tracking-widest"
                        >
                            <option value="all">Global Matrix</option>
                            {platforms.filter(p => p.connected).map(p => (
                                <option key={p.platform_id} value={p.name.toLowerCase()}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            {udemyCertificates.length > 0 && (
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase">
                        Udemy <span className="text-gradient">Certificates</span> ({udemyCertificates.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {udemyCertificates.map((cert, idx) => (
                            <motion.div
                                key={cert.id || idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="glass-card hover:border-white/40 transition-all duration-500 overflow-hidden group h-full flex flex-col">
                                    <div className="aspect-video bg-zinc-900 border-b border-white/5 relative flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#A435F0]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <Award className="w-14 h-14 text-amber-500 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12" />
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-2xl">
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Verified</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 flex-1 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-white bg-[#A435F0] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#A435F0]/20">Udemy</span>
                                                {cert.completion_date && (
                                                    <span className="text-[10px] font-bold text-text-secondary opacity-40 uppercase tracking-widest">
                                                        {new Date(cert.completion_date).toLocaleDateString('en-GB')}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-black text-text-primary tracking-tight leading-tight group-hover:text-amber-500 transition-colors duration-300">
                                                {cert.title}
                                            </h3>
                                        </div>
                                        <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_var(--color-accent-amber)]" />
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Signal Confirmed</span>
                                            </div>
                                            <motion.a
                                                whileHover={{ scale: 1.1 }}
                                                href={cert.certificate_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-xl"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </motion.a>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {courses.filter(c => c.provider === 'Unstop' && (c.certificate_url || c.isVirtual)).length > 0 && (
                <div className="space-y-8 relative z-10">
                    <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase">
                        Unstop <span className="text-[#00B4F1]">Achievements</span> ({courses.filter(c => c.provider === 'Unstop' && (c.certificate_url || c.isVirtual)).length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {courses.filter(c => c.provider === 'Unstop' && (c.certificate_url || c.isVirtual)).map((cert, idx) => (
                            <motion.div
                                key={cert.id || idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="glass-card hover:border-white/40 border-[#00B4F1]/20 transition-all duration-500 overflow-hidden group h-full flex flex-col">
                                    <div className="aspect-video bg-zinc-900 border-b border-white/5 relative flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#00B4F1]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <ShieldCheck className="w-14 h-14 text-[#00B4F1] transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12" />
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-2xl">
                                            <span className="text-[10px] font-black text-[#00B4F1] uppercase tracking-widest leading-none">Victory</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 flex-1 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-white bg-[#00B4F1] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#00B4F1]/20">Unstop</span>
                                                {cert.completion_date && (
                                                    <span className="text-[10px] font-bold text-text-secondary opacity-40 uppercase tracking-widest">
                                                        {new Date(cert.completion_date).toLocaleDateString('en-GB')}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-black text-text-primary tracking-tight leading-tight group-hover:text-[#00B4F1] transition-colors duration-300">
                                                {cert.title}
                                            </h3>
                                        </div>
                                        <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#007CC2] animate-pulse shadow-[0_0_8px_var(--color-accent-blue)]" />
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Verified Win</span>
                                            </div>
                                            {cert.certificate_url && (
                                                <motion.a
                                                    whileHover={{ scale: 1.1 }}
                                                    href={cert.certificate_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#00B4F1] hover:bg-[#00B4F1] hover:text-white transition-all shadow-xl"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </motion.a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Course Cards */}
            <div className="space-y-8 relative z-10">
                <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase">
                    Knowledge <span className="text-gradient">Nodes</span> ({filteredCourses.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course, idx) => (
                            <motion.div
                                key={course.id || idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex"
                            >
                                <Card className="glass-card hover:border-white/40 transition-all duration-500 flex flex-col w-full overflow-hidden group">
                                    {/* Course Image Header */}
                                    <div className="aspect-video bg-zinc-900 border-b border-white/5 flex items-center justify-center relative overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                        {course.provider === 'Udemy' ? (
                                            <div className="p-8 w-full h-full flex items-center justify-center bg-zinc-900">
                                                <img
                                                    src={course.title.includes('Next.js') ? "https://logo.clearbit.com/nextjs.org" :
                                                        course.title.includes('Python') ? "https://logo.clearbit.com/python.org" :
                                                            course.title.includes('Java') ? "https://logo.clearbit.com/java.com" :
                                                                course.title.includes('AutoCAD') ? "https://logo.clearbit.com/autodesk.com" : "https://logo.clearbit.com/udemy.com"}
                                                    className="w-16 h-16 object-contain opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 brightness-0 invert"
                                                    alt=""
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                />
                                                <GraduationCap className="w-14 h-14 text-accent-primary hidden" />
                                            </div>
                                        ) : (
                                            <GraduationCap className="w-14 h-14 text-accent-primary opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                        )}

                                        {course.certificate_url && (
                                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-2xl">
                                                <Award className="w-5 h-5 text-amber-500" />
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-8 flex-1 flex flex-col">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.25em] bg-accent-primary/5 px-3 py-1.5 rounded-full border border-accent-primary/10">
                                                    {course.provider}
                                                </span>
                                                <span className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">
                                                    Locked
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-black text-text-primary tracking-tighter leading-none group-hover:text-accent-primary transition-colors duration-300">
                                                {course.title}
                                            </h3>

                                            <div className="flex flex-col gap-3">
                                                <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                                                    {course.instructor}
                                                </p>

                                                {course.hours && (
                                                    <div className="flex items-center gap-2 text-text-secondary opacity-40">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{course.hours} Payload Hours</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black text-accent-emerald uppercase tracking-widest flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    Sync 100%
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-accent-primary to-accent-emerald shadow-[0_0_12px_rgba(16,185,129,0.3)] rounded-full" 
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                 <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">System Complete</span>
                                                {course.certificate_url && (
                                                    <motion.a
                                                        whileHover={{ scale: 1.1 }}
                                                        href={course.certificate_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-xl"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </motion.a>
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
