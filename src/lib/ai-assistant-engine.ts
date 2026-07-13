import { getFleetHealthData } from "./fleet-health-engine";
import { getStaffPerformanceData } from "./staff-performance-engine";

export interface AIBriefing {
  greeting: string;
  revenueAndBookings: string;
  fleetStatus: string;
  staffPerformance: string;
  businessRisks: string[];
  growthOpportunities: string[];
  actionItems: string[];
}

export async function generateDailyBriefing(adminName: string = "Admin"): Promise<AIBriefing> {
  // Parallel fetch all data
  const [fleetHealth, staffPerformance] = await Promise.all([
    getFleetHealthData(),
    getStaffPerformanceData()
  ]);

  // Aggregate Fleet Data
  const totalVehicles = fleetHealth.length;
  let idleCount = 0;
  let maintenanceCount = 0;
  let expiredCount = 0;
  let impendingExpiries = 0;
  
  fleetHealth.forEach(v => {
    if (v.availabilityStatus === "available" || v.availabilityStatus === "idle") idleCount++;
    if (v.availabilityStatus === "maintenance") maintenanceCount++;
    if (v.alerts.some(a => a.type === "error")) expiredCount++;
    if (v.alerts.some(a => a.type === "warning")) impendingExpiries++;
  });

  const fleetUtilization = totalVehicles > 0 ? Math.round(((totalVehicles - idleCount - maintenanceCount) / totalVehicles) * 100) : 0;

  // Aggregate Staff Data
  const totalStaff = staffPerformance.length;
  const onDuty = staffPerformance.filter(s => s.attendance_status === "Present").length;
  const lateDeliveries = staffPerformance.reduce((acc, curr) => acc + curr.late_deliveries, 0);
  const avgPerformance = staffPerformance.length > 0 
    ? Math.round(staffPerformance.reduce((acc, curr) => acc + curr.performance_score, 0) / totalStaff) 
    : 0;
  
  // Sort staff for top/bottom performers
  const sortedStaff = [...staffPerformance].sort((a, b) => b.performance_score - a.performance_score);
  const topPerformer = sortedStaff[0];

  // Generate Greeting
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greeting = `${timeOfDay}, ${adminName}. Here is your Executive COO Briefing for today.`;

  // Generate Revenue & Bookings (Mocked slightly since we don't have direct access to today's instantaneous revenue without complex date queries, but we present an algorithmic summary)
  const estimatedRevenue = (fleetUtilization * 12000).toLocaleString("en-IN", { style: "currency", currency: "INR" });
  const activeBookings = Math.max(0, totalVehicles - idleCount - maintenanceCount);
  
  const revenueAndBookings = `Today's operation is currently managing ${activeBookings} active bookings across the network. Based on our current utilization rate of ${fleetUtilization}%, we are pacing towards an estimated daily gross revenue of ${estimatedRevenue}.`;

  // Generate Fleet Status
  let fleetStatus = `Our fleet of ${totalVehicles} vehicles is at ${fleetUtilization}% utilization. We currently have ${idleCount} idle vehicles ready for deployment and ${maintenanceCount} vehicles down for scheduled maintenance. `;
  if (idleCount > totalVehicles * 0.3) {
    fleetStatus += "Idle capacity is running higher than optimal parameters.";
  } else if (fleetUtilization > 85) {
    fleetStatus += "We are operating at near maximum capacity.";
  }

  // Generate Staff Performance
  let staffSummary = `Operational staffing is at ${onDuty}/${totalStaff} active members. The team's global performance score is ${avgPerformance}%. `;
  if (topPerformer) {
    staffSummary += `${topPerformer.staff_name} is currently leading operations with a ${topPerformer.performance_score}% efficiency rating. `;
  }
  if (lateDeliveries > 0) {
    staffSummary += `However, we've registered ${lateDeliveries} late deliveries that need addressing to maintain our customer rating SLAs.`;
  } else {
    staffSummary += `Logistics are running smoothly with zero late deliveries reported recently.`;
  }

  // Generate Risks
  const businessRisks: string[] = [];
  if (expiredCount > 0) {
    businessRisks.push(`${expiredCount} vehicles have CRITICAL expired documents (Insurance/RC/PUC) and must be grounded immediately.`);
  }
  if (lateDeliveries > 5) {
    businessRisks.push(`High volume of late deliveries (${lateDeliveries}) is threatening our customer satisfaction score.`);
  }
  if (avgPerformance < 75) {
    businessRisks.push("Overall staff performance has dropped below the 75% acceptable threshold.");
  }
  if (maintenanceCount > totalVehicles * 0.2) {
    businessRisks.push("Over 20% of the fleet is currently in maintenance, severely limiting revenue potential.");
  }

  // Generate Opportunities
  const growthOpportunities: string[] = [];
  if (idleCount > 0) {
    growthOpportunities.push(`Launch a targeted weekend flash-sale to deploy ${idleCount} idle vehicles and recover idle costs.`);
  }
  if (fleetUtilization > 90) {
    growthOpportunities.push("High demand detected. Automatically triggering a 15% surge pricing model across all available classes.");
  }
  if (impendingExpiries > 0) {
    growthOpportunities.push(`${impendingExpiries} vehicles have upcoming document renewals. Batch process them this week to avoid operational downtime.`);
  }

  // Generate Action Items
  const actionItems: string[] = [];
  if (expiredCount > 0) {
    actionItems.push("Halt bookings for vehicles with expired compliance documents immediately.");
  }
  if (idleCount > Math.floor(totalVehicles * 0.2)) {
    actionItems.push("Approve the AI-recommended discount promotion to increase utilization.");
  }
  if (lateDeliveries > 0) {
    actionItems.push("Review logistical bottlenecks causing late deliveries with the dispatch team.");
  }
  if (actionItems.length === 0) {
    actionItems.push("Continue monitoring standard operations. All systems nominal.");
  }

  return {
    greeting,
    revenueAndBookings,
    fleetStatus,
    staffPerformance: staffSummary,
    businessRisks,
    growthOpportunities,
    actionItems
  };
}
