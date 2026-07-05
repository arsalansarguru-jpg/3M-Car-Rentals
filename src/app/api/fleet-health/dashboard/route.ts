import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getFleetHealthData } from "@/lib/fleet-health-engine";

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

export async function GET() {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const healthData = await getFleetHealthData();

    // Compute aggregated metrics
    const avgHealth = Math.round(
      healthData.reduce((sum, v) => sum + v.healthScore, 0) / Math.max(1, healthData.length)
    );
    const totalFASTag = healthData.reduce((sum, v) => sum + v.fastagBalance, 0);
    const nonCompliantCount = healthData.filter((v) => !v.isCompliant).length;
    const maintenanceCount = healthData.filter((v) => v.availabilityStatus === "maintenance").length;
    const dirtyCount = healthData.filter((v) => v.cleanlinessStatus === "Dirty").length;
    const detailingCount = healthData.filter((v) => v.cleanlinessStatus === "Detailing").length;

    // Collect all alerts
    const allAlerts = healthData.flatMap((v) => 
      v.alerts.map((a) => ({
        ...a,
        vehicleId: v.vehicleId,
        vehicleName: `${v.brand} ${v.model}`,
        registrationNumber: v.registrationNumber
      }))
    );

    return NextResponse.json({
      summary: {
        avgHealth,
        totalFASTag,
        nonCompliantCount,
        maintenanceCount,
        dirtyCount,
        detailingCount,
        totalVehicles: healthData.length
      },
      vehicles: healthData,
      alerts: allAlerts
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
