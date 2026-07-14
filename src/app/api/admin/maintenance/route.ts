import { requireStaff } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import { validateBody, successResponse, errorResponse } from "@/utils/api-helpers";
import { maintenanceJobCreateSchema } from "@/utils/validation-schemas";
import { MaintenanceService } from "@/services/maintenance/maintenance.service";
import { Logger } from "@/services/logger.service";

export async function GET(req: Request) {
  try {
    // Enforce Staff/Manager role
    await requireStaff();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const supabase = await AuthService.getServerClient();
    let query = supabase
      .from("maintenance_jobs")
      .select(`
        *,
        vehicle:vehicles (
          id, registration_number, brand, model
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (search) query = query.or(`job_number.ilike.%${search}%,workshop.ilike.%${search}%`);

    const { data: jobs, error } = await query;

    if (error) {
      Logger.error("Failed to query maintenance jobs", error);
      return errorResponse("DATABASE_ERROR", "Failed to retrieve maintenance jobs.");
    }

    return successResponse(jobs);
  } catch (err: any) {
    Logger.error("Error executing maintenance GET endpoint", err);
    return errorResponse("SERVER_ERROR", err.message || "An unexpected error occurred", null, 500);
  }
}

export async function POST(req: Request) {
  try {
    const resolved = await requireStaff();
    const user = resolved.user;
    const userEmail = user?.email || "admin@3mrentals.com";

    const { data, errorResponse: valError } = await validateBody(maintenanceJobCreateSchema, req);
    if (valError) return valError;

    const job = await MaintenanceService.createJob({
      vehicleId: data!.vehicleId,
      triggerType: data!.triggerType as any,
      priority: data!.priority as any,
      description: data!.description,
      workshop: data!.workshop,
      estimatedCost: data!.estimatedCost,
      estimatedCompletion: data!.estimatedCompletion,
      userEmail
    });

    return successResponse(job);
  } catch (err: any) {
    Logger.error("Error executing maintenance POST endpoint", err);
    return errorResponse("SERVER_ERROR", err.message || "An unexpected error occurred", null, 500);
  }
}
