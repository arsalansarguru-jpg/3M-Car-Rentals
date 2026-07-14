import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import { validateBody, successResponse, errorResponse } from "@/utils/api-helpers";
import { vehicleUpdateSchema } from "@/utils/validation-schemas";
import { Logger } from "@/services/logger.service";
import { AuditService } from "@/services/audit.service";
import { DomainEventDispatcher } from "@/lib/event-bus";

export async function POST(req: Request) {
  try {
    // 1. Enforce server-side authentication and role check
    const resolved = await requireAdmin();
    const user = resolved.user;
    const userEmail = user?.email || "admin@3mrentals.com";

    // 2. Standard validation helper using Zod
    const { data, errorResponse: valError } = await validateBody(vehicleUpdateSchema, req);
    if (valError) {
      Logger.warn("Fleet update validation failed", { context: { service: "FleetAPI", action: "update" } });
      return valError;
    }

    const { vehicleIds, action } = data!;
    const supabase = await AuthService.getServerClient();

    Logger.info("Starting fleet batch update operation", {
      context: { service: "FleetAPI", action: "batchUpdate" },
      meta: { vehicleCount: vehicleIds.length, action }
    });

    for (const vehicleId of vehicleIds) {
      // Fetch current vehicle record for oldValue audits mapping
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (!vehicle) {
        Logger.warn(`Vehicle profile not found during batch update: ${vehicleId}`);
        continue;
      }

      let oldValue = "";
      let newValueStr = "";
      let updatePayload: any = {};

      if (action === "mark_available") {
        oldValue = vehicle.availability_status;
        updatePayload.availability_status = "available";
        newValueStr = "available";
      } else if (action === "send_to_maintenance") {
        oldValue = vehicle.availability_status;
        updatePayload.availability_status = "maintenance";
        newValueStr = "maintenance";
      } else if (action === "disable") {
        oldValue = vehicle.is_visible ? "Visible" : "Hidden";
        updatePayload.is_visible = false;
        newValueStr = "Hidden";
      } else if (action === "send_to_cleaning") {
        const { data: health } = await supabase
          .from("vehicle_health")
          .select("cleanliness_status")
          .eq("vehicle_id", vehicleId)
          .maybeSingle();

        oldValue = health?.cleanliness_status || "Clean";
        newValueStr = "Detailing";

        await supabase
          .from("vehicle_health")
          .update({ cleanliness_status: "Detailing" })
          .eq("vehicle_id", vehicleId);
      } else {
        continue;
      }

      // Legacy audit metadata updates
      const existingMetadata = vehicle.metadata || {};
      const existingAudit = existingMetadata.audit_trail || [];
      const logEntry = {
        action,
        user: userEmail,
        timestamp: new Date().toISOString(),
        old_value: oldValue,
        new_value: newValueStr
      };

      updatePayload.metadata = {
        ...existingMetadata,
        audit_trail: [...existingAudit, logEntry]
      };

      // 3. Centralized Database Audit Logging
      await AuditService.logAudit({
        userEmail,
        userRole: "admin",
        action: `vehicle_${action}`,
        entity: "vehicles",
        entityId: vehicleId,
        oldValue: { status: oldValue },
        newValue: { status: newValueStr }
      });

      // 4. Update core record in Supabase
      await supabase
        .from("vehicles")
        .update(updatePayload)
        .eq("id", vehicleId);

      // 5. Fire asynchronous Decoupled Domain Event
      DomainEventDispatcher.publish({
        eventName: action === "send_to_maintenance" ? "MaintenanceScheduled" : "VehicleStatusUpdated",
        timestamp: new Date().toISOString(),
        payload: {
          vehicleId,
          action,
          oldValue,
          newValue: newValueStr,
          userId: user?.id || "admin"
        }
      });
    }

    Logger.info("Fleet batch update completed successfully");
    return successResponse({ success: true });
  } catch (err: any) {
    Logger.error("Fleet batch update execution failed", err);
    return errorResponse("SERVER_ERROR", err.message || "An unexpected error occurred", null, 500);
  }
}
