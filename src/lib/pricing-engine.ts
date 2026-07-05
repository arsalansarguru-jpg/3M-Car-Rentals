import { supabaseAdmin } from "./supabase-admin";

export interface PricingRecommendation {
  vehicleId: string;
  brand: string;
  model: string;
  basePrice: number;
  oldPrice: number;
  newPrice: number;
  finalPrice: number;
  utilization: number;
  demandScore: number;
  seasonName: string;
  holidayName: string;
  reason: string;
  confidenceScore: number;
  status: "pending" | "auto_applied";
}

// Helper to check if a date is within a season (ignoring year or handling boundary wraps)
function isDateInSeason(date: Date, start: Date, end: Date): boolean {
  const d = new Date(2026, date.getMonth(), date.getDate()).getTime();
  const s = new Date(2026, start.getMonth(), start.getDate()).getTime();
  const e = new Date(2026, end.getMonth(), end.getDate()).getTime();

  if (s <= e) {
    return d >= s && d <= e;
  } else {
    // Wraps around new year (e.g. Nov 1 to Jan 31)
    return d >= s || d <= e;
  }
}

export async function calculateOptimalPrice(vehicleId: string): Promise<PricingRecommendation> {
  // 1. Fetch Vehicle and Category
  const { data: vehicle, error: vehicleErr } = await supabaseAdmin
    .from("vehicles")
    .select(`
      id, brand, model, daily_rate, category_id, created_at,
      category:vehicle_categories(name)
    `)
    .eq("id", vehicleId)
    .single();

  if (vehicleErr || !vehicle) {
    throw new Error(`Vehicle not found: ${vehicleErr?.message || "unknown"}`);
  }

  // 2. Fetch Active Pricing Settings
  const { data: settings } = await supabaseAdmin
    .from("pricing_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const minPrice = settings ? Number(settings.minimum_price) : 500;
  const maxPrice = settings ? Number(settings.maximum_price) : 50000;
  const maxIncreasePct = settings ? Number(settings.maximum_daily_increase) : 50;
  const maxDecreasePct = settings ? Number(settings.maximum_daily_decrease) : 50;
  const approvalRequired = settings ? settings.approval_required : true;

  // 3. Fetch Active Rules
  const { data: rules } = await supabaseAdmin
    .from("pricing_rules")
    .select("*")
    .eq("active", true);

  // 4. Fetch Bookings for Utilization Calculation (30 day window)
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("pickup_datetime, return_datetime, booking_status, created_at, payment_status")
    .eq("vehicle_id", vehicleId)
    .neq("booking_status", "cancelled");

  // Calculate booked days within the next 30 days
  let bookedDays = 0;
  const tStart = today.getTime();
  const tEnd = thirtyDaysLater.getTime();

  if (bookings && bookings.length > 0) {
    bookings.forEach((b) => {
      const p = new Date(b.pickup_datetime).getTime();
      const r = new Date(b.return_datetime).getTime();
      
      // Calculate overlap with the [today, today + 30] interval
      const overlapStart = Math.max(tStart, p);
      const overlapEnd = Math.min(tEnd, r);
      
      if (overlapEnd > overlapStart) {
        bookedDays += (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24);
      }
    });
  }

  const utilization = Math.min(100, Math.max(0, (bookedDays / 30) * 100));

  // 5. Calculate Demand Score (0-100)
  // Factors: Bookings volume, rating counts, pending reviews, incomplete checkouts
  const bookingsToday = bookings?.filter((b) => {
    const created = new Date(b.created_at).getTime();
    return tStart - created <= 24 * 60 * 60 * 1000;
  }).length || 0;

  const bookingsYesterday = bookings?.filter((b) => {
    const created = new Date(b.created_at).getTime();
    const diff = tStart - created;
    return diff > 24 * 60 * 60 * 1000 && diff <= 48 * 60 * 60 * 1000;
  }).length || 0;

  const bookingsThisWeek = bookings?.filter((b) => {
    const created = new Date(b.created_at).getTime();
    return tStart - created <= 7 * 24 * 60 * 60 * 1000;
  }).length || 0;

  const incompleteBookings = bookings?.filter((b) => b.booking_status === "pending").length || 0;
  const pendingPayments = bookings?.filter((b) => b.payment_status === "unpaid" && b.booking_status !== "cancelled").length || 0;

  // Rating and popularity factors
  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("vehicle_id", vehicleId);

  const ratingsCount = reviews?.length || 0;
  const avgRating = (reviews && ratingsCount > 0) ? reviews.reduce((sum, r: { rating: number }) => sum + r.rating, 0) / ratingsCount : 4.0;

  const categoryStr = Array.isArray(vehicle.category)
    ? (vehicle.category as any)[0]?.name || ""
    : (vehicle.category as any)?.name || "";
  const isLuxury = categoryStr.toLowerCase().includes("luxury") || categoryStr.toLowerCase().includes("premium");
  const baseViews = isLuxury ? 45 : 25;
  const viewBoost = bookingsThisWeek * 8 + ratingsCount * 3;
  const simulatedViews = baseViews + viewBoost;

  // Compute Demand Score
  const rawDemand = (bookingsToday * 30) + (bookingsYesterday * 15) + (bookingsThisWeek * 8) + (incompleteBookings * 5) + (pendingPayments * 5) + (simulatedViews * 0.2);
  const demandScore = Math.min(100, Math.max(10, Math.round(rawDemand)));

  // 6. Match Season
  const { data: seasons } = await supabaseAdmin.from("seasons").select("*");
  let activeSeasonName = "Regular Season";
  let seasonMultiplier = 1.0;

  if (seasons) {
    for (const s of seasons) {
      if (isDateInSeason(today, new Date(s.start_date), new Date(s.end_date))) {
        activeSeasonName = s.season_name;
        seasonMultiplier = Number(s.multiplier);
        break;
      }
    }
  }

  // 7. Match Holiday
  const todayDateStr = today.toISOString().split("T")[0];
  const { data: holidayMatch } = await supabaseAdmin
    .from("holidays")
    .select("holiday_name, pricing_multiplier")
    .eq("date", todayDateStr)
    .maybeSingle();

  const activeHolidayName = holidayMatch ? holidayMatch.holiday_name : "None";
  const holidayMultiplier = holidayMatch ? Number(holidayMatch.pricing_multiplier) : 1.0;

  // 8. Weekend Adjustment
  const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  let weekendPct = 0;
  if (dayOfWeek === 5) {
    weekendPct = Number(rules?.find((r) => r.rule_name === "Weekend Premium Friday")?.adjustment_value || 5);
  } else if (dayOfWeek === 6) {
    weekendPct = Number(rules?.find((r) => r.rule_name === "Weekend Premium Saturday")?.adjustment_value || 10);
  } else if (dayOfWeek === 0) {
    weekendPct = Number(rules?.find((r) => r.rule_name === "Weekend Premium Sunday")?.adjustment_value || 8);
  }

  // 9. Lead Time Adjustment
  // Suggesting next day booking as the baseline calculation (Lead time = 1 day)
  const leadTimePct = Number(rules?.find((r) => r.rule_name === "Last Minute Booking (<24h)")?.adjustment_value || 10);

  // 10. Popularity Adjustment
  const isPopular = ratingsCount >= 3 && avgRating >= 4.5;
  const isUnpopular = ratingsCount > 0 && avgRating < 3.5;
  let popularityPct = 0;
  if (isPopular) {
    popularityPct = Number(rules?.find((r) => r.rule_name === "High Popularity Vehicle Rating")?.adjustment_value || 5);
  } else if (isUnpopular) {
    popularityPct = Number(rules?.find((r) => r.rule_name === "Low Popularity Vehicle Promo")?.adjustment_value || -5);
  }

  // 11. Utilization Adjustment
  let utilizationPct = 0;
  if (utilization > 90) {
    utilizationPct = Number(rules?.find((r) => r.rule_name === "Utilization High (>90%)")?.adjustment_value || 15);
  } else if (utilization >= 80) {
    utilizationPct = Number(rules?.find((r) => r.rule_name === "Utilization Normal-High (80-90%)")?.adjustment_value || 5);
  } else if (utilization >= 40 && utilization < 60) {
    utilizationPct = Number(rules?.find((r) => r.rule_name === "Utilization Normal-Low (40-60%)")?.adjustment_value || -5);
  } else if (utilization < 40) {
    utilizationPct = Number(rules?.find((r) => r.rule_name === "Utilization Low (<40%)")?.adjustment_value || -15);
  }

  // 12. Calculate Final Multiplier
  const seasonPct = (seasonMultiplier - 1.0) * 100;
  const holidayPct = (holidayMultiplier - 1.0) * 100;
  
  const totalAdjustmentPct = weekendPct + leadTimePct + popularityPct + utilizationPct + seasonPct + holidayPct;
  const totalMultiplier = 1.0 + totalAdjustmentPct / 100;

  const basePrice = Number(vehicle.daily_rate);
  const rawFinalPrice = basePrice * totalMultiplier;

  // 13. Apply Safety Rules
  // Limit daily price fluctuation
  const oldPrice = Number(vehicle.daily_rate);
  let finalPrice = rawFinalPrice;

  const maxAllowedPrice = oldPrice * (1 + maxIncreasePct / 100);
  const minAllowedPrice = oldPrice * (1 - maxDecreasePct / 100);

  if (finalPrice > maxAllowedPrice) {
    finalPrice = maxAllowedPrice;
  }
  if (finalPrice < minAllowedPrice) {
    finalPrice = minAllowedPrice;
  }

  // Limit absolute boundaries
  if (finalPrice > maxPrice) {
    finalPrice = maxPrice;
  }
  if (finalPrice < minPrice) {
    finalPrice = minPrice;
  }

  // Round to nearest 100 INR
  finalPrice = Math.round(finalPrice / 100) * 100;

  // Ensure absolute bounds again after rounding
  finalPrice = Math.max(minPrice, Math.min(maxPrice, finalPrice));

  // 14. Confidence Score (0-100)
  // Grade confidence on data volume (ratingsCount, bookingsCount, demand certainty)
  const bookingsCount = bookings?.length || 0;
  const confidenceScore = Math.min(100, Math.max(30, 40 + (bookingsCount * 3) + (ratingsCount * 5)));

  // Generate detailed reasoning log
  const reasonParts = [];
  if (seasonMultiplier !== 1.0) {
    reasonParts.push(`${activeSeasonName} (${seasonMultiplier > 1 ? "+" : ""}${Math.round(seasonPct)}%)`);
  }
  if (holidayMultiplier !== 1.0) {
    reasonParts.push(`${activeHolidayName} (${holidayMultiplier > 1 ? "+" : ""}${Math.round(holidayPct)}%)`);
  }
  if (utilizationPct !== 0) {
    reasonParts.push(`Utilization ${utilization.toFixed(0)}% (${utilizationPct > 0 ? "+" : ""}${utilizationPct}%)`);
  }
  if (weekendPct !== 0) {
    reasonParts.push(`Weekend Rate (${weekendPct > 0 ? "+" : ""}${weekendPct}%)`);
  }
  if (popularityPct !== 0) {
    reasonParts.push(`Popularity boost (${popularityPct > 0 ? "+" : ""}${popularityPct}%)`);
  }
  if (leadTimePct !== 0) {
    reasonParts.push(`Next-day lead adjustment (${leadTimePct > 0 ? "+" : ""}${leadTimePct}%)`);
  }

  const reason = reasonParts.length > 0 
    ? `Adjusted for: ${reasonParts.join(", ")}.` 
    : "Maintained base rate (no active adjustments).";

  const status = approvalRequired ? "pending" : "auto_applied";

  return {
    vehicleId: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    basePrice,
    oldPrice,
    newPrice: finalPrice,
    finalPrice,
    utilization,
    demandScore,
    seasonName: activeSeasonName,
    holidayName: activeHolidayName,
    reason,
    confidenceScore,
    status,
  };
}

export async function applyPricingRecommendation(logId: string, approvedByUserId: string): Promise<boolean> {
  // Fetch pricing log
  const { data: log } = await supabaseAdmin
    .from("pricing_logs")
    .select("*")
    .eq("id", logId)
    .single();

  if (!log || log.status !== "pending") {
    return false;
  }

  // Update vehicle daily_rate
  const { error: vehicleErr } = await supabaseAdmin
    .from("vehicles")
    .update({ daily_rate: log.final_price })
    .eq("id", log.vehicle_id);

  if (vehicleErr) {
    throw new Error(`Failed to update vehicle rate: ${vehicleErr.message}`);
  }

  // Update pricing log status
  const { error: logErr } = await supabaseAdmin
    .from("pricing_logs")
    .update({
      status: "approved",
      approved_by: approvedByUserId,
    })
    .eq("id", logId);

  if (logErr) {
    throw new Error(`Failed to update pricing log: ${logErr.message}`);
  }

  return true;
}
