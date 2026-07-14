import { supabaseAdmin } from "@/lib/supabase-admin";
import { Logger } from "@/services/logger.service";
import { AuditService } from "@/services/audit.service";
import { DomainEventDispatcher } from "@/lib/event-bus";

export interface CreateJobInput {
  vehicleId: string;
  triggerType: "mileage" | "incident" | "duration" | "manual";
  priority: "low" | "medium" | "high" | "critical";
  description?: string;
  workshop?: string;
  estimatedCost?: number;
  estimatedCompletion?: string;
  userEmail: string;
}

export interface UpdateJobInput {
  jobId: string;
  priority?: "low" | "medium" | "high" | "critical";
  description?: string;
  workshop?: string;
  estimatedCost?: number;
  estimatedCompletion?: string;
  userEmail: string;
}

export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  scheduled: ["awaiting_inspection", "cancelled"],
  awaiting_inspection: ["inspection_complete", "cancelled"],
  inspection_complete: ["awaiting_approval", "in_workshop", "cancelled"],
  awaiting_approval: ["in_workshop", "cancelled"],
  in_workshop: ["waiting_parts", "repairing", "cancelled"],
  waiting_parts: ["repairing", "cancelled"],
  repairing: ["qc_pending", "cancelled"],
  qc_pending: ["qc_passed", "in_workshop"],
  qc_passed: ["closed"],
  closed: [],
  cancelled: []
};

export class MaintenanceService {
  /**
   * Creates a new maintenance job record and marks the vehicle status to scheduled.
   */
  static async createJob(input: CreateJobInput) {
    Logger.info("Executing createJob workflow", {
      context: { service: "MaintenanceService", action: "createJob" },
      meta: { vehicleId: input.vehicleId, priority: input.priority }
    });

    // 1. Verify if vehicle is already in an active maintenance lifecycle
    const { data: activeJob } = await supabaseAdmin
      .from("maintenance_jobs")
      .select("id")
      .eq("vehicle_id", input.vehicleId)
      .not("status", "in", '("closed","cancelled")')
      .maybeSingle();

    if (activeJob) {
      throw new Error("Vehicle is already undergoing an active maintenance lifecycle.");
    }

    // 2. Insert maintenance job
    const { data: job, error } = await supabaseAdmin
      .from("maintenance_jobs")
      .insert({
        vehicle_id: input.vehicleId,
        trigger_type: input.triggerType,
        priority: input.priority,
        status: "scheduled",
        description: input.description,
        workshop: input.workshop,
        estimated_cost: input.estimatedCost || 0.00,
        actual_cost: 0.00,
        estimated_completion: input.estimatedCompletion || null
      })
      .select("*")
      .single();

    if (error || !job) {
      Logger.error("Failed to insert maintenance job record", error);
      throw new Error(error?.message || "Failed to insert maintenance job record.");
    }

    // 3. Update vehicle status to maintenance scheduled
    await supabaseAdmin
      .from("vehicles")
      .update({ availability_status: "maintenance" })
      .eq("id", input.vehicleId);

    // 4. Log Audit Trail
    await AuditService.logAudit({
      userEmail: input.userEmail,
      userRole: "admin",
      action: "maintenance_job_created",
      entity: "maintenance_jobs",
      entityId: job.id,
      oldValue: null,
      newValue: job
    });

    // 5. Fire Domain Event
    await DomainEventDispatcher.publish({
      eventName: "MaintenanceCreated",
      timestamp: new Date().toISOString(),
      payload: {
        jobId: job.id,
        vehicleId: input.vehicleId,
        priority: input.priority,
        jobNumber: job.job_number
      }
    });

    return job;
  }

  /**
   * Updates general ticket parameters like descriptions or schedules.
   */
  static async updateJob(input: UpdateJobInput) {
    Logger.info("Executing updateJob details payload update", {
      context: { service: "MaintenanceService", action: "updateJob" },
      meta: { jobId: input.jobId }
    });

    const { data: currentJob } = await supabaseAdmin
      .from("maintenance_jobs")
      .select("*")
      .eq("id", input.jobId)
      .single();

    if (!currentJob) {
      throw new Error("Maintenance job record not found.");
    }

    const updatePayload: any = {};
    if (input.priority) updatePayload.priority = input.priority;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.workshop !== undefined) updatePayload.workshop = input.workshop;
    if (input.estimatedCost !== undefined) updatePayload.estimated_cost = input.estimatedCost;
    if (input.estimatedCompletion !== undefined) updatePayload.estimated_completion = input.estimatedCompletion;

    const { data: updatedJob, error } = await supabaseAdmin
      .from("maintenance_jobs")
      .update(updatePayload)
      .eq("id", input.jobId)
      .select("*")
      .single();

    if (error || !updatedJob) {
      throw new Error(error?.message || "Failed to update maintenance job details.");
    }

    // Audit logs
    await AuditService.logAudit({
      userEmail: input.userEmail,
      userRole: "admin",
      action: "maintenance_job_updated",
      entity: "maintenance_jobs",
      entityId: input.jobId,
      oldValue: currentJob,
      newValue: updatedJob
    });

    return updatedJob;
  }

  /**
   * Enforces status transition guards and handles vehicle availability resets upon closing.
   */
  static async changeStatus(jobId: string, targetStatus: string, userEmail: string) {
    Logger.info("Requesting maintenance status transition", {
      context: { service: "MaintenanceService", action: "changeStatus" },
      meta: { jobId, targetStatus }
    });

    const { data: currentJob } = await supabaseAdmin
      .from("maintenance_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!currentJob) {
      throw new Error("Maintenance job record not found.");
    }

    const currentStatus = currentJob.status;
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${targetStatus}.`);
    }

    const updatePayload: any = { status: targetStatus };
    if (targetStatus === "closed" || targetStatus === "cancelled") {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data: updatedJob, error } = await supabaseAdmin
      .from("maintenance_jobs")
      .update(updatePayload)
      .eq("id", jobId)
      .select("*")
      .single();

    if (error || !updatedJob) {
      throw new Error(error?.message || "Failed to transition maintenance job status.");
    }

    // Handle automated Vehicle availability states mappings
    if (targetStatus === "closed") {
      await supabaseAdmin
        .from("vehicles")
        .update({ availability_status: "available" })
        .eq("id", currentJob.vehicle_id);

      DomainEventDispatcher.publish({
        eventName: "VehicleAvailable",
        timestamp: new Date().toISOString(),
        payload: { vehicleId: currentJob.vehicle_id, jobId }
      });
    } else if (targetStatus === "cancelled") {
      await supabaseAdmin
        .from("vehicles")
        .update({ availability_status: "available" })
        .eq("id", currentJob.vehicle_id);
    }

    // Log transitions audit
    await AuditService.logAudit({
      userEmail,
      userRole: "admin",
      action: "maintenance_status_changed",
      entity: "maintenance_jobs",
      entityId: jobId,
      oldValue: { status: currentStatus },
      newValue: { status: targetStatus }
    });

    DomainEventDispatcher.publish({
      eventName: "MaintenanceStatusUpdated",
      timestamp: new Date().toISOString(),
      payload: { jobId, oldStatus: currentStatus, newStatus: targetStatus }
    });

    return updatedJob;
  }
}
