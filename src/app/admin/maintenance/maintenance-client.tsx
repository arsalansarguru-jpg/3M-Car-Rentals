"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  PageHeader, 
  StatGrid, 
  KpiCard, 
  Table, 
  TableToolbar, 
  Pagination, 
  Badge, 
  StatusBadge, 
  Modal 
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Wrench, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Plus, 
  Search, 
  Calendar, 
  ChevronRight, 
  FileText 
} from "lucide-react";
import { Logger } from "@/services/logger.service";

interface MaintenanceJob {
  id: string;
  job_number: string;
  trigger_type: string;
  priority: string;
  status: string;
  workshop: string | null;
  estimated_cost: number;
  actual_cost: number;
  estimated_completion: string | null;
  completed_at?: string | null;
  created_at: string;
  vehicle: {
    id: string;
    registration_number: string;
    brand: string;
    model: string;
  };
}

interface AvailableVehicle {
  id: string;
  registration_number: string;
  brand: string;
  model: string;
  availability_status: string;
}

interface MaintenanceClientProps {
  initialJobs: MaintenanceJob[];
  availableVehicles: AvailableVehicle[];
}

export default function MaintenanceClient({ initialJobs, availableVehicles }: MaintenanceClientProps) {
  const router = useRouter();
  
  // UI and dataset states
  const [jobs, setJobs] = useState<MaintenanceJob[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [workshop, setWorkshop] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");

  // ─── KPI Calculations ────────────────────────────────────────────────────────
  const openJobs = jobs.filter(j => j.status !== "closed" && j.status !== "cancelled").length;
  const inWorkshop = jobs.filter(j => j.status === "in_workshop" || j.status === "repairing").length;
  const awaitingParts = jobs.filter(j => j.status === "waiting_parts").length;
  const completedToday = jobs.filter(j => {
    if (j.status !== "closed") return false;
    const closedDate = j.completed_at ? new Date(j.completed_at).toDateString() : "";
    return closedDate === new Date().toDateString();
  }).length;
  const totalActualCost = jobs.reduce((sum, j) => sum + Number(j.actual_cost), 0);

  // ─── Filter & Search ─────────────────────────────────────────────────────────
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.job_number.toLowerCase().includes(search.toLowerCase()) ||
      job.vehicle.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      job.vehicle.brand.toLowerCase().includes(search.toLowerCase()) ||
      job.vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
      (job.workshop && job.workshop.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ─── Submit Handler ─────────────────────────────────────────────────────────
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      setErrorMsg("Please select a vehicle to schedule.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          triggerType,
          priority,
          description,
          workshop: workshop || undefined,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
          estimatedCompletion: estimatedCompletion || undefined
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create maintenance job ticket.");
      }

      Logger.info("Maintenance job created successfully via client dialog");
      
      // Reset form variables
      setSelectedVehicle("");
      setTriggerType("manual");
      setPriority("medium");
      setDescription("");
      setWorkshop("");
      setEstimatedCost("");
      setEstimatedCompletion("");
      setIsCreateOpen(false);

      // Refresh data
      router.refresh();
    } catch (err: any) {
      Logger.error("Failed to create maintenance job", err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 min-h-screen bg-[#0a0b0d] text-white">
      {/* Page Header */}
      <PageHeader 
        title="Fleet Maintenance Board" 
        subtitle="Manage scheduled services, parts procurement, and quality audits."
        contextTag="RentalOS Operations"
      >
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-[#0f1115] hover:text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all select-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </Button>
      </PageHeader>

      {/* KPI Cards Grid */}
      <StatGrid cols={5}>
        <KpiCard 
          title="Open Jobs" 
          value={openJobs} 
          icon={Wrench} 
          glowColor="blue" 
        />
        <KpiCard 
          title="In Workshop" 
          value={inWorkshop} 
          icon={Clock} 
          glowColor="purple" 
        />
        <KpiCard 
          title="Awaiting Parts" 
          value={awaitingParts} 
          icon={AlertCircle} 
          glowColor="pink" 
        />
        <KpiCard 
          title="Completed Today" 
          value={completedToday} 
          icon={CheckCircle2} 
          glowColor="cyan" 
        />
        <KpiCard 
          title="Expenses Logged" 
          value={totalActualCost} 
          prefix="₹" 
          icon={DollarSign} 
          glowColor="indigo" 
        />
      </StatGrid>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.01] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              type="text" 
              placeholder="Search by job number, registration or workshop..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-10 w-full bg-white/[0.02] border-white/10 text-white rounded-xl focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-white/80 text-sm focus:border-blue-500/50 cursor-pointer outline-none"
          >
            <option value="all" className="bg-[#0f1115]">All Statuses</option>
            <option value="scheduled" className="bg-[#0f1115]">Scheduled</option>
            <option value="awaiting_inspection" className="bg-[#0f1115]">Awaiting Inspection</option>
            <option value="in_workshop" className="bg-[#0f1115]">In Workshop</option>
            <option value="waiting_parts" className="bg-[#0f1115]">Waiting Parts</option>
            <option value="repairing" className="bg-[#0f1115]">Repairing</option>
            <option value="qc_pending" className="bg-[#0f1115]">QC Pending</option>
            <option value="qc_passed" className="bg-[#0f1115]">QC Passed</option>
            <option value="closed" className="bg-[#0f1115]">Closed</option>
            <option value="cancelled" className="bg-[#0f1115]">Cancelled</option>
          </select>

          {/* Priority filter */}
          <select 
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-white/80 text-sm focus:border-blue-500/50 cursor-pointer outline-none"
          >
            <option value="all" className="bg-[#0f1115]">All Priorities</option>
            <option value="low" className="bg-[#0f1115]">Low</option>
            <option value="medium" className="bg-[#0f1115]">Medium</option>
            <option value="high" className="bg-[#0f1115]">High</option>
            <option value="critical" className="bg-[#0f1115]">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white/[0.01] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
        <Table>
          <thead>
            <tr className="border-b border-white/10 text-left text-white/40 text-xs uppercase tracking-wider bg-white/[0.02]">
              <th className="p-4 md:p-5 font-bold">Job Number</th>
              <th className="p-4 md:p-5 font-bold">Vehicle Details</th>
              <th className="p-4 md:p-5 font-bold">Trigger Reason</th>
              <th className="p-4 md:p-5 font-bold">Priority</th>
              <th className="p-4 md:p-5 font-bold">Status</th>
              <th className="p-4 md:p-5 font-bold">Workshop / Location</th>
              <th className="p-4 md:p-5 font-bold">Cost Estimate</th>
              <th className="p-4 md:p-5 font-bold">Created Date</th>
              <th className="p-4 md:p-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-16 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-semibold">No maintenance jobs matched your query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job) => (
                <tr 
                  key={job.id} 
                  className="border-b border-white/5 hover:bg-white/[0.02] text-sm text-white/80 transition-colors"
                >
                  <td className="p-4 md:p-5 font-mono font-bold text-[#3B82F6]">
                    {job.job_number}
                  </td>
                  <td className="p-4 md:p-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{job.vehicle.brand} {job.vehicle.model}</span>
                      <span className="text-xs text-white/40 font-mono mt-0.5">{job.vehicle.registration_number}</span>
                    </div>
                  </td>
                  <td className="p-4 md:p-5 capitalize">
                    {job.trigger_type}
                  </td>
                  <td className="p-4 md:p-5">
                    <Badge variant={
                      job.priority === "critical" ? "red" :
                      job.priority === "high" ? "amber" :
                      job.priority === "medium" ? "blue" : "slate"
                    }>
                      {job.priority}
                    </Badge>
                  </td>
                  <td className="p-4 md:p-5">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="p-4 md:p-5 text-white/60">
                    {job.workshop || "Not Assigned"}
                  </td>
                  <td className="p-4 md:p-5 font-semibold text-white/90">
                    ₹{Number(job.estimated_cost).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 md:p-5 text-white/40 text-xs">
                    {new Date(job.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td className="p-4 md:p-5 text-right">
                    <button 
                      onClick={() => router.push(`/admin/maintenance/${job.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-white cursor-pointer select-none"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <div className="border-t border-white/10 p-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              totalItems={filteredJobs.length}
            />
          </div>
        )}
      </div>

      {/* Create Maintenance Job Dialog */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Vehicle Maintenance"
      >
        <form onSubmit={handleCreateJob} className="flex flex-col gap-5 text-white">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Vehicle Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Select Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white focus:border-blue-500/50 outline-none cursor-pointer"
              required
            >
              <option value="" className="bg-[#0f1115]">Choose a vehicle to schedule...</option>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id} className="bg-[#0f1115]">
                  {vehicle.brand} {vehicle.model} ({vehicle.registration_number})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Trigger type */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Trigger Reason</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white focus:border-blue-500/50 outline-none cursor-pointer"
              >
                <option value="manual" className="bg-[#0f1115]">Manual Request</option>
                <option value="mileage" className="bg-[#0f1115]">Mileage Interval</option>
                <option value="incident" className="bg-[#0f1115]">Incident Damage</option>
                <option value="duration" className="bg-[#0f1115]">Duration Expiry</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white focus:border-blue-500/50 outline-none cursor-pointer"
              >
                <option value="low" className="bg-[#0f1115]">Low</option>
                <option value="medium" className="bg-[#0f1115]">Medium</option>
                <option value="high" className="bg-[#0f1115]">High</option>
                <option value="critical" className="bg-[#0f1115]">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cost */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Estimated Cost (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="bg-white/[0.02] border-white/10 text-white rounded-xl focus:border-blue-500/50"
              />
            </div>

            {/* Estimated Completion */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Estimated Completion</label>
              <Input
                type="date"
                value={estimatedCompletion}
                onChange={(e) => setEstimatedCompletion(e.target.value)}
                className="bg-white/[0.02] border-white/10 text-white rounded-xl focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Workshop */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Assigned Workshop</label>
            <Input
              type="text"
              placeholder="e.g. Mumbai Regional Workshop"
              value={workshop}
              onChange={(e) => setWorkshop(e.target.value)}
              className="bg-white/[0.02] border-white/10 text-white rounded-xl focus:border-blue-500/50"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Job Description & Notes</label>
            <textarea
              placeholder="Describe the issues reported or parts list required..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white/80 text-sm focus:border-blue-500/50 outline-none resize-none font-sans"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-3 mt-2 border-t border-white/10 pt-4">
            <Button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] text-white font-semibold rounded-xl select-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-[#0f1115] hover:text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {isLoading ? "Scheduling..." : "Schedule Job"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
