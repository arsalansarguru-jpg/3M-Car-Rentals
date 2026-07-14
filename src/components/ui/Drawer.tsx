"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "./Button";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
  size = "md"
}) => {
  // Listen for escape key close trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-3xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Sliding drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className={clsx(
              "w-full bg-[#0c0d10] border-l border-white/10 h-full relative z-10 flex flex-col justify-between p-6 overflow-y-auto custom-scrollbar",
              sizeClasses[size],
              className
            )}
          >
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header section */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 shrink-0">
                <div>
                  <h3 className="text-white text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
                    {title}
                  </h3>
                  {subtitle && (
                    <span className="text-[10px] font-mono text-white/40 block mt-0.5 uppercase tracking-wider">
                      {subtitle}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable contents panel */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6 min-h-0">
                {children}
              </div>
            </div>

            {/* Optional footer triggers */}
            {footer ? (
              <div className="border-t border-white/5 pt-4 mt-6 shrink-0 flex justify-end gap-3 bg-[#0c0d10]">
                {footer}
              </div>
            ) : (
              <div className="border-t border-white/5 pt-4 mt-6 shrink-0 flex justify-end bg-[#0c0d10]">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="rounded-xl text-[10px] uppercase font-bold px-6 py-2 h-auto"
                >
                  Close Drawer
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
