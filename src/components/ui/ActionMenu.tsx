"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "./Button";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  trigger,
  align = "right",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={clsx("relative inline-block text-left", className)} ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            className="p-2 h-9 w-9 rounded-lg flex items-center justify-center border-white/10 text-white/50 hover:text-white"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          className={clsx(
            "absolute mt-2 w-44 rounded-xl border border-white/10 bg-[#0c0d10]/95 backdrop-blur-xl shadow-2xl z-50 py-1.5 focus:outline-none font-sans text-xs",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={clsx(
                  "w-full text-left px-4 py-2 flex items-center gap-2.5 transition-colors focus:outline-none disabled:opacity-30 disabled:pointer-events-none",
                  item.variant === "destructive"
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                )}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0 opacity-70" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
