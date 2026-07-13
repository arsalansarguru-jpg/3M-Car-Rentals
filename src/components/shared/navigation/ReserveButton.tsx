"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface ReserveButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function ReserveButton({ className, onClick }: ReserveButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onClick) {
      onClick();
    }
    router.push("/fleet");
  };

  return (
    <button
      onClick={handlePress}
      id="header-book-now-btn"
      className={clsx(
        "btn-glass btn-glass-blue animate-luxury-glow",
        "hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300",
        "focus-visible:ring-2 focus-visible:ring-blue-400/50 outline-none",
        "min-h-[44px] px-6 text-[11px] md:text-xs font-semibold tracking-widest uppercase",
        className
      )}
    >
      Reserve
    </button>
  );
}
