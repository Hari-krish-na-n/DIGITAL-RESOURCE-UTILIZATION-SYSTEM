import React from "react";
import { cn } from "../../utils";

export const Card = ({ children, className, hoverable = true, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-bg-card border border-border-subtle rounded-2xl overflow-hidden transition-all duration-300",
        hoverable && "hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};
