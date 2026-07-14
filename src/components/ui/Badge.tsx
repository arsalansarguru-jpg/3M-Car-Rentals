import React from "react";
import { clsx } from "clsx";

// ─── Badge Component ──────────────────────────────────────────────────────────

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "emerald" | "amber" | "red" | "purple" | "pink" | "cyan" | "slate";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "slate",
  className,
  ...props
}) => {
  const variantClasses = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    pink: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    slate: "bg-white/5 border-white/10 text-white/50"
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border font-sans",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// ─── StatusBadge Component ────────────────────────────────────────────────────

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const normalized = status.toLowerCase().trim().replace(/_/g, " ");

  const getVariant = (): BadgeProps["variant"] => {
    switch (normalized) {
      case "available":
      case "approved":
      case "active":
      case "paid":
      case "clean":
      case "delivered":
      case "success":
        return "emerald";
      case "reserved":
      case "confirmed":
      case "pending":
      case "authorized":
        return "blue";
      case "maintenance":
      case "rejected":
      case "failed":
      case "dirty":
      case "suspended":
        return "red";
      case "coming soon":
      case "limited":
      case "pickup reminder":
      case "return reminder":
        return "amber";
      case "detailing":
      case "cleaning":
      case "refunded":
        return "purple";
      default:
        return "slate";
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {normalized}
    </Badge>
  );
};
