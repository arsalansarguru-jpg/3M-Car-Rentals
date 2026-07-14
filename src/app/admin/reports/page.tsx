import React from "react";
import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import BusinessIntelligenceDashboardClient from "./reports-client";

export default async function BusinessIntelligenceDashboard() {
  // Enforce admin/staff authorization on the server
  const resolved = await requireAdmin();

  // Instantiate server-side Supabase client for database query
  const supabase = await AuthService.getServerClient();

  // Fetch all bookings (excluding cancelled ones for cleaner operational revenue)
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      vehicle:vehicles(
        category:vehicle_categories(name)
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch all user registrations with the customer role
  const { data: customers } = await supabase
    .from("users")
    .select(`
      id,
      created_at,
      role:roles!inner(name)
    `)
    .eq("role.name", "customer");

  // Fetch all fleet vehicles
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, daily_rate");

  return (
    <BusinessIntelligenceDashboardClient 
      bookings={bookings || []} 
      customers={customers || []}
      vehicles={vehicles || []}
    />
  );
}
