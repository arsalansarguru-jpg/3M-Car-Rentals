import React from "react";
import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import FinanceDashboardClient from "./finance-client";

export default async function FinanceDashboard() {
  // Enforce admin/staff authentication on the server
  const resolved = await requireAdmin();

  // Instantiate server-side Supabase client for database query
  const supabase = await AuthService.getServerClient();

  // Fetch all payment transactions with joined booking and user info
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      booking:bookings(
        booking_reference,
        deposit_amount,
        payment_status,
        user:users(first_name, last_name, email)
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch all bookings for deposit, balance, and status tracking
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_reference, booking_status, payment_status, total_amount, deposit_amount");

  return (
    <FinanceDashboardClient 
      initialPayments={payments || []} 
      bookings={bookings || []} 
    />
  );
}
