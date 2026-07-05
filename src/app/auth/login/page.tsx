"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // New States for Google and OTP Login options
  const [loginMethod, setLoginMethod] = React.useState<"email" | "otp">("email");
  const [phone, setPhone] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpSuccess, setOtpSuccess] = React.useState<string | null>(null);

  const rawRedirect = searchParams.get("redirect") || "";
  const redirectDestination =
    rawRedirect && rawRedirect !== "/dashboard"
      ? rawRedirect
      : "/dashboard";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        if (signInError.message === "Failed to fetch" || signInError.message.includes("fetch")) {
          setAuthError(
            "Unable to connect to the server. Please ensure the Supabase environment variables are configured in your Vercel project settings."
          );
        } else {
          setAuthError(signInError.message);
        }
      } else {
        router.push(redirectDestination);
      }
    } catch {
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
          redirectTo: `${window.location.origin}${redirectDestination}`,
        },
      });
      if (oauthError) {
        setAuthError(oauthError.message);
      }
    } catch {
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
    } catch {
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
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otpCode,
        type: "sms",
      });
      if (verifyError) {
        setAuthError(verifyError.message);
      } else {
        router.push(redirectDestination);
      }
    } catch {
      setAuthError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#060b18]">
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundImage: "url('/auth-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b18]/90 via-[#060b18]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b18]/80 via-transparent to-transparent" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96d] shadow-lg">
            <span className="text-[#0a0f1e] font-black text-base">3M</span>
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">Car Rentals</p>
            <p className="text-[#c9a84c] text-[11px] tracking-[0.2em] uppercase font-medium">Goa&apos;s Premium Fleet</p>
          </div>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10">
          <blockquote className="text-white/90 text-2xl font-bold leading-snug mb-4 max-w-md">
            &ldquo;Every journey deserves a vehicle that matches your ambition.&rdquo;
          </blockquote>
          <p className="text-white/50 text-sm">Trusted by 500+ premium travellers in Goa</p>
          <div className="flex gap-6 mt-6">
            {["500+ Bookings", "30+ Vehicles", "5★ Rating"].map((s) => (
              <div key={s} className="flex flex-col">
                <span className="text-[#c9a84c] font-black text-lg">{s.split(" ")[0]}</span>
                <span className="text-white/40 text-xs">{s.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#e8c96d] flex items-center justify-center">
            <span className="text-[#0a0f1e] font-black text-sm">3M</span>
          </div>
          <span className="text-white font-bold text-lg">Car Rentals</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-4">
              Secure Portal
            </span>
            <h1 className="text-3xl font-black text-white mt-3">Welcome back</h1>
            <p className="text-white/50 mt-2 text-sm">Sign in to manage your bookings and fleet access.</p>
          </div>

          {/* ── Google Social Login Option ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white font-bold transition-all cursor-pointer text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.63 1.39 7.54l3.82 2.96c.92-2.76 3.51-4.46 6.79-4.46z"/>
              <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.43 3.58l3.78 2.93c2.2-2.03 3.68-5.02 3.68-8.75z"/>
              <path fill="#fbbc05" d="M5.21 10.5c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.39 2.96C.5 4.77 0 6.83 0 9s.5 4.23 1.39 6.04l3.82-3.54z"/>
              <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.93l-3.78-2.93c-1.1.74-2.5 1.18-4.18 1.18-3.28 0-5.87-1.7-6.79-4.46L1.39 17.38C3.37 21.37 7.35 24 12 24z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30 font-black uppercase tracking-wider">or sign in with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* ── Tab Switcher between Email and OTP ── */}
          <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/10 p-1.5 rounded-xl mb-6 text-xs">
            <button
              type="button"
              onClick={() => { setLoginMethod("email"); setAuthError(null); }}
              className={`py-2 rounded-lg font-bold tracking-wider uppercase transition-all cursor-pointer ${loginMethod === "email" ? "bg-[#c9a84c] text-[#0a0f1e]" : "text-white/40 hover:text-white/70"}`}
            >
              Other Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod("otp"); setAuthError(null); }}
              className={`py-2 rounded-lg font-bold tracking-wider uppercase transition-all cursor-pointer ${loginMethod === "otp" ? "bg-[#c9a84c] text-[#0a0f1e]" : "text-white/40 hover:text-white/70"}`}
            >
              Mobile OTP
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {authError}
            </div>
          )}

          {otpSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
              <span>✓</span>
              {otpSuccess}
            </div>
          )}

          {/* ── Render selected login method form ── */}
          {loginMethod === "email" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <Input
                id="email"
                type="email"
                label="Email address"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-white/70 select-none cursor-pointer">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-[#c9a84c] hover:text-white transition-colors">Forgot password?</Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password")}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  }
                />
              </div>

              {/* Submit */}
              <Button
                id="login-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
              >
                Sign In to Dashboard
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="phone" className="text-sm font-medium text-white/70 select-none cursor-pointer">Mobile Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#c9a84c] text-sm"
                      required
                    />
                    <p className="text-[10px] text-white/30 leading-normal font-medium mt-1">
                      Include country code (e.g. +91 for India). SMS OTP login requires configuration in Supabase dashboard.
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={otpLoading}
                    className="w-full"
                  >
                    Send Verification OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="otpCode" className="text-sm font-medium text-white/70 select-none cursor-pointer">Enter 6-digit OTP Code</label>
                    <input
                      id="otpCode"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#c9a84c] text-sm font-mono tracking-widest text-center"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={otpLoading}
                    className="w-full"
                  >
                    Confirm & Sign In
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpSuccess(null); }}
                      className="text-xs text-[#c9a84c] hover:text-white transition-colors cursor-pointer"
                    >
                      ← Change phone number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          <p className="mt-6 text-center text-sm text-white/40">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-[#c9a84c] font-semibold hover:text-white transition-colors">
              Create one free
            </Link>
          </p>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center gap-6 text-white/25 text-xs">
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white/50 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
