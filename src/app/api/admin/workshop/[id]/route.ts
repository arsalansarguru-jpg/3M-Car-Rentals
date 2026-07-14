import { requireStaff } from "@/services/auth-helpers";
import { successResponse, errorResponse } from "@/utils/api-helpers";
import { WorkshopService } from "@/services/workshop/workshop.service";
import { Logger } from "@/services/logger.service";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AuthService } from "@/services/auth.service";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const params = await props.params;
    const { id } = params;

    const supabase = await AuthService.getServerClient();
    const { data: job, error } = await supabase
      .from("workshop_jobs")
      .select(`
        *,
        maintenance:maintenance_jobs (
          *,
          vehicle:vehicles (*),
          tasks:maintenance_tasks (*),
          history:maintenance_history (*)
        )
      `)
      .eq("id", id)
      .single();

    if (error || !job) {
      Logger.error(`Failed to fetch workshop job: ${id}`, error);
      return errorResponse("NOT_FOUND", "Workshop job not found.");
    }

    // Load sub-tables info
    const jobId = job.job_id;
    const { data: assignments } = await supabase.from("technician_assignments").select("*").eq("job_id", jobId);
    const { data: notes } = await supabase.from("technician_notes").select("*").eq("job_id", jobId).order("created_at", { ascending: false });
    const { data: parts } = await supabase.from("service_parts").select("*").eq("job_id", jobId);
    const { data: labour } = await supabase.from("service_labour").select("*").eq("job_id", jobId);
    const { data: photos } = await supabase.from("service_photos").select("*").eq("job_id", jobId);
    const { data: qc } = await supabase.from("quality_checks").select("*").eq("job_id", jobId);
    const { data: report } = await supabase.from("service_reports").select("*").eq("job_id", jobId).maybeSingle();

    return successResponse({
      ...job,
      assignments: assignments || [],
      notes: notes || [],
      parts: parts || [],
      labour: labour || [],
      photos: photos || [],
      qualityChecks: qc || [],
      report
    });
  } catch (err: any) {
    return errorResponse("SERVER_ERROR", err.message || "An unexpected error occurred", null, 500);
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const resolved = await requireStaff();
    const user = resolved.user;
    const userEmail = user?.email || "admin@3mrentals.com";
    const params = await props.params;
    const { id } = params;

    const payload = await req.json();
    const { action } = payload;

    // Fetch the workshop job details to get the job_id
    const { data: wsJob } = await supabaseAdmin
      .from("workshop_jobs")
      .select("job_id")
      .eq("id", id)
      .single();

    if (!wsJob) {
      return errorResponse("NOT_FOUND", "Workshop job not found.");
    }

    const jobId = wsJob.job_id;

    if (action === "update_status") {
      const { status } = payload;
      
      // Update workshop job status
      const { data: updated, error } = await supabaseAdmin
        .from("workshop_jobs")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      // Sync maintenance job status
      let mStatus = "in_workshop";
      if (status === "waiting_parts") mStatus = "waiting_parts";
      if (status === "in_progress") mStatus = "repairing";
      if (status === "quality_check") mStatus = "qc_pending";
      if (status === "completed") mStatus = "qc_passed";

      await supabaseAdmin
        .from("maintenance_jobs")
        .update({ status: mStatus })
        .eq("id", jobId);

      return successResponse(updated);
    }

    if (action === "add_note") {
      const { noteType, noteContent } = payload;
      const note = await WorkshopService.addNote({
        jobId,
        technicianId: user!.id,
        noteType,
        noteContent
      });
      return successResponse(note);
    }

    if (action === "add_part") {
      const { partName, quantity, unitPrice, supplier, batchNumber } = payload;
      const part = await WorkshopService.addPart({
        jobId,
        partName,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        supplier,
        batchNumber,
        userEmail
      });
      return successResponse(part);
    }

    if (action === "add_labour") {
      const { workDone, hours, hourlyRate } = payload;
      const labour = await WorkshopService.addLabour({
        jobId,
        workDone,
        hours: Number(hours),
        hourlyRate: Number(hourlyRate),
        technicianId: user!.id,
        userEmail
      });
      return successResponse(labour);
    }

    if (action === "submit_qc") {
      const { oilFilled, brakeTested, tyrePressure, acChecked, lightsWorking, testDriveDone, notes } = payload;
      const qc = await WorkshopService.submitQC({
        jobId,
        oilFilled,
        brakeTested,
        tyrePressure,
        acChecked,
        lightsWorking,
        testDriveDone,
        checkedBy: user!.id,
        notes,
        userEmail
      });
      return successResponse(qc);
    }

    if (action === "complete_service") {
      const { observations, recommendations, nextServiceDue, outcome } = payload;
      const report = await WorkshopService.completeService({
        jobId,
        technicianId: user!.id,
        observations,
        recommendations,
        nextServiceDue,
        outcome,
        userEmail
      });
      return successResponse(report);
    }

    return errorResponse("BAD_REQUEST", "Unknown action specifier.");
  } catch (err: any) {
    Logger.error("Failed to execute Workshop PATCH operations updates", err);
    return errorResponse("SERVER_ERROR", err.message || "Operation failed", null, 500);
  }
}
