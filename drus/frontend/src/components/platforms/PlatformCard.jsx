import React, { useState } from "react";
import { usePlatforms } from "../../context/PlatformContext";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  RefreshCw,
  ExternalLink,
  Trophy,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../utils";
import { HackerRankBadge } from "./HackerRankBadge";

const OFFICIAL_URLS = {
  leetcode: "https://leetcode.com",
  codeforces: "https://codeforces.com",
  hackerrank: "https://www.hackerrank.com",
  github: "https://github.com",
  codechef: "https://www.codechef.com",
  atcoder: "https://atcoder.jp",
  unstop: "https://unstop.com"
};

export const PlatformCard = ({ platform }) => {
  const { updatePlatform, syncPlatform } = usePlatforms();
  const [username, setUsername] = useState(platform.username);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const getPlatformStyle = () => {
    switch (platform.id?.toLowerCase()) {
      case "leetcode": return { color: "from-[#FFA116] to-[#FFD66B]" };
      case "codeforces": return { color: "from-[#1F8ACB] to-[#3B82F6]" };
      case "hackerrank": return { color: "from-[#2EC866] to-[#10B981]" };
      case "github": return { color: "from-[#2D333B] to-[#444D56]" };
      default: return { color: "from-emerald-500 to-teal-600" };
    }
  };

  const style = getPlatformStyle();

  const handleSave = async () => {
    let cleanUsername = username.trim();
    if (!cleanUsername) {
      const officialUrl = OFFICIAL_URLS[platform.id];
      if (officialUrl) window.open(officialUrl, '_blank');
      return;
    }
    setLoading(true);
    try {
      await updatePlatform(platform.id, { username: cleanUsername, connected: !!cleanUsername });
      if (cleanUsername) handleSync();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncPlatform(platform.id);
    } catch (err) {
      setError("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Card className="h-full flex flex-col group border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-[2rem] overflow-hidden hover:border-emerald-500/20 transition-all">
        <CardContent className="p-6 flex flex-col h-full space-y-6">
          {/* Compact Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center p-0.5 bg-gradient-to-br shadow-lg", style.color)}>
                 <div className="w-full h-full bg-bg-card rounded-[0.9rem] flex items-center justify-center">
                    <span className={cn("text-xl font-black bg-clip-text text-transparent bg-gradient-to-br", style.color)}>
                      {platform.name ? platform.name[0] : platform.id ? platform.id[0] : '?'}
                    </span>
                 </div>
              </div>
              <div>
                <h3 className="text-text-primary text-xl font-black tracking-tighter leading-none">{platform.name}</h3>
                {platform.connected ? (
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Linked
                  </span>
                ) : (
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1 mt-1 opacity-50">
                    <Globe className="w-3 h-3" /> Unlinked
                  </span>
                )}
              </div>
            </div>
            {platform.connected && (
              <button onClick={handleSync} className="p-2.5 bg-emerald-500/5 text-emerald-500 rounded-xl hover:bg-emerald-500/10 transition-all">
                <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
              </button>
            )}
          </div>

          {/* Action Area */}
          <div className="space-y-3">
            <Input
              placeholder="Username or URL"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-bg-card-alt/30 border-border-subtle h-12 px-4 font-bold text-sm rounded-2xl"
            />
            <div className="flex gap-2">
              <Button
                className={cn(
                  "flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                  platform.connected ? "bg-bg-card-alt text-text-primary border border-border-subtle" : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                )}
                onClick={handleSave}
                loading={loading}
              >
                {platform.connected ? "Update" : "Link"}
              </Button>
              {platform.connected && platform.profileUrl && (
                <a href={platform.profileUrl} target="_blank" className="w-12 h-12 flex items-center justify-center bg-bg-card-alt border border-border-subtle rounded-2xl text-text-secondary hover:text-emerald-500 transition-all">
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Compact Stats */}
          {platform.connected && platform.stats && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-subtle/30">
              <div className="p-4 bg-bg-card-alt/30 rounded-2xl border border-border-subtle/50 group/stat">
                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-60">Activity</p>
                <p className="text-xl font-black text-text-primary tabular-nums tracking-tighter group-hover/stat:text-emerald-500 transition-colors">
                  {platform.stats.solved || 0}
                </p>
              </div>
              <div className="p-4 bg-bg-card-alt/30 rounded-2xl border border-border-subtle/50 group/stat">
                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest mb-1 opacity-60">Status</p>
                <p className="text-xl font-black text-text-primary tabular-nums tracking-tighter group-hover/stat:text-blue-500 transition-colors">
                  {platform.stats.rank || 'Prime'}
                </p>
              </div>
            </div>
          )}

          {/* Compact Achievements */}
          {platform.connected && platform.badges && platform.badges.length > 0 && (
            <div className="pt-4 border-t border-border-subtle/30">
               <div className="flex items-center justify-between mb-3">
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-amber-500" /> Trophies
                  </p>
                  <span className="text-[8px] font-black text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">{platform.badges.length}</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  {platform.badges.slice(0, 4).map((badge, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-bg-card-alt border border-border-subtle p-2.5 flex items-center justify-center group/badge relative hover:border-amber-500/30 transition-all">
                       {badge.icon ? <img src={badge.icon} className="w-full h-full object-contain" alt="" /> : <Trophy className="w-full h-full text-text-secondary/20" />}
                    </div>
                  ))}
                  {platform.badges.length > 4 && (
                    <div className="w-10 h-10 rounded-xl bg-bg-card-alt border border-border-subtle flex items-center justify-center text-[8px] font-black text-text-secondary">+{platform.badges.length - 4}</div>
                  )}
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default PlatformCard;
