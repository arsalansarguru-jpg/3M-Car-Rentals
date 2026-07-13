"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/profile`,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setSuccessMsg("Password reset email sent successfully. Please check your inbox for instructions.");
        setEmail("");
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0b0d] overflow-x-hidden">
      
      {/* ── Left Side: Luxury Hero Section (60% Desktop) ── */}
      <div
        className="hidden lg:flex lg:w-[60%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden select-none"
        style={{
          backgroundImage: "url('/auth-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Gradient Overlay for premium cinematic contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0d]/95 via-[#0a0b0d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d]/90 via-transparent to-[#0a0b0d]/40" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] shadow-lg">
            <span className="text-[#0f1115] text-base font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
          </div>
          <div>
            <p className="text-white leading-none font-semibold text-lg" style={{ fontFamily: "var(--font-heading)" }}>Car Rentals</p>
            <p className="text-[#3B82F6] text-[10px] tracking-[0.18em] uppercase font-bold mt-1" style={{ fontFamily: "var(--font-body)" }}>Goa's Premium Fleet</p>
          </div>
        </div>

        {/* Cinematic Headline & Statement */}
        <div className="relative z-10 max-w-xl">
          <h2
            className="text-white font-extrabold tracking-tight leading-none mb-4 break-words text-[34px] md:text-[46px] lg:text-[56px]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Access Security & Credentials Portal
          </h2>
          <blockquote
            className="mb-8 max-w-md text-white/80 italic text-base leading-relaxed border-l-2 border-accent-gold pl-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            "Every journey deserves a vehicle that matches your ambition."
          </blockquote>

          {/* Highlights Grid */}
          <div className="flex gap-8 lg:gap-12 mt-8">
            {[
              { count: "500+", label: "Bookings Completed" },
              { count: "30+", label: "Luxury Vehicles" },
              { count: "5★", label: "Customer Rating" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[#3B82F6] font-bold text-xl lg:text-2xl leading-none" style={{ fontFamily: "var(--font-heading)" }}>{stat.count}</span>
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-2" style={{ fontFamily: "var(--font-body)" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info on Left Side */}
        <div className="relative z-10 text-white/20 text-[10px] uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
          © 2026 3M Car Rentals. All rights reserved.
        </div>
      </div>

      {/* ── Right Side: Authentication Card (40% Desktop) ── */}
      <div className="flex-1 lg:w-[40%] flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 relative z-10">
        
        {/* Glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Brand header for mobile screen sizes */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-md">
            <span className="text-[#0f1115] text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>Car Rentals</span>
        </div>

        {/* Vertically Centered Glassmorphic Card */}
        <div className="w-full max-w-[440px] p-8 md:p-10 rounded-[28px] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:border-white/15 transition-colors duration-300">
          
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
              Security
            </span>
            <h1 className="text-white font-extrabold text-2xl mt-4 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Reset password
            </h1>
            <p className="text-white/50 text-sm mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Enter your email address and we'll send you a secure link to update your credentials.
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 leading-snug">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {successMsg ? (
            <div className="mb-5 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold">
                <span>✓</span>
                <span>Reset Email Sent</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-300/80">
                {successMsg}
              </p>
              <Link
                href="/login"
                className="btn-glass btn-glass-blue w-full mt-4 min-h-[44px] text-xs font-bold tracking-widest uppercase rounded-[20px] inline-flex items-center justify-center"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="email" className="text-xs text-white/60 font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full mt-2 min-h-[44px] text-xs font-bold tracking-widest uppercase rounded-[20px]"
              >
                Send Reset Link <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* Footer of the card */}
          <div className="mt-6 text-center text-xs">
            <Link href="/login" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors" style={{ fontFamily: "var(--font-body)" }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-4">
            {["/privacy", "/terms", "/"].map((href, i) => (
              <Link key={href} href={href} className="text-white/20 hover:text-white/50 transition-colors text-[10px]" style={{ fontFamily: "var(--font-body)" }}>
                {["Privacy", "Terms", "Back to Home"][i]}
              </Link>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
