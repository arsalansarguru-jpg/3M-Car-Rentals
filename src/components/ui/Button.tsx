import React from "react";
import { clsx } from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"     // Royal Blue glass
    | "secondary"   // Subtle white glass
    | "outline"     // Transparent with border
    | "ghost"       // Text only with hover glass highlight
    | "success"     // Emerald glass
    | "warning"     // Amber glass
    | "danger"      // Rose glass (replaces legacy destructive)
    | "destructive" // Backwards-compatible alias for danger
    | "fleet"       // Cyan glass
    | "finance"     // Purple glass
    | "crm"         // Pink glass
    | "ai"          // Indigo glass
    | "reports"     // Teal glass
    | "settings";   // Slate glass
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Variant map ──────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:     "btn-glass btn-glass-blue font-medium tracking-wider uppercase",
  secondary:   "btn-glass btn-glass-slate font-medium tracking-wider uppercase",
  outline:     "btn-glass bg-transparent border-white/15 text-white/80 hover:border-white/40 hover:bg-white/5",
  ghost:       "bg-transparent text-white/60 hover:bg-white/5 hover:text-white rounded-[20px] transition-all duration-200",
  success:     "btn-glass btn-glass-success font-medium tracking-wider uppercase",
  warning:     "btn-glass btn-glass-warning font-medium tracking-wider uppercase",
  danger:      "btn-glass btn-glass-danger font-medium tracking-wider uppercase",
  destructive: "btn-glass btn-glass-danger font-medium tracking-wider uppercase",
  fleet:       "btn-glass btn-glass-cyan font-medium tracking-wider uppercase",
  finance:     "btn-glass btn-glass-purple font-medium tracking-wider uppercase",
  crm:         "btn-glass btn-glass-pink font-medium tracking-wider uppercase",
  ai:          "btn-glass btn-glass-indigo font-medium tracking-wider uppercase",
  reports:     "btn-glass btn-glass-teal font-medium tracking-wider uppercase",
  settings:    "btn-glass btn-glass-slate font-medium tracking-wider uppercase",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-[10px] tracking-wider",
  md: "h-11 px-5 text-xs tracking-widest",
  lg: "h-12 px-7 text-xs tracking-widest",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 select-none active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10",
          "rounded-[20px]", // Global Glass Button radius requirement
          SIZE_CLASSES[size],
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-light tracking-[0.12em] uppercase text-[10px]">Loading…</span>
          </div>
        ) : (
          <>
            {leftIcon && <span className="flex shrink-0 items-center justify-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex shrink-0 items-center justify-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
