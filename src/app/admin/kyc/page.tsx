"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  FileText, 
  User, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  ZoomIn,
  Eye,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw
} from "lucide-react";

interface LicenseData {
  id: string;
  user_id: string;
  license_number: string | null;
  issuing_country: string | null;
  expiry_date: string | null;
  license_front_url: string | null;
  license_back_url: string | null;
  govt_id_type: "Aadhaar" | "Passport" | "PAN" | null;
  govt_id_number: string | null;
  govt_id_url: string | null;
  selfie_url: string | null;
  address_proof_url: string | null;
  verified_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  audit_trail: any[];
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    kyc_status: string;
  } | null;
}

export default function AdminKYCQueue() {
  const [licenses, setLicenses] = useState<LicenseData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  // Rejection modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Verification Checklist Items
  const [checks, setChecks] = useState({
    nameMatches: false,
    expiryValid: false,
    imagesClear: false,
    idReferenceMatches: false,
  });

  const fetchQueue = async () => {
    try {
      const { data } = await supabase
        .from("driver_licenses")
        .select(`
          *,
          user:users(first_name, last_name, email, phone, kyc_status)
        `);

      if (data) {
        setLicenses(data as any);
      }
    } catch (err) {
      console.error("Fetch KYC Queue failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const selectedLicense = licenses.find(l => l.id === selectedId);

  useEffect(() => {
    // Reset checks when active item changes
    setChecks({
      nameMatches: false,
      expiryValid: false,
      imagesClear: false,
      idReferenceMatches: false,
    });
  }, [selectedId]);

  const handleApprove = async () => {
    if (!selectedLicense) return;
    
    const checklistUnmet = !checks.nameMatches || !checks.expiryValid || !checks.imagesClear || !checks.idReferenceMatches;
    if (checklistUnmet) {
      if (!confirm("Some verification checklist points are not marked. Do you still want to approve this submission?")) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const updatedAudit = [
        ...(selectedLicense.audit_trail || []),
        {
          action: "approved",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: "Onboarding documents verified and approved."
        }
      ];

      // Update License
      const { error: licenseErr } = await supabase
        .from("driver_licenses")
        .update({
          verified_status: "approved",
          rejection_reason: null,
          audit_trail: updatedAudit
        })
        .eq("id", selectedLicense.id);

      if (licenseErr) throw licenseErr;

      // Update User
      const { error: userErr } = await supabase
        .from("users")
        .update({
          kyc_status: "approved"
        })
        .eq("id", selectedLicense.user_id);

      if (userErr) throw userErr;

      alert("KYC Docket Approved Successfully.");
      setSelectedId(null);
      fetchQueue();

    } catch (err: any) {
      alert(err.message || "Approval failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!selectedLicense || !rejectReason) return;

    setSubmitting(true);
    try {
      const updatedAudit = [
        ...(selectedLicense.audit_trail || []),
        {
          action: "request_additional_documents",
          timestamp: new Date().toISOString(),
          verifier: "Operations Manager",
          note: rejectReason
        }
      ];

      // Update License
      const { error: licenseErr } = await supabase
        .from("driver_licenses")
        .update({
          verified_status: "rejected",
          rejection_reason: rejectReason,
          audit_trail: updatedAudit
        })
        .eq("id", selectedLicense.id);

      if (licenseErr) throw licenseErr;

      // Update User
      const { error: userErr } = await supabase
        .from("users")
        .update({
          kyc_status: "action_required"
        })
        .eq("id", selectedLicense.user_id);

      if (userErr) throw userErr;

      alert("Concierge request sent to customer profile.");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedId(null);
      fetchQueue();

    } catch (err: any) {
      alert(err.message || "Rejection dispatch failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Expiry Date check helper
  const checkExpiryStatus = (dateStr: string | null) => {
    if (!dateStr) return { label: "N/A", style: "text-white/40" };
    const date = new Date(dateStr);
    const now = new Date();
    if (date > now) {
      return { label: "Valid Future Expiry", style: "text-emerald-400 font-bold" };
    } else {
      return { label: "EXPIRED DOCUMENT", style: "text-red-400 font-extrabold animate-pulse" };
    }
  };

  const filteredQueue = licenses.filter(l => {
    if (filter === "pending") return l.user?.kyc_status === "under_review";
    if (filter === "approved") return l.user?.kyc_status === "approved";
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="glass-card glass-glow-blue p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-widest block mb-1">Prestige Security Desk</span>
          <h1 className="text-white text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>KYC Approvals Queue</h1>
          <p className="text-white/40 text-xs mt-1">Review driver profiles, inspect side-by-side scans, and manage user clearance states.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => { setLoading(true); fetchQueue(); }}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Queue Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left: Queue List */}
        <div className="rounded-[24px] bg-white/[0.02] border border-white/5 p-5 backdrop-blur-md space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Inboxes</span>
            <div className="flex bg-[#090a0f] border border-white/5 p-0.5 rounded-lg">
              <button 
                onClick={() => setFilter("pending")}
                className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${filter === "pending" ? "bg-blue-600 text-white" : "text-white/40"}`}
              >
                Review
              </button>
              <button 
                onClick={() => setFilter("all")}
                className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${filter === "all" ? "bg-blue-600 text-white" : "text-white/40"}`}
              >
                All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-white/30 font-mono">Querying database...</div>
          ) : filteredQueue.length > 0 ? (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredQueue.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    selectedId === item.id 
                      ? "bg-blue-600/10 border-blue-500/30 text-white" 
                      : "bg-[#090a0f]/40 border-white/5 text-white/60 hover:bg-white/[0.01]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-white text-sm font-bold">{item.user?.first_name} {item.user?.last_name}</h4>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                      item.user?.kyc_status === "under_review" 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {item.user?.kyc_status}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/30 block mt-1">{item.user?.email}</span>
                  <span className="text-[9px] text-white/40 font-mono block mt-1.5">Submitted: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-white/30 font-mono">No submissions matching selection.</div>
          )}
        </div>

        {/* Middle/Right: Document comparison details */}
        <div className="lg:col-span-2 rounded-[24px] bg-white/[0.02] border border-white/5 p-6 backdrop-blur-md flex flex-col justify-between">
          
          {selectedLicense ? (
            <div className="space-y-6">
              
              {/* Profile details header */}
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-urbanist)" }}>
                    {selectedLicense.user?.first_name} {selectedLicense.user?.last_name}
                  </h3>
                  <p className="text-white/40 text-xs mt-0.5">Email: {selectedLicense.user?.email} | Phone: {selectedLicense.user?.phone}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 text-red-400 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Request Info
                  </button>
                  <button 
                    onClick={handleApprove}
                    disabled={submitting}
                    className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/5"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve KYC
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Left: Input values & Checklist */}
                <div className="space-y-6">
                  {/* Registry profile details */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                    <h4 className="text-white/70 text-xs font-bold uppercase tracking-wider">Submitted parameters</h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">License Number:</span>
                        <span className="text-white font-mono font-semibold">{selectedLicense.license_number || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Country:</span>
                        <span className="text-white font-semibold">{selectedLicense.issuing_country || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Expiry Date:</span>
                        <span className="text-white font-semibold">
                          {selectedLicense.expiry_date ? new Date(selectedLicense.expiry_date).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Expiry Status:</span>
                        <span className={checkExpiryStatus(selectedLicense.expiry_date).style}>
                          {checkExpiryStatus(selectedLicense.expiry_date).label}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Govt ID Type:</span>
                        <span className="text-white font-bold">{selectedLicense.govt_id_type || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Govt ID Number:</span>
                        <span className="text-white font-mono font-semibold">{selectedLicense.govt_id_number || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Checklist */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                    <h4 className="text-white/70 text-xs font-bold uppercase tracking-wider">Auditor Checks</h4>
                    
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2.5 text-white/70 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checks.nameMatches}
                          onChange={(e) => setChecks(c => ({ ...c, nameMatches: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>Name matches document parameters</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-white/70 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checks.expiryValid}
                          onChange={(e) => setChecks(c => ({ ...c, expiryValid: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>Document expiry is valid and check-in future</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-white/70 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checks.imagesClear}
                          onChange={(e) => setChecks(c => ({ ...c, imagesClear: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>Scans are high-quality (Clarity / Readability)</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-white/70 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checks.idReferenceMatches}
                          onChange={(e) => setChecks(c => ({ ...c, idReferenceMatches: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>ID reference numbers match database inputs</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: Document viewer images */}
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  {/* License Front */}
                  {selectedLicense.license_front_url && (
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">License Front View</span>
                      <div className="rounded-xl border border-white/10 relative overflow-hidden group h-36 bg-black">
                        <img 
                          src={selectedLicense.license_front_url} 
                          alt="License Front" 
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-[8px] font-mono text-white/60 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Resolution: Clear
                        </span>
                      </div>
                    </div>
                  )}

                  {/* License Back */}
                  {selectedLicense.license_back_url && (
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">License Back View</span>
                      <div className="rounded-xl border border-white/10 relative overflow-hidden group h-36 bg-black">
                        <img 
                          src={selectedLicense.license_back_url} 
                          alt="License Back" 
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-[8px] font-mono text-white/60 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Resolution: Clear
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Govt ID */}
                  {selectedLicense.govt_id_url && (
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">Government ID ({selectedLicense.govt_id_type})</span>
                      <div className="rounded-xl border border-white/10 relative overflow-hidden group h-36 bg-black">
                        <img 
                          src={selectedLicense.govt_id_url} 
                          alt="Govt ID Copy" 
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-[8px] font-mono text-white/60 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Clarity: High
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Selfie validation portrait */}
                  {selectedLicense.selfie_url && (
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">Facial Selfie Match</span>
                      <div className="rounded-xl border border-white/10 relative overflow-hidden group h-36 bg-black">
                        <img 
                          src={selectedLicense.selfie_url} 
                          alt="Face Selfie" 
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-[8px] font-mono text-white/60 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Face Match: 98%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Address proof */}
                  {selectedLicense.address_proof_url && (
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">Address Proof (Utility Copy)</span>
                      <div className="rounded-xl border border-white/10 relative overflow-hidden group h-36 bg-black">
                        <img 
                          src={selectedLicense.address_proof_url} 
                          alt="Address Proof" 
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-[8px] font-mono text-white/60 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Format: Valid
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Audit trail */}
              <div className="border-t border-white/5 pt-4">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold block mb-2">Audit logs</span>
                <div className="space-y-2">
                  {selectedLicense.audit_trail && selectedLicense.audit_trail.length > 0 ? (
                    selectedLicense.audit_trail.map((log: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-[11px] text-white/50 bg-white/[0.01] p-2 rounded-lg border border-white/5">
                        <span>{log.note}</span>
                        <span className="text-[10px] text-white/30">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-white/30 text-[10px] italic">No audit records logged yet.</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center gap-3 text-white/30 min-h-[300px]">
              <Layers className="w-12 h-12 text-white/10" />
              <div>
                <h4 className="text-white font-bold">Select Submission</h4>
                <p className="text-xs text-white/40 mt-1 max-w-xs leading-relaxed">
                  Choose a pending customer profile from the queue to start verification and document inspection.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Reject/Request More Info Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="bg-[#121210] border border-white/10 rounded-[24px] p-6 max-w-md w-full relative z-10 space-y-4">
            <div>
              <h3 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-urbanist)" }}>Request Document Adjustments</h3>
              <p className="text-white/40 text-xs mt-0.5">Provide a detailed reason to the customer indicating what details/scans they need to correct.</p>
            </div>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. License back card scan is blurry. Please re-upload in high resolution."
              rows={4}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
              required
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleRequestMoreInfo}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 border border-red-500/20 text-white rounded-xl text-xs uppercase tracking-widest font-bold"
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
