import React from "react";
import { PlatformCard } from "./PlatformCard";
import { LearningCard } from "./LearningCard";
import { motion } from "motion/react";
import { usePlatforms } from "../../context/PlatformContext";
import { RefreshCw, GraduationCap, Network } from "lucide-react";
import { cn } from "../../utils";

export const PlatformGrid = () => {
  const { platforms, learningResources, loading } = usePlatforms();

  if (loading && platforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
        <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-text-primary text-lg font-black uppercase tracking-widest animate-pulse">Syncing Matrix</p>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title, subtitle, accentColor }) => {
    const titleParts = title ? title.split(' ') : ['?', '?'];
    return (
      <div className="flex items-center gap-5 mb-8">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-xl shrink-0", accentColor)}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">
            {titleParts[0]} <span className="text-emerald-500">{titleParts[1] || ''}</span>
          </h2>
          <p className="text-text-secondary text-sm font-medium opacity-60 tracking-tight">{subtitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-20 pb-20 max-w-[1200px] mx-auto px-4">
      <div className="fixed inset-0 mesh-bg -z-10 opacity-20 pointer-events-none" />

      {/* Coding Platforms Section */}
      <section>
        <SectionHeader 
          icon={Network}
          title="Coding Nodes"
          subtitle="Map your competitive programming telemetry."
          accentColor="bg-blue-500/10 border-blue-500/20 text-blue-500"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
      </section>

      {/* Learning Resources Section */}
      <section>
        <SectionHeader 
          icon={GraduationCap}
          title="Learning Uplinks"
          subtitle="Sync academic achievements and certifications."
          accentColor="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningResources.map((resource) => (
            <LearningCard key={resource.platform_id} resource={resource} />
          ))}
        </div>
      </section>

      {/* Meta Footer */}
      <div className="pt-10 flex flex-wrap gap-6 justify-center opacity-30">
        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Linked Data Pipeline
        </div>
        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Buffer Ready
        </div>
      </div>
    </div>
  );
};
export default PlatformGrid;
