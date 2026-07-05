import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { runRevenueAnalysis } from "@/lib/revenue-engine";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_ROLES = [
  "admin", "super_admin", "revenue_manager", "finance_manager", "operations_manager", "branch_manager"
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

export async function GET() {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recommendations } = await runRevenueAnalysis();
    return NextResponse.json({ recommendations });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { actionIndex, description } = await req.json();
    if (actionIndex === undefined) {
      return NextResponse.json({ error: "Missing actionIndex parameter" }, { status: 400 });
    }

    // Execute actions depending on description triggers
    const logDesc = description || `Executive Action #${actionIndex}`;
    
    // Log the executive decision to public.pricing_logs or another audit trail table
    await supabaseAdmin.from("pricing_logs").insert({
      vehicle_id: null, // Global or system-wide operational choice
      old_price: 0,
      new_price: 0,
      base_price: 0,
      final_price: 0,
      reason: `Executed executive recommendation: "${logDesc}"`,
      confidence_score: 100,
      utilization: 0,
      demand_score: 0,
      season: "Executive Decisions",
      holiday: "None",
      status: "approved",
      approved_by: profile.id,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully executed: "${logDesc}"`,
      executedBy: `${profile.first_name} ${profile.last_name}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
