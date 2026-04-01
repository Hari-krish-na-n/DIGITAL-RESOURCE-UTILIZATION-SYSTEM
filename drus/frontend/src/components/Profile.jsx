import React, { useEffect, useState } from "react";
import { User, RefreshCw, Folder, CheckCircle, Trophy } from "lucide-react";
import client from "../api/client";
import { Card, CardContent } from "./ui/Card";

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [summary, setSummary] = useState([]);
  const [repoCount, setRepoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [me, platformsData, summaryData, repos] = await Promise.all([
        client("/auth/me"),
        client("/platforms/me/platforms"),
        client("/stats/summary"),
        client("/stats/repos"),
      ]);

      setUser(me);
      setPlatforms(platformsData || []);
      setSummary(summaryData || []);
      setRepoCount(Array.isArray(repos) ? repos.length : 0);
    } catch (err) {
      console.error("Failed to load profile", err);
      setError("Unable to load profile information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const totalSolved = summary.reduce((acc, item) => acc + (item.problems_solved || 0), 0);
  const totalBadges = platforms.reduce((acc, item) => acc + (item.badges?.length || 0), 0);
  const connectedPlatforms = platforms.filter((p) => p.connected);



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-accent-primary animate-spin" />
        <p className="text-text-secondary text-sm font-medium animate-pulse">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tight">Profile</h1>
          <p className="text-text-secondary text-sm max-w-md">Update your account details and view your connected platforms, code activity and badge progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-card border border-border-subtle rounded-2xl">
            <User className="w-5 h-5 text-accent-primary" />
            <span className="text-xs font-black text-text-secondary">{user?.username || "—"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="p-6 bg-bg-card border border-border-subtle rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Connected profiles</p>
              <p className="text-3xl font-black text-text-primary">{connectedPlatforms.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-text-secondary mt-3">Profiles connected to your account (LeetCode, GitHub, HackerRank, etc.)</p>
        </div>

        <div className="p-6 bg-bg-card border border-border-subtle rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Problems solved</p>
              <p className="text-3xl font-black text-text-primary">{totalSolved.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-text-secondary mt-3">Total across all connected platforms.</p>
        </div>

        <div className="p-6 bg-bg-card border border-border-subtle rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Repositories</p>
              <p className="text-3xl font-black text-text-primary">{repoCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-text-secondary mt-3">Repositories synced from GitHub.</p>
        </div>

        <div className="p-6 bg-bg-card border border-border-subtle rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Badges earned</p>
              <p className="text-3xl font-black text-text-primary">{totalBadges}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-text-secondary mt-3">Skills and accomplishments from connected platforms.</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-text-primary tracking-tight">Connected profiles</h2>
            {connectedPlatforms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {connectedPlatforms.map((p) => (
                  <div key={p.id} className="p-4 bg-bg-main border border-border-subtle rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-text-primary">{p.name}</p>
                        <p className="text-[11px] text-text-secondary">{p.platform_username || "–"}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{p.lastSynced ? new Date(p.lastSynced.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB') : 'Never'}</span>
                    </div>
                    {p.profileUrl && (
                      <a
                        href={p.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-[11px] font-black text-accent-primary hover:text-accent-primary/70"
                      >
                        View profile
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No platforms are connected yet. Visit the Platforms page to connect your accounts.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-bg-main border border-border-subtle rounded-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Account details</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[11px] text-text-secondary uppercase tracking-widest">Username</p>
                  <p className="text-sm font-black text-text-primary">{user?.username || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase tracking-widest">Email</p>
                  <p className="text-sm font-black text-text-primary">{user?.email || "—"}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 font-bold">{error}</div>
            )}

            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={fetchProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-bg-card px-5 py-3 text-xs font-black uppercase tracking-widest text-text-primary border border-border-subtle hover:bg-bg-main transition"
              >
                <RefreshCw className="w-4 h-4" /> Refresh data
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
