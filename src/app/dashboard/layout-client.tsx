"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Car, 
  User, 
  FileText, 
  CreditCard, 
  Gift, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface CustomerDashboardClientLayoutProps {
  children: React.ReactNode;
  user: any;
  profile: any;
}

export default function CustomerDashboardClientLayout({ children, user, profile }: CustomerDashboardClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Compute profile credentials synchronously from server props
  const fname = profile?.first_name || "";
  const lname = profile?.last_name || "";
  const userDisplayName = [fname, lname].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "Premium Member";
  const userInitials = [fname[0], lname[0]].filter(Boolean).join("").toUpperCase() || "PM";
  const membershipTier = profile?.loyalty_tier || "Club Royal";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[Dashboard Client Layout] Sign out error:", err);
    }
  };

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: Compass },
    { name: "My Bookings", href: "/dashboard/bookings", icon: Car },
    { name: "KYC Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Payments & Wallet", href: "/dashboard/payments", icon: CreditCard },
    { name: "Loyalty Club", href: "/dashboard/rewards", icon: Gift },
    { name: "Concierge Support", href: "/dashboard/support", icon: HelpCircle },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#07080b] flex text-gray-200 overflow-hidden font-sans relative">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-white/[0.01] backdrop-blur-2xl shrink-0 z-20 relative">
        {/* Logo */}
        <div className="h-24 flex items-center px-8 border-b border-white/5 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <span className="text-[#0f1115] text-base font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
            </div>
            <div>
              <h2 className="text-white font-extrabold tracking-tight text-lg leading-none" style={{ fontFamily: "var(--font-heading)" }}>3M Rentals</h2>
              <span className="text-blue-400 text-[9px] uppercase tracking-[0.2em] font-bold block mt-1">Luxury Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                  isActive 
                    ? "bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6] font-semibold" 
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]"
                }`}>
                  <item.icon className={`w-4 h-4 ${isActive ? "text-[#3B82F6]" : "text-gray-400"}`} />
                  <span className="text-xs uppercase tracking-wider">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center font-bold text-[#3B82F6]">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userDisplayName}</p>
              <p className="text-[10px] text-gray-500 truncate">{membershipTier}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-transparent text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
            <span className="text-xs uppercase tracking-wider">Log Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#07080b]/80 backdrop-blur-md flex items-center justify-between px-6 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[#3B82F6] font-extrabold text-lg" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
            </Link>
          </div>

          <div className="hidden lg:block text-xs text-gray-500 uppercase tracking-widest font-semibold">
            {menuItems.find(i => i.href === pathname)?.name || "Dashboard"}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs text-[#3B82F6]">
                {userInitials}
              </div>
              <span className="hidden md:block text-xs font-semibold text-gray-300">{userDisplayName}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Panel Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-0">
          {children}
        </main>
      </div>

      {/* ─── MOBILE DRAWER MENU ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-[#07080b]/95 backdrop-blur-2xl border-r border-white/5 z-40 lg:hidden flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center">
                    <span className="text-[#0f1115] text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
                  </div>
                  <span className="text-white font-extrabold text-base" style={{ fontFamily: "var(--font-heading)" }}>3M Rentals</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                        isActive 
                          ? "bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6] font-semibold" 
                          : "border-transparent text-gray-400 hover:text-white"
                      }`}>
                        <item.icon className={`w-4 h-4 ${isActive ? "text-[#3B82F6]" : "text-gray-400"}`} />
                        <span className="text-xs uppercase tracking-wider">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 p-1">
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center font-bold text-[#3B82F6]">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{userDisplayName}</p>
                    <p className="text-[10px] text-gray-500">{membershipTier}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
