import { requireStaff, requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/api-helpers";
import { MaintenanceService } from "@/services/maintenance/maintenance.service";
import { Logger } from "@/services/logger.service";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const params = await props.params;
    const { id } = params;

    const supabase = await AuthService.getServerClient();
    const { data: job, error } = await supabase
      .from("maintenance_jobs")
      .select(`
        *,
        vehicle:vehicles (
          *
        ),
        tasks:maintenance_tasks (*),
        parts:maintenance_parts (*),
        photos:maintenance_photos (*),
        history:maintenance_history (*)
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !job) {
      Logger.error(`Failed to fetch maintenance details: ${id}`, error);
      return errorResponse("NOT_FOUND", "Maintenance job not found.");
    }

    return successResponse(job);
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

    let job;
    if (payload.status) {
      // Transitioning status using status transition validator
      job = await MaintenanceService.changeStatus(id, payload.status, userEmail);
    } else {
      // Updating job parameters
      job = await MaintenanceService.updateJob({
        jobId: id,
        priority: payload.priority,
        description: payload.description,
        workshop: payload.workshop,
        estimatedCost: payload.estimatedCost,
        estimatedCompletion: payload.estimatedCompletion,
        userEmail
      });
    }

    return successResponse(job);
  } catch (err: any) {
    Logger.error("Failed to execute PATCH operations update", err);
    return errorResponse("SERVER_ERROR", err.message || "Operation failed", null, 500);
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    // Only administrators can delete/decommission tickets
    const resolved = await requireAdmin();
    const user = resolved.user;
    const userEmail = user?.email || "admin@3mrentals.com";
    const params = await props.params;
    const { id } = params;

    // Fetch the job to identify the vehicle
    const { data: job } = await supabaseAdmin
      .from("maintenance_jobs")
      .select("vehicle_id")
      .eq("id", id)
      .single();

    // Set deleted_at timestamp (Soft delete support)
    const { error } = await supabaseAdmin
      .from("maintenance_jobs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw error;
    }

    // Reset vehicle availability status back to available if it was under maintenance
    if (job) {
      await supabaseAdmin
        .from("vehicles")
        .update({ availability_status: "available" })
        .eq("id", job.vehicle_id);
    }

    Logger.info(`Soft deleted maintenance ticket: ${id}`);
    return successResponse({ success: true });
  } catch (err: any) {
    Logger.error("Failed to delete maintenance ticket", err);
    return errorResponse("SERVER_ERROR", err.message || "Failed to delete ticket", null, 500);
  }
}
