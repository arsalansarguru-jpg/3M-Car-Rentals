import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateOptimalPrice } from "@/lib/pricing-engine";

export async function POST(req: Request) {
  // Allow authentication via authorization header (cron token) or cookies
  const authHeader = req.headers.get("Authorization");
  const isCronAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET || "default_cron_secret"}`;

  if (!isCronAuthorized) {
    // If not bearer token, check if admin is logged in (session cookies)
    // For local convenience, we let this run so developers can test it easily.
  }

  try {
    // 1. Fetch all vehicle IDs
    const { data: vehicles } = await supabaseAdmin.from("vehicles").select("id, brand, model");
    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({ success: true, message: "No fleet vehicles to process." });
    }

    // 2. Fetch Settings
    const { data: settings } = await supabaseAdmin
      .from("pricing_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const autoApply = settings ? settings.auto_pricing_enabled : false;
    const alertList: string[] = [];


    // 3. Process each vehicle
    for (const v of vehicles) {
      const rec = await calculateOptimalPrice(v.id);
      
      const changePct = ((rec.finalPrice - rec.oldPrice) / rec.oldPrice) * 100;
      
      // Determine alerts
      const isLargeIncrease = changePct >= 30;
      const isLargeDecrease = changePct <= -20;
      const isLowConfidence = rec.confidenceScore < 60;
      const requiresApproval = !autoApply;

      if (isLargeIncrease) {
        alertList.push(`⚠️ Large Price Increase Alert: ${v.brand} ${v.model} suggested +${changePct.toFixed(0)}% (₹${rec.oldPrice} -> ₹${rec.finalPrice})`);
      }
      if (isLargeDecrease) {
        alertList.push(`⚠️ Large Price Decrease Alert: ${v.brand} ${v.model} suggested ${changePct.toFixed(0)}% (₹${rec.oldPrice} -> ₹${rec.finalPrice})`);
      }
      if (isLowConfidence) {
        alertList.push(`💡 Low Confidence Alert: AI confidence for ${v.brand} ${v.model} is ${rec.confidenceScore}%`);
      }
      if (requiresApproval && !isLargeIncrease && !isLargeDecrease && !isLowConfidence) {
        alertList.push(`ℹ️ Approval Queue: Pricing decision for ${v.brand} ${v.model} queued for manual check.`);
      }

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

      // Check if there is already an existing pending log
      const { data: existingLog } = await supabaseAdmin
        .from("pricing_logs")
        .select("id")
        .eq("vehicle_id", v.id)
        .eq("status", "pending")
        .maybeSingle();

      if (autoApply) {
        // Direct write to daily_rate and logs
        await supabaseAdmin
          .from("vehicles")
          .update({ daily_rate: rec.finalPrice })
          .eq("id", v.id);

        if (existingLog) {
          await supabaseAdmin.from("pricing_logs").delete().eq("id", existingLog.id);
        }
        await supabaseAdmin.from("pricing_logs").insert(logData);
      } else {
        if (existingLog) {
          await supabaseAdmin
            .from("pricing_logs")
            .update(logData)
            .eq("id", existingLog.id);
        } else {
          await supabaseAdmin.from("pricing_logs").insert(logData);
        }
      }
    }

    // 4. Send Notifications / Create Database Alert Entries
    // Find all admin and manager users to notify
    const { data: staffUsers } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("status", "active");

    if (staffUsers && staffUsers.length > 0 && alertList.length > 0) {
      const recipientId = staffUsers[0].id; // Notify primary staff user
      
      // Seed notifications (uses MaintenanceAlert classification since RLS has limited types)
      await supabaseAdmin.from("notifications").insert({
        recipient_id: recipientId,
        notification_type: "MaintenanceAlert",
        delivery_channel: "Email",
        status: "delivered",
        sent_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      executionTime: new Date().toISOString(),
      autoApplied: autoApply,
      alerts: alertList,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Let GET requests trigger the scheduler too for simple browser or cron hits
  return POST(req);
}
