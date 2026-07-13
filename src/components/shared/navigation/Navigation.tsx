"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import NavActions from "./NavActions";
import { clsx } from "clsx";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const pathname = usePathname();
  const router = useRouter();

  // Scroll listener for sticky glass navbar transition
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync Supabase authentication session
  useEffect(() => {
    async function syncSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsSignedIn(true);
        const { data: userRow } = await supabase
          .from("users")
          .select("role:roles(name)")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();
        const roleName = (userRow?.role as unknown as { name: string } | null)?.name ?? "customer";
        const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);
        setDashboardHref(isAdmin ? "/admin" : "/dashboard/client");
      } else {
        setIsSignedIn(false);
      }
    }

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsSignedIn(true);
        syncSession();
      } else {
        setIsSignedIn(false);
        setDashboardHref("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#121210]/60 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/35"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
        {/* Flex layout with equal left/right widths to mathematically center the desktop menu */}
        <div className="flex items-center justify-between h-16 md:h-[72px] lg:h-20">
          
          {/* LEFT: Logo Container */}
          <div className="flex-1 flex justify-start items-center">
            <Logo />
          </div>

          {/* CENTER: Desktop Menu */}
          <div className="hidden md:flex justify-center items-center">
            <DesktopMenu />
          </div>

          {/* RIGHT: Action Buttons / Mobile Menu Trigger */}
          <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">
            <NavActions
              isSignedIn={isSignedIn}
              dashboardHref={dashboardHref}
              onLogout={handleLogout}
            />
            <MobileMenu
              isSignedIn={isSignedIn}
              dashboardHref={dashboardHref}
              onLogout={handleLogout}
            />
          </div>

        </div>
      </div>
    </header>
  );
}
