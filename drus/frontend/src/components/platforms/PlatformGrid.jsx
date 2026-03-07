import React from "react";
import { PlatformCard } from "./PlatformCard";
import { LearningCard } from "./LearningCard";
import { motion } from "motion/react";
import { usePlatforms } from "../../context/PlatformContext";
import { RefreshCw, Code2, GraduationCap } from "lucide-react";

export const PlatformGrid = () => {
  const { platforms, learningResources, loading } = usePlatforms();

  if (loading && platforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-text-secondary text-sm font-medium animate-pulse">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Coding Platforms Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
            <Code2 className="w-6 h-6 text-accent-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">Coding Platforms</h2>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Sync your competitive programming & dev profiles</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <PlatformCard platform={platform} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Learning Resources Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-emerald/10 flex items-center justify-center border border-accent-emerald/20">
            <GraduationCap className="w-6 h-6 text-accent-emerald" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">Learning Resources</h2>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Track your courses & certifications</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningResources.map((resource, index) => (
            <motion.div
              key={resource.platform_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <LearningCard resource={resource} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
