import React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, success, helperText, rightElement, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-white/70 select-none cursor-pointer"
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type={type}
            aria-invalid={!!error}
            aria-describedby={clsx({
              [helperId]: !!helperText,
              [errorId]: !!error,
            })}
            className={clsx(
              "w-full h-11 px-4 text-sm font-normal text-white bg-white/5 border border-white/10 outline-none transition-all placeholder-white/25 focus:bg-white/8",
              rightElement ? "pr-11" : "",
              
              // Custom UXS border radius (10px)
              "rounded-input",

              // Validation border states mapping
              {
                "border-red-500/30 bg-red-500/5 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20": !!error,
                "border-emerald-500/30 bg-emerald-500/5 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20": success && !error,
                "border-white/10 focus:border-[#c9a84c]/60 focus:ring-1 focus:ring-[#c9a84c]/20": !error && !success,
              },
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>

        {/* Validation Helper copy states */}
        {error && (
          <p id={errorId} className="text-xs font-medium text-red-400 mt-0.5 animate-fadeIn">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-xs font-normal text-white/40 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
