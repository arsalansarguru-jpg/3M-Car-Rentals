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
    // Fetch all vehicles
    const { data: vehicles, error: vehicleErr } = await supabaseAdmin
      .from("vehicles")
      .select(`
        id, registration_number, brand, model, daily_rate, availability_status,
        category:vehicle_categories (name)
      `)
      .order("brand", { ascending: true });

    if (vehicleErr) {
      return NextResponse.json({ error: vehicleErr.message }, { status: 500 });
    }

    // Fetch pending pricing logs
    const { data: logs, error: logErr } = await supabaseAdmin
      .from("pricing_logs")
      .select("*")
      .eq("status", "pending");

    if (logErr) {
      return NextResponse.json({ error: logErr.message }, { status: 500 });
    }

    const payload = vehicles.map((v) => {
      const pendingSuggestion = logs?.find((l) => l.vehicle_id === v.id);
      return {
        id: v.id,
        brand: v.brand,
        model: v.model,
        category: Array.isArray(v.category) 
          ? (v.category as unknown as { name: string }[])[0]?.name || "Regular" 
          : (v.category as unknown as { name: string })?.name || "Regular",
        currentPrice: Number(v.daily_rate),
        suggestedPrice: pendingSuggestion ? Number(pendingSuggestion.final_price) : Number(v.daily_rate),
        difference: pendingSuggestion ? Number(pendingSuggestion.final_price) - Number(v.daily_rate) : 0,
        reason: pendingSuggestion ? pendingSuggestion.reason : "No pending changes.",
        confidence: pendingSuggestion ? pendingSuggestion.confidence_score : 100,
        status: pendingSuggestion ? "pending" : "active",
        logId: pendingSuggestion ? pendingSuggestion.id : null,
      };
    });

    return NextResponse.json({ prices: payload });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
