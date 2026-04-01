import React, { useState } from "react";
import { usePlatforms } from "../../context/PlatformContext";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
    RefreshCw,
    ExternalLink,
    GraduationCap,
    Clock,
    ShieldCheck,
    BookOpen,
    Award,
    Zap,
    Download,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../utils";

export const LearningCard = ({ resource }) => {
    const { updateLearningResource, syncLearningResource } = usePlatforms();
    const [profileUrl, setProfileUrl] = useState(resource.profile_url || "");
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [isCertsModalOpen, setIsCertsModalOpen] = useState(false);

    const getPlatformStyle = () => {
        switch (resource.platform_id?.toLowerCase() || '') {
            case "udemy": return { color: "from-[#A435F0] to-[#6E1FB1]", glyph: "U" };
            case "coursera": return { color: "from-[#0056D2] to-[#00419E]", glyph: "C" };
            case "fcc": return { color: "from-[#0a0a23] to-[#444D56]", glyph: "F" };
            case "unstop": return { color: "from-[#00B4F1] to-[#007CC2]", glyph: "N" };
            default: return { color: "from-emerald-500 to-teal-600", glyph: "?" };
        }
    };

    const style = getPlatformStyle();

    const handleConnect = async () => {
        if (!profileUrl.trim()) return;
        setLoading(true);
        try {
            await updateLearningResource(resource.platform_id, profileUrl.trim());
            handleSync();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncLearningResource(resource.platform_id);
        } catch (err) {
            setError("Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    const stats = resource.stats || {};

    return (
        <motion.div whileHover={{ y: -4 }} className="h-full">
            <Card className="h-full flex flex-col group border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-[2rem] overflow-hidden hover:border-emerald-500/20 transition-all">
                <CardContent className="p-6 flex flex-col h-full space-y-6">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center p-0.5 bg-gradient-to-br shadow-lg shadow-emerald-500/10", style.color)}>
                                <div className="w-full h-full bg-bg-card rounded-[0.9rem] flex items-center justify-center">
                                    <span className={cn("text-xl font-black bg-clip-text text-transparent bg-gradient-to-br tracking-tighter capitalize", style.color)}>
                                        {style.glyph}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-text-primary text-xl font-black tracking-tighter leading-none capitalize">{resource.platform_id}</h3>
                                {resource.connected ? (
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                                        <ShieldCheck className="w-3 h-3" /> Academy Linked
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1 mt-1 opacity-50">
                                        <GraduationCap className="w-3 h-3" /> Unlinked Node
                                    </span>
                                )}
                            </div>
                        </div>
                        {resource.connected && (
                            <button onClick={handleSync} className="p-2.5 bg-emerald-500/5 text-emerald-500 rounded-xl hover:bg-emerald-500/10 transition-all">
                                <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                            </button>
                        )}
                    </div>

                    {/* Action Area */}
                    <div className="space-y-3">
                        <Input
                            placeholder="Public Profile URL"
                            value={profileUrl}
                            onChange={(e) => setProfileUrl(e.target.value)}
                            className="bg-bg-card-alt/30 border-border-subtle h-12 px-4 font-bold text-sm rounded-2xl"
                        />
                        <div className="flex gap-2">
                            <Button
                                className={cn(
                                    "flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                                    resource.connected ? "bg-bg-card-alt text-text-primary border border-border-subtle" : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                                )}
                                onClick={handleConnect}
                                loading={loading}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {resource.connected ? "Update" : "Link Academy"} <Zap className="w-4 h-4" />
                                </span>
                            </Button>
                            {resource.connected && resource.profile_url && (
                                <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href={resource.profile_url}
                                    target="_blank"
                                    className="w-12 h-12 flex items-center justify-center bg-bg-card-alt border border-border-subtle rounded-2xl text-text-secondary hover:text-emerald-500 transition-all shadow-lg shadow-black/5"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </motion.a>
                            )}
                        </div>
                    </div>

                    {/* Compact Metrics */}
                    {resource.connected && (
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-subtle/30">
                            <div className="p-4 bg-bg-card-alt/30 rounded-2xl border border-border-subtle/50 group/stat">
                                <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.25em] mb-1 opacity-60">Completed</p>
                                <p className="text-xl font-black text-text-primary tabular-nums tracking-tighter group-hover/stat:text-emerald-500 transition-colors">
                                    {stats.completedCourses || 0}
                                </p>
                            </div>
                            <div className="p-4 bg-bg-card-alt/30 rounded-2xl border border-border-subtle/50 group/stat">
                                <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.25em] mb-1 opacity-60">Study (H)</p>
                                <p className="text-xl font-black text-text-primary tabular-nums tracking-tighter group-hover/stat:text-blue-500 transition-colors">
                                    {stats.hoursWatched || 0}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Compact Dossier */}
                    {resource.connected && (
                        <div className="pt-4 border-t border-border-subtle/30 space-y-2">
                            <div className="flex items-center justify-between p-3 bg-bg-card-alt/30 rounded-2xl border border-border-subtle/50 group/row hover:border-emerald-500/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[9px] font-black text-text-primary uppercase tracking-tight">Active Courses</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-500">{stats.totalCourses || 0}</span>
                            </div>
                            <motion.div 
                                onClick={() => stats.certificates?.length > 0 && setIsCertsModalOpen(true)}
                                className={cn(
                                    "flex items-center justify-between p-3 bg-bg-card-alt/30 rounded-2xl border border-border-subtle/50 group/row transition-all",
                                    stats.certificates?.length > 0 ? "cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5" : "opacity-80"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Award className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[9px] font-black text-text-primary uppercase tracking-tight">Certifications</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-amber-500">{stats.certificates?.length || 0}</span>
                                    {stats.certificates?.length > 0 && <ChevronRight className="w-3 h-3 text-amber-500/50" />}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <AnimatePresence>
                        {isCertsModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsCertsModalOpen(false)}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="relative w-full max-w-lg bg-bg-card border border-border-subtle rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                                >
                                    <div className={cn("absolute top-0 left-0 w-full h-2 bg-gradient-to-r", style.color)} />
                                    
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center p-0.5 bg-gradient-to-br", style.color)}>
                                                <div className="w-full h-full bg-bg-card rounded-[0.8rem] flex items-center justify-center">
                                                    <Award className="w-7 h-7 text-amber-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-text-primary tracking-tighter">Verified Credentials</h2>
                                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{resource.platform_id} Subnet • {stats.certificates?.length} Found</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsCertsModalOpen(false)}
                                            className="p-3 hover:bg-bg-card-alt rounded-2xl text-text-secondary transition-colors"
                                        >
                                            <RefreshCw className="w-5 h-5 rotate-45" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {stats.certificates?.map((cert, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group/item flex items-center justify-between p-5 bg-bg-card-alt/40 border border-border-subtle rounded-3xl hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                                            >
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className="text-sm font-black text-text-primary truncate">{cert.title || 'Advanced Certification'}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5 font-black uppercase text-[8px] tracking-widest text-text-secondary">
                                                        <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> Verified</span>
                                                        <span className="text-border-subtle">•</span>
                                                        <span>{cert.issuedOn || 'RECENT'}</span>
                                                    </div>
                                                </div>
                                                {cert.certificateUrl && (
                                                    <a 
                                                        href={cert.certificateUrl} 
                                                        target="_blank" 
                                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 text-[10px] font-black uppercase tracking-tighter transition-all hover:text-white"
                                                    >
                                                        View <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-border-subtle flex justify-end">
                                        <Button 
                                            onClick={() => setIsCertsModalOpen(false)}
                                            className="px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-bg-card-alt border border-border-subtle hover:bg-emerald-500 hover:text-white transition-all"
                                        >
                                            Close Dossier
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Meta Footer */}
                    {resource.connected && (
                        <div className="pt-4 mt-auto flex items-center justify-between border-t border-border-subtle/30 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 text-[8px] font-black text-text-secondary uppercase tracking-[0.25em]">
                                <Clock className="w-3.5 h-3.5" />
                                {resource.last_synced ? (
                                    <span>{new Date(resource.last_synced).toLocaleDateString()}</span>
                                ) : (
                                    <span>Pending Sync</span>
                                )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-secondary" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
export default LearningCard;
