"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "./Button";

// ─── Modal Component ──────────────────────────────────────────────────────────

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={clsx(
              "bg-[#0c0d10] border border-white/10 p-6 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl space-y-4",
              className
            )}
          >
            {title && (
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                  {title}
                </h4>
                <button
                  onClick={onClose}
                  className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="text-xs text-white/80">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── Dialog Component ─────────────────────────────────────────────────────────

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0c0d10] border border-white/10 p-6 rounded-3xl w-full max-w-sm relative z-10 space-y-5 text-center shadow-2xl"
          >
            <div className={clsx(
              "w-12 h-12 rounded-full flex items-center justify-center mx-auto border",
              isDestructive 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            )}>
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                {title}
              </h4>
              <p className="text-white/50 text-xs leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl text-[10px] uppercase font-bold py-2 h-auto"
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={onConfirm}
                className={clsx(
                  "flex-1 rounded-xl text-[10px] uppercase font-bold py-2 h-auto border-none",
                  isDestructive
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-blue-600 hover:bg-blue-500"
                )}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
