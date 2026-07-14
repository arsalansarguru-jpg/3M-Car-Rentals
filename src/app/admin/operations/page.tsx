import React from "react";
import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import OperationsCommandCenterClient from "./operations-client";

export default async function OperationsCommandCenter() {
  // Enforce admin/staff authentication on the server
  const resolved = await requireAdmin();

  // Instantiate server-side Supabase client for database query
  const supabase = await AuthService.getServerClient();

  // Fetch initial active bookings for dispatch lanes
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      user:users(first_name, last_name, phone),
      vehicle:vehicles(id, brand, model, registration_number)
    `)
    .order("pickup_datetime", { ascending: true });

  // Fetch vehicles for maintenance and cleanliness alerts
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(`
      id,
      brand,
      model,
      registration_number,
      availability_status
    `);

  // Fetch vehicle health metrics for vital logs
  const { data: vehicleHealth } = await supabase
    .from("vehicle_health")
    .select(`
      vehicle_id,
      cleanliness_status,
      current_odometer
    `);

  return (
    <OperationsCommandCenterClient 
      initialBookings={bookings || []} 
      initialVehicles={vehicles || []} 
      initialHealth={vehicleHealth || []}
    />
  );
}
