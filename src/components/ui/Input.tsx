import React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, success, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-700 select-none cursor-pointer"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
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
              "w-full h-11 px-4 text-base font-normal text-gray-900 bg-white border outline-none transition-all placeholder-gray-400 focus:ring-1 focus:ring-accent-blue focus:border-accent-blue",
              
              // Custom UXS border radius (10px)
              "rounded-input",

              // Validation border states mapping
              {
                "border-error focus:ring-error focus:border-error": !!error,
                "border-success focus:ring-success focus:border-success": success && !error,
                "border-gray-300": !error && !success,
              },
              className
            )}
            {...props}
          />
        </div>

        {/* Validation Helper copy states */}
        {error && (
          <p id={errorId} className="text-xs font-medium text-error mt-0.5 animate-fadeIn">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-xs font-normal text-gray-400 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
