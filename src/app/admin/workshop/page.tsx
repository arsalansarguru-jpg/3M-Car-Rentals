import React from "react";
import { redirect } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { requireStaff } from "@/services/auth-helpers";
import { Logger } from "@/services/logger.service";
import WorkshopClient from "./workshop-client";

export default async function WorkshopPage() {
  try {
    // 1. Authenticate user, check staff privileges
    await requireStaff();
    const supabase = await AuthService.getServerClient();

    // 2. Fetch all queued and active workshop jobs
    const { data: queue, error: queueError } = await supabase
      .from("workshop_jobs")
      .select(`
        *,
        maintenance:maintenance_jobs (
          id,
          job_number,
          trigger_type,
          priority,
          description,
          vehicle:vehicles (
            id, registration_number, brand, model
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (queueError) {
      Logger.error("Server component failed to load workshop queue", queueError);
    }

    // 3. Fetch list of users (staff/technicians) to allocate jobs to
    const { data: staff, error: staffError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name");

    if (staffError) {
      Logger.error("Server component failed to load staff records", staffError);
    }

    return (
      <WorkshopClient 
        initialQueue={queue || []} 
        staffList={staff || []} 
      />
    );
  } catch (err) {
    Logger.error("Access denied or unexpected load failure in Workshop page", err);
    redirect("/login?redirect=/admin/workshop");
  }
}
