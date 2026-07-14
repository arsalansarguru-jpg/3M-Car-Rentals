"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Card Component ──────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowColor?: "blue" | "pink" | "purple" | "cyan" | "indigo" | "none";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = true,
  glowColor = "none",
  ...props
}) => {
  const glowClasses = {
    blue: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/25",
    pink: "hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:border-pink-500/25",
    purple: "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/25",
    cyan: "hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-500/25",
    indigo: "hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500/25",
    none: ""
  };

  return (
    <div
      className={clsx(
        "bg-white/[0.01] border border-white/10 rounded-[20px] p-6 backdrop-blur-md shadow-lg transition-all duration-300",
        hoverEffect && "hover:bg-white/[0.02]",
        glowClasses[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ─── KpiCard Component ────────────────────────────────────────────────────────

export interface KpiCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  growth?: number; // Growth percentage
  icon: React.ComponentType<any>;
  glowColor?: "blue" | "pink" | "purple" | "cyan" | "indigo";
  isLoading?: boolean;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix = "",
  suffix = "",
  growth,
  icon: Icon,
  glowColor = "blue",
  isLoading = false,
  className
}) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;
    let startTime: number;
    let frame: number;
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4); // Quartic ease-out
      setDisplayVal(value * ease);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const colorMaps = {
    blue: "text-blue-400 bg-blue-500/5 border-blue-500/10 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:border-blue-500/30",
    pink: "text-pink-400 bg-pink-500/5 border-pink-500/10 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] hover:border-pink-500/30",
    purple: "text-purple-400 bg-purple-500/5 border-purple-500/10 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:border-purple-500/30",
    cyan: "text-cyan-400 bg-cyan-500/5 border-cyan-500/10 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:border-cyan-500/30",
    indigo: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:border-indigo-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        "border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl transition-all duration-300 h-[130px] w-full",
        colorMaps[glowColor],
        className
      )}
    >
      <div className="flex justify-between items-start w-full">
        <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider block max-w-[120px] leading-tight">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-current">
          <Icon className="w-4 h-4 shrink-0" />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between w-full">
        <div>
          {isLoading ? (
            <div className="w-16 h-6 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <span className="text-xl md:text-2xl font-black text-white font-mono leading-none">
              {prefix}
              {typeof value === "number"
                ? value > 1000 
                  ? displayVal.toLocaleString("en-IN", { maximumFractionDigits: 0 }) 
                  : Math.round(displayVal)
                : value
              }
              {suffix}
            </span>
          )}
          <span className="text-[8px] uppercase font-bold text-white/20 block mt-1">vs prior period</span>
        </div>

        {growth !== undefined && (
          <span className={clsx(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
            growth >= 0 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {growth >= 0 ? `+${growth}%` : `${growth}%`}
          </span>
        )}
      </div>
    </motion.div>
  );
};
