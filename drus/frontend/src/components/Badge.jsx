import React from 'react';
import { cn } from '../utils';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-bg-main text-text-secondary border-border-subtle',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
    purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  };

  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
