import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function verifyAdminAccess() {
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
  
  if (["admin", "super_admin", "manager", "revenue_manager"].includes(roleName)) {
    return profile;
  }
  return null;
}

export async function GET() {
  const profile = await verifyAdminAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: logs, error } = await supabaseAdmin
      .from("pricing_logs")
      .select(`
        *,
        vehicle:vehicles (brand, model, registration_number),
        approver:users (first_name, last_name)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const auditTrail = logs?.map((l) => ({
      id: l.id,
      timestamp: l.created_at,
      vehicle: l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} (${l.vehicle.registration_number})` : "Deleted Vehicle",
      oldPrice: Number(l.old_price),
      newPrice: Number(l.new_price),
      reason: l.reason,
      confidence: l.confidence_score,
      user: l.approver ? `${l.approver.first_name} ${l.approver.last_name}` : l.status === "auto_applied" ? "System AI" : "—",
      status: l.status,
    })) || [];

    return NextResponse.json({ history: auditTrail });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
