"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  User, 
  FileText, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  HelpCircle,
  FileCheck,
  Compass,
  AlertTriangle,
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingKYCWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [dbLoading, setDbLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- OBOARDING STATE VECTORS ---
  // Step 2: Personal Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Step 3: Driver License
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licenseCountry, setLicenseCountry] = useState("India");
  const [licenseFront, setLicenseFront] = useState<string | null>(null);
  const [licenseBack, setLicenseBack] = useState<string | null>(null);

  // Step 4: Government ID
  const [govtIdType, setGovtIdType] = useState<"Aadhaar" | "Passport" | "PAN">("Aadhaar");
  const [govtIdNumber, setGovtIdNumber] = useState("");
  const [govtIdFile, setGovtIdFile] = useState<string | null>(null);

  // Step 5: Selfie & Address
  const [selfieFile, setSelfieFile] = useState<string | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<string | null>(null);
  const [takingSelfie, setTakingSelfie] = useState(false);

  // Step 6: Emergency & Preferences
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Spouse");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadDraft() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .maybeSingle();

        if (profile) {
          setUserId(profile.id);
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setPhone(profile.phone || "");
          setStep(profile.onboarding_step || 1);
          setPreferredLocations(profile.preferred_locations || []);
          setPreferredCategories(profile.preferred_categories || []);
          setEmergencyName(profile.emergency_contact_name || "");
          setEmergencyPhone(profile.emergency_contact_phone || "");
          setEmergencyRelation(profile.emergency_contact_relationship || "Spouse");

          // Load License drafts
          const { data: licenseData } = await supabase
            .from("driver_licenses")
            .select("*")
            .eq("user_id", profile.id)
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
            setSelfieFile(licenseData.selfie_url || null);
            setAddressProofFile(licenseData.address_proof_url || null);

            // If user's kyc is already approved or under review, check status
            if (profile.kyc_status === "approved" || profile.kyc_status === "under_review") {
              // Direct pass to Success or Hold state
              setStep(7);
            }
          }
        }
      } catch (err) {
        console.error("Draft loading failed:", err);
      } finally {
        setDbLoading(false);
      }
    }
    loadDraft();
  }, [router]);

  // Mock upload implementation (gives premium client-side immediate feedback)
  const handleFileUploadMock = (setField: React.Dispatch<React.SetStateAction<string | null>>) => {
    setLoading(true);
    setTimeout(() => {
      // Simulate file upload setting a dummy preview
      setField("https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600");
      setLoading(false);
    }, 1200);
  };

  const handleSelfieCaptureMock = () => {
    setTakingSelfie(true);
    setTimeout(() => {
      setSelfieFile("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400");
      setTakingSelfie(false);
    }, 2000);
  };

  const calculateCompletionPercent = (currentStep: number) => {
    return Math.round((currentStep / 6) * 100);
  };

  const handleNextStep = async () => {
    setErrorMsg(null);
    
    // Step validation rules
    if (step === 2 && (!firstName || !lastName || !phone)) {
      setErrorMsg("Please fill in your name and contact details.");
      return;
    }
    if (step === 3 && (!licenseNumber || !licenseExpiry || !licenseFront || !licenseBack)) {
      setErrorMsg("Please enter license details and upload both front and back card scans.");
      return;
    }
    if (step === 4 && (!govtIdNumber || !govtIdFile)) {
      setErrorMsg("Please enter your Government ID number and upload the scan.");
      return;
    }
    if (step === 5 && (!selfieFile || !addressProofFile)) {
      setErrorMsg("Please capture verification selfie and attach address proof documentation.");
      return;
    }
    if (step === 6 && (!emergencyName || !emergencyPhone || preferredLocations.length === 0 || preferredCategories.length === 0)) {
      setErrorMsg("Please complete emergency contacts and choose vehicle/pickup preferences.");
      return;
    }

    setLoading(true);
    try {
      const completionPercent = calculateCompletionPercent(step);

      // Save draft progress to database
      const { error: userError } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          onboarding_step: step + 1,
          profile_completed_percent: completionPercent,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          emergency_contact_relationship: emergencyRelation,
          preferred_locations: preferredLocations,
          preferred_categories: preferredCategories,
          // If moving to step 7, update kyc_status to 'under_review'
          kyc_status: step === 6 ? "under_review" : "not_started"
        })
        .eq("id", userId);

      if (userError) throw userError;

      // Update or Insert License credentials
      const { data: existingLicense } = await supabase
        .from("driver_licenses")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const licensePayload = {
        user_id: userId,
        license_number: licenseNumber || null,
        issuing_country: licenseCountry || null,
        expiry_date: licenseExpiry || null,
        license_front_url: licenseFront,
        license_back_url: licenseBack,
        govt_id_type: govtIdType,
        govt_id_number: govtIdNumber || null,
        govt_id_url: govtIdFile,
        selfie_url: selfieFile,
        address_proof_url: addressProofFile,
        verified_status: step === 6 ? "pending" : "pending"
      };

      if (existingLicense) {
        await supabase
          .from("driver_licenses")
          .update(licensePayload)
          .eq("id", existingLicense.id);
      } else {
        await supabase
          .from("driver_licenses")
          .insert(licensePayload);
      }

      setStep(prev => prev + 1);

    } catch (err: any) {
      setErrorMsg(err.message || "Progress save failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleLocationToggle = (loc: string) => {
    setPreferredLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleCategoryToggle = (cat: string) => {
    setPreferredCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  if (dbLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Loading onboarding state...</p>
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: "Welcome" },
    { num: 2, label: "Profile" },
    { num: 3, label: "License" },
    { num: 4, label: "Govt ID" },
    { num: 5, label: "Verification" },
    { num: 6, label: "Setup" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
      
      {/* ─── PROGRESS BAR HEADER ─── */}
      {step < 7 && (
        <div className="rounded-[24px] p-6 bg-white/[0.02] border border-white/5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff]">Onboarding Progress</span>
            <span className="text-xs text-white/50">{calculateCompletionPercent(step)}% Completed</span>
          </div>
          
          <div className="relative">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-[#00e5ff] rounded-full transition-all duration-500"
                style={{ width: `${calculateCompletionPercent(step)}%` }}
              />
            </div>
            {/* Dots */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1 pointer-events-none">
              {stepsList.map(s => (
                <div 
                  key={s.num} 
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    step >= s.num 
                      ? "bg-[#00e5ff] border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]" 
                      : "bg-[#090a0f] border-white/10"
                  }`} 
                />
              ))}
            </div>
          </div>

          <div className="hidden sm:flex justify-between text-[10px] uppercase tracking-wider text-white/30 font-bold px-1 pt-1">
            {stepsList.map(s => (
              <span key={s.num} className={step === s.num ? "text-white" : ""}>{s.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── WIZARD CARDS & TRANSITIONS ─── */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="rounded-[30px] p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-8"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.2)]">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                    Verified Luxury Awaits
                  </h2>
                  <p className="text-white/40 text-sm max-w-md mt-1">
                    To maintain our exclusive fleet integrity and state logistics, we require a brief verification clearance before your first rental keys dispatch.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto text-center">
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                  <span className="text-[10px] text-white/30 uppercase font-bold block mb-1">Time to Complete</span>
                  <p className="text-white text-base font-bold">~4 Minutes</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                  <span className="text-[10px] text-white/30 uppercase font-bold block mb-1">Documents Needed</span>
                  <p className="text-white text-base font-bold">ID + License</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                  <span className="text-[10px] text-white/30 uppercase font-bold block mb-1">SLA Review Time</span>
                  <p className="text-white text-base font-bold">&lt; 30 Minutes</p>
                </div>
              </div>

              <div className="flex justify-center border-t border-white/5 pt-6">
                <Button 
                  onClick={() => setStep(2)} 
                  variant="fleet" 
                  className="rounded-2xl px-8 py-4 font-bold uppercase tracking-wider text-xs flex items-center gap-2"
                >
                  Start Verification <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-[30px] p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-6"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff] block mb-1">Step 2 of 6</span>
                <h2 className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Personal Credentials</h2>
                <p className="text-white/40 text-xs mt-0.5">Please confirm your contact credentials for check-in registry logs.</p>
              </div>

              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{errorMsg}</div>}

              <div className="space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Phone Number (SMS logs)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-6 mt-8">
                <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleNextStep} variant="fleet" disabled={loading} className="rounded-xl px-6 flex items-center gap-1.5">Next <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-[30px] p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-6"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff] block mb-1">Step 3 of 6</span>
                <h2 className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Driver&apos;s License Documentation</h2>
                <p className="text-white/40 text-xs mt-0.5">Attach high-resolution scans of your valid driving license.</p>
              </div>

              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{errorMsg}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">License Number</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="DL-XXXXXXXXXXXXX"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Expiry Date</label>
                      <input
                        type="date"
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Issuing Country</label>
                      <input
                        type="text"
                        value={licenseCountry}
                        onChange={(e) => setLicenseCountry(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Upload slots */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Front card */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block text-center">Front View</label>
                    <div 
                      onClick={() => handleFileUploadMock(setLicenseFront)}
                      className="h-32 rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.01] transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center relative overflow-hidden"
                    >
                      {licenseFront ? (
                        <>
                          <img src={licenseFront} alt="Front Preview" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-white/20 mb-1.5" />
                          <span className="text-[10px] text-white/40">License Front</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Back card */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block text-center">Back View</label>
                    <div 
                      onClick={() => handleFileUploadMock(setLicenseBack)}
                      className="h-32 rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.01] transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center relative overflow-hidden"
                    >
                      {licenseBack ? (
                        <>
                          <img src={licenseBack} alt="Back Preview" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-white/20 mb-1.5" />
                          <span className="text-[10px] text-white/40">License Back</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-6 mt-8">
                <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleNextStep} variant="fleet" disabled={loading} className="rounded-xl px-6 flex items-center gap-1.5">Next <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-[30px] p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-6"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff] block mb-1">Step 4 of 6</span>
                <h2 className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Government ID Credentials</h2>
                <p className="text-white/40 text-xs mt-0.5">Please confirm an additional primary government-issued ID.</p>
              </div>

              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{errorMsg}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Select ID Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">ID Type</label>
                    <select
                      value={govtIdType}
                      onChange={(e) => setGovtIdType(e.target.value as any)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    >
                      <option value="Aadhaar" className="bg-[#090a0f]">Aadhaar Card</option>
                      <option value="Passport" className="bg-[#090a0f]">Passport</option>
                      <option value="PAN" className="bg-[#090a0f]">PAN Card</option>
                    </select>
                  </div>

                  {/* ID number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">ID Reference Number</label>
                    <input
                      type="text"
                      value={govtIdNumber}
                      onChange={(e) => setGovtIdNumber(e.target.value)}
                      placeholder={govtIdType === "Aadhaar" ? "XXXX XXXX XXXX" : govtIdType === "Passport" ? "LXXXXXXX" : "ABCDE1234F"}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Upload Slot */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block text-center">Scan / Document Upload</label>
                  <div 
                    onClick={() => handleFileUploadMock(setGovtIdFile)}
                    className="h-36 rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.01] transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center relative overflow-hidden"
                  >
                    {govtIdFile ? (
                      <>
                        <img src={govtIdFile} alt="Govt ID Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-white/20 mb-2" />
                        <span className="text-xs text-white/50 font-semibold">Upload ID Copy</span>
                        <span className="text-[10px] text-white/30 mt-1 block">Supports PDF, PNG, JPG</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-6 mt-8">
                <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleNextStep} variant="fleet" disabled={loading} className="rounded-xl px-6 flex items-center gap-1.5">Next <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-[30px] p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-6"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff] block mb-1">Step 5 of 6</span>
                <h2 className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Face Verification & Address Proof</h2>
                <p className="text-white/40 text-xs mt-0.5">Provide a quick identity verification portrait scan and utility document proof.</p>
              </div>

              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{errorMsg}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Selfie snapshot */}
                <div className="space-y-3">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block text-center">Selfie Capture</label>
                  <div className="h-44 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    {selfieFile ? (
                      <>
                        <img src={selfieFile} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" />
                        <button 
                          onClick={handleSelfieCaptureMock}
                          className="absolute bottom-3 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white hover:bg-black/80 transition-colors z-20 flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" /> Retake Snapshot
                        </button>
                      </>
                    ) : (
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                          <Camera className="w-6 h-6" />
                        </div>
                        <button
                          onClick={handleSelfieCaptureMock}
                          disabled={takingSelfie}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg transition-colors inline-block"
                        >
                          {takingSelfie ? "Connecting Camera..." : "Launch Snapshot"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Address proof upload */}
                <div className="space-y-3">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block text-center">Utility Bill / Rental Agreement</label>
                  <div 
                    onClick={() => handleFileUploadMock(setAddressProofFile)}
                    className="h-44 rounded-2xl bg-white/[0.01] border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.01] transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center relative overflow-hidden"
                  >
                    {addressProofFile ? (
                      <>
                        <img src={addressProofFile} alt="Address Proof" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-8 h-8 text-white/20 mb-2" />
                        <span className="text-xs text-white/50 font-semibold">Upload Address Proof</span>
                        <span className="text-[9px] text-white/30 mt-1 block">Electricity, broadband, or rental contracts</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-6 mt-8">
                <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleNextStep} variant="fleet" disabled={loading} className="rounded-xl px-6 flex items-center gap-1.5">Next <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-[30px] p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-6"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff] block mb-1">Step 6 of 6</span>
                <h2 className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>Preferences & Contacts</h2>
                <p className="text-white/40 text-xs mt-0.5">Define your target preferences to unlock tailored dispatch automation.</p>
              </div>

              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">{errorMsg}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Emergency contact */}
                <div className="space-y-4">
                  <h3 className="text-white text-sm font-extrabold uppercase tracking-wide border-b border-white/5 pb-2">Emergency Contact</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold block">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 font-bold block">Phone</label>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="Contact phone"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 font-bold block">Relationship</label>
                      <select
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      >
                        <option value="Spouse" className="bg-[#090a0f]">Spouse</option>
                        <option value="Parent" className="bg-[#090a0f]">Parent</option>
                        <option value="Sibling" className="bg-[#090a0f]">Sibling</option>
                        <option value="Friend" className="bg-[#090a0f]">Friend</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ride Preferences */}
                <div className="space-y-4">
                  <h3 className="text-white text-sm font-extrabold uppercase tracking-wide border-b border-white/5 pb-2">Fleet Preferences</h3>
                  
                  {/* Pick up locations */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold block">Preferred Pick-up Locations</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["Mopa Airport (GOX)", "Dabolim Airport (GOI)", "Panaji", "Candolim", "Margao"].map(loc => {
                        const active = preferredLocations.includes(loc);
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => handleLocationToggle(loc)}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                              active 
                                ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                                : "bg-[#090a0f]/40 border-white/10 text-white/50 hover:text-white"
                            }`}
                          >
                            {loc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* preferred Categories */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold block">Favorite Vehicle Categories</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["SUV", "Luxury", "Convertible", "Sedan", "Hatchback"].map(cat => {
                        const active = preferredCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategoryToggle(cat)}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                              active 
                                ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                                : "bg-[#090a0f]/40 border-white/10 text-white/50 hover:text-white"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-6 mt-8">
                <Button onClick={handlePrevStep} variant="ghost" className="rounded-xl flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button 
                  onClick={handleNextStep} 
                  variant="fleet" 
                  disabled={loading} 
                  className="rounded-xl px-6 py-3.5 flex items-center gap-1.5 uppercase font-bold text-xs shadow-lg shadow-blue-500/15"
                >
                  {loading ? "Saving Progress..." : "Submit Verification"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="step-7"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="rounded-[30px] p-8 bg-gradient-to-br from-emerald-950/10 to-transparent border border-emerald-500/10 backdrop-blur-md space-y-6 text-center py-12"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h2 className="text-white text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-urbanist)" }}>
                  KYC Records Dispatched
                </h2>
                <p className="text-white/50 text-sm max-w-md mx-auto" style={{ fontFamily: "var(--font-manrope)" }}>
                  Your verification docket has been successfully loaded into the concierge review queue. Account validation is prioritized and typically completed under 30 minutes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 max-w-sm mx-auto flex items-center gap-3 text-left">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-[10px] text-white/40 uppercase tracking-wide leading-normal">
                  Our dispatch automation will alert you via SMS and Email the instant verification resolves.
                </span>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={() => {
                    router.push("/dashboard");
                    router.refresh();
                  }}
                  variant="fleet" 
                  className="rounded-xl px-8"
                >
                  Return to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
