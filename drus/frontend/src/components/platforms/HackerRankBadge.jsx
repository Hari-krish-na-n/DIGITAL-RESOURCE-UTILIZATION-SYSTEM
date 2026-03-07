import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils';

export const HackerRankBadge = ({ badge = {} }) => {
    const { badge_name, name, stars = 0, icon = null } = badge;
    const displayName = badge_name || name || "Badge";

    // HackerRank naming convention often includes the topic
    const shortName = displayName.replace(/Badge$/i, '').trim() || "Badge";

    // Most HackerRank badges are peach/orange colored when earned
    // we'll use a premium gradient for this
    const isEarned = (stars || 0) > 0;

    return (
        <div className="flex flex-col items-center group/hr-badge">
            <div className="relative w-24 h-28 flex items-center justify-center mb-4">
                {/* Hexagonal Background using clip-path */}
                <div
                    className={cn(
                        "absolute inset-0 transition-transform duration-500 group-hover/hr-badge:scale-110 group-hover/hr-badge:rotate-3 shadow-2xl",
                        isEarned
                            ? "bg-gradient-to-br from-[#f8d7da] via-[#f5b7b1] to-[#edbb99]"
                            : "bg-slate-200"
                    )}
                    style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                    }}
                />

                {/* Inner glow/border effect */}
                <div
                    className="absolute inset-1 opacity-50 transition-opacity group-hover/hr-badge:opacity-80"
                    style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        background: 'linear-gradient(rgba(255,255,255,0.4), transparent)'
                    }}
                />

                {/* Badge Icon */}
                <div className="relative z-10 w-12 h-12 flex items-center justify-center">
                    {icon ? (
                        <img
                            src={icon}
                            alt={name}
                            className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] grayscale-[0.2] group-hover/hr-badge:grayscale-0 transition-all"
                        />
                    ) : (
                        <span className="text-2xl font-black text-slate-800/20">{name[0]}</span>
                    )}
                </div>

                {/* Reflection */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-20" />
            </div>

            {/* Badge Name */}
            <div className="text-center space-y-1">
                <p className="text-[11px] font-black text-text-primary uppercase tracking-wider line-clamp-1 group-hover/hr-badge:text-accent-emerald transition-colors">
                    {shortName}
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-0.5">
                    {[...Array(6)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "w-2.5 h-2.5 transition-all transform",
                                i < stars
                                    ? "fill-amber-500 text-amber-500 scale-110 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]"
                                    : "text-slate-300 scale-90"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
