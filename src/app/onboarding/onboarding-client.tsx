"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  FileText, 
  Upload, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Heart,
  CheckCircle2,
  FileSignature
} from "lucide-react";

interface OnboardingWizardClientProps {
  user: any;
  initialProfile: any;
}

export default function OnboardingWizardClient({ user, initialProfile }: OnboardingWizardClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Step 1: Personal Details ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [occupation, setOccupation] = useState("");
  const [city, setCity] = useState("");

  // --- Step 2: Driving Licence ---
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseCountry, setLicenseCountry] = useState("India");
  const [licenseFront, setLicenseFront] = useState<string | null>(null);
  const [licenseBack, setLicenseBack] = useState<string | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // --- Step 3: Government ID ---
  const [govtIdType, setGovtIdType] = useState<"Aadhaar" | "Passport" | "PAN">("Aadhaar");
  const [govtIdNumber, setGovtIdNumber] = useState("");
  const [govtIdFile, setGovtIdFile] = useState<string | null>(null);
  const [uploadingGovtId, setUploadingGovtId] = useState(false);

  // --- Step 4: Emergency Contact ---
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");

  // --- Step 5: Vehicle Preferences ---
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  // --- Step 6: Accept Policies ---
  const [agreeChecked, setAgreeChecked] = useState(false);

  // Load existing profile drafts
  useEffect(() => {
    async function loadDraft() {
      try {
        if (initialProfile) {
          const fname = initialProfile.first_name || "";
          const lname = initialProfile.last_name || "";
          setFullName([fname, lname].filter(Boolean).join(" ") || "");
          setPhone(initialProfile.phone || "");
          setDob(initialProfile.dob || "");
          setOccupation(initialProfile.occupation || "");
          setCity(initialProfile.city || "");
          
          // Re-load onboarding step
          setStep(initialProfile.onboarding_step || 1);
          setEmergencyName(initialProfile.emergency_contact_name || "");
          setEmergencyPhone(initialProfile.emergency_contact_phone || "");
          setEmergencyRelation(initialProfile.emergency_contact_relationship || "Spouse");
          setPreferredCategories(initialProfile.preferred_categories || []);

          // Load License draft
          const { data: licenseData } = await supabase
            .from("driver_licenses")
            .select("*")
            .eq("user_id", initialProfile.id)
            .maybeSingle();

          if (licenseData) {
            setLicenseNumber(licenseData.license_number || "");
            setLicenseExpiry(licenseData.expiry_date || "");
            setLicenseCountry(licenseData.issuing_country || "India");
            setLicenseFront(licenseData.license_front_url || null);
            setLicenseBack(licenseData.license_back_url || null);
            setGovtIdType(licenseData.govt_id_type || "Aadhaar");
            setGovtIdNumber(licenseData.govt_id_number || "");
            setGovtIdFile(licenseData.govt_id_url || null);
          }
        }
      } catch (err) {
        console.error("[Onboarding Client] Failed loading draft progress:", err);
      } finally {
        setDbLoading(false);
      }
    }
    loadDraft();
  }, [initialProfile]);

  // Premium mock file upload for fluid UI feedback
  const handleFileUploadMock = (
    setField: React.Dispatch<React.SetStateAction<string | null>>,
    setLoader: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoader(true);
    setErrorMsg(null);
    setTimeout(() => {
      // Simulate set standard document placeholder URL
      setField("https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600");
      setLoader(false);
    }, 1500);
  };

  const calculateProgressPercent = (currentStep: number) => {
    return Math.round(((currentStep - 1) / 6) * 100);
  };

  const handleNext = async () => {
    setErrorMsg(null);

    // Form validation checks per step
    if (step === 1) {
      if (!fullName.trim() || !phone || !dob || !occupation || !city) {
        setErrorMsg("Please complete all personal details before proceeding.");
        return;
      }
    }
    if (step === 2) {
      if (!licenseNumber || !licenseExpiry || !licenseFront || !licenseBack) {
        setErrorMsg("Please enter license credentials and upload both front and back card scans.");
        return;
      }
    }
    if (step === 3) {
      if (!govtIdNumber || !govtIdFile) {
        setErrorMsg("Please enter your Government ID card number and upload the scan.");
        return;
      }
    }
    if (step === 4) {
      if (!emergencyName || !emergencyPhone || !emergencyRelation) {
        setErrorMsg("Please provide an emergency contact name, phone, and relationship.");
        return;
      }
    }
    if (step === 5) {
      if (preferredCategories.length === 0) {
        setErrorMsg("Please select at least one preferred luxury vehicle category.");
        return;
      }
    }
    if (step === 6) {
      if (!agreeChecked) {
        setErrorMsg("You must accept our policies and terms to finish your profile verification.");
        return;
      }
    }

    setLoading(true);
    try {
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "Guest";
      const lastName = nameParts.slice(1).join(" ") || "Member";

      // If completing step 6, profile completion percentage becomes 100
      const currentProgress = step === 6 ? 100 : calculateProgressPercent(step + 1);

      // 1. Save step details to user profile
      const { error: userError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          dob: dob || null,
          occupation: occupation || null,
          city: city || null,
          onboarding_step: step + 1,
          profile_completed_percent: currentProgress,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          emergency_contact_relationship: emergencyRelation,
          preferred_categories: preferredCategories,
          kyc_status: step === 6 ? "under_review" : "not_started"
        })
        .eq("auth_user_id", user.id);

      if (userError) throw userError;

      // 2. Save step details to driver license profile if licences were updated
      if (step >= 2 && step <= 4) {
        const { data: licenseRow } = await supabase
          .from("driver_licenses")
          .select("id")
          .eq("user_id", initialProfile.id)
          .maybeSingle();

        const payload = {
          user_id: initialProfile.id,
          license_number: licenseNumber || null,
          issuing_country: licenseCountry || null,
          expiry_date: licenseExpiry || null,
          license_front_url: licenseFront,
          license_back_url: licenseBack,
          govt_id_type: govtIdType,
          govt_id_number: govtIdNumber || null,
          govt_id_url: govtIdFile,
          verified_status: "pending"
        };

        if (licenseRow) {
          const { error: licenseUpdateErr } = await supabase
            .from("driver_licenses")
            .update(payload)
            .eq("id", licenseRow.id);
          if (licenseUpdateErr) throw licenseUpdateErr;
        } else {
          const { error: licenseInsertErr } = await supabase
            .from("driver_licenses")
            .insert(payload);
          if (licenseInsertErr) throw licenseInsertErr;
        }
      }

      setStep(prev => prev + 1);
    } catch (err: any) {
      console.error("[Onboarding Client] Save error:", err);
      setErrorMsg(err.message || "Failed to save progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const toggleCategory = (cat: string) => {
    setPreferredCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const stepTitles = [
    "Personal Details",
    "Driving Licence",
    "Government ID",
    "Emergency Contact",
    "Vehicle Preferences",
    "Policies Agreement",
    "Verification"
  ];

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-[#07080b] flex flex-col items-center justify-center text-white p-6">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-white/50 font-bold">Synchronizing Profile Draft...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-gray-200 flex flex-col justify-between py-12 px-4 md:px-8 relative select-none">
      
      {/* Background radial overlays */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header Container */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-lg">
            <span className="text-[#0f1115] text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>3M</span>
          </div>
          <div>
            <h2 className="text-white font-extrabold text-base leading-none" style={{ fontFamily: "var(--font-heading)" }}>3M Rentals</h2>
            <span className="text-blue-400 text-[9px] uppercase tracking-[0.18em] font-bold block mt-1">Premium Onboarding</span>
          </div>
        </div>
        {step <= 6 && (
          <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">
            Progress: {calculateProgressPercent(step)}%
          </span>
        )}
      </header>

      {/* Main Stepper Layout */}
      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 flex-1">
        
        {/* Step Indicator Panel (Desktop Left, 4 cols) */}
        {step <= 6 && (
          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider text-blue-400/80 mb-6" style={{ fontFamily: "var(--font-heading)" }}>Onboarding Steps</h3>
            <div className="space-y-4">
              {stepTitles.slice(0, 6).map((title, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === step;
                const isCompleted = stepNum < step;
                return (
                  <div key={title} className="flex items-center gap-4 group">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isActive 
                        ? "bg-[#3B82F6] border-[#3B82F6] text-[#0f1115] shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-105" 
                        : isCompleted
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "border-white/10 text-white/30"
                    }`}>
                      {isCompleted ? "✓" : stepNum}
                    </div>
                    <span className={`text-xs uppercase tracking-wider font-semibold ${isActive ? "text-white font-bold" : isCompleted ? "text-white/60" : "text-white/20"}`}>
                      {title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Main Card Panel (Right, 8 cols or full if finish) */}
        <div className={`lg:col-span-8 ${step > 6 ? "lg:col-span-12 max-w-2xl mx-auto" : ""} w-full`}>
          <div className="bg-white/[0.02] border border-white/10 rounded-[28px] p-8 md:p-10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
            
            {/* Header step info */}
            {step <= 6 && (
              <div className="mb-6">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 rounded-full">
                  Step {step} of 6
                </span>
                <h1 className="text-white font-extrabold text-2xl mt-4 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  {stepTitles[step - 1]}
                </h1>
                <p className="text-white/50 text-xs mt-2 leading-relaxed">
                  {step === 1 && "Help us construct your customer profile."}
                  {step === 2 && "A valid driving license is required for self-drive luxury rentals."}
                  {step === 3 && "Government validation required for vehicle handover security."}
                  {step === 4 && "Provide details in case of any emergency contact requirements."}
                  {step === 5 && "Tell us about your fleet choices to customize your experience."}
                  {step === 6 && "Review and accept our standard operating and cancellation terms."}
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3">
                <span>⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Stepper Forms */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* ── STEP 1: Personal Details ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="tel"
                            placeholder="+91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Date of Birth</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Occupation</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            placeholder="Entrepreneur"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">City of Residence</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            placeholder="Mumbai"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Driving Licence ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Licence Number</label>
                        <input
                          type="text"
                          placeholder="DL-1420110012345"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Expiry Date</label>
                        <input
                          type="date"
                          value={licenseExpiry}
                          onChange={(e) => setLicenseExpiry(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upload Licence Front */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Licence Front Scan</span>
                        <div 
                          onClick={() => handleFileUploadMock(setLicenseFront, setUploadingFront)}
                          className="border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative min-h-[140px] overflow-hidden"
                        >
                          {uploadingFront ? (
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          ) : licenseFront ? (
                            <>
                              <img src={licenseFront} alt="Licence Front" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                              <span className="relative z-10 text-[10px] bg-black/50 px-3 py-1.5 rounded-full font-bold uppercase text-[#3B82F6]">Replace Scan</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-white/30" />
                              <div className="text-center">
                                <p className="text-xs text-white/80 font-semibold">Upload Front Scan</p>
                                <p className="text-[10px] text-white/30 mt-1">JPEG, PNG up to 5MB</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Upload Licence Back */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Licence Back Scan</span>
                        <div 
                          onClick={() => handleFileUploadMock(setLicenseBack, setUploadingBack)}
                          className="border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative min-h-[140px] overflow-hidden"
                        >
                          {uploadingBack ? (
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          ) : licenseBack ? (
                            <>
                              <img src={licenseBack} alt="Licence Back" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                              <span className="relative z-10 text-[10px] bg-black/50 px-3 py-1.5 rounded-full font-bold uppercase text-[#3B82F6]">Replace Scan</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-white/30" />
                              <div className="text-center">
                                <p className="text-xs text-white/80 font-semibold">Upload Back Scan</p>
                                <p className="text-[10px] text-white/30 mt-1">JPEG, PNG up to 5MB</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Government ID ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">ID Document Type</label>
                        <select
                          value={govtIdType}
                          onChange={(e: any) => setGovtIdType(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="Aadhaar" className="bg-[#07080b]">Aadhaar Card</option>
                          <option value="Passport" className="bg-[#07080b]">Passport</option>
                          <option value="PAN" className="bg-[#07080b]">PAN Card</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">ID Card Number</label>
                        <input
                          type="text"
                          placeholder={govtIdType === "Aadhaar" ? "1234-5678-9012" : govtIdType === "Passport" ? "A1234567" : "ABCDE1234F"}
                          value={govtIdNumber}
                          onChange={(e) => setGovtIdNumber(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Document Scan Upload</span>
                      <div 
                        onClick={() => handleFileUploadMock(setGovtIdFile, setUploadingGovtId)}
                        className="border border-dashed border-white/10 rounded-2xl p-8 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative min-h-[160px] overflow-hidden"
                      >
                        {uploadingGovtId ? (
                          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        ) : govtIdFile ? (
                          <>
                            <img src={govtIdFile} alt="Govt ID Document" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                            <span className="relative z-10 text-[10px] bg-black/50 px-3 py-1.5 rounded-full font-bold uppercase text-[#3B82F6]">Replace Scan</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-white/30" />
                            <div className="text-center">
                              <p className="text-xs text-white/80 font-semibold">Upload ID Document (Front Side or Bio-Data Page)</p>
                              <p className="text-[10px] text-white/30 mt-1">JPEG, PDF, PNG up to 5MB</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Emergency Contact ── */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Relationship</label>
                        <select
                          value={emergencyRelation}
                          onChange={(e) => setEmergencyRelation(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="Spouse" className="bg-[#07080b]">Spouse</option>
                          <option value="Parent" className="bg-[#07080b]">Parent</option>
                          <option value="Sibling" className="bg-[#07080b]">Sibling</option>
                          <option value="Friend" className="bg-[#07080b]">Friend / Other</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Contact Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="tel"
                            placeholder="+91 9999988888"
                            value={emergencyPhone}
                            onChange={(e) => setEmergencyPhone(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 5: Vehicle Preferences ── */}
                {step === 5 && (
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Select Preferred Categories</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["SUV", "Luxury", "Convertible", "Electric", "Sedan"].map((cat) => {
                        const isSelected = preferredCategories.includes(cat);
                        return (
                          <div
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                              isSelected 
                                ? "bg-[#3B82F6]/10 border-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                                : "bg-white/[0.01] border-white/10 text-white/60 hover:bg-white/[0.03] hover:text-white"
                            }`}
                          >
                            <Sparkles className={`w-5 h-5 ${isSelected ? "text-[#3B82F6]" : "text-white/30"}`} />
                            <span className="text-xs font-semibold tracking-wider uppercase">{cat}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── STEP 6: Accept Policies ── */}
                {step === 6 && (
                  <div className="space-y-6">
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar bg-white/[0.01] border border-white/5 p-4 rounded-xl text-[11px] leading-relaxed text-white/60">
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1"><FileSignature className="w-3.5 h-3.5 text-blue-400" /> Rental Terms</h4>
                        <p>All rental operations are governed by our master leasing policies. Renters must maintain an active, valid driving license at all times. Smoking, driving under the influence, and off-road driving are strictly prohibited. The vehicle must be returned to the agreed-upon location at the designated time.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1"><FileSignature className="w-3.5 h-3.5 text-blue-400" /> Privacy Policy</h4>
                        <p>We respect your privacy. All scans, license numbers, selfie verification files, and contact numbers uploaded during onboarding are strictly used for security verification purposes. We do not sell or share customer data with third-party advertising companies.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1"><FileSignature className="w-3.5 h-3.5 text-blue-400" /> Cancellation Policy</h4>
                        <p>Bookings can be cancelled free of charge up to 48 hours before the reservation starts. Cancellations made within 24 to 48 hours are subject to a 50% deposit penalty. Cancellations within 24 hours of start time are non-refundable.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="agree"
                        checked={agreeChecked}
                        onChange={(e) => setAgreeChecked(e.target.checked)}
                        className="w-4 h-4 accent-[#3B82F6] cursor-pointer"
                      />
                      <label htmlFor="agree" className="text-xs text-white/80 cursor-pointer font-medium select-none">
                        I Agree to the Rental Terms, Privacy Policy, and Cancellation Rules.
                      </label>
                    </div>
                  </div>
                )}

                {/* ── STEP 7: Finish Screen ── */}
                {step === 7 && (
                  <div className="text-center py-8 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-white font-extrabold text-2xl tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                        Thank you!
                      </h1>
                      <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                        Your profile has been submitted for verification. Our fleet officer will review your documents within 2 hours.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        router.push("/dashboard");
                        router.refresh();
                      }}
                      variant="primary"
                      className="min-h-[44px] px-8 rounded-full text-xs font-bold uppercase tracking-widest"
                    >
                      Enter Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Stepper Footer Action Buttons */}
            {step <= 6 && (
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={step === 1 || loading}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous Step
                </button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  isLoading={loading}
                  className="min-h-[44px] px-6 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
                >
                  {step === 6 ? "Finish Onboarding" : "Save & Continue"} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl w-full mx-auto mt-8 text-center text-white/20 text-[10px] uppercase tracking-wider relative z-10">
        © 2026 3M Car Rentals. All rights reserved.
      </footer>

    </div>
  );
}
