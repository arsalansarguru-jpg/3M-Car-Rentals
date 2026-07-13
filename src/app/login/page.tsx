"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Mail, Lock, Sparkles, ArrowRight, Phone } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "otp">("email");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

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
        setAuthError(signInError.message);
      } else {
        router.push("/dashboard");
        router.refresh();
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
          redirectTo: `${window.location.origin}/dashboard`,
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
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setAuthError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Box */}
      <div className="w-full max-w-md mx-4 p-8 rounded-[30px] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.3)] mb-4">
            <span className="text-[#0f1115] text-lg font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>3M</span>
          </div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "var(--font-urbanist)" }}>
            Welcome to 3M Experience
          </h1>
          <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: "var(--font-manrope)" }}>
            Access Goa&apos;s most exclusive self-drive luxury fleet.
          </p>
        </div>

        {/* Toggle Login Option */}
        <div className="flex bg-white/[0.04] p-1 rounded-xl mb-6 border border-white/5">
          <button
            onClick={() => { setLoginMethod("email"); setAuthError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${loginMethod === "email" ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white"}`}
          >
            Password Login
          </button>
          <button
            onClick={() => { setLoginMethod("otp"); setAuthError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${loginMethod === "otp" ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white"}`}
          >
            OTP Login
          </button>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
            {authError}
          </div>
        )}

        {/* Password Login Form */}
        {loginMethod === "email" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-white/50 font-semibold tracking-wider uppercase block">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              {errors.password && <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              variant="fleet"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 rounded-xl text-sm tracking-wide uppercase font-bold"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* OTP Login Form */}
        {loginMethod === "otp" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="fleet"
                  disabled={otpLoading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm tracking-wide uppercase font-bold"
                >
                  Send OTP Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {otpSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl">
                    {otpSuccess}
                  </div>
                )}
                <div>
                  <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">Verification Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 px-4 text-white text-center tracking-[0.5em] text-lg font-bold placeholder:text-white/20 placeholder:tracking-normal focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  variant="fleet"
                  disabled={otpLoading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm tracking-wide uppercase font-bold"
                >
                  Verify & Log In
                </Button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-white/40 hover:text-white block w-full text-center hover:underline mt-2"
                >
                  Change phone number
                </button>
              </form>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="relative my-6 text-center">
          <hr className="border-white/10" />
          <span className="bg-[#090a0f] text-[10px] text-white/30 uppercase tracking-widest px-3 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">Or continue with</span>
        </div>

        {/* Google OAuth Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white font-semibold text-sm transition-all"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.63 1.39 7.54l3.82 2.96c.92-2.76 3.51-4.46 6.79-4.46z"/>
            <path fill="#4285f4" d="M23 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.18c-.27 1.39-1.04 2.56-2.2 3.33l3.4 2.64C21.35 18.47 23 15.61 23 12.27z"/>
            <path fill="#fbbc05" d="M5.21 14.78c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.39 7.26C.5 9.07 0 11.08 0 13.2s.5 4.13 1.39 5.94l3.82-2.96z"/>
            <path fill="#34a853" d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.4-2.64c-.94.63-2.15 1-3.56 1-3.28 0-6.07-2.19-7.06-5.14L1.12 16.3C3.18 20.31 7.24 23 12 23z"/>
          </svg>
          Google Cloud Session
        </button>

        {/* Footer */}
        <div className="mt-8 text-center text-xs">
          <p className="text-white/40">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:underline font-semibold">Sign Up Now</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
