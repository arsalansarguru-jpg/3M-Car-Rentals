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
            className="text-[10px] font-semibold text-[#E8DCC8]/60 uppercase tracking-[0.14em] select-none cursor-pointer mb-0.5"
            style={{ fontFamily: "var(--font-body)" }}
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
              "w-full h-11 px-4 text-sm font-normal text-white bg-white/[0.08] border border-white/12 outline-none transition-all placeholder-white/20 focus:bg-white/[0.12]",
              rightElement ? "pr-11" : "",
              "rounded-[20px]", // Rounded corners: 20px

              // Glass input focus states
              {
                "border-red-500/35 bg-red-500/5 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10": !!error,
                "border-emerald-500/35 bg-emerald-500/5 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10": success && !error,
                "border-white/12 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10": !error && !success,
              },
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>

        {/* Validation Helper states */}
        {error && (
          <p id={errorId} className="text-xs font-light text-red-400 mt-1 pl-2">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-xs font-light text-white/30 mt-1 pl-2">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
