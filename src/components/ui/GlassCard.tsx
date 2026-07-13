import React from "react";
import { clsx } from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GlowColor =
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "purple"
  | "cyan"
  | "pink"
  | "teal"
  | "gold"
  | "none";

export interface GlassCardProps {
  children: React.ReactNode;
  /** Module accent color — adds a subtle colored ring + brightened glow on hover */
  glow?: GlowColor;
  /** Enable hover elevation (lift + scale + brightened glow). Default: false */
  hover?: boolean;
  /** Add the top-edge shimmer line (light reflection). Default: true */
  shimmer?: boolean;
  className?: string;
  /** Override HTML element. Default: div */
  as?: React.ElementType;
  onClick?: React.MouseEventHandler<HTMLElement>;
  style?: React.CSSProperties;
  id?: string;
}

const glowClasses: Record<GlowColor, string> = {
  blue:    "glass-glow-blue",
  emerald: "glass-glow-emerald",
  amber:   "glass-glow-amber",
  red:     "glass-glow-red",
  purple:  "glass-glow-purple",
  cyan:    "glass-glow-cyan",
  pink:    "glass-glow-pink",
  teal:    "glass-glow-teal",
  gold:    "glass-glow-gold",
  none:    "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function GlassCard({
  children,
  glow = "none",
  hover = false,
  shimmer = true,
  className,
  as: Tag = "div",
  onClick,
  style,
  id,
}: GlassCardProps) {
  return (
    <Tag
      id={id}
      style={style}
      onClick={onClick}
      className={clsx(
        "glass-card",
        glow !== "none" && glowClasses[glow],
        hover && "glass-card-hover",
        shimmer && "glass-card-shimmer",
        className
      )}
    >
      {children}
    </Tag>
  );
}
