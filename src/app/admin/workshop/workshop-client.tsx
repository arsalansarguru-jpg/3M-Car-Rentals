"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  PageHeader, 
  StatGrid, 
  KpiCard, 
  Badge, 
  StatusBadge, 
  Drawer, 
  Dialog 
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Wrench, 
  Users, 
  ClipboardCheck, 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar, 
  ChevronRight, 
  FileText, 
  UserPlus, 
  ListTodo, 
  WrenchIcon, 
  FileSignature, 
  Info,
  Clock
} from "lucide-react";
import { Logger } from "@/services/logger.service";

interface Staff {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface WorkshopJob {
  id: string;
  status: "pending" | "assigned" | "in_progress" | "waiting_parts" | "quality_check" | "completed";
  start_time: string | null;
  expected_finish: string | null;
  created_at: string;
  maintenance: {
    id: string;
    job_number: string;
    trigger_type: string;
    priority: string;
    description: string | null;
    vehicle: {
      id: string;
      registration_number: string;
      brand: string;
      model: string;
    };
  };
}

interface WorkshopClientProps {
  initialQueue: WorkshopJob[];
  staffList: Staff[];
}

export default function WorkshopClient({ initialQueue, staffList }: WorkshopClientProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<WorkshopJob[]>(initialQueue);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected job for detail workspace slide-in
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "costs" | "qc" | "report">("overview");

  // Form states inside slide-in
  const [techAssignId, setTechAssignId] = useState("");
  const [estHours, setEstHours] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Notes form states
  const [noteType, setNoteType] = useState<"inspection" | "recommendation" | "general">("inspection");
  const [noteContent, setNoteContent] = useState("");

  // Parts form states
  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState("1");
  const [partPrice, setPartPrice] = useState("");
  const [partSupplier, setPartSupplier] = useState("");
  const [partBatch, setPartBatch] = useState("");

  // Labour form states
  const [labourWork, setLabourWork] = useState("");
  const [labourHours, setLabourHours] = useState("");
  const [labourRate, setLabourRate] = useState("600");

  // QC form states
  const [oilFilled, setOilFilled] = useState(false);
  const [brakeTested, setBrakeTested] = useState(false);
  const [tyrePressure, setTyrePressure] = useState(false);
  const [acChecked, setAcChecked] = useState(false);
  const [lightsWorking, setLightsWorking] = useState(false);
  const [testDriveDone, setTestDriveDone] = useState(false);
  const [qcNotes, setQcNotes] = useState("");

  // Complete & Report form states
  const [rptObs, setRptObs] = useState("");
  const [rptRecs, setRptRecs] = useState("");
  const [rptNextDate, setRptNextDate] = useState("");
  const [rptOutcome, setRptOutcome] = useState<"available" | "inspection_required" | "not_available">("available");

  // ─── Metrics ────────────────────────────────────────────────────────────────
  const waitingJobs = queue.filter(j => j.status === "pending").length;
  const underService = queue.filter(j => ["assigned", "in_progress", "waiting_parts"].includes(j.status)).length;
  const readyDelivery = queue.filter(j => j.status === "quality_check").length;
  const completedToday = queue.filter(j => j.status === "completed").length;

  // Filter queue records
  const filteredQueue = queue.filter(job => {
    const matchesSearch = 
      job.maintenance.job_number.toLowerCase().includes(search.toLowerCase()) ||
      job.maintenance.vehicle.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      job.maintenance.vehicle.brand.toLowerCase().includes(search.toLowerCase()) ||
      job.maintenance.vehicle.model.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ─── Fetch Detailed Job Workspace ───────────────────────────────────────────
  const handleOpenWorkspace = async (id: string) => {
    setSelectedJobId(id);
    setIsDetailsOpen(true);
    setActiveTab("overview");
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/workshop/${id}`);
      const result = await res.json();
      if (res.ok && result.data) {
        setSelectedJobDetails(result.data);
        
        // Populate existing QC checklist state if present
        const currentQc = result.data.qualityChecks?.[0];
        if (currentQc) {
          setOilFilled(currentQc.oil_filled);
          setBrakeTested(currentQc.brake_tested);
          setTyrePressure(currentQc.tyre_pressure);
          setAcChecked(currentQc.ac_checked);
          setLightsWorking(currentQc.lights_working);
          setTestDriveDone(currentQc.test_drive_done);
          setQcNotes(currentQc.notes || "");
        } else {
          setOilFilled(false);
          setBrakeTested(false);
          setTyrePressure(false);
          setAcChecked(false);
          setLightsWorking(false);
          setTestDriveDone(false);
          setQcNotes("");
        }
      }
    } catch (err) {
      Logger.error("Failed to load workshop details workspace", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Re-fetch active slide details
  const refreshDetails = async () => {
    if (!selectedJobId) return;
    try {
      const res = await fetch(`/api/admin/workshop/${selectedJobId}`);
      const result = await res.json();
      if (res.ok && result.data) {
        setSelectedJobDetails(result.data);
      }
    } catch (err) {
      Logger.error("Failed to refresh details view", err);
    }
  };

  // ─── Actions Submit Handlers ────────────────────────────────────────────────

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techAssignId) return;
    setIsSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobDetails.job_id,
          assignedTo: techAssignId,
          estimatedHours: estHours ? parseFloat(estHours) : undefined
        })
      });

      if (res.ok) {
        await refreshDetails();
        // Update master listing states
        router.refresh();
      }
    } catch (err) {
      Logger.error("Failed to assign technician", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus: string) => {
    setIsSubmitLoading(true);
    try {
      const res = await fetch(`/api/admin/workshop/${selectedJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status: targetStatus
        })
      });

      if (res.ok) {
        await refreshDetails();
        router.refresh();
      }
    } catch (err) {
      Logger.error("Failed to change repair status", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/workshop/${selectedJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          noteType,
          noteContent
        })
      });

      if (res.ok) {
        setNoteContent("");
        await refreshDetails();
      }
    } catch (err) {
      Logger.error("Failed to save note record", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partPrice) return;
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/workshop/${selectedJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_part",
          partName,
          quantity: parseInt(partQty, 10),
          unitPrice: parseFloat(partPrice),
          supplier: partSupplier,
          batchNumber: partBatch
        })
      });

      if (res.ok) {
        setPartName("");
        setPartPrice("");
        setPartSupplier("");
        setPartBatch("");
        await refreshDetails();
        router.refresh();
      }
    } catch (err) {
      Logger.error("Failed to append part logged", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleAddLabour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labourWork || !labourHours || !labourRate) return;
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/workshop/${selectedJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_labour",
          workDone: labourWork,
          hours: parseFloat(labourHours),
          hourlyRate: parseFloat(labourRate)
        })
      });

      if (res.ok) {
        setLabourWork("");
        setLabourHours("");
        await refreshDetails();
        router.refresh();
      }
    } catch (err) {
      Logger.error("Failed to append labour log", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleSubmitQC = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/workshop/${selectedJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_qc",
          oilFilled,
          brakeTested,
          tyrePressure,
          acChecked,
          lightsWorking,
          testDriveDone,
          notes: qcNotes
        })
      });

      if (res.ok) {
        await refreshDetails();
        router.refresh();
      }
    } catch (err) {
      Logger.error("QC checklist log submission failed", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleCompleteService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      const res = await fetch(`/api/admin/workshop/${selectedJobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_service",
          observations: rptObs,
          recommendations: rptRecs,
          nextServiceDue: rptNextDate,
          outcome: rptOutcome
        })
      });

      if (res.ok) {
        setIsDetailsOpen(false);
        // Refresh master queue
        const listRes = await fetch("/api/admin/workshop");
        const listResJson = await listRes.json();
        if (listResJson.data) setQueue(listResJson.data);
        router.refresh();
      } else {
        const errorResult = await res.json();
        alert(errorResult.error || "Completion report submission failed.");
      }
    } catch (err) {
      Logger.error("Complete Service report submission failed", err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Cost sums calculations
  const partsSum = selectedJobDetails?.parts?.reduce((sum: number, p: any) => sum + Number(p.total_price), 0) || 0;
  const labourSum = selectedJobDetails?.labour?.reduce((sum: number, l: any) => sum + Number(l.total_price), 0) || 0;
  const totalAccruedCost = partsSum + labourSum;

  const isQcPassed = oilFilled && brakeTested && tyrePressure && acChecked && lightsWorking && testDriveDone;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 min-h-screen bg-[#0a0b0d] text-white">
      {/* Page Header */}
      <PageHeader 
        title="Workshop Management Center" 
        subtitle="Track active repair jobs, assign technicians, log labor and parts, and complete quality checks."
        contextTag="RentalOS Operations"
      />

      {/* KPI Stats Grid */}
      <StatGrid cols={4}>
        <KpiCard 
          title="Waiting Allocation" 
          value={waitingJobs} 
          icon={Users} 
          glowColor="pink" 
        />
        <KpiCard 
          title="Under Service" 
          value={underService} 
          icon={Wrench} 
          glowColor="blue" 
        />
        <KpiCard 
          title="QC Pending / Ready" 
          value={readyDelivery} 
          icon={ClipboardCheck} 
          glowColor="purple" 
        />
        <KpiCard 
          title="Completed Today" 
          value={completedToday} 
          icon={CheckSquare} 
          glowColor="cyan" 
        />
      </StatGrid>

      {/* Search and Filters toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.01] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            type="text" 
            placeholder="Search by registration number, brand, job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full bg-white/[0.02] border-white/10 text-white rounded-xl focus:border-blue-500/50"
          />
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-white/85 text-sm focus:border-blue-500/50 cursor-pointer outline-none w-full md:w-auto"
        >
          <option value="all" className="bg-[#0f1115]">All Statuses</option>
          <option value="pending" className="bg-[#0f1115]">Pending Assignment</option>
          <option value="assigned" className="bg-[#0f1115]">Technician Assigned</option>
          <option value="in_progress" className="bg-[#0f1115]">In Progress</option>
          <option value="waiting_parts" className="bg-[#0f1115]">Waiting Parts</option>
          <option value="quality_check" className="bg-[#0f1115]">Quality Check</option>
          <option value="completed" className="bg-[#0f1115]">Completed</option>
        </select>
      </div>

      {/* Workshop Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredQueue.length === 0 ? (
          <div className="col-span-full py-16 text-center text-white/35 flex flex-col items-center gap-3">
            <WrenchIcon className="w-10 h-10 opacity-30" />
            <p className="font-semibold text-sm">No vehicles are currently in the workshop queue.</p>
          </div>
        ) : (
          filteredQueue.map((job) => (
            <div 
              key={job.id} 
              className="bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg transition-all hover:shadow-white/5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold font-mono text-[#3B82F6]">{job.maintenance.job_number}</span>
                  <StatusBadge status={job.status} />
                </div>

                <h3 className="font-bold text-base leading-tight text-white mb-0.5">
                  {job.maintenance.vehicle.brand} {job.maintenance.vehicle.model}
                </h3>
                <span className="text-xs font-mono text-white/40 uppercase block mb-3">
                  {job.maintenance.vehicle.registration_number}
                </span>

                <div className="flex flex-col gap-2 border-t border-white/5 pt-3 text-xs text-white/60">
                  <div className="flex justify-between">
                    <span>Reason:</span>
                    <span className="font-semibold capitalize text-white/80">{job.maintenance.trigger_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <span className="font-semibold capitalize text-white/80">{job.maintenance.priority}</span>
                  </div>
                  {job.expected_finish && (
                    <div className="flex justify-between">
                      <span>Expected:</span>
                      <span className="font-semibold text-white/80">
                        {new Date(job.expected_finish).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleOpenWorkspace(job.id)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-white/[0.02] hover:bg-[#3B82F6] text-white hover:text-[#0f1115] border border-white/10 hover:border-transparent font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Open Worksheet</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Slide-over Workspace Drawer */}
      <Drawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedJobDetails ? `Servicing Details: ${selectedJobDetails.maintenance.job_number}` : "Loading Details..."}
      >
        {selectedJobDetails && (
          <div className="flex flex-col gap-6 h-full text-white">
            {/* Tabs Selector */}
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap ${activeTab === "overview" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/40 hover:text-white"}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab("notes")}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap ${activeTab === "notes" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/40 hover:text-white"}`}
              >
                Tech Notes
              </button>
              <button 
                onClick={() => setActiveTab("costs")}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap ${activeTab === "costs" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/40 hover:text-white"}`}
              >
                Parts & Labor
              </button>
              <button 
                onClick={() => setActiveTab("qc")}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap ${activeTab === "qc" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/40 hover:text-white"}`}
              >
                QA Checklist
              </button>
              <button 
                onClick={() => setActiveTab("report")}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap ${activeTab === "report" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/40 hover:text-white"}`}
              >
                Service Report
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto pr-1">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-6">
                  {/* Status Banner */}
                  <div className="flex justify-between items-center bg-white/[0.02] border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold">Servicing Status</span>
                    </div>
                    <StatusBadge status={selectedJobDetails.status} />
                  </div>

                  {/* Quick updates buttons */}
                  {selectedJobDetails.status !== "completed" && selectedJobDetails.status !== "pending" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Update Status Stage</label>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={() => handleStatusChange("in_progress")}
                          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20"
                        >
                          Start Repairing
                        </Button>
                        <Button 
                          onClick={() => handleStatusChange("waiting_parts")}
                          className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs font-bold rounded-lg border border-pink-500/20"
                        >
                          Wait for Parts
                        </Button>
                        <Button 
                          onClick={() => handleStatusChange("quality_check")}
                          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20"
                        >
                          Quality Check
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Vehicle description details */}
                  <div className="flex flex-col gap-3 bg-white/[0.01] border border-white/5 rounded-xl p-4 text-sm">
                    <h4 className="font-bold text-white/50 text-xs uppercase tracking-wide">Vehicle Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-white/40 block">Vehicle Model</span>
                        <span className="font-semibold text-white/90">
                          {selectedJobDetails.maintenance.vehicle.brand} {selectedJobDetails.maintenance.vehicle.model}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-white/40 block">License Plate</span>
                        <span className="font-semibold text-white/90 font-mono">
                          {selectedJobDetails.maintenance.vehicle.registration_number}
                        </span>
                      </div>
                    </div>
                    {selectedJobDetails.maintenance.description && (
                      <div className="mt-2">
                        <span className="text-xs text-white/40 block">Job Description</span>
                        <p className="text-xs text-white/70 bg-white/[0.02] border border-white/10 rounded-lg p-3 mt-1 leading-relaxed">
                          {selectedJobDetails.maintenance.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Allocate Technician Panel */}
                  {selectedJobDetails.status === "pending" && (
                    <form onSubmit={handleAssignTechnician} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-blue-400 flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4" />
                        <span>Allocate Technician</span>
                      </h4>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Technician</label>
                        <select
                          value={techAssignId}
                          onChange={(e) => setTechAssignId(e.target.value)}
                          className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white text-sm outline-none cursor-pointer"
                          required
                        >
                          <option value="" className="bg-[#0f1115]">Choose a technician...</option>
                          {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id} className="bg-[#0f1115]">
                              {staff.first_name || ""} {staff.last_name || ""} ({staff.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Estimated Hours</label>
                        <Input
                          type="number"
                          placeholder="e.g. 4.5"
                          value={estHours}
                          onChange={(e) => setEstHours(e.target.value)}
                          className="bg-white/[0.02] border-white/10 text-white rounded-lg focus:border-blue-500/50"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitLoading}
                        className="w-full py-2.5 bg-blue-500 text-[#0f1115] font-bold rounded-lg hover:bg-blue-600 transition-all cursor-pointer"
                      >
                        Assign Technician & Dispatch
                      </Button>
                    </form>
                  )}

                  {/* Current allocation summaries */}
                  {selectedJobDetails.assignments?.length > 0 && (
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 text-xs flex flex-col gap-2">
                      <span className="font-bold text-white/55 uppercase tracking-wider block mb-1">Technician Assignments Logs</span>
                      {selectedJobDetails.assignments.map((asg: any) => {
                        const staff = staffList.find(s => s.id === asg.assigned_to);
                        return (
                          <div key={asg.id} className="flex justify-between border-b border-white/5 pb-2 last:border-b-0 last:pb-0 text-white/80">
                            <span>{staff ? `${staff.first_name || ""} ${staff.last_name || ""}` : "Staff"}</span>
                            <span>{asg.estimated_hours} Est. Hours</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TECH NOTES */}
              {activeTab === "notes" && (
                <div className="flex flex-col gap-6">
                  {/* Note Creator Form */}
                  {selectedJobDetails.status !== "completed" && (
                    <form onSubmit={handleAddNote} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-blue-400">Append Inspection Note</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setNoteType("inspection")}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${noteType === "inspection" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-transparent border-white/10 text-white/55"}`}
                        >
                          Inspection
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteType("recommendation")}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${noteType === "recommendation" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-transparent border-white/10 text-white/55"}`}
                        >
                          Recommendation
                        </button>
                      </div>

                      <textarea
                        placeholder="Log observations like: 'Brake pads worn', 'Rear tyre damaged'..."
                        rows={3}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white/80 text-xs focus:border-blue-500/50 outline-none resize-none font-sans"
                        required
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitLoading}
                        className="py-2 bg-blue-500 text-[#0f1115] hover:text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Add Tech Note
                      </Button>
                    </form>
                  )}

                  {/* Notes Timeline List */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold text-white/55 uppercase tracking-wider block">Technician Observations Ledger</label>
                    {selectedJobDetails.notes?.length === 0 ? (
                      <span className="text-xs text-white/35">No notes recorded yet.</span>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {selectedJobDetails.notes.map((note: any) => (
                          <div key={note.id} className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <Badge variant={note.note_type === "inspection" ? "blue" : note.note_type === "recommendation" ? "amber" : "slate"}>
                                {note.note_type}
                              </Badge>
                              <span className="text-white/40">
                                {new Date(note.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed font-mono">
                              {note.note_content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PARTS & LABOR */}
              {activeTab === "costs" && (
                <div className="flex flex-col gap-6">
                  {/* Accumulated Expense Summary */}
                  <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-[#3B82F6] font-bold uppercase tracking-wider block">Accrued Cost Total</span>
                      <span className="text-2xl font-black text-white">₹{totalAccruedCost.toLocaleString("en-IN")}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      Parts: ₹{partsSum.toLocaleString("en-IN")} | Labor: ₹{labourSum.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {selectedJobDetails.status !== "completed" && (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Log Part Consumed */}
                      <form onSubmit={handleAddPart} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                        <h4 className="font-bold text-xs uppercase tracking-wide text-blue-400">Record Part Consumed</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Part Name (e.g. Brake Pad)"
                            value={partName}
                            onChange={(e) => setPartName(e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                            required
                          />
                          <Input
                            type="number"
                            placeholder="Quantity"
                            value={partQty}
                            onChange={(e) => setPartQty(e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            placeholder="Unit Price (₹)"
                            value={partPrice}
                            onChange={(e) => setPartPrice(e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                            required
                          />
                          <Input
                            placeholder="Supplier (e.g. Bosch)"
                            value={partSupplier}
                            onChange={(e) => setPartSupplier(e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                            required
                          />
                        </div>
                        <Input
                          placeholder="Batch / Serial Number"
                          value={partBatch}
                          onChange={(e) => setPartBatch(e.target.value)}
                          className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                          required
                        />
                        <Button
                          type="submit"
                          disabled={isSubmitLoading}
                          className="py-2 bg-blue-500 text-[#0f1115] font-bold rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Log Part Log
                        </Button>
                      </form>

                      {/* Log Labour Hours */}
                      <form onSubmit={handleAddLabour} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                        <h4 className="font-bold text-xs uppercase tracking-wide text-blue-400">Log Labour Work Hours</h4>
                        <Input
                          placeholder="Work Done (e.g. Brake system overhaul)"
                          value={labourWork}
                          onChange={(e) => setLabourWork(e.target.value)}
                          className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                          required
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            placeholder="Hours logged"
                            value={labourHours}
                            onChange={(e) => setLabourHours(e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                            required
                          />
                          <Input
                            type="number"
                            placeholder="Hourly Rate (₹)"
                            value={labourRate}
                            onChange={(e) => setLabourRate(e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={isSubmitLoading}
                          className="py-2 bg-blue-500 text-[#0f1115] font-bold rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Log Labour Hours
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Consumed Parts Table List */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Recorded Parts Inventory Log</label>
                    {selectedJobDetails.parts?.length === 0 ? (
                      <span className="text-xs text-white/35">No parts logged yet.</span>
                    ) : (
                      <div className="bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-white/[0.03] text-white/40">
                            <tr>
                              <th className="p-3">Part Name</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3">Supplier</th>
                              <th className="p-3 text-right">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedJobDetails.parts.map((p: any) => (
                              <tr key={p.id} className="border-b border-white/5 text-white/80">
                                <td className="p-3 font-semibold">{p.part_name}</td>
                                <td className="p-3 text-center">{p.quantity}</td>
                                <td className="p-3">{p.supplier}</td>
                                <td className="p-3 text-right">₹{Number(p.total_price).toLocaleString("en-IN")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: QA CHECKLIST */}
              {activeTab === "qc" && (
                <div className="flex flex-col gap-6">
                  <form onSubmit={handleSubmitQC} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col gap-5">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-blue-400 flex items-center gap-1.5">
                      <ClipboardCheck className="w-4.5 h-4.5" />
                      <span>Workshop QA Inspection Audit</span>
                    </h4>

                    <div className="flex flex-col gap-3.5">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={oilFilled}
                          onChange={(e) => setOilFilled(e.target.checked)}
                          className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-white/80">✓ Oil Filled & Levels Verified</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={brakeTested}
                          onChange={(e) => setBrakeTested(e.target.checked)}
                          className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-white/80">✓ Brake Pads & Hydralics Tested</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={tyrePressure}
                          onChange={(e) => setTyrePressure(e.target.checked)}
                          className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-white/80">✓ Tyre Pressure & Treads Checked</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={acChecked}
                          onChange={(e) => setAcChecked(e.target.checked)}
                          className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-white/80">✓ Climate Control / AC Filter Cleaned</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={lightsWorking}
                          onChange={(e) => setLightsWorking(e.target.checked)}
                          className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-white/80">✓ Lights, Signals & Electronics Working</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={testDriveDone}
                          onChange={(e) => setTestDriveDone(e.target.checked)}
                          className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-white/80">✓ Road Test Drive Verification Done</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-white/50 uppercase">Inspectors Notes</label>
                      <textarea
                        placeholder="Log any final comments regarding vehicle performance..."
                        rows={2}
                        value={qcNotes}
                        onChange={(e) => setQcNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white/85 text-xs focus:border-blue-500/50 outline-none resize-none font-sans"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitLoading}
                      className="w-full py-2.5 bg-blue-500 text-[#0f1115] hover:text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Save QC Checklist & Lock Status
                    </Button>
                  </form>
                </div>
              )}

              {/* TAB 5: SERVICE REPORT */}
              {activeTab === "report" && (
                <div className="flex flex-col gap-6">
                  {selectedJobDetails.report ? (
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col gap-4 text-sm font-mono text-white/80">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <FileSignature className="w-4 h-4" />
                        <span>Generated Service Report</span>
                      </h4>
                      <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                        <div className="flex justify-between text-xs">
                          <span>Total Duration:</span>
                          <span className="text-white font-bold">{selectedJobDetails.report.duration_hours} Hrs</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Labor cost accrued:</span>
                          <span className="text-white font-bold">₹{Number(selectedJobDetails.report.labour_cost).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Parts cost logged:</span>
                          <span className="text-white font-bold">₹{Number(selectedJobDetails.report.parts_cost).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2 text-sm">
                          <span>Final Total cost:</span>
                          <span className="text-blue-400 font-extrabold">₹{Number(selectedJobDetails.report.total_cost).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      {selectedJobDetails.report.observations && (
                        <div className="mt-2 text-xs">
                          <span className="text-white/40 block uppercase text-[10px]">Observations</span>
                          <p className="mt-1 font-sans text-white/70 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-lg">
                            {selectedJobDetails.report.observations}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleCompleteService} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col gap-5">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-blue-400 flex items-center gap-1.5">
                        <FileText className="w-4.5 h-4.5" />
                        <span>Completion Summary Service Report</span>
                      </h4>

                      {!isQcPassed && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                          <Info className="w-4.5 h-4.5 shrink-0" />
                          <span>Complete Service is locked. Please check all boxes in the QA Checklist tab first!</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Technical Observations</label>
                        <textarea
                          placeholder="Summary of issues resolved..."
                          rows={2.5}
                          value={rptObs}
                          onChange={(e) => setRptObs(e.target.value)}
                          className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white/80 text-xs focus:border-blue-500/50 outline-none resize-none font-sans"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase">Future Recommendations</label>
                        <textarea
                          placeholder="Notes for next schedule (e.g. suspension checks needed)..."
                          rows={2}
                          value={rptRecs}
                          onChange={(e) => setRptRecs(e.target.value)}
                          className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white/80 text-xs focus:border-blue-500/50 outline-none resize-none font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase">Next Service Due Date</label>
                          <Input
                            type="date"
                            value={rptNextDate}
                            onChange={(e) => setRptNextDate(e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-white rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-white/50 uppercase">QA Release Outcome</label>
                          <select
                            value={rptOutcome}
                            onChange={(e) => setRptOutcome(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-white text-xs outline-none cursor-pointer"
                          >
                            <option value="available" className="bg-[#0f1115]">Mark Available (Ready)</option>
                            <option value="inspection_required" className="bg-[#0f1115]">Re-Inspection Required</option>
                            <option value="not_available" className="bg-[#0f1115]">Decommission / Disable</option>
                          </select>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitLoading || !isQcPassed}
                        className={`w-full py-2.5 font-bold rounded-lg text-xs transition-all cursor-pointer ${isQcPassed ? "bg-emerald-500 hover:bg-emerald-600 text-[#0f1115]" : "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"}`}
                      >
                        Publish Final Report & Release Vehicle
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
