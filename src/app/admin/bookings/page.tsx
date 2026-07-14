import React from "react";
import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import BookingsCommandCenterClient from "./bookings-client";

export default async function BookingsCommandCenter() {
  // Enforce admin/staff authentication and permissions on the server
  const resolved = await requireAdmin();

  // Instantiate server-side Supabase client for database query
  const supabase = await AuthService.getServerClient();

  // Fetch bookings with joined user and vehicle profiles
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      user:users(first_name, last_name, email, phone, kyc_status),
      vehicle:vehicles(id, brand, model, registration_number, daily_rate)
    `)
    .order("created_at", { ascending: false });

  // Fetch active fleet vehicles
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, brand, model, registration_number, daily_rate");

  return (
    <BookingsCommandCenterClient 
      initialBookings={bookings || []} 
      vehicles={vehicles || []} 
    />
  );
}
