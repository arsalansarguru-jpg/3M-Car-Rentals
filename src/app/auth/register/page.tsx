"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setAuthError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: `${data.firstName} ${data.lastName}`, phone: data.phone } },
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setSuccessMsg("Account created! Check your email to verify your address before signing in.");
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#060b18]">
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundImage: "url('/auth-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b18]/90 via-[#060b18]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b18]/80 via-transparent to-transparent" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e8c96d] shadow-lg">
            <span className="text-[#0a0f1e] font-black text-base">3M</span>
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">Car Rentals</p>
            <p className="text-[#c9a84c] text-[11px] tracking-[0.2em] uppercase font-medium">Goa&apos;s Premium Fleet</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-2xl font-black mb-3 max-w-sm leading-tight">
            Your premium Goa driving experience starts here.
          </h2>
          <p className="text-white/50 text-sm mb-6 max-w-xs">
            Create a free account and unlock instant bookings, fleet access, and priority customer support.
          </p>
          <div className="space-y-3">
            {[
              "Instant booking confirmation",
              "Exclusive member-only rates",
              "Airport delivery available",
              "24/7 concierge support",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/70 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#e8c96d] flex items-center justify-center">
            <span className="text-[#0a0f1e] font-black text-sm">3M</span>
          </div>
          <span className="text-white font-bold text-lg">Car Rentals</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-4">
              Free Account
            </span>
            <h1 className="text-3xl font-black text-white mt-3">Create your account</h1>
            <p className="text-white/50 mt-2 text-sm">Join 500+ premium travellers in Goa. No credit card required.</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {authError}
            </div>
          )}

          {successMsg ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Check your inbox!</h3>
              <p className="text-emerald-400/80 text-sm">{successMsg}</p>
              <Link href="/auth/login" className="mt-5 inline-flex px-6 py-2.5 rounded-lg bg-[#c9a84c] text-[#0a0f1e] font-bold text-sm hover:bg-[#e8c96d] transition-colors">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* First + Last Name row */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="firstName"
                  type="text"
                  label="First Name"
                  autoComplete="given-name"
                  placeholder="John"
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />
                <Input
                  id="lastName"
                  type="text"
                  label="Last Name"
                  autoComplete="family-name"
                  placeholder="Doe"
                  error={errors.lastName?.message}
                  {...register("lastName")}
                />
              </div>

              {/* Email */}
              <Input
                id="reg-email"
                type="email"
                label="Email address"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              {/* Phone */}
              <Input
                id="phone"
                type="tel"
                label="Phone Number"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                error={errors.phone?.message}
                {...register("phone")}
              />

              {/* Password */}
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                label="Password"
                autoComplete="new-password"
                placeholder="Min. 12 chars, uppercase, number, symbol"
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

              <Button
                id="register-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
              >
                Create Free Account
              </Button>

              <p className="text-center text-xs text-white/30 leading-relaxed">
                By registering, you agree to our{" "}
                <Link href="/terms" className="text-white/50 underline hover:text-white">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-white/50 underline hover:text-white">Privacy Policy</Link>.
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#c9a84c] font-semibold hover:text-white transition-colors">Sign in</Link>
          </p>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center">
            <Link href="/" className="text-white/25 text-xs hover:text-white/50 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
