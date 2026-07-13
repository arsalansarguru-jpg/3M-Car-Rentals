"use client";

import React, { useState, useEffect } from "react";
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

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userDisplayName, setUserDisplayName] = useState("Premium Member");
  const [userInitials, setUserInitials] = useState("PM");
  const [membershipTier, setMembershipTier] = useState("Club Member");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select(`first_name, last_name, role:roles(name)`)
          .eq("auth_user_id", user.id)
          .single();
        if (profile) {
          const fname = profile.first_name || "";
          const lname = profile.last_name || "";
          const fullName = [fname, lname].filter(Boolean).join(" ") || user.email?.split("@")[0] || "Premium Member";
          const initials = [fname[0], lname[0]].filter(Boolean).join("").toUpperCase() || "PM";
          
          setUserDisplayName(fullName);
          setUserInitials(initials);
          
          // Compute loyalty tier based on some criteria (conceptually)
          setMembershipTier("Club Royal");
        }
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
              <span className="text-[#0f1115] text-base font-extrabold" style={{ fontFamily: "var(--font-urbanist)" }}>3M</span>
            </div>
            <div>
              <h2 className="text-white font-extrabold tracking-tight text-lg leading-none" style={{ fontFamily: "var(--font-urbanist)" }}>3M Rentals</h2>
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
                    ? "bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] font-semibold"
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
                }`}>
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm tracking-wide" style={{ fontFamily: "var(--font-manrope)" }}>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-2xl py-3.5 text-red-400/80 hover:text-red-400 transition-colors text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent pb-16 lg:pb-0">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-black/[0.1] backdrop-blur-2xl px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block text-xs uppercase tracking-widest text-white/30 font-bold" style={{ fontFamily: "var(--font-manrope)" }}>
              {pathname === "/dashboard" ? "Customer Experience Hub" : "Premium Member Area"}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification trigger */}
            <button className="relative text-white/40 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-[#07080b]" />
            </button>

            <div className="h-6 w-px bg-white/10" />

            {/* Profile Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-bold leading-none mb-1" style={{ fontFamily: "var(--font-urbanist)" }}>{userDisplayName}</p>
                <p className="text-blue-400 text-[10px] uppercase tracking-wider font-extrabold">{membershipTier}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-indigo-600 flex items-center justify-center text-white border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <span className="text-xs font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>{userInitials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* ─── MOBILE BOTTOM NAVIGATION BAR ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090a0f]/90 border-t border-white/5 backdrop-blur-xl z-40 flex items-center justify-around px-2">
        {menuItems.slice(0, 6).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center flex-1 py-1">
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "text-blue-400" : "text-white/40"}`}>
                <item.icon className="w-5.5 h-5.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── MOBILE DRAWER MENU ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#090a0f] border-r border-white/10 z-50 flex flex-col lg:hidden"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-extrabold text-sm" style={{ fontFamily: "var(--font-urbanist)" }}>3M</span>
                  </div>
                  <h2 className="text-white font-extrabold" style={{ fontFamily: "var(--font-urbanist)" }}>3M Rentals</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isActive 
                          ? "bg-blue-600/10 border-blue-500/20 text-blue-400 font-semibold" 
                          : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
                      }`}
                    >
                      <item.icon className="w-5 h-5 shrink-0 mr-3" />
                      <span className="text-sm" style={{ fontFamily: "var(--font-manrope)" }}>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-white/5 shrink-0">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-xl py-3 px-4 text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-semibold">Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
