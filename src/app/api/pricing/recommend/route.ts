import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateOptimalPrice } from "@/lib/pricing-engine";

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

export async function POST() {
  const profile = await verifyAdminAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch all vehicle IDs
    const { data: vehicles, error: vehicleErr } = await supabaseAdmin
      .from("vehicles")
      .select("id");

    if (vehicleErr) {
      return NextResponse.json({ error: vehicleErr.message }, { status: 500 });
    }

    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No vehicles in fleet." });
    }

    // 2. Fetch Pricing Settings to check auto-apply
    const { data: settings } = await supabaseAdmin
      .from("pricing_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const autoApply = settings ? settings.auto_pricing_enabled : false;

    const recommendations = [];
    
    // 3. Generate recommendations for every vehicle
    for (const v of vehicles) {
      const rec = await calculateOptimalPrice(v.id);
      recommendations.push(rec);

      // Check if there is already an existing pending log for this vehicle
      const { data: existingLog } = await supabaseAdmin
        .from("pricing_logs")
        .select("id")
        .eq("vehicle_id", v.id)
        .eq("status", "pending")
        .maybeSingle();

      const logData = {
        vehicle_id: rec.vehicleId,
        old_price: rec.oldPrice,
        new_price: rec.newPrice,
        base_price: rec.basePrice,
        final_price: rec.finalPrice,
        reason: rec.reason,
        confidence_score: rec.confidenceScore,
        utilization: rec.utilization,
        demand_score: rec.demandScore,
        season: rec.seasonName,
        holiday: rec.holidayName,
        status: autoApply ? "auto_applied" : "pending",
      };

      if (autoApply) {
        // Direct write to daily_rate and logs
        await supabaseAdmin
          .from("vehicles")
          .update({ daily_rate: rec.finalPrice })
          .eq("id", v.id);

        if (existingLog) {
          // Resolve pending suggestions
          await supabaseAdmin.from("pricing_logs").delete().eq("id", existingLog.id);
        }

        await supabaseAdmin.from("pricing_logs").insert(logData);
      } else {
        if (existingLog) {
          // Update the pending suggestion in-place
          await supabaseAdmin
            .from("pricing_logs")
            .update(logData)
            .eq("id", existingLog.id);
        } else {
          // Insert a new pending suggestion
          await supabaseAdmin.from("pricing_logs").insert(logData);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      autoApplied: autoApply,
      recommendations,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
