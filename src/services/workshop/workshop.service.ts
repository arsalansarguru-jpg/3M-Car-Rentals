import { supabaseAdmin } from "@/lib/supabase-admin";
import { Logger } from "@/services/logger.service";
import { AuditService } from "@/services/audit.service";
import { DomainEventDispatcher } from "@/lib/event-bus";

export interface AssignTechnicianInput {
  jobId: string;
  assignedTo: string;
  assignedBy: string;
  estimatedHours: number;
  userEmail: string;
}

export interface AddNoteInput {
  jobId: string;
  technicianId: string;
  noteType: "inspection" | "recommendation" | "general";
  noteContent: string;
}

export interface AddPartInput {
  jobId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  batchNumber: string;
  userEmail: string;
}

export interface AddLabourInput {
  jobId: string;
  workDone: string;
  hours: number;
  hourlyRate: number;
  technicianId: string;
  userEmail: string;
}

export interface SubmitQCInput {
  jobId: string;
  oilFilled: boolean;
  brakeTested: boolean;
  tyrePressure: boolean;
  acChecked: boolean;
  lightsWorking: boolean;
  testDriveDone: boolean;
  checkedBy: string;
  notes?: string;
  userEmail: string;
}

export interface CompleteServiceInput {
  jobId: string;
  technicianId: string;
  observations?: string;
  recommendations?: string;
  nextServiceDue?: string;
  outcome: "available" | "inspection_required" | "not_available";
  userEmail: string;
}

export class WorkshopService {
  /**
   * Automatically initializes a workshop job queue entry once a maintenance ticket is approved.
   */
  static async initializeQueueEntry(jobId: string) {
    const { data: existing } = await supabaseAdmin
      .from("workshop_jobs")
      .select("id")
      .eq("job_id", jobId)
      .maybeSingle();

    if (existing) return existing;

    const { data: entry, error } = await supabaseAdmin
      .from("workshop_jobs")
      .insert({
        job_id: jobId,
        status: "pending"
      })
      .select("*")
      .single();

    if (error) {
      Logger.error("Failed to initialize workshop queue entry", error);
      throw error;
    }

    return entry;
  }

  /**
   * Allocates a technician and transitions queue states.
   */
  static async assignTechnician(input: AssignTechnicianInput) {
    Logger.info("Executing technician allocation", {
      context: { service: "WorkshopService", action: "assignTechnician" },
      meta: { jobId: input.jobId, tech: input.assignedTo }
    });

    // 1. Log assignment
    const { error: assignErr } = await supabaseAdmin
      .from("technician_assignments")
      .insert({
        job_id: input.jobId,
        assigned_to: input.assignedTo,
        assigned_by: input.assignedBy,
        estimated_hours: input.estimatedHours
      });

    if (assignErr) throw assignErr;

    // 2. Transition statuses
    await supabaseAdmin
      .from("workshop_jobs")
      .update({ status: "assigned" })
      .eq("job_id", input.jobId);

    await supabaseAdmin
      .from("maintenance_jobs")
      .update({ 
        status: "in_workshop",
        assigned_to: input.assignedTo
      })
      .eq("id", input.jobId);

    // 3. Log Audit
    await AuditService.logAudit({
      userEmail: input.userEmail,
      userRole: "admin",
      action: "workshop_technician_assigned",
      entity: "workshop_jobs",
      entityId: input.jobId,
      oldValue: { status: "pending" },
      newValue: { status: "assigned", technicianId: input.assignedTo }
    });

    return { success: true };
  }

  /**
   * Appends notes separately without overwriting historical trails.
   */
  static async addNote(input: AddNoteInput) {
    const { data: note, error } = await supabaseAdmin
      .from("technician_notes")
      .insert({
        job_id: input.jobId,
        technician_id: input.technicianId,
        note_type: input.noteType,
        note_content: input.noteContent
      })
      .select("*")
      .single();

    if (error) throw error;
    return note;
  }

  /**
   * Records parts consumed and updates total costs.
   */
  static async addPart(input: AddPartInput) {
    const { data: part, error } = await supabaseAdmin
      .from("service_parts")
      .insert({
        job_id: input.jobId,
        part_name: input.partName,
        quantity: input.quantity,
        unit_price: input.unitPrice,
        supplier: input.supplier,
        batch_number: input.batchNumber
      })
      .select("*")
      .single();

    if (error) throw error;

    await this.recalculateActualCost(input.jobId, input.userEmail);
    return part;
  }

  /**
   * Logs labour hours work logs.
   */
  static async addLabour(input: AddLabourInput) {
    const { data: labour, error } = await supabaseAdmin
      .from("service_labour")
      .insert({
        job_id: input.jobId,
        work_done: input.workDone,
        hours: input.hours,
        hourly_rate: input.hourlyRate,
        technician_id: input.technicianId
      })
      .select("*")
      .single();

    if (error) throw error;

    await this.recalculateActualCost(input.jobId, input.userEmail);
    return labour;
  }

  /**
   * Recalculates total accumulated cost (parts + labour).
   */
  private static async recalculateActualCost(jobId: string, userEmail: string) {
    const { data: parts } = await supabaseAdmin
      .from("service_parts")
      .select("total_price")
      .eq("job_id", jobId);

    const { data: labour } = await supabaseAdmin
      .from("service_labour")
      .select("total_price")
      .eq("job_id", jobId);

    const partsSum = parts?.reduce((sum, p) => sum + Number(p.total_price), 0) || 0;
    const labourSum = labour?.reduce((sum, l) => sum + Number(l.total_price), 0) || 0;
    const totalActual = partsSum + labourSum;

    await supabaseAdmin
      .from("maintenance_jobs")
      .update({ actual_cost: totalActual })
      .eq("id", jobId);

    Logger.info(`Updated actual cost values: ${totalActual} for job ${jobId}`);
  }

  /**
   * Submits quality audit checks parameters.
   */
  static async submitQC(input: SubmitQCInput) {
    const { data: qc, error } = await supabaseAdmin
      .from("quality_checks")
      .insert({
        job_id: input.jobId,
        oil_filled: input.oilFilled,
        brake_tested: input.brakeTested,
        tyre_pressure: input.tyrePressure,
        ac_checked: input.acChecked,
        lights_working: input.lightsWorking,
        test_drive_done: input.testDriveDone,
        checked_by: input.checkedBy,
        notes: input.notes
      })
      .select("*")
      .single();

    if (error) throw error;

    // Transition statuses to quality validation stage
    await supabaseAdmin
      .from("workshop_jobs")
      .update({ status: "quality_check" })
      .eq("job_id", input.jobId);

    await supabaseAdmin
      .from("maintenance_jobs")
      .update({ status: "qc_pending" })
      .eq("id", input.jobId);

    await AuditService.logAudit({
      userEmail: input.userEmail,
      userRole: "admin",
      action: "workshop_qc_submitted",
      entity: "quality_checks",
      entityId: qc.id,
      oldValue: null,
      newValue: qc
    });

    return qc;
  }

  /**
   * Generates reports and updates vehicle availability statuses.
   */
  static async completeService(input: CompleteServiceInput) {
    // 1. Verify QC checklist logs exist and are fully completed
    const { data: qc } = await supabaseAdmin
      .from("quality_checks")
      .select("*")
      .eq("job_id", input.jobId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!qc) {
      throw new Error("No quality inspection log found. Please submit the QC check first.");
    }

    const qcPassed = qc.oil_filled && qc.brake_tested && qc.tyre_pressure && qc.ac_checked && qc.lights_working && qc.test_drive_done;
    if (!qcPassed) {
      throw new Error("Cannot complete service: Quality Control checks have not all passed.");
    }

    // 2. Fetch costs totals
    const { data: job } = await supabaseAdmin
      .from("maintenance_jobs")
      .select("vehicle_id, estimated_cost, actual_cost")
      .eq("id", input.jobId)
      .single();

    if (!job) throw new Error("Maintenance job record not found.");

    const { data: parts } = await supabaseAdmin
      .from("service_parts")
      .select("total_price")
      .eq("job_id", input.jobId);

    const { data: labour } = await supabaseAdmin
      .from("service_labour")
      .select("total_price, hours")
      .eq("job_id", input.jobId);

    const partsSum = parts?.reduce((sum, p) => sum + Number(p.total_price), 0) || 0;
    const labourSum = labour?.reduce((sum, l) => sum + Number(l.total_price), 0) || 0;
    const durationSum = labour?.reduce((sum, l) => sum + Number(l.hours), 0) || 0;

    // 3. Save service report
    const { data: report, error: rptErr } = await supabaseAdmin
      .from("service_reports")
      .insert({
        job_id: input.jobId,
        technician_id: input.technicianId,
        duration_hours: durationSum,
        labour_cost: labourSum,
        parts_cost: partsSum,
        total_cost: partsSum + labourSum,
        observations: input.observations,
        recommendations: input.recommendations,
        next_service_due: input.nextServiceDue || null
      })
      .select("*")
      .single();

    if (rptErr) throw rptErr;

    // 4. Update statuses
    await supabaseAdmin
      .from("workshop_jobs")
      .update({ status: "completed" })
      .eq("job_id", input.jobId);

    await supabaseAdmin
      .from("maintenance_jobs")
      .update({ status: "closed", completed_at: new Date().toISOString() })
      .eq("id", input.jobId);

    // 5. Update vehicle status depending on outcomes
    let vehicleAvailability = "available";
    if (input.outcome === "inspection_required") {
      vehicleAvailability = "maintenance";
    } else if (input.outcome === "not_available") {
      vehicleAvailability = "disabled";
    }

    await supabaseAdmin
      .from("vehicles")
      .update({ availability_status: vehicleAvailability })
      .eq("id", job.vehicle_id);

    // 6. Log Audits
    await AuditService.logAudit({
      userEmail: input.userEmail,
      userRole: "admin",
      action: "workshop_service_completed",
      entity: "service_reports",
      entityId: report.id,
      oldValue: null,
      newValue: { report, vehicleAvailability }
    });

    // 7. Fire Event
    await DomainEventDispatcher.publish({
      eventName: "WorkshopJobCompleted",
      timestamp: new Date().toISOString(),
      payload: {
        jobId: input.jobId,
        reportId: report.id,
        vehicleId: job.vehicle_id,
        outcome: input.outcome
      }
    });

    return report;
  }
}
