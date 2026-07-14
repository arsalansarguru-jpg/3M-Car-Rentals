import React from "react";
import { clsx } from "clsx";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  contextTag?: string;
  children?: React.ReactNode; // For headers action buttons or indicators
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  contextTag = "3M Rentals Console",
  children,
  className
}) => {
  return (
    <div className={clsx("flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md", className)}>
      <div>
        <span className="text-[10px] font-mono text-[#3B82F6] uppercase tracking-widest block mb-1">
          {contextTag}
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/40 text-xs mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  );
};
