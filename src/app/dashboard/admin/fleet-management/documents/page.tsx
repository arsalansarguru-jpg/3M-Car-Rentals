"use client";

import React, { useEffect, useState } from "react";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Plus,
  Check,
  Edit2
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Document {
  type: string;
  number: string;
  expiry: string;
  url: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  documents?: Document[];
}

export default function DocumentsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for adding/editing docs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [docType, setDocType] = useState("Insurance");
  const [docNumber, setDocNumber] = useState("");
  const [docExpiry, setDocExpiry] = useState("");

  const defaultTypes = [
    "RC Book", "Insurance", "PUC Certificate", "Fitness Certificate", 
    "Tourist Permit", "Road Tax", "Service Record", "Vehicle Manual", "Warranty"
  ];

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (res.ok && data.vehicles) {
        setVehicles(data.vehicles);
        if (data.vehicles.length > 0) {
          const first = data.vehicles[0];
          setSelectedVehicleId(first.id);
          setDocuments(first.documents || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      setDocuments(vehicle.documents || []);
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber || !docExpiry) return;

    const newDoc: Document = {
      type: docType,
      number: docNumber,
      expiry: docExpiry,
      url: "#"
    };

    // Remove existing of same type if present, then add new
    const nextDocs = [...documents.filter(d => d.type !== docType), newDoc];
    setDocuments(nextDocs);
    setIsFormOpen(false);
    setDocNumber("");
    setDocExpiry("");
  };

  const handleDeleteDocument = (typeToDelete: string) => {
    setDocuments(documents.filter(d => d.type !== typeToDelete));
  };

  const handleSaveDocuments = async () => {
    if (!selectedVehicleId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedVehicleId,
          documents
        })
      });
      if (res.ok) {
        setVehicles(vehicles.map(v => v.id === selectedVehicleId ? { ...v, documents } : v));
        alert("Compliance documents updated and saved successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Get status class and days remaining
  const getDocStatus = (expiryDateStr: string) => {
    if (expiryDateStr === "Permanent" || expiryDateStr === "permanent") {
      return { status: "active", label: "Permanent", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" };
    }
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining < 0) {
      return { status: "expired", label: "Expired", color: "text-red-400 border-red-500/20 bg-red-500/10" };
    } else if (daysRemaining <= 30) {
      return { status: "warning", label: `${daysRemaining} days left`, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" };
    } else {
      return { status: "active", label: "Active", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Compliance Operations
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Documents Locker
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Store permits, tax invoices, PUC slips, insurance certificates, and track automated renewals.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(true)} disabled={!selectedVehicleId}>
            <Upload className="w-4 h-4 mr-2" /> Upload Document
          </Button>
          <Button variant="fleet" size="sm" onClick={handleSaveDocuments} disabled={saving || !selectedVehicleId}>
            <Check className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Locker"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Control Card */}
        <div className="space-y-6">
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Select Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="glass-input px-3.5 py-2.5 text-white bg-transparent border border-white/10 rounded-xl focus:outline-none"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-[#0f1115]">
                    {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>

            {selectedVehicleId && (
              <div className="pt-3 border-t border-white/5 space-y-2 text-sm text-white/60">
                <div className="flex justify-between">
                  <span>Tracked Documents</span>
                  <span className="text-white font-mono">{documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Action Required</span>
                  <span className="text-amber-400 font-semibold font-mono">
                    {documents.filter(d => getDocStatus(d.expiry).status !== "active").length}
                  </span>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right list */}
        <div className="lg:col-span-3 space-y-6">
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.25rem" }}>
              Regulatory Certificates
            </h3>

            {documents.length === 0 ? (
              <div className="py-14 text-center text-white/35 flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-white/10" />
                <p>No certificates recorded for this vehicle. Upload one below.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc, idx) => {
                  const statusInfo = getDocStatus(doc.expiry);
                  
                  return (
                    <div
                      key={doc.type || idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[#00e5ff] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 600, color: "#ffffff" }} className="block">
                              {doc.type}
                            </span>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }} className="block mt-0.5 font-mono">
                              Ref: {doc.number}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-3.5 border-t border-white/[0.03] text-xs">
                        <span style={{ color: "rgba(255,255,255,0.4)" }} className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Expiry: {doc.expiry}
                        </span>

                        <button
                          onClick={() => handleDeleteDocument(doc.type)}
                          className="text-white/30 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-all"
                          title="Remove certificate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Manual document upload modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-md glass-modal overflow-hidden animate-scaleUp">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f1115]/80">
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff" }}>
                Add Document to Locker
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-white/40 hover:text-white p-1 hover:bg-white/5 rounded">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="glass-input px-3.5 py-2.5 text-white text-sm bg-transparent border border-white/10 rounded-xl focus:outline-none"
                >
                  {defaultTypes.map(t => (
                    <option key={t} value={t} className="bg-[#0f1115]">{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Certificate Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INS-AUDI-880221"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="glass-input px-3.5 py-2.5 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={docExpiry}
                  onChange={(e) => setDocExpiry(e.target.value)}
                  className="glass-input px-3.5 py-2.5 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setIsFormOpen(false)} className="text-white/50">
                  Cancel
                </Button>
                <Button variant="fleet" type="submit">
                  Record Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

