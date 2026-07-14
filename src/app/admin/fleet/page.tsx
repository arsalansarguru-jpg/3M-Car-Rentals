import React from "react";
import { requireAdmin } from "@/services/auth-helpers";
import { AuthService } from "@/services/auth.service";
import { 
  getAllVehicles, 
  getVehicleCounts, 
  getAvailabilityCounts, 
  getMaintenanceCounts, 
  getDetailingCounts, 
  getInactiveVehicles 
} from "@/services/fleet.service";
import FleetClient from "./fleet-client";

export default async function FleetDashboardPage() {
  // 1. Protect path using requireAdmin() on the server
  await requireAdmin();

  // Instantiate server-side Supabase client to fetch health metrics
  const supabase = await AuthService.getServerClient();
  const { data: healthList } = await supabase
    .from("vehicle_health")
    .select("vehicle_id, cleanliness_status, current_odometer");

  // 2. Fetch fleet summary metrics from FleetService
  const totalCount = await getVehicleCounts();
  const availableCount = await getAvailabilityCounts();
  const maintenanceCount = await getMaintenanceCounts();
  const detailingCount = await getDetailingCounts();
  const inactiveVehicles = await getInactiveVehicles();
  const inactiveCount = inactiveVehicles.length;

  // 3. Fetch all vehicles catalog
  const rawVehicles = await getAllVehicles();

  // Map health metrics (cleanliness and odometer) onto each vehicle
  const vehicles = (rawVehicles || []).map((v: any) => {
    const health = (healthList || []).find((h: any) => h.vehicle_id === v.id);
    return {
      ...v,
      cleanliness_status: health?.cleanliness_status || "Clean",
      current_odometer: health?.current_odometer || 0
    };
  });

  // 4. Pass datasets to the Client presenter
  return (
    <FleetClient 
      vehicles={vehicles as any[]}
      summary={{
        total: totalCount,
        available: availableCount,
        maintenance: maintenanceCount,
        detailing: detailingCount,
        inactive: inactiveCount
      }}
    />
  );
}
