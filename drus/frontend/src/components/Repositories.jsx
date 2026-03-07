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
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-text-primary tracking-tight">Repositories</h1>
                    <p className="text-text-secondary max-w-md">
                        Manage and explore your synchronized GitHub projects and contributions.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-bg-card p-2 rounded-2xl border border-border-subtle shadow-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-bg-main rounded-xl border border-border-subtle">
                        <Folder className="w-4 h-4 text-accent-primary" />
                        <span className="text-sm font-black text-text-primary">{repos.length}</span>
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Total</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-accent-primary transition-colors" />
                        <Input
                            placeholder="Search repositories by name or description..."
                            className="pl-12 h-14 bg-bg-card border-border-subtle focus:border-accent-primary/30 rounded-2xl shadow-sm text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="md:col-span-4">
                    <div className="relative group h-full">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent-primary transition-colors" />
                        <select
                            value={filterLanguage}
                            onChange={(e) => setFilterLanguage(e.target.value)}
                            className="w-full h-14 pl-11 pr-4 bg-bg-card border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:outline-none focus:border-accent-primary/30 appearance-none cursor-pointer shadow-sm"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredRepos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRepos.map((repo, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5 }}
                        >
                            <Card className="h-full flex flex-col hover:border-accent-primary/30 transition-all shadow-sm hover:shadow-xl hover:shadow-accent-primary/5">
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-bg-main border border-border-subtle flex items-center justify-center text-accent-primary">
                                            <Folder className="w-5 h-5 opacity-40" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-text-secondary">
                                                <Star className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-xs font-black">{repo.stargazersCount}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-text-secondary">
                                                <GitFork className="w-3.5 h-3.5" />
                                                <span className="text-xs font-black">{repo.forksCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={repo.htmlUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg font-black text-text-primary hover:text-accent-primary transition-colors mb-3 block tracking-tight"
                                    >
                                        {repo.name}
                                    </a>

                                    <p className="text-sm text-text-secondary line-clamp-2 mb-8 flex-1 leading-relaxed">
                                        {repo.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between pt-5 border-t border-border-subtle">
                                        {repo.language && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-main rounded-lg border border-border-subtle">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    repo.language === "JavaScript" ? "bg-yellow-400" :
                                                        repo.language === "Python" ? "bg-blue-500" :
                                                            repo.language === "HTML" ? "bg-orange-600" :
                                                                repo.language === "CSS" ? "bg-indigo-500" : "bg-accent-primary"
                                                )} />
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">{repo.language}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">
                                                {new Date(repo.updatedAt).toLocaleDateString('en-GB')}
                                            </span>
                                            <a
                                                href={repo.htmlUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg hover:bg-bg-main text-text-secondary hover:text-accent-primary transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
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
