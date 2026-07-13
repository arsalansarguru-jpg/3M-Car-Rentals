"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { FileText, ShieldCheck, AlertTriangle, Calendar, Globe, Award, Sparkles } from "lucide-react";

interface LicenseData {
  id: string;
  license_number: string;
  issuing_country: string;
  expiry_date: string;
  verified_status: "pending" | "approved" | "rejected";
}

export default function DocumentsKYCPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [license, setLicense] = useState<LicenseData | null>(null);

  // Form Fields
  const [licenseNumber, setLicenseNumber] = useState("");
  const [issuingCountry, setIssuingCountry] = useState("India");
  const [expiryDate, setExpiryDate] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLicense = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userProfile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (!userProfile) return;
      setUserId(userProfile.id);

      const { data } = await supabase
        .from("driver_licenses")
        .select("*")
        .eq("user_id", userProfile.id)
        .maybeSingle();

      if (data) {
        setLicense(data as any);
      }
    } catch (err) {
      console.error("Fetch License Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  const handleSubmitLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    if (!licenseNumber || !expiryDate) {
      setErrorMsg("Please fill out all required fields.");
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("driver_licenses")
        .insert({
          user_id: userId,
          license_number: licenseNumber,
          issuing_country: issuingCountry,
          expiry_date: expiryDate,
          verified_status: "pending",
        });

      if (error) {
        setErrorMsg(error.message);
      } else {
        fetchLicense();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase">Retrieving KYC Slips...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
          KYC & Credentials Verification
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Submit your credentials to gain verification approval for driving self-drive vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Verification Status Banner */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <h3 className="text-white font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-urbanist)" }}>KYC Clearance</h3>
            
            {license ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    license.verified_status === "approved"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : license.verified_status === "rejected"
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold block">Status</span>
                    <p className="text-white text-sm font-extrabold uppercase tracking-wide">
                      {license.verified_status}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-white/5 my-2" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">License ID:</span>
                    <span className="text-white/80 font-mono">{license.license_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Country:</span>
                    <span className="text-white/80">{license.issuing_country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Expiry Date:</span>
                    <span className="text-white/80">{new Date(license.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h4 className="text-white text-sm font-bold">Action Required</h4>
                <p className="text-white/40 text-xs mt-1 leading-relaxed">
                  No active driver license records found. Submit your parameters to unlock bookings.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl p-5 bg-blue-950/10 border border-blue-500/10 flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white text-xs font-bold">SLA Targets</h4>
              <p className="text-white/40 text-[10px] leading-relaxed mt-0.5">
                Our verification concierge resolves submissions within 30 minutes of entry logs.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form Column */}
        <div className="md:col-span-2">
          {!license ? (
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/5 backdrop-blur-md">
              <h3 className="text-white font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-urbanist)" }}>Submit Driver License</h3>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-6">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmitLicense} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">License Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="DL-XXXXXXXXXXXXX"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Issuing Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={issuingCountry}
                      onChange={(e) => setIssuingCountry(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 font-bold tracking-widest uppercase mb-1.5 block">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="fleet"
                  disabled={saving}
                  className="rounded-xl px-6 py-3.5 text-xs font-bold tracking-widest uppercase mt-2 w-full"
                >
                  {saving ? "Submitting documentation..." : "Authenticate Document"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col justify-center items-center text-center gap-4 min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-urbanist)" }}>KYC Completed</h3>
                <p className="text-white/40 text-xs max-w-sm mt-1 mx-auto leading-relaxed">
                  Your identity documents have been confirmed. Your profile holds verified status and you can secure booking logs instantly.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
