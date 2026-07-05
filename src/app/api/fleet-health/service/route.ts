import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_ROLES = ["admin", "super_admin", "manager", "staff", "operations_manager", "branch_manager"];

async function verifyStaffAccess() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select(`*, role:roles (name)`)
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return null;
  const roleName = (profile.role as { name: string } | null)?.name || "";
  
  if (ALLOWED_ROLES.includes(roleName)) {
    return profile;
  }
  return null;
}

export async function POST(req: Request) {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { vehicleId, serviceType, cost, odometer, details } = await req.json();

    if (!vehicleId || !serviceType || cost === undefined || !odometer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    
    // 1. Insert into vehicle_maintenance_logs
    const { data: logData, error: logError } = await supabaseAdmin
      .from("vehicle_maintenance_logs")
      .insert({
        vehicle_id: vehicleId,
        service_type: serviceType,
        date: todayStr,
        odometer: Number(odometer),
        cost: Number(cost),
        details: details || ""
      })
      .select()
      .single();

    if (logError && logError.code !== "P0001" && logError.message.indexOf("does not exist") === -1) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    // 2. Fetch current health to update specific wear fields
    const { data: currentHealth } = await supabaseAdmin
      .from("vehicle_health")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .maybeSingle();

    if (currentHealth) {
      const updateData: Record<string, string | number | boolean> = {
        current_odometer: Math.max(currentHealth.current_odometer, Number(odometer)),
        updated_at: new Date().toISOString()
      };

      if (serviceType === "oil_change") {
        updateData.last_oil_change_date = todayStr;
        updateData.last_oil_change_odometer = Number(odometer);
        updateData.next_oil_change_odometer = Number(odometer) + 10000;
      } else if (serviceType === "tyre_replacement") {
        updateData.tyre_tread_depth_mm = 8.0;
        updateData.tyre_install_date = todayStr;
        updateData.tyre_alignment_date = todayStr;
      } else if (serviceType === "battery_replacement") {
        updateData.battery_health_pct = 100;
        updateData.battery_install_date = todayStr;
        updateData.battery_voltage = 12.60;
      } else if (serviceType === "scheduled_service") {
        updateData.last_service_date = todayStr;
        updateData.last_service_odometer = Number(odometer);
        
        const sixMonthsOut = new Date();
        sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
        updateData.next_service_date = sixMonthsOut.toISOString().split("T")[0];
      } else if (serviceType === "detailing") {
        updateData.cleanliness_score = 10;
        updateData.cleanliness_status = "Clean";
      }

      await supabaseAdmin
        .from("vehicle_health")
        .update(updateData)
        .eq("vehicle_id", vehicleId);
    }

    // 3. Resolve active incidents if general repair is done
    if (serviceType === "general_repair" || serviceType === "scheduled_service") {
      await supabaseAdmin
        .from("vehicle_incidents")
        .update({ status: "resolved" })
        .eq("vehicle_id", vehicleId)
        .eq("status", "reported");
    }

    // 4. Update vehicle status to available if it is in maintenance
    const { data: vehicle } = await supabaseAdmin
      .from("vehicles")
      .select("availability_status")
      .eq("id", vehicleId)
      .single();

    if (vehicle && vehicle.availability_status === "maintenance") {
      await supabaseAdmin
        .from("vehicles")
        .update({ availability_status: "available" })
        .eq("id", vehicleId);
    }

    return NextResponse.json({ success: true, log: logData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
