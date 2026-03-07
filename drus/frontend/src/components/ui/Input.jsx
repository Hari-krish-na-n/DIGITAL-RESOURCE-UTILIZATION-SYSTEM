import React from "react";
import { cn } from "../../utils";

export const Input = React.forwardRef(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-blue-500 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-bg-main/50 border border-border-subtle rounded-2xl px-5 py-4 text-sm text-text-primary placeholder:text-text-secondary/30 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500",
              icon && "pl-12",
              error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
