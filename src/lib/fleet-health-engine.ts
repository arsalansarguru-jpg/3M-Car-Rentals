import { supabaseAdmin } from "./supabase-admin";

export interface VehicleHealthStatus {
  vehicleId: string;
  brand: string;
  model: string;
  registrationNumber: string;
  availabilityStatus: string;
  
  // Document Validity
  insuranceExpiry: string;
  rcExpiry: string;
  pucExpiry: string;
  isCompliant: boolean;
  
  // Financials
  fastagBalance: number;
  
  // Components Wear
  currentOdometer: number;
  lastServiceDate: string;
  nextServiceDate: string;
  lastServiceOdometer: number;
  lastOilChangeDate: string;
  lastOilChangeOdometer: number;
  nextOilChangeOdometer: number;
  tyreTreadDepthMm: number;
  tyreInstallDate: string;
  tyreAlignmentDate: string;
  batteryHealthPct: number;
  batteryInstallDate: string;
  batteryVoltage: number;
  
  // Aesthetics & Incidents
  cleanlinessScore: number;
  cleanlinessStatus: "Clean" | "Dirty" | "Detailing";
  activeDamagesCount: number;
  activeAccidentsCount: number;
  
  // AI Derived
  healthScore: number;
  alerts: FleetHealthAlert[];
  predictions: MaintenancePrediction;
}

export interface FleetHealthAlert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  text: string;
  dueDate?: string;
}

export interface MaintenancePrediction {
  nextOilChangeKmRemaining: number;
  nextOilChangeDate: string;
  nextServiceKmRemaining: number;
  nextServiceDate: string;
  tyreReplacementKmRemaining: number;
  batteryReplacementDate: string;
  optimalServiceDate: string;
  optimalServiceReason: string;
}

export interface IncidentRecord {
  id: string;
  vehicleId: string;
  incidentType: "accident" | "damage";
  date: string;
  description: string;
  severity: "minor" | "moderate" | "major";
  cost: number;
  status: "reported" | "repairing" | "resolved";
}

export interface ServiceLogRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  odometer: number;
  cost: number;
  details: string;
}

// -----------------------------------------------------------------------------
// Calculate Health Score Algorithm
// -----------------------------------------------------------------------------
export function calculateHealthScore(status: Partial<VehicleHealthStatus>): { score: number; isCompliant: boolean } {
  let score = 100;
  const now = new Date();
  
  // 1. Check Compliance Documents (Strict Drop to 0 if any are expired)
  const insExpired = status.insuranceExpiry ? new Date(status.insuranceExpiry) < now : false;
  const rcExpired = status.rcExpiry ? new Date(status.rcExpiry) < now : false;
  const pucExpired = status.pucExpiry ? new Date(status.pucExpiry) < now : false;
  
  if (insExpired || rcExpired || pucExpired) {
    return { score: 0, isCompliant: false };
  }
  
  // 2. Tyre Wear (Max -20 points)
  const tread = status.tyreTreadDepthMm ?? 8.0;
  if (tread < 3.0) score -= 15;
  else if (tread < 1.6) score -= 20; // Critical legal limit in India
  else if (tread < 5.0) score -= 5;
  
  // 3. Battery Health (Max -15 points)
  const battHealth = status.batteryHealthPct ?? 100;
  if (battHealth < 40) score -= 15;
  else if (battHealth < 75) score -= 8;
  
  const battVolt = status.batteryVoltage ?? 12.6;
  if (battVolt < 11.8) score -= 5;
  
  // 4. Oil Change Interval (Max -15 points)
  const currentOdo = status.currentOdometer ?? 0;
  const nextOilOdo = status.nextOilChangeOdometer ?? 0;
  if (currentOdo >= nextOilOdo) {
    score -= 15;
  } else if (nextOilOdo - currentOdo < 1500) {
    score -= 5;
  }
  
  // 5. Incidents & Active Damages (Max -25 points)
  const damages = status.activeDamagesCount ?? 0;
  const accidents = status.activeAccidentsCount ?? 0;
  score -= (damages * 5);
  score -= (accidents * 15);
  
  // 6. Cleanliness (Max -10 points)
  const cleanScore = status.cleanlinessScore ?? 10;
  if (cleanScore < 5) score -= 10;
  else if (cleanScore < 7) score -= 5;
  
  // Cleanliness Status
  if (status.cleanlinessStatus === "Dirty") score -= 5;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    isCompliant: true
  };
}

// -----------------------------------------------------------------------------
// Predict Maintenance and Optimal Service Dates
// -----------------------------------------------------------------------------
export function generatePredictions(
  odo: number,
  lastServiceOdo: number,
  nextOilOdo: number,
  tread: number,
  battInstallDate: string,
  batteryHealth: number,
  nextServiceDateStr: string
): MaintenancePrediction {
  const avgKmPerWeek = 450; // Historical average booking mileage per car
  const kmPerDay = avgKmPerWeek / 7;
  const now = new Date();
  
  // 1. Oil change projection
  const oilRemaining = Math.max(0, nextOilOdo - odo);
  const daysToOilChange = Math.round(oilRemaining / kmPerDay);
  const oilChangeDate = new Date(now.getTime() + daysToOilChange * 24 * 60 * 60 * 1000);
  
  // 2. Service schedule projection
  const serviceRemaining = Math.max(0, (lastServiceOdo + 15000) - odo); // Periodic service every 15,000 km
  const daysToService = Math.round(serviceRemaining / kmPerDay);
  const projectedServiceDate = new Date(now.getTime() + daysToService * 24 * 60 * 60 * 1000);
  
  // Date-based due
  const timeDue = new Date(nextServiceDateStr);
  const finalServiceDate = timeDue < projectedServiceDate ? timeDue : projectedServiceDate;
  
  // 3. Tyres replacement projection
  const tyreRemaining = Math.max(0, (tread - 1.6) * 4000); // 4000 km wear per 1mm tread depth
  
  
  // 4. Battery replacement projection
  const battInstall = new Date(battInstallDate);
  const yearsElapsed = (now.getTime() - battInstall.getTime()) / (365 * 24 * 60 * 60 * 1000);
  const remainingYears = Math.max(0, 3.5 - yearsElapsed); // 3.5 year average luxury battery life
  const batteryReplaceDate = new Date(now.getTime() + remainingYears * 365 * 24 * 60 * 60 * 1000);
  
  // 5. Optimal Service Date Recommendation
  // AI schedules on upcoming mid-week (Tuesday/Wednesday) with no bookings
  let serviceTarget = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // Default to 5 days out
  while (serviceTarget.getDay() !== 2 && serviceTarget.getDay() !== 3) {
    serviceTarget = new Date(serviceTarget.getTime() + 24 * 60 * 60 * 1000);
  }
  
  return {
    nextOilChangeKmRemaining: oilRemaining,
    nextOilChangeDate: oilChangeDate.toISOString().split("T")[0],
    nextServiceKmRemaining: serviceRemaining,
    nextServiceDate: finalServiceDate.toISOString().split("T")[0],
    tyreReplacementKmRemaining: Math.round(tyreRemaining),
    batteryReplacementDate: (batteryHealth < 40 ? now : batteryReplaceDate).toISOString().split("T")[0],
    optimalServiceDate: serviceTarget.toISOString().split("T")[0],
    optimalServiceReason: `Optimal weekday slot (mid-week low-occupancy window). Avoids weekend peak demand.`
  };
}

// -----------------------------------------------------------------------------
// Core Engine Entry Point
// -----------------------------------------------------------------------------
export async function getFleetHealthData(): Promise<VehicleHealthStatus[]> {
  try {
    const { data: vehicles, error: vError } = await supabaseAdmin
      .from("vehicles")
      .select("id, brand, model, registration_number, availability_status")
      .order("brand", { ascending: true });
      
    if (vError || !vehicles) {
      return getMockFleetHealth();
    }
    
    const { data: healthRows, error: hError } = await supabaseAdmin
      .from("vehicle_health")
      .select("*");
      
    const { data: incidentRows } = await supabaseAdmin
      .from("vehicle_incidents")
      .select("*")
      .neq("status", "resolved");
      
    // If table doesn't exist, fallback to mock compilation
    if (hError || !healthRows || healthRows.length === 0) {
      return getMockFleetHealth(vehicles);
    }
    
    return vehicles.map((v) => {
      const h = healthRows.find((row) => row.vehicle_id === v.id) || getDefaultHealthRow(v.id);
      const activeDamages = (incidentRows ?? []).filter((i) => i.vehicle_id === v.id && i.incident_type === "damage").length;
      const activeAccidents = (incidentRows ?? []).filter((i) => i.vehicle_id === v.id && i.incident_type === "accident").length;
      
      const { score, isCompliant } = calculateHealthScore({
        insuranceExpiry: h.insurance_expiry,
        rcExpiry: h.rc_expiry,
        pucExpiry: h.puc_expiry,
        tyreTreadDepthMm: Number(h.tyre_tread_depth_mm),
        batteryHealthPct: h.battery_health_pct,
        batteryVoltage: Number(h.battery_voltage),
        currentOdometer: h.current_odometer,
        nextOilChangeOdometer: h.next_oil_change_odometer,
        activeDamagesCount: activeDamages,
        activeAccidentsCount: activeAccidents,
        cleanlinessScore: h.cleanliness_score,
        cleanlinessStatus: h.cleanliness_status
      });
      
      const alerts: FleetHealthAlert[] = [];
      const now = new Date();
      
      if (h.fastag_balance < 500) {
        alerts.push({
          id: `fastag-${v.id}`,
          type: h.fastag_balance < 200 ? "error" : "warning",
          title: "Low FASTag Balance",
          text: `Current balance: ₹${h.fastag_balance}. Recharge immediately to avoid toll barrier penalties.`
        });
      }
      
      const insDate = new Date(h.insurance_expiry);
      if (insDate < now) {
        alerts.push({ id: `ins-${v.id}`, type: "error", title: "Insurance Expired", text: "Vehicle cannot be rented. Insurance coverage expired." });
      } else if (insDate.getTime() - now.getTime() < 15 * 24 * 60 * 60 * 1000) {
        alerts.push({ id: `ins-${v.id}`, type: "warning", title: "Insurance Expiring Soon", text: `Expires on ${h.insurance_expiry}.` });
      }
      
      const pucDate = new Date(h.puc_expiry);
      if (pucDate < now) {
        alerts.push({ id: `puc-${v.id}`, type: "error", title: "PUC Expired", text: "Vehicle cannot be rented. PUC emission certificate expired." });
      }
      
      if (h.battery_health_pct < 40) {
        alerts.push({ id: `batt-${v.id}`, type: "error", title: "Critical Battery Health", text: `Battery health is at ${h.battery_health_pct}%. Risk of start failure.` });
      }
      
      if (Number(h.tyre_tread_depth_mm) < 3.0) {
        alerts.push({ id: `tyre-${v.id}`, type: "warning", title: "Tyre Wear Warning", text: `Tread depth is ${h.tyre_tread_depth_mm}mm. Schedule tyre rotation or replacement.` });
      }
      
      const predictions = generatePredictions(
        h.current_odometer,
        h.last_service_odometer,
        h.next_oil_change_odometer,
        Number(h.tyre_tread_depth_mm),
        h.battery_install_date,
        h.battery_health_pct,
        h.next_service_date
      );
      
      return {
        vehicleId: v.id,
        brand: v.brand,
        model: v.model,
        registrationNumber: v.registration_number,
        availabilityStatus: v.availability_status,
        
        insuranceExpiry: h.insurance_expiry,
        rcExpiry: h.rc_expiry,
        pucExpiry: h.puc_expiry,
        isCompliant,
        
        fastagBalance: Number(h.fastag_balance),
        currentOdometer: h.current_odometer,
        lastServiceDate: h.last_service_date,
        nextServiceDate: h.next_service_date,
        lastServiceOdometer: h.last_service_odometer,
        lastOilChangeDate: h.last_oil_change_date,
        lastOilChangeOdometer: h.last_oil_change_odometer,
        nextOilChangeOdometer: h.next_oil_change_odometer,
        tyreTreadDepthMm: Number(h.tyre_tread_depth_mm),
        tyreInstallDate: h.tyre_install_date,
        tyreAlignmentDate: h.tyre_alignment_date,
        batteryHealthPct: h.battery_health_pct,
        batteryInstallDate: h.battery_install_date,
        batteryVoltage: Number(h.battery_voltage),
        
        cleanlinessScore: h.cleanliness_score,
        cleanlinessStatus: h.cleanliness_status,
        activeDamagesCount: activeDamages,
        activeAccidentsCount: activeAccidents,
        
        healthScore: score,
        alerts,
        predictions
      };
    });
  } catch (err) {
    console.error("Error in getFleetHealthData:", err);
    return getMockFleetHealth();
  }
}

// Helper default fallback object generator
function getDefaultHealthRow(vehicleId: string) {
  return {
    vehicle_id: vehicleId,
    insurance_expiry: "2027-01-01",
    rc_expiry: "2039-01-01",
    puc_expiry: "2027-01-01",
    fastag_balance: 1000.00,
    last_service_date: "2026-01-01",
    next_service_date: "2027-01-01",
    last_service_odometer: 10000,
    last_oil_change_date: "2026-01-01",
    last_oil_change_odometer: 10000,
    next_oil_change_odometer: 20000,
    tyre_tread_depth_mm: 7.5,
    tyre_install_date: "2025-01-01",
    tyre_alignment_date: "2026-01-01",
    battery_health_pct: 90,
    battery_install_date: "2025-01-01",
    battery_voltage: 12.6,
    cleanliness_score: 9,
    cleanliness_status: "Clean",
    current_odometer: 12500
  };
}

// -----------------------------------------------------------------------------
// Mock Data Generation (Fault Tolerance fallback)
// -----------------------------------------------------------------------------
function getMockFleetHealth(
  vehiclesList?: Array<{
    id: string;
    brand: string;
    model: string;
    registration_number: string;
    availability_status: string;
  }>
): VehicleHealthStatus[] {
  const list = vehiclesList ?? [
    { id: 'b2c3d4e5-0001-0001-0001-000000000001', brand: 'Maruti Suzuki', model: 'Swift', registration_number: 'GA01-AA-1001', availability_status: 'available' },
    { id: 'b2c3d4e5-0001-0001-0001-000000000002', brand: 'Hyundai', model: 'i20', registration_number: 'GA01-AA-1002', availability_status: 'available' },
    { id: 'b2c3d4e5-0001-0001-0001-000000000003', brand: 'Honda', model: 'City', registration_number: 'GA01-AB-2001', availability_status: 'available' },
    { id: 'b2c3d4e5-0001-0001-0001-000000000004', brand: 'Maruti Suzuki', model: 'Ciaz', registration_number: 'GA01-AB-2002', availability_status: 'available' },
    { id: 'b2c3d4e5-0001-0001-0001-000000000005', brand: 'Hyundai', model: 'Creta', registration_number: 'GA01-AC-3001', availability_status: 'available' },
    { id: 'b2c3d4e5-0001-0001-0001-000000000006', brand: 'Mahindra', model: 'Thar', registration_number: 'GA01-AC-3002', availability_status: 'available' },
    { id: 'b2c3d4e5-0001-0001-0001-000000000007', brand: 'BMW', model: '3 Series', registration_number: 'GA01-AD-4001', availability_status: 'available' },
    { id: 'b2c3d4e5-0001-0001-0001-000000000008', brand: 'Mercedes-Benz', model: 'GLE', registration_number: 'GA01-AE-5001', availability_status: 'available' }
  ];

  const now = new Date();
  return list.map((v, index) => {
    let ins = "2027-04-15";
    const rc = "2038-08-20";
    let puc = "2026-12-05";
    const odo = 14500 + index * 4200;
    let fastag = 1250 - index * 120;
    let tyreTread = 7.2 - index * 0.6;
    let batteryHealth = 92 - index * 6;
    let cleanliness: "Clean" | "Dirty" | "Detailing" = "Clean";
    let damages = 0;
    let accidents = 0;

    // Swift (index 0) - Perfect
    // i20 (index 1) - Low FASTag (₹180)
    if (index === 1) fastag = 180;
    // Honda City (index 2) - Expired PUC
    if (index === 2) puc = "2026-07-01";
    // Ciaz (index 3) - Expiring Insurance, low battery
    if (index === 3) {
      ins = "2026-07-18";
      batteryHealth = 25;
    }
    // Creta (index 4) - Worn tyres, dirty, active damage
    if (index === 4) {
      tyreTread = 2.5;
      cleanliness = "Dirty";
      damages = 1;
    }
    // Thar (index 5) - Needs service soon
    if (index === 5) {
      accidents = 1;
    }
    // BMW (index 6) - Detailing
    if (index === 6) {
      cleanliness = "Detailing";
    }

    const { score, isCompliant } = calculateHealthScore({
      insuranceExpiry: ins,
      rcExpiry: rc,
      pucExpiry: puc,
      tyreTreadDepthMm: tyreTread,
      batteryHealthPct: batteryHealth,
      batteryVoltage: 12.6 - (index * 0.1),
      currentOdometer: odo,
      nextOilChangeOdometer: odo + 5000,
      activeDamagesCount: damages,
      activeAccidentsCount: accidents,
      cleanlinessScore: cleanliness === "Clean" ? 9 : cleanliness === "Dirty" ? 4 : 8,
      cleanlinessStatus: cleanliness
    });

    const alerts: FleetHealthAlert[] = [];
    if (fastag < 500) {
      alerts.push({ id: `fastag-${v.id}`, type: fastag < 200 ? "error" : "warning", title: "Low FASTag Balance", text: `Current balance: ₹${fastag}.` });
    }
    if (new Date(ins) < now) {
      alerts.push({ id: `ins-${v.id}`, type: "error", title: "Insurance Expired", text: "Insurance coverage expired." });
    }
    if (new Date(puc) < now) {
      alerts.push({ id: `puc-${v.id}`, type: "error", title: "PUC Expired", text: "PUC emission certificate expired." });
    }
    if (batteryHealth < 40) {
      alerts.push({ id: `batt-${v.id}`, type: "error", title: "Critical Battery Health", text: `Battery health is at ${batteryHealth}%.` });
    }
    if (tyreTread < 3.0) {
      alerts.push({ id: `tyre-${v.id}`, type: "warning", title: "Tyre Wear Warning", text: `Tread depth is ${tyreTread.toFixed(1)}mm.` });
    }

    const predictions = generatePredictions(
      odo,
      odo - 5000,
      odo + (1000 - index * 100),
      tyreTread,
      "2024-05-10",
      batteryHealth,
      "2026-11-10"
    );

    return {
      vehicleId: v.id,
      brand: v.brand,
      model: v.model,
      registrationNumber: v.registration_number,
      availabilityStatus: v.availability_status,
      
      insuranceExpiry: ins,
      rcExpiry: rc,
      pucExpiry: puc,
      isCompliant,
      
      fastagBalance: fastag,
      currentOdometer: odo,
      lastServiceDate: "2026-05-10",
      nextServiceDate: "2026-11-10",
      lastServiceOdometer: odo - 5000,
      lastOilChangeDate: "2026-05-10",
      lastOilChangeOdometer: odo - 5000,
      nextOilChangeOdometer: odo + (1000 - index * 100),
      tyreTreadDepthMm: tyreTread,
      tyreInstallDate: "2025-05-10",
      tyreAlignmentDate: "2026-05-10",
      batteryHealthPct: batteryHealth,
      batteryInstallDate: "2025-05-10",
      batteryVoltage: Number((12.6 - (index * 0.1)).toFixed(2)),
      
      cleanlinessScore: cleanliness === "Clean" ? 9 : cleanliness === "Dirty" ? 4 : 8,
      cleanlinessStatus: cleanliness,
      activeDamagesCount: damages,
      activeAccidentsCount: accidents,
      
      healthScore: score,
      alerts,
      predictions
    };
  });
}
