import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
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

export async function POST(req: Request) {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { triggerType, message } = await req.json();
    if (!triggerType || !message) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Query active staff members to receive the system alert
    const { data: staffList } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("status", "active")
      .limit(3);

    if (staffList && staffList.length > 0) {
      // Seed alert notifications under 'MaintenanceAlert' type constraints
      await Promise.all(
        staffList.map((s) =>
          supabaseAdmin.from("notifications").insert({
            recipient_id: s.id,
            notification_type: "MaintenanceAlert",
            delivery_channel: "Email",
            status: "delivered",
            sent_at: new Date().toISOString(),
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      logged: true,
      alertMessage: `[ALERT TRIGGERED]: type=${triggerType} message="${message}"`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
