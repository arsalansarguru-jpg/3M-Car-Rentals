"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface LoginButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function LoginButton({ className, onClick }: LoginButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onClick) {
      onClick();
    }
    router.push("/auth/login");
  };

  return (
    <button
      onClick={handlePress}
      id="header-login-btn"
      className={clsx(
        "inline-flex items-center justify-center font-medium tracking-widest uppercase text-[11px] md:text-xs rounded-[20px] cursor-pointer outline-none select-none transition-all duration-300 ease-in-out border border-transparent",
        "bg-transparent text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
        "focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold/50",
        "min-h-[44px] px-5",
        className
      )}
    >
      Login
    </button>
  );
}
