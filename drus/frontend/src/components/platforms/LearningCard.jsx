import React, { useState } from "react";
import { usePlatforms } from "../../context/PlatformContext";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
    RefreshCw,
    AlertCircle,
    ExternalLink,
    GraduationCap,
    Clock,
    ChevronRight,
    ShieldCheck,
    BookOpen,
    Award
} from "lucide-react";
import { cn } from "../../utils";

export const LearningCard = ({ resource }) => {
    const { updateLearningResource, syncLearningResource } = usePlatforms();
    const [profileUrl, setProfileUrl] = useState(resource.profile_url || "");
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);

    const getPlatformColors = () => {
        switch (resource.platform_id.toLowerCase()) {
            case "udemy": return "text-[#A435F0] bg-[#A435F0]/10 border-[#A435F0]/20";
            case "coursera": return "text-[#0056D2] bg-[#0056D2]/10 border-[#0056D2]/20";
            case "fcc": return "text-[#0a0a23] bg-[#0a0a23]/10 border-[#0a0a23]/20";
            default: return "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20";
        }
    };

    const colorClasses = getPlatformColors();

    const handleConnect = async () => {
        if (!profileUrl.trim()) {
            setError("Profile URL is required");
            return;
        }

        setLoading(true);
        setError(null);
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
        setError(null);
        try {
            await syncLearningResource(resource.platform_id);
        } catch (err) {
            setError("Sync failed. Ensure your profile is public.");
        } finally {
            setSyncing(false);
        }
    };

    const stats = resource.stats || {};

    return (
        <Card className="h-full flex flex-col group overflow-hidden">
            <CardContent className="flex-1 flex flex-col p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 text-2xl font-black shadow-lg transition-transform group-hover:scale-110 uppercase", colorClasses)}>
                            {resource.platform_id[0]}
                        </div>
                        <div>
                            <h3 className="text-text-primary text-xl font-black tracking-tight capitalize">{resource.platform_id}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {resource.connected ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                        <AlertCircle className="w-3.5 h-3.5" /> Disconnected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {resource.connected && resource.profile_url && (
                        <a
                            href={resource.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-bg-main border border-border-subtle text-text-secondary hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>

                {/* Form */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Input
                            label="Public Profile URL"
                            placeholder="https://www.platform.com/user/username"
                            value={profileUrl}
                            onChange={(e) => setProfileUrl(e.target.value)}
                            error={error || undefined}
                            className="bg-bg-main/50"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px]"
                            onClick={handleConnect}
                            loading={loading}
                            variant={resource.connected ? "secondary" : "primary"}
                        >
                            {resource.connected ? "Update Connection" : "Connect Resource"}
                        </Button>
                        {resource.connected && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSync}
                                loading={syncing}
                                className="rounded-xl w-12 h-12"
                            >
                                <RefreshCw className={cn("w-5 h-5", syncing && "animate-spin")} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Preview */}
                {resource.connected && (
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
                        <div className="p-4 bg-bg-main/40 rounded-2xl border border-border-subtle group/stat hover:border-emerald-500/20 transition-all">
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Courses</p>
                            <p className="text-2xl font-black text-text-primary group-hover/stat:text-emerald-500 transition-colors">{stats.completedCourses || 0}</p>
                        </div>
                        <div className="p-4 bg-bg-main/40 rounded-2xl border border-border-subtle group/stat hover:border-blue-500/20 transition-all">
                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Hours</p>
                            <p className="text-2xl font-black text-text-primary group-hover/stat:text-blue-500 transition-colors">{stats.hoursWatched || 0}</p>
                        </div>
                    </div>
                )}

                {/* Achievements Section for Learning */}
                {resource.connected && (
                    <div className="pt-6 border-t border-border-subtle">
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Award className="w-3.5 h-3.5 text-amber-500" /> Certifications & Progress
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-xl border border-border-subtle">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-4 h-4 text-accent-primary" />
                                    <span className="text-[10px] font-bold text-text-primary uppercase">Total Courses</span>
                                </div>
                                <span className="text-[10px] font-black text-accent-primary">{stats.totalCourses || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-bg-main/50 rounded-xl border border-border-subtle">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-text-primary uppercase">Certificates</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-500">{stats.certificates?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {resource.connected && (
                    <div className="pt-6 mt-auto flex items-center justify-between border-t border-border-subtle">
                        <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {resource.last_synced ? (
                                <span>Last Sync: {new Date(resource.last_synced).toLocaleDateString('en-GB')}</span>
                            ) : (
                                <span className="text-amber-500/70">Awaiting First Sync</span>
                            )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-secondary/30" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
