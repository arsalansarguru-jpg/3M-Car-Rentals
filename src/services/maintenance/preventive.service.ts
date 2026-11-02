import { supabaseAdmin } from "@/lib/supabase-admin";
import { Logger } from "@/services/logger.service";
import { AuditService } from "@/services/audit.service";
import { NotificationService } from "@/services/notification.service";
import { MaintenanceService } from "./maintenance.service";
import { WorkshopService } from "@/services/workshop/workshop.service";
import { DomainEventDispatcher } from "@/lib/event-bus";

export interface MaintenanceRule {
  id: string;
  name: string;
  brand: string;
  model: string;
  trigger_type: "mileage" | "time" | "vehicle_age" | "both" | "all";
  interval_km?: number;
  interval_months?: number;
  age_limit_months?: number;
  actions: string[];
  service_type: "scheduled_service" | "oil_change" | "tyre_replacement" | "battery_replacement" | "general_repair" | "detailing";
  priority: "low" | "medium" | "high" | "critical";
  description?: string;
  is_active: boolean;
}

export interface RuleEvaluationResult {
  rule: MaintenanceRule;
  isDue: boolean;
  reason: string;
}

export class PreventiveMaintenanceService {
  /**
   * Evaluates all active maintenance rules for a specific vehicle.
   */
  static async evaluateVehicle(vehicleId: string): Promise<RuleEvaluationResult[]> {
    // 1. Fetch vehicle metadata
    const { data: vehicle, error: vErr } = await supabaseAdmin
      .from("vehicles")
      .select("id, brand, model, registration_number, year")
      .eq("id", vehicleId)
      .single();

    if (vErr || !vehicle) {
      throw new Error(`Vehicle with ID ${vehicleId} not found.`);
    }

    // 2. Fetch vehicle health records
    const { data: health, error: hErr } = await supabaseAdmin
      .from("vehicle_health")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .single();

    if (hErr || !health) {
      throw new Error(`Vehicle health record not found for vehicle ${vehicleId}.`);
    }

    // 3. Fetch active rules
    const { data: rules, error: rErr } = await supabaseAdmin
      .from("maintenance_rules")
      .select("*")
      .eq("is_active", true);

    if (rErr || !rules) {
      return [];
    }

    const now = new Date();
    const ageMonths = (now.getFullYear() - vehicle.year) * 12 + now.getMonth();

    const results: RuleEvaluationResult[] = [];

    for (const rule of rules as MaintenanceRule[]) {
      // Check brand & model applicability (support wildcard '*')
      const brandMatch = rule.brand === "*" || rule.brand.toLowerCase() === vehicle.brand.toLowerCase();
      const modelMatch = rule.model === "*" || rule.model.toLowerCase() === vehicle.model.toLowerCase();

      if (!brandMatch || !modelMatch) {
        continue; // Rule is not applicable to this vehicle
      }

      let isDue = false;
      const reasons: string[] = [];

      // Evaluation based on Trigger Type
      const triggersMileage = ["mileage", "both", "all"].includes(rule.trigger_type);
      const triggersTime = ["time", "both", "all"].includes(rule.trigger_type);
      const triggersAge = ["vehicle_age", "all"].includes(rule.trigger_type);

      // 1. Mileage check
      if (triggersMileage && rule.interval_km) {
        const lastOdo = rule.service_type === "oil_change" 
          ? health.last_oil_change_odometer 
          : health.last_service_odometer;
        
        const kmSinceLast = health.current_odometer - lastOdo;
        if (kmSinceLast >= rule.interval_km) {
          isDue = true;
          reasons.push(`Odometer difference (${kmSinceLast.toLocaleString()} km) exceeded interval (${rule.interval_km.toLocaleString()} km).`);
        }
      }

      // 2. Time check
      if (triggersTime && rule.interval_months) {
        const lastDateStr = rule.service_type === "oil_change"
          ? health.last_oil_change_date
          : health.last_service_date;
        
        const lastDate = new Date(lastDateStr);
        const monthsElapsed = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth());
        
        if (monthsElapsed >= rule.interval_months) {
          isDue = true;
          reasons.push(`Months elapsed (${monthsElapsed} m) exceeded interval (${rule.interval_months} m).`);
        }
      }

      // 3. Vehicle Age check
      if (triggersAge && rule.age_limit_months) {
        if (ageMonths >= rule.age_limit_months) {
          isDue = true;
          reasons.push(`Vehicle age (${ageMonths} m) exceeded threshold limit (${rule.age_limit_months} m).`);
        }
      }

      results.push({
        rule,
        isDue,
        reason: reasons.join(" ")
      });
    }

    return results;
  }

  /**
   * Updates vehicle odometer and runs the preventive maintenance rule engine.
   */
  static async updateOdometerAndEvaluate(vehicleId: string, newOdometer: number, userEmail: string) {
    Logger.info("Odometer update requested", {
      context: { service: "PreventiveMaintenanceService", action: "updateOdometerAndEvaluate" },
      meta: { vehicleId, newOdometer }
    });

    // 1. Update the odometer value in the database
    const { data: updatedHealth, error: updateErr } = await supabaseAdmin
      .from("vehicle_health")
      .update({
        current_odometer: newOdometer,
        updated_at: new Date().toISOString()
      })
      .eq("vehicle_id", vehicleId)
      .select("*")
      .single();

    if (updateErr || !updatedHealth) {
      throw new Error(`Failed to update odometer: ${updateErr?.message}`);
    }

    // 2. Query vehicle model names for events/notifications
    const { data: vehicle } = await supabaseAdmin
      .from("vehicles")
      .select("id, brand, model, registration_number")
      .eq("id", vehicleId)
      .single();

    // 3. Evaluate rules
    const evaluations = await this.evaluateVehicle(vehicleId);
    const triggeredJobs: any[] = [];

    for (const evalResult of evaluations) {
      if (evalResult.isDue) {
        const { rule, reason } = evalResult;

        // Check if there is an active maintenance ticket for this specific service_type
        const { data: activeJob } = await supabaseAdmin
          .from("maintenance_jobs")
          .select("id")
          .eq("vehicle_id", vehicleId)
          .eq("trigger_type", rule.trigger_type === "vehicle_age" ? "duration" : rule.trigger_type === "mileage" ? "mileage" : "duration")
          .not("status", "in", '("closed","cancelled")')
          .maybeSingle();

        if (activeJob) {
          Logger.info(`Active ticket ${activeJob.id} already exists. Skipping duplicate ticket generation.`);
          continue;
        }

        // Action 1: Create Maintenance Ticket
        if (rule.actions.includes("create_ticket")) {
          Logger.info(`Auto-generating maintenance ticket due to rule: ${rule.name}`);
          
          const job = await MaintenanceService.createJob({
            vehicleId,
            triggerType: rule.trigger_type === "vehicle_age" ? "duration" : rule.trigger_type === "mileage" ? "mileage" : "duration",
            priority: rule.priority,
            description: `Auto-generated by Rule: ${rule.name}. Reason: ${reason}`,
            userEmail: "system@3mrentals.com"
          });

          // Action 2: Reserve Workshop Slot
          Logger.info(`Auto-reserving workshop slot queue entry for job: ${job.id}`);
          await WorkshopService.initializeQueueEntry(job.id);

          triggeredJobs.push({
            jobId: job.id,
            ruleName: rule.name,
            reason
          });

          // Action 3: Dispatch Staff Notification
          if (rule.actions.includes("notify_staff")) {
            // Find an active operations staff to notify, or use system notification channel
            const { data: operationsUsers } = await supabaseAdmin
              .from("users")
              .select("id")
              .limit(1);
            
            const recipientId = operationsUsers?.[0]?.id || "system";

            await NotificationService.publishEvent({
              recipientId,
              event: "maintenance_alert",
              variables: {
                vehicle_name: `${vehicle?.brand || ""} ${vehicle?.model || ""}`,
                registration_number: vehicle?.registration_number || "",
                odometer: String(newOdometer)
              },
              channels: ["InApp", "Slack", "Email"]
            });
          }

          // Publish Domain Event
          await DomainEventDispatcher.publish({
            eventName: "PreventiveMaintenanceTriggered",
            timestamp: new Date().toISOString(),
            payload: {
              vehicleId,
              ruleId: rule.id,
              jobId: job.id,
              reason
            }
          });
        }
      }
    }

    return {
      success: true,
      currentOdometer: newOdometer,
      triggeredJobs
    };
  }
}
