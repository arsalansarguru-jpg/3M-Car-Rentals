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

export async function PUT(req: Request) {
  const profile = await verifyAdminAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      minimumPrice,
      maximumPrice,
      maximumDailyIncrease,
      maximumDailyDecrease,
      approvalRequired,
      autoPricingEnabled,
    } = body;

    const updateData: Record<string, number | boolean> = {};
    if (minimumPrice !== undefined) updateData.minimum_price = Number(minimumPrice);
    if (maximumPrice !== undefined) updateData.maximum_price = Number(maximumPrice);
    if (maximumDailyIncrease !== undefined) updateData.maximum_daily_increase = Number(maximumDailyIncrease);
    if (maximumDailyDecrease !== undefined) updateData.maximum_daily_decrease = Number(maximumDailyDecrease);
    if (approvalRequired !== undefined) updateData.approval_required = Boolean(approvalRequired);
    if (autoPricingEnabled !== undefined) updateData.auto_pricing_enabled = Boolean(autoPricingEnabled);

    const { data, error } = await supabaseAdmin
      .from("pricing_settings")
      .update(updateData)
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const profile = await verifyAdminAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: settings, error } = await supabaseAdmin
      .from("pricing_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: rules } = await supabaseAdmin
      .from("pricing_rules")
      .select("*")
      .order("priority", { ascending: false });

    return NextResponse.json({ settings, rules });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
