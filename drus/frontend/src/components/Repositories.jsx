import React, { useState, useEffect } from "react";
import {
    Folder,
    Star,
    GitFork,
    Search,
    ExternalLink,
    RefreshCw,
    Filter
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import client from "../api/client";
import { cn } from "../utils";

export const Repositories = () => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLanguage, setFilterLanguage] = useState("All");

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const data = await client("/stats/repos");
                setRepos(data || []);
            } catch (err) {
                console.error("Failed to fetch repositories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, []);

    const languages = ["All", ...new Set(repos.map(r => r.language).filter(Boolean))];

    const filteredRepos = repos.filter(repo => {
        const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesLanguage = filterLanguage === "All" || repo.language === filterLanguage;
        return matchesSearch && matchesLanguage;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <RefreshCw className="w-10 h-10 text-accent-primary animate-spin" />
                <p className="text-text-secondary text-sm font-medium animate-pulse">Loading your repositories...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 relative">
            <div className="fixed inset-0 mesh-bg -z-10 opacity-30 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
                <div className="space-y-4">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full"
                    >
                        <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                        <span className="text-[11px] font-black text-accent-primary uppercase tracking-[0.2em] leading-none">Global Access Node 02</span>
                    </motion.div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tighter leading-[1.1] mb-2">
                             System <span className="text-gradient">Repositories</span>.
                        </h1>
                        <p className="text-base text-text-secondary max-w-2xl font-medium leading-relaxed">
                            Managing synchronized project nodes and distributed contribution matrices across the GitHub network.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Active Nodes</span>
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/5 shadow-2xl">
                            <Folder className="w-5 h-5 text-accent-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-2xl font-black text-text-primary tracking-tighter">{repos.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                <div className="md:col-span-8">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent-primary transition-all duration-300" />
                        <Input
                            placeholder="Universal Name Search..."
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
                            value={filterLanguage}
                            onChange={(e) => setFilterLanguage(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/5 rounded-2xl text-sm font-black text-text-primary focus:outline-none focus:border-accent-primary/50 appearance-none cursor-pointer shadow-xl transition-all uppercase tracking-widest"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang === 'All' ? 'Select Matrix' : lang}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredRepos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {filteredRepos.map((repo, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05, type: "spring", bounce: 0.4 }}
                        >
                            <Card className="h-full flex flex-col glass-card hover:border-white/40 transition-all duration-500 hover:shadow-2xl group overflow-hidden">
                                <CardContent className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 flex items-center justify-center text-accent-primary transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500">
                                            <Folder className="w-7 h-7 opacity-60" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center group/stat">
                                                <Star className="w-4 h-4 text-amber-500 transition-transform group-hover/stat:scale-125" />
                                                <span className="text-[10px] font-black text-text-primary mt-1">{repo.stargazersCount}</span>
                                            </div>
                                            <div className="flex flex-col items-center group/stat">
                                                <GitFork className="w-4 h-4 text-emerald-500 transition-transform group-hover/stat:scale-125" />
                                                <span className="text-[10px] font-black text-text-primary mt-1">{repo.forksCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={repo.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-2xl font-black text-text-primary hover:text-accent-primary transition-all mb-4 block tracking-tighter leading-tight"
                                    >
                                        {repo.name}
                                    </a>

                                    <p className="text-sm font-medium text-text-secondary line-clamp-2 mb-10 flex-1 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                                        {repo.description || "System node awaiting metadata description stream."}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        {repo.language && (
                                            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/40 dark:bg-black/20 rounded-xl border border-white/60 dark:border-white/5">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                                                    repo.language === "JavaScript" ? "text-yellow-400 bg-yellow-400" :
                                                        repo.language === "Python" ? "text-blue-500 bg-blue-500" :
                                                            repo.language === "HTML" ? "text-orange-600 bg-orange-600" :
                                                                repo.language === "CSS" ? "text-indigo-500 bg-indigo-500" : "text-accent-primary bg-accent-primary"
                                                )} />
                                                <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{repo.language}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
                                                {new Date(repo.updatedAt).toLocaleDateString('en-GB')}
                                            </span>
                                            <motion.a
                                                whileHover={{ scale: 1.1 }}
                                                href={repo.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-all shadow-xl"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </motion.a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-bg-card rounded-[2.5rem] border-2 border-dashed border-border-subtle">
                    <div className="w-16 h-16 bg-bg-main rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-border-subtle">
                        <Search className="w-8 h-8 text-text-secondary opacity-20" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">No projects found</h3>
                    <p className="text-text-secondary text-sm max-w-xs mx-auto mb-8 font-medium">
                        We couldn't find any repositories matching your current search or filters.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => { setSearchQuery(""); setFilterLanguage("All"); }}
                        className="rounded-xl uppercase tracking-widest text-[10px] px-6"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    );
};
