import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const ALLOWED_ROLES = [
  "admin", "super_admin", "revenue_manager", "finance_manager"
];

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

// In-memory fallback config database cache (for rapid developer deployments)
let localSettings = {
  occupancyAlertMin: 40,
  utilizationAlertMax: 95,
  idleDaysThreshold: 10,
  emailAlertTargets: "ops-alerts@3mrentals.com, revenue@3mrentals.com",
  automatedUpgrades: true,
};

export async function GET() {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ settings: localSettings });
}

export async function PUT(req: Request) {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    localSettings = {
      ...localSettings,
      ...body,
    };
    return NextResponse.json({ success: true, settings: localSettings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
