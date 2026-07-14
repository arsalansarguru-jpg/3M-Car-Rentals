# 3M Car Rentals Database Audit Standards
**Centralised Database Audit System & AuditService Integration Manual**

*Prepared by: Principal Backend Architect*

---

## 1. Database Table Structure (`audit_logs`)

The audit logs are persisted in a centralized `public.audit_logs` table optimized with B-Tree indices to support instant lookups on entity changes:

| Column Name | DB DataType | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO (PK) | Auto-generated UUID. |
| `user_email` | `text` | NO | Email of the operating user. |
| `user_role` | `text` | NO | User role group (e.g. `admin`, `staff`). |
| `action` | `text` | NO | Code indicator for the action performed (e.g. `mark_available`). |
| `entity` | `text` | NO | Target table name (e.g. `vehicles`, `bookings`). |
| `entity_id` | `uuid` | NO | Key ID of the targeted record. |
| `old_value` | `jsonb` | YES | JSON object representing the state before modifications. |
| `new_value` | `jsonb` | YES | JSON object representing the state after modifications. |
| `timestamp` | `timestamptz`| NO | Datetime log stamp in UTC. |
| `ip_address` | `text` | YES | Requester client network address. |
| `session_id` | `text` | YES | Unique session token identifier. |
| `correlation_id`| `text` | YES | Correlation UUID tracking request flows. |

---

## 2. API Integration Mappings & Code Snippets

```typescript
import { AuditService } from "@/services/audit.service";
import { AuthService } from "@/services/auth.service";

export async function updateVehicleStatus(vehicleId: string, newStatus: string) {
  const supabase = await AuthService.getServerClient();
  const session = await AuthService.getCurrentUser(supabase);
  
  if (!session) throw new Error("Unauthorized");

  // 1. Fetch old value for audit trail mapping
  const { data: oldVehicle } = await supabase
    .from("vehicles")
    .select("availability_status")
    .eq("id", vehicleId)
    .single();

  // 2. Perform DB update mutation
  await supabase
    .from("vehicles")
    .update({ availability_status: newStatus })
    .eq("id", vehicleId);

  // 3. Log audit record to postgres central audit table
  await AuditService.logAudit({
    userEmail: session.user.email,
    userRole: session.role,
    action: "update_status",
    entity: "vehicles",
    entityId: vehicleId,
    oldValue: { availability_status: oldVehicle?.availability_status },
    newValue: { availability_status: newStatus },
    ipAddress: "192.168.1.100", // Resolved from headers
    correlationId: "req-trace-uuid-1234"
  }, supabase);
}
```

---

## 3. Querying Audit History
To display a chronological timeline inside client drawers, use `getAuditTrail`:

```typescript
import { AuditService } from "@/services/audit.service";

// Returns array of audit logs ordered newest first
const history = await AuditService.getAuditTrail("vehicles", vehicleId);
```
