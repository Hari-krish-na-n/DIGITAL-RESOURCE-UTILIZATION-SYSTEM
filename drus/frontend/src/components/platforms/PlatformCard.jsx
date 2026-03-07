import React, { useState } from "react";
import { usePlatforms } from "../../context/PlatformContext";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Trophy,
  Clock,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "../../utils";
import { HackerRankBadge } from "./HackerRankBadge";

const OFFICIAL_URLS = {
  leetcode: "https://leetcode.com",
  codeforces: "https://codeforces.com",
  hackerrank: "https://www.hackerrank.com",
  github: "https://github.com",
  codechef: "https://www.codechef.com",
  atcoder: "https://atcoder.jp"
};

export const PlatformCard = ({ platform }) => {
  const { updatePlatform, syncPlatform } = usePlatforms();
  const [username, setUsername] = useState(platform.username);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSave = async () => {
    let cleanUsername = username.trim();

    if (!cleanUsername) {
      const officialUrl = OFFICIAL_URLS[platform.id];
      if (officialUrl) {
        window.open(officialUrl, '_blank');
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (platform.id === "hackerrank" && cleanUsername.includes("hackerrank.com/")) {
        try {
          const urlObj = new URL(cleanUsername.startsWith('http') ? cleanUsername : `https://${cleanUsername}`);
          const pathParts = urlObj.pathname.split('/').filter(p => p);
          if (pathParts[0] === 'profile' && pathParts[1]) {
            cleanUsername = pathParts[1];
          } else if (pathParts[0]) {
            cleanUsername = pathParts[0];
          }
        } catch { /* fallback */ }
      }

      const getProfileUrl = (id, username) => {
        switch (id) {
          case 'leetcode': return `https://leetcode.com/${username}`;
          case 'codeforces': return `https://codeforces.com/profile/${username}`;
          case 'hackerrank': return `https://www.hackerrank.com/profile/${username}`;
          case 'github': return `https://github.com/${username}`;
          case 'codechef': return `https://www.codechef.com/users/${username}`;
          case 'atcoder': return `https://atcoder.jp/users/${username}`;
          default: return "";
        }
      };

      await updatePlatform(platform.id, {
        username: cleanUsername,
        profileUrl: cleanUsername ? getProfileUrl(platform.id, cleanUsername) : "",
        connected: !!cleanUsername
      });
      setUsername(cleanUsername);
      if (cleanUsername) handleSync();
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
      await syncPlatform(platform.id);
    } catch (err) {
      if (err.status === 404) {
        setError("User not found. Check spelling/URL.");
      } else if (err.status === 403) {
        setError("Access denied. Platform is blocking requests.");
      } else {
        setError("Sync failed. Try again later.");
      }
    } finally {
      setSyncing(false);
    }
  };

  const isHackerRank = platform.id === "hackerrank";

  return (
    <Card className="h-full flex flex-col group overflow-hidden">
      <CardContent className="flex-1 flex flex-col p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 text-2xl font-black shadow-lg transition-transform group-hover:scale-110", colorClasses)}>
              {platform.name[0]}
            </div>
            <div>
              <h3 className="text-text-primary text-xl font-black tracking-tight">{platform.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {platform.connected ? (
                  <>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                      Live Data
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                    <AlertCircle className="w-3.5 h-3.5" /> Unlinked
                  </span>
                )}
                {error && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">
                    Error
                  </span>
                )}
              </div>
            </div>
          </div>

          {platform.connected && platform.profileUrl && (
            <a
              href={platform.profileUrl}
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
              label="Handle or Profile URL"
              placeholder={`e.g. ${platform.username || 'username'}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={error || undefined}
              className="bg-bg-main/50"
            />
            {platform.connected && platform.stats && !isHackerRank && (
              <p className="text-[10px] font-bold text-text-secondary/60 uppercase tracking-widest px-1">
                {platform.id === 'github' ? 'Repositories' : 'Solved'} {platform.stats.solved} — Rating {platform.stats.rank || 'N/A'}
              </p>
            )}
            {platform.connected && isHackerRank && (
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-1">
                HackerRank Certified Professional
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px]"
              onClick={handleSave}
              loading={loading}
              variant={platform.connected ? "secondary" : "primary"}
            >
              {platform.connected ? "Update Profile" : "Connect Account"}
            </Button>
            {platform.connected && (
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

        {/* Stats Preview - Hidden for HackerRank as requested */}
        {platform.connected && platform.stats && !isHackerRank && (
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
            <div className="p-4 bg-bg-main/40 rounded-2xl border border-border-subtle group/stat hover:border-emerald-500/20 transition-all">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">
                {platform.id === 'github' ? 'Repositories' : 'Problems'}
              </p>
              <p className="text-2xl font-black text-text-primary group-hover/stat:text-emerald-500 transition-colors">{platform.stats.solved}</p>
            </div>
            <div className="p-4 bg-bg-main/40 rounded-2xl border border-border-subtle group/stat hover:border-blue-500/20 transition-all">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Rating</p>
              <p className="text-2xl font-black text-text-primary group-hover/stat:text-blue-500 transition-colors">{platform.stats.rank || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Badges Section */}
        {platform.connected && platform.badges && platform.badges.length > 0 && (
          <div className="pt-6 border-t border-border-subtle">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> {isHackerRank ? "Skill Badges" : "Recent Achievements"}
              </p>
              <span className="text-[9px] font-black text-text-secondary opacity-50">{platform.badges.length} Earned</span>
            </div>

            {isHackerRank ? (
              <div className="grid grid-cols-3 gap-y-10 gap-x-4">
                {platform.badges.map((badge, i) => (
                  <HackerRankBadge key={i} badge={badge} />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {platform.badges.slice(0, 4).map((badge, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-bg-main border border-border-subtle p-2 flex items-center justify-center group/badge relative hover:border-amber-500/30 transition-all">
                    {badge.icon ? (
                      <img src={badge.icon} alt={badge.badge_name} className="w-full h-full object-contain drop-shadow-md" />
                    ) : (
                      <Trophy className="w-full h-full text-text-secondary/20" />
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-black/90 backdrop-blur-md text-[10px] text-white font-bold rounded-lg opacity-0 group-hover/badge:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl border border-white/10 scale-90 group-hover/badge:scale-100">
                      {badge.badge_name}
                    </div>
                  </div>
                ))}
                {platform.badges.length > 4 && (
                  <div className="w-10 h-10 rounded-xl bg-bg-main border border-border-subtle flex items-center justify-center text-[10px] font-black text-text-secondary hover:text-text-primary transition-colors">
                    +{platform.badges.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {platform.connected && (
          <div className="pt-6 mt-auto flex items-center justify-between border-t border-border-subtle">
            <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              {platform.lastSynced ? (
                <span>Last Sync: {new Date(platform.lastSynced.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB')}</span>
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
export default PlatformCard;
