import React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", isLoading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]",
          
          // Custom UXS Radius
          "rounded-button",
          
          // Variant mappings matching UXS specifications
          {
            "bg-gradient-to-r from-[#c9a84c] to-[#e8c96d] text-[#0a0f1e] hover:shadow-lg hover:shadow-[#c9a84c]/20 hover:-translate-y-0.5": variant === "primary",
            "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white": variant === "secondary",
            "bg-transparent border border-white/15 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/30": variant === "outline",
            "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20": variant === "destructive",
            "bg-transparent text-white/50 hover:bg-white/5 hover:text-white": variant === "ghost",
          },

          // Size mappings matching UXS specifications
          {
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-sm": size === "md",
            "h-12 px-8 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
