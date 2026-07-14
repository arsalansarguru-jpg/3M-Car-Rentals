import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    // 1. Enforce server-side authentication and admin checking
    const resolved = await requireAdmin();
    const user = resolved.user;
    const userEmail = user?.email || "admin@3mrentals.com";

    // Parse parameters
    const { vehicleIds, action } = await req.json();

    if (!vehicleIds || !Array.isArray(vehicleIds) || !action) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
    }

    const supabase = await AuthService.getServerClient();

    for (const vehicleId of vehicleIds) {
      // Fetch current vehicle profile
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (!vehicle) continue;

      let oldValue = "";
      let newValueStr = "";
      let updatePayload: any = {};

      // Map action onto DB updates
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

        // Perform cleanliness status update in health table
        await supabase
          .from("vehicle_health")
          .update({ cleanliness_status: "Detailing" })
          .eq("vehicle_id", vehicleId);
      } else {
        continue;
      }

      // Append structured audit log entry to metadata.audit_trail JSONB
      const existingMetadata = vehicle.metadata || {};
      const existingAudit = existingMetadata.audit_trail || [];

      const logEntry = {
        action,
        user: userEmail,
        timestamp: new Date().toISOString(),
        old_value: oldValue,
        new_value: newValueStr
      };

      const updatedMetadata = {
        ...existingMetadata,
        audit_trail: [...existingAudit, logEntry]
      };

      updatePayload.metadata = updatedMetadata;

      // Persist vehicle updates in PostgreSQL
      await supabase
        .from("vehicles")
        .update(updatePayload)
        .eq("id", vehicleId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}
