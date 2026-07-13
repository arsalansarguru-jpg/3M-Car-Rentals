"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Phone, Sparkles, ArrowRight } from "lucide-react";

export default function CustomerSignupPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        },
      });

      if (signUpError) {
        setAuthError(signUpError.message);
      } else {
        setAuthSuccess("Registration initiated successfully. Please check your email inbox to verify your account.");
      }
    } catch {
      setAuthError("An unexpected error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center relative overflow-hidden font-sans py-12">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Box */}
      <div className="w-full max-w-lg mx-4 p-8 rounded-[30px] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.3)] mb-4">
            <span className="text-[#0f1115] text-lg font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>3M</span>
          </div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "var(--font-urbanist)" }}>
            Create Your Account
          </h1>
          <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: "var(--font-manrope)" }}>
            Join the premier luxury car rental service in Goa.
          </p>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
            {authError}
          </div>
        )}

        {authSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-4 rounded-xl mb-6">
            {authSuccess}
          </div>
        )}

        {!authSuccess && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    {...register("firstName")}
                    type="text"
                    placeholder="John"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                {errors.firstName && <p className="text-red-400 text-[10px] mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    {...register("lastName")}
                    type="text"
                    placeholder="Doe"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                {errors.lastName && <p className="text-red-400 text-[10px] mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="john.doe@example.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+919876543210"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              {errors.phone && <p className="text-red-400 text-[10px] mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="text-xs text-white/50 font-semibold tracking-wider uppercase mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Minimum 12 characters"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              {errors.password && <p className="text-red-400 text-[10px] mt-1 leading-normal">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              variant="fleet"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 rounded-xl text-sm tracking-wide uppercase font-bold"
            >
              Sign Up <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs border-t border-white/5 pt-6">
          <p className="text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline font-semibold">Sign In Now</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
