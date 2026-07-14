import React from "react";
import { redirect } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { requireStaff } from "@/services/auth-helpers";
import { Logger } from "@/services/logger.service";
import MaintenanceClient from "./maintenance-client";

export default async function MaintenancePage() {
  try {
    // 1. Authenticate user, check staff privileges
    await requireStaff();
    const supabase = await AuthService.getServerClient();

    // 2. Fetch all active and completed maintenance jobs (excluding soft-deleted ones)
    const { data: jobs, error: jobsError } = await supabase
      .from("maintenance_jobs")
      .select(`
        *,
        vehicle:vehicles (
          id, registration_number, brand, model
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (jobsError) {
      Logger.error("Server component failed to load maintenance jobs list", jobsError);
    }

    // 3. Fetch list of available vehicles to populate the creation dropdown
    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id, registration_number, brand, model, availability_status")
      .is("deleted_at", null)
      .eq("availability_status", "available");

    if (vehiclesError) {
      Logger.error("Server component failed to load available vehicles dropdown telemetry", vehiclesError);
    }

    return (
      <MaintenanceClient 
        initialJobs={jobs || []} 
        availableVehicles={vehicles || []} 
      />
    );
  } catch (err) {
    Logger.error("Access denied or unexpected load failure in Maintenance page", err);
    redirect("/login?redirect=/admin/maintenance");
  }
}
