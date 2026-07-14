import React from "react";
import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import CustomersDashboardClient from "./customers-client";

export default async function CustomersDashboard() {
  // Enforce admin/staff authentication on the server
  const resolved = await requireAdmin();

  // Instantiate server-side Supabase client for database query
  const supabase = await AuthService.getServerClient();

  // Fetch all users with the customer role
  const { data: customers } = await supabase
    .from("users")
    .select(`
      *,
      role:roles!inner(name)
    `)
    .eq("role.name", "customer")
    .order("created_at", { ascending: false });

  // Fetch all bookings to calculate customer-level metrics and stats
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, user_id, booking_status, total_amount");

  return (
    <CustomersDashboardClient 
      initialCustomers={customers || []} 
      bookings={bookings || []} 
    />
  );
}
