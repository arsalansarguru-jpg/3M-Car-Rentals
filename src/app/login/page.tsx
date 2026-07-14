"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "otp">("email");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const rawRedirect = searchParams.get("redirect") || "";
  const redirectDestination =
    rawRedirect && rawRedirect !== "/dashboard"
      ? rawRedirect
      : "/dashboard";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Client-side session check to prevent authenticated users from viewing login page
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Retrieve roles from database for role-based redirection
        const { data: userData } = await supabase
          .from("users")
          .select("role:roles(name)")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        const roleName = (userData as any)?.role?.name || "customer";
        const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);
        router.push(isAdmin ? "/admin" : redirectDestination);
      }
    }
    checkUser();
  }, [router, redirectDestination]);

  const handleRoleRedirect = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("role:roles(name)")
        .eq("auth_user_id", userId)
        .maybeSingle();

      const roleName = (userData as any)?.role?.name || "customer";
      const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);

      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push(redirectDestination);
      }
      router.refresh();
    } catch (err) {
      console.error("[Login Page] Failed to resolve user role:", err);
      router.push(redirectDestination);
      router.refresh();
    }
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        setAuthError(signInError.message);
      } else if (authData.user) {
        await handleRoleRedirect(authData.user.id);
      }
    } catch (err) {
      console.error("[Login Page] Unexpected signInWithPassword exception:", err);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectDestination)}`,
        },
      });
      if (oauthError) {
        setAuthError(oauthError.message);
      }
    } catch (err) {
      console.error("[Login Page] Unexpected signInWithOAuth exception:", err);
      setAuthError("Failed to initialize Google login.");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setAuthError("Please enter a valid phone number.");
      return;
    }
    setAuthError(null);
    setOtpSuccess(null);
    setOtpLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      if (otpError) {
        setAuthError(otpError.message);
      } else {
        setOtpSent(true);
        setOtpSuccess("OTP code sent successfully to your mobile number.");
      }
    } catch (err) {
      console.error("[Login Page] Unexpected signInWithOtp exception:", err);
      setAuthError("Failed to send OTP. Please verify your number format.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otpCode) {
      setAuthError("Please enter the OTP verification code.");
      return;
    }
    setAuthError(null);
    setOtpLoading(true);
    try {
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otpCode,
        type: "sms",
      });
      if (verifyError) {
        setAuthError(verifyError.message);
      } else if (authData.user) {
        await handleRoleRedirect(authData.user.id);
      }
    } catch (err) {
      console.error("[Login Page] Unexpected verifyOtp exception:", err);
      setAuthError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
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
            Goa's Most Exclusive Self-Drive Luxury Fleet
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
        
        {/* Glow behind card for the soft blue glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Brand header for mobile screen sizes */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-md">
            <span className="text-[#0f1115] text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>Car Rentals</span>
        </div>

        {/* Vertically Centered Glassmorphic Authentication Card */}
        <div className="w-full max-w-[440px] p-8 md:p-10 rounded-[28px] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:border-white/15 transition-colors duration-300">
          
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
              Secure Client Portal
            </span>
            <h1 className="text-white font-extrabold text-2xl mt-4 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Welcome back
            </h1>
            <p className="text-white/50 text-sm mt-2 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Sign in to manage bookings and customize your luxury experiences.
            </p>
          </div>

          {/* ── Google Social Login button matching guidelines ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white hover:text-white font-semibold text-sm transition-all cursor-pointer shadow-sm select-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {/* Google G logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.63 1.39 7.54l3.82 2.96c.92-2.76 3.51-4.46 6.79-4.46z"/>
              <path fill="#4285f4" d="M23 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.18c-.27 1.39-1.04 2.56-2.2 3.33l3.4 2.64C21.35 18.47 23 15.61 23 12.27z"/>
              <path fill="#fbbc05" d="M5.21 14.78c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.39 7.26C.5 9.07 0 11.08 0 13.2s.5 4.13 1.39 5.94l3.82-2.96z"/>
              <path fill="#34a853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.4-2.64c-.94.63-2.15 1-3.56 1-3.28 0-6.07-2.19-7.06-5.14L1.12 16.3C3.18 20.31 7.24 23 12 23z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest" style={{ fontFamily: "var(--font-body)" }}>or sign in with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Toggle Login Option between Email and Mobile OTP */}
          <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/10 p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => { setLoginMethod("email"); setAuthError(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer font-bold text-xs ${loginMethod === "email" ? "bg-[#3B82F6] text-[#0f1115] shadow-md" : "text-white/40 hover:text-white/70"}`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod("otp"); setAuthError(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer font-bold text-xs ${loginMethod === "otp" ? "bg-[#3B82F6] text-[#0f1115] shadow-md" : "text-white/40 hover:text-white/70"}`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              Mobile OTP
            </button>
          </div>

          {authError && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 leading-snug">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {otpSuccess && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3">
              <span>✓</span>
              <span>{otpSuccess}</span>
            </div>
          )}

          {/* Email/Password Form */}
          {loginMethod === "email" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="email" className="text-xs text-white/60 font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs text-white/60 font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>Password</label>
                  <Link href="/forgot-password" className="text-[10px] text-[#3B82F6] hover:text-white transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>}
              </div>

              <Button
                id="login-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full mt-2 min-h-[44px] text-xs font-bold tracking-widest uppercase rounded-[20px]"
              >
                Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="phone" className="text-xs text-white/60 font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 text-xs"
                        required
                      />
                    </div>
                    <p className="text-[9px] text-white/35 font-medium leading-normal mt-1">
                      Include country code (e.g. +91 for India). SMS OTP login requires Supabase config.
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={otpLoading}
                    className="w-full mt-2 min-h-[44px] text-xs font-bold tracking-widest uppercase rounded-[20px]"
                  >
                    Send OTP Verification
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="otpCode" className="text-xs text-white/60 font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>Enter 6-digit OTP Code</label>
                    <input
                      id="otpCode"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500/50 text-xs font-mono tracking-widest text-center"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={otpLoading}
                    className="w-full min-h-[44px] text-xs font-bold tracking-widest uppercase rounded-[20px]"
                  >
                    Confirm & Sign In
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpSuccess(null); }}
                      className="text-[11px] text-[#3B82F6] hover:text-white transition-colors cursor-pointer"
                    >
                      ← Change phone number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer of the card */}
          <div className="mt-8 text-center text-xs">
            <p className="text-white/40">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-white hover:underline transition-colors font-bold" style={{ fontFamily: "var(--font-body)" }}>
                Sign Up Now
              </Link>
            </p>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
