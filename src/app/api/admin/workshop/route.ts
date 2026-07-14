import { requireStaff } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/api-helpers";
import { WorkshopService } from "@/services/workshop/workshop.service";
import { Logger } from "@/services/logger.service";

export async function GET(req: Request) {
  try {
    await requireStaff();
    const supabase = await AuthService.getServerClient();
    
    // Fetch all workshop jobs along with vehicle and maintenance details
    const { data: queue, error } = await supabase
      .from("workshop_jobs")
      .select(`
        *,
        maintenance:maintenance_jobs (
          id,
          job_number,
          trigger_type,
          priority,
          description,
          vehicle:vehicles (
            id, registration_number, brand, model
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      Logger.error("Failed to query workshop queue logs", error);
      return errorResponse("DATABASE_ERROR", "Failed to retrieve workshop queue records.");
    }

    return successResponse(queue);
  } catch (err: any) {
    Logger.error("Error executing workshop GET collection", err);
    return errorResponse("SERVER_ERROR", err.message || "An unexpected error occurred", null, 500);
  }
}

export async function POST(req: Request) {
  try {
    const resolved = await requireStaff();
    const user = resolved.user;
    const userEmail = user?.email || "admin@3mrentals.com";

    const payload = await req.json();
    const { jobId, assignedTo, estimatedHours } = payload;

    if (!jobId || !assignedTo) {
      return errorResponse("VALIDATION_ERROR", "Job ID and Assigned To user are required.");
    }

    await WorkshopService.assignTechnician({
      jobId,
      assignedTo,
      assignedBy: user!.id,
      estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
      userEmail
    });

    return successResponse({ success: true });
  } catch (err: any) {
    Logger.error("Error executing workshop POST allocation", err);
    return errorResponse("SERVER_ERROR", err.message || "Technician allocation failed", null, 500);
  }
}
