"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        // Verify they are actually an admin/staff role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from("users")
            .select("role:roles(name)")
            .eq("auth_user_id", user.id)
            .maybeSingle();

          const roleName = (userData as any)?.role?.name || "";
          const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(roleName);

          if (isAdmin) {
            router.push("/admin");
            router.refresh();
          } else {
            // Sign out because they are a customer trying to access admin login
            await supabase.auth.signOut();
            setAuthError("Access denied. This login is reserved for operations staff only.");
          }
        }
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121210] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Gold Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md mx-4 p-8 rounded-[30px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E8DCC8] flex items-center justify-center shadow-[0_0_25px_rgba(201,168,76,0.2)] mb-4">
            <ShieldCheck className="w-7 h-7 text-[#121210]" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-urbanist)" }}>
            3M Command Center
          </h1>
          <p className="text-overline font-semibold text-[#E8DCC8]/40">
            Operations & Management Login
          </p>
        </div>

        {authError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Staff Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                {...register("email")}
                type="email"
                placeholder="staff@3mrentals.com"
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-white/[0.02] border border-[#E8DCC8]/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
            </div>
            {errors.password && <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 flex items-center justify-center gap-2 rounded-xl text-xs tracking-widest uppercase font-bold text-white bg-[#C9A84C]/20 border border-[#C9A84C]/30 hover:bg-[#C9A84C]/30 hover:border-[#C9A84C]/40"
          >
            Authenticate <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-8 text-center text-[10px] text-[#E8DCC8]/20 tracking-wider">
          System access is audited. Unauthorized attempts will be logged.
        </div>

      </div>
    </div>
  );
}
