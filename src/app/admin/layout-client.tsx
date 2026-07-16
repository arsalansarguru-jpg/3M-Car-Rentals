"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Car, 
  Activity, 
  ShieldCheck, 
  Search, 
  LayoutDashboard, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Bell,
  Command,
  Menu,
  X,
  Calendar as CalendarIcon,
  Image,
  FileText,
  BarChart3
} from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface AdminDashboardClientLayoutProps {
  children: React.ReactNode;
  user: any;
  profile: any;
}

export default function AdminDashboardClientLayout({ children, user, profile }: AdminDashboardClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronously compute profile parameters from server props
  const fname = profile?.first_name || "";
  const lname = profile?.last_name || "";
  const userDisplayName = [fname, lname].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "Admin";
  const userInitials = [fname[0], lname[0]].filter(Boolean).join("").toUpperCase() || "A";
  
  const rawRole = profile?.role?.name || "Administrator";
  const userRole = rawRole.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[Admin Client Layout] Sign out error:", err);
    }
  };

  // Command Palette Keyboard Shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const adminNav = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard, color: "blue", activeText: "text-blue-400" },
    { name: "Smart Calendar", href: "/admin/bookings", icon: CalendarIcon, color: "blue", activeText: "text-blue-400" },
    { name: "Customer 360", href: "/admin/customers", icon: Users, color: "pink", activeText: "text-pink-400" },
    { name: "KYC Approvals", href: "/admin/kyc", icon: ShieldCheck, color: "indigo", activeText: "text-indigo-400" },
    { name: "Dynamic Pricing", href: "/admin/pricing", icon: TrendingUp, color: "cyan", activeText: "text-cyan-400" },
    { name: "Financial Operations", href: "/admin/finance", icon: Wallet, color: "purple", activeText: "text-purple-400" },
    { name: "Business Intel", href: "/admin/reports", icon: BarChart3, color: "indigo", activeText: "text-indigo-400" },
    { name: "Operations Command", href: "/admin/operations", icon: Activity, color: "indigo", activeText: "text-indigo-400" },
    { name: "Fleet Management", href: "/admin/fleet", icon: Car, color: "cyan", activeText: "text-cyan-400" },
    { name: "Fleet Health", href: "/admin/fleet-health", icon: Car, color: "cyan", activeText: "text-cyan-400" },
    { name: "Staff Ops", href: "/admin/staff-performance", icon: Activity, color: "indigo", activeText: "text-indigo-400" },
    { name: "Licensing", href: "/admin#licensing", icon: ShieldCheck, color: "slate", activeText: "text-slate-400" },
    
    // Fleet Management Sub-pages
    { name: "Fleet Overview", href: "/admin/fleet-management/overview", icon: LayoutDashboard, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
    { name: "Vehicle Inventory", href: "/admin/fleet-management/inventory", icon: Car, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
    { name: "Vehicle Gallery", href: "/admin/fleet-management/gallery", icon: Image, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
    { name: "Availability Calendar", href: "/admin/fleet-management/availability", icon: CalendarIcon, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
    { name: "Maintenance", href: "/admin/fleet-management/maintenance", icon: Activity, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
    { name: "Documents", href: "/admin/fleet-management/documents", icon: FileText, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
    { name: "Pricing", href: "/admin/fleet-management/pricing", icon: TrendingUp, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
    { name: "Vehicle Analytics", href: "/admin/fleet-management/analytics", icon: Activity, group: "Fleet Management", color: "cyan", activeText: "text-cyan-400" },
  ];

  const getGlowStyles = (color: string) => {
    switch (color) {
      case "blue":   return "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
      case "pink":   return "bg-pink-500/10 border-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)]";
      case "cyan":   return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
      case "purple": return "bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]";
      case "indigo": return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]";
      case "slate":  return "bg-slate-500/10 border-slate-500/20 text-slate-400 shadow-[0_0_15px_rgba(100,116,139,0.15)]";
      default:       return "bg-white/10 border-white/20 text-white shadow-sm";
    }
  };

  const getGlowLine = (color: string) => {
    switch (color) {
      case "blue":   return "bg-blue-500";
      case "pink":   return "bg-pink-500";
      case "cyan":   return "bg-cyan-500";
      case "purple": return "bg-purple-500";
      case "indigo": return "bg-indigo-500";
      case "slate":  return "bg-slate-500";
      default:       return "bg-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#121210] flex text-gray-200 overflow-hidden font-sans">
      
      {/* ─── COMMAND PALETTE ─── */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsCommandOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-white/[0.08] backdrop-blur-[24px] border border-white/12 rounded-[20px] shadow-2xl overflow-hidden"
            >
              <CommandPrimitive className="flex flex-col w-full" loop>
                <div className="flex items-center border-b border-white/10 px-4">
                  <Search className="w-5 h-5 text-white/40" />
                  <CommandPrimitive.Input 
                    autoFocus
                    placeholder="Search customers, bookings, or jump to..." 
                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-white/20 px-4 py-5 text-lg"
                  />
                  <div className="text-[10px] bg-white/10 text-white/50 px-2.5 py-1 rounded-[20px] font-mono">ESC</div>
                </div>
                <CommandPrimitive.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                  <CommandPrimitive.Empty className="p-6 text-center text-white/40 text-sm">No results found.</CommandPrimitive.Empty>
                  
                  <CommandPrimitive.Group heading={<div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#E8DCC8]/40">Navigation</div>}>
                    {adminNav.map((item) => (
                      <CommandPrimitive.Item 
                        key={item.href}
                        onSelect={() => {
                          router.push(item.href);
                          setIsCommandOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-3 rounded-[20px] text-sm font-medium text-white/70 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer"
                      >
                        <item.icon className="w-4 h-4 text-[#C9A84C]" />
                        {item.name}
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                </CommandPrimitive.List>
              </CommandPrimitive>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─── */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="hidden lg:flex flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-xl shrink-0 z-20 relative"
      >
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 bg-white/[0.08] backdrop-blur-md border border-white/12 rounded-full p-1.5 text-white/50 hover:text-white z-50 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0 overflow-hidden">
          <Link href="/" className="flex items-center gap-3 min-w-max">
            <span className="text-[#C9A84C]" style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 600 }}>3M</span>
            <motion.div animate={{ opacity: isSidebarCollapsed ? 0 : 1, x: isSidebarCollapsed ? -20 : 0 }} transition={{ duration: 0.2 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "#ffffff", lineHeight: 1, fontSize: "1.0625rem" }}>3M Rentals</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.625rem", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 500, marginTop: "0.2rem" }}>Command Center</p>
            </motion.div>
          </Link>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-1.5 px-3 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {adminNav.filter((item: any) => !item.group).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="group relative flex items-center rounded-[20px] transition-all duration-200">
                {isActive && (
                  <motion.div layoutId="activeNav" className={`absolute left-0 top-1 bottom-1 w-1 rounded-full ${getGlowLine(item.color)}`} />
                )}
                <div className={`flex items-center w-full px-4 py-3 rounded-[20px] transition-all border border-transparent duration-200 ${
                  isActive ? `border-white/10 ${getGlowStyles(item.color)}` : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                }`}>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "" : "text-white/35 group-hover:text-white/75"}`} />
                  <motion.span 
                    animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : "auto", marginLeft: isSidebarCollapsed ? 0 : 12 }}
                    style={{ fontWeight: isActive ? 600 : 500 }}
                    className="text-sidebar-label whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                </div>
              </Link>
            );
          })}

          <div className="mt-6 pt-4 border-t border-white/5 space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#E8DCC8]/40 mb-2">
                Fleet Management
              </div>
            )}
            {adminNav.filter((item: any) => item.group === "Fleet Management").map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="group relative flex items-center rounded-[20px] transition-all duration-200">
                  {isActive && (
                    <motion.div layoutId="activeNavFleet" className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full ${getGlowLine(item.color)}`} />
                  )}
                  <div className={`flex items-center w-full px-4 py-2.5 rounded-[20px] transition-all border border-transparent duration-200 ${
                    isActive ? `border-white/10 ${getGlowStyles(item.color)}` : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                  }`}>
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "" : "text-white/35 group-hover:text-white/70"}`} />
                    <motion.span 
                      animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : "auto", marginLeft: isSidebarCollapsed ? 0 : 10 }}
                      style={{ fontWeight: isActive ? 600 : 500 }}
                      className="text-nav-label whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
          <button 
            onClick={() => setIsCommandOpen(true)}
            className={`w-full flex items-center justify-center gap-2 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 rounded-[20px] py-3 transition-colors ${isSidebarCollapsed ? "px-0" : "px-4"}`}
          >
            <Search className="w-4 h-4 text-white/50" />
            {!isSidebarCollapsed && (
              <div className="text-body-sm font-medium text-white/50 flex items-center gap-2">
                Search
                <span className="bg-black/30 border border-white/10 px-1.5 py-0.5 rounded-[20px] font-mono text-[9px] flex items-center gap-0.5"><Command className="w-3 h-3"/> K</span>
              </div>
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-[20px] py-3 text-red-400/70 hover:text-red-400 transition-colors ${isSidebarCollapsed ? "px-0" : "px-4"}`}
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && (
              <span className="text-body-sm font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#121210]/95 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col lg:hidden"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
                <Link href="/" className="flex items-center gap-3">
                  <span className="text-[#C9A84C] font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "#ffffff", lineHeight: 1, fontSize: "1.0625rem" }}>3M Rentals</h2>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.625rem", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 500, marginTop: "0.2rem" }}>Command Center</p>
                  </div>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 py-6 flex flex-col gap-1.5 px-3 overflow-y-auto">
                {adminNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} className={`flex items-center w-full px-4 py-3 rounded-[20px] transition-all border border-transparent duration-200 ${
                      isActive ? `border-white/10 ${getGlowStyles(item.color)}` : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                    }`}>
                      <item.icon className={`w-5 h-5 shrink-0 mr-3 ${isActive ? "" : "text-white/40"}`} />
                      <span className="text-sidebar-label font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setIsCommandOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[20px] py-3 px-4 transition-colors"
                >
                  <Search className="w-4 h-4 text-white/50" />
                  <div className="text-body-sm font-medium text-white/50 flex items-center gap-2">
                    Search
                    <span className="bg-black/30 border border-white/10 px-1.5 py-0.5 rounded font-mono text-[9px] flex items-center gap-0.5"><Command className="w-3 h-3"/> K</span>
                  </div>
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-[20px] py-3 px-4 text-red-400/70 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-body-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#121210]">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 bg-white/[0.04] backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0" style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.30)' }}>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
               <Menu className="w-6 h-6" />
             </button>
             <div className="lg:hidden hidden sm:block" style={{ fontFamily: "var(--font-urbanist)", fontWeight: 500, color: "#ffffff", fontSize: "1rem" }}>3M Mobility</div>
             
             <div className="hidden lg:flex items-center gap-2">
                <span className="text-body-sm text-white/40 font-normal">Dashboard</span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
                <span className="text-body-sm text-white font-semibold">
                  {pathname === "/admin" ? "Executive Overview" :
                   pathname === "/admin/bookings" ? "Smart Calendar" :
                   pathname?.includes("/admin/customers") ? "Customer 360" :
                   pathname?.includes("/admin/kyc") ? "KYC Approvals" :
                   pathname === "/admin/pricing" ? "Dynamic Pricing" :
                   pathname === "/admin/revenue" ? "Revenue Intel" :
                   pathname === "/admin/fleet-health" ? "Fleet Health" :
                   pathname === "/admin/staff-performance" ? "Staff Ops" :
                   "Operations"}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-white/40 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full border border-[#121210]"></span>
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p style={{ fontFamily: "var(--font-urbanist)", fontSize: "0.9375rem", fontWeight: 500, color: "#ffffff", lineHeight: 1, marginBottom: "0.25rem" }}>{userDisplayName}</p>
                <p className="text-overline font-medium text-[#C9A84C] text-[10px]" style={{ lineHeight: 1 }}>{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/12 flex items-center justify-center">
                <span style={{ fontFamily: "var(--font-urbanist)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>{userInitials}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar relative">
           {children}
         </div>
      </main>

    </div>
  );
}
