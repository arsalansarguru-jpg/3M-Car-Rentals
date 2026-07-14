import { SupabaseClient } from "@supabase/supabase-js";
import { AuthService } from "./auth.service";

export interface AuditPayload {
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
  sessionId?: string | null;
  correlationId?: string | null;
}

export class AuditService {
  /**
   * Logs a structured audit record into the PostgreSQL database.
   * Uses a server-side Supabase client to record operations.
   */
  static async logAudit(payload: AuditPayload, client?: SupabaseClient): Promise<void> {
    try {
      const supabase = client || (await AuthService.getServerClient());

      const { error } = await supabase.from("audit_logs").insert({
        user_email: payload.userEmail,
        user_role: payload.userRole,
        action: payload.action,
        entity: payload.entity,
        entity_id: payload.entityId,
        old_value: payload.oldValue || null,
        new_value: payload.newValue || null,
        ip_address: payload.ipAddress || null,
        session_id: payload.sessionId || null,
        correlation_id: payload.correlationId || null
      });

      if (error) {
        console.error("[AuditService] Failed to insert audit log row:", error.message);
        throw error;
      }
    } catch (err) {
      // Fail-silent in runtime to prevent audit logs crashes from breaking operations,
      // but output exception traces to system error outputs.
      console.error("[AuditService] Logging transaction threw an exception:", err);
    }
  }

  /**
   * Retrieves chronologically ordered audit logs for a given database entity record.
   */
  static async getAuditTrail(
    entity: string,
    entityId: string,
    client?: SupabaseClient
  ): Promise<any[]> {
    try {
      const supabase = client || (await AuthService.getServerClient());

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entity", entity)
        .eq("entity_id", entityId)
        .order("timestamp", { ascending: false });

      if (error) {
        console.error(`[AuditService] Failed fetching audit trail (Entity: ${entity}, ID: ${entityId}):`, error.message);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error("[AuditService] Fetching trail threw an exception:", err);
      return [];
    }
  }
}
