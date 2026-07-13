"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, Lock, Save, ShieldAlert, Sparkles } from "lucide-react";

export default function CustomerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password reset fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (data) {
          setProfileId(data.id);
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
        }
      } catch (err) {
        console.error("Load Profile Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        })
        .eq("id", profileId);

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({ text: "Profile details updated successfully.", type: "success" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "An unexpected error occurred.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword.length < 12) {
      setPwdMessage({ text: "Password must be at least 12 characters long.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setPwdSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPwdMessage({ text: error.message, type: "error" });
      } else {
        setPwdMessage({ text: "Password reset complete. Use your new credentials from next login.", type: "success" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setPwdMessage({ text: err.message || "Failed to update password.", type: "error" });
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase">Retrieving Credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          Personal Credentials
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Manage your contact credentials and verify system access parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column Profile info summary */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] mx-auto mb-4">
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                {firstName[0]}{lastName[0]}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-urbanist)" }}>{firstName} {lastName}</h3>
            <p className="text-blue-400 text-xs mt-0.5">Prestige Club Member</p>
            <div className="h-px bg-white/5 my-4" />
            <div className="text-left space-y-2 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Security Clearance:</span>
                <span className="text-blue-400 font-bold">Level 1 (KYC Approved)</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-5 bg-blue-950/10 border border-blue-500/10 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white text-xs font-extrabold">Data Sovereignty</h4>
              <p className="text-white/40 text-[10px] leading-relaxed mt-0.5">
                All profile parameters and security vectors are protected with Supabase Row Level Security (RLS) policies.
              </p>
            </div>
          </div>
        </div>

        {/* Edit fields form (Middle/Right columns) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main profile form */}
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h3 className="text-white font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-urbanist)" }}>Update Details</h3>
            
            {message && (
              <div className={`px-4 py-3 rounded-xl text-xs mb-6 border ${
                message.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-white/[0.01] border border-white/5 text-white/40 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="fleet"
                disabled={saving}
                className="rounded-xl px-5 py-3 text-xs tracking-wider uppercase font-bold"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving changes..." : "Save details"}
              </Button>
            </form>
          </div>

          {/* Reset password form */}
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h3 className="text-white font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-urbanist)" }}>Security Password Reset</h3>
            
            {pwdMessage && (
              <div className={`px-4 py-3 rounded-xl text-xs mb-6 border ${
                pwdMessage.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {pwdMessage.text}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 12 characters"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify new password"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="fleet"
                disabled={pwdSaving}
                className="rounded-xl px-5 py-3 text-xs tracking-wider uppercase font-bold"
              >
                Reset Password
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
