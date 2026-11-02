import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { PreventiveMaintenanceService } from "@/services/maintenance/preventive.service";

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
    const { vehicleId, odometer } = await req.json();

    if (!vehicleId || odometer === undefined) {
      return NextResponse.json({ error: "Missing required fields vehicleId or odometer" }, { status: 400 });
    }

    const result = await PreventiveMaintenanceService.updateOdometerAndEvaluate(
      vehicleId,
      Number(odometer),
      profile.email
    );

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
