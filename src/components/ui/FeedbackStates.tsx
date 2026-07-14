import React from "react";
import { clsx } from "clsx";
import { Info, RefreshCw } from "lucide-react";

// ─── EmptyState Component ─────────────────────────────────────────────────────

export interface EmptyStateProps {
  title?: string;
  description: string;
  icon?: React.ComponentType<any>;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  description,
  icon: Icon = Info,
  className
}) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center text-center p-12 border border-white/5 bg-white/[0.01] rounded-3xl backdrop-blur-md", className)}>
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-white font-extrabold text-sm uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h4>
      <p className="text-white/40 text-xs max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

// ─── LoadingState Component ───────────────────────────────────────────────────

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading platform metrics...",
  className
}) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center text-center p-12", className)}>
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 animate-spin mb-4">
        <RefreshCw className="w-5 h-5" />
      </div>
      <p className="text-white/40 text-xs font-mono tracking-wider uppercase">
        {message}
      </p>
    </div>
  );
};

// ─── Skeleton Component ───────────────────────────────────────────────────────

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-white/5",
        variant === "text" && "h-3 w-3/4 rounded",
        variant === "rectangular" && "rounded-2xl",
        variant === "circular" && "rounded-full",
        className
      )}
      {...props}
    />
  );
};
