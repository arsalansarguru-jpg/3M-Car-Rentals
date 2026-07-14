# 3M Car Rentals Enterprise RBAC Matrix
**Granular Permissions Matrix & Role Mappings Specification**

*Prepared by: Principal Design Systems Engineer & Solutions Architect*

---

## 1. Enterprise Roles Definitions

* **CEO (Executive Admin)**: Full platform visibility, financial audits, strategic reports access, and global system overrides.
* **Branch Manager**: Full branch operations management, user profile approvals, financial reconciliations, and staff performance metrics.
* **Fleet Manager**: Full lifecycle control over fleet vehicles, pricing configurations, and maintenance schedules.
* **Operations Manager**: High-speed command center controller (checking in/checking out vehicles, dispatch allocations).
* **Finance**: Full access to financial ledgers, gateway configurations, deposit releases, and processing customer refunds.
* **Support**: Read-only CRM views, reservation calendar checks, document verification uploads, and logging customer queries.
* **Inspector**: Verification checker for vehicles during pickups and check-ins (reporting checklist status, fuel, and damages).
* **Cleaner**: Detailed check-in cleanliness logger (flagging detailing cycles, cleaning updates).
* **Workshop (Mechanic)**: Logging servicing entries, service costs, and updating odometer milestones.
* **Driver (Customer / Renter)**: Primary renter role (requesting bookings, uploading license docs, viewing active trips).

---

## 2. Shared Permissions Matrix

The permissions are mapped below:

| Role | Permitted Pages | Permitted APIs | Database Table Access | UI Button Visibility | Bulk Actions Allowed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CEO** | All pages (`/admin/*`) | All APIs (`/api/*`) | All Tables (`public.*`) | All Buttons | All Bulk Actions |
| **Branch Manager** | `/admin`, `/admin/bookings`, `/admin/customers`, `/admin/kyc`, `/admin/finance`, `/admin/operations`, `/admin/fleet` | `/api/admin/*`, `/api/finance/*`, `/api/bookings/*` | `users`, `bookings`, `driver_licenses`, `vehicles`, `payments` | Verify Document, Trigger Refund, Suspend Account | Mark Available, Disable |
| **Fleet Manager** | `/admin/fleet`, `/admin/pricing`, `/admin/operations` | `/api/admin/fleet/*`, `/api/pricing/*` | `vehicles`, `vehicle_categories`, `vehicle_health`, `vehicle_maintenance_logs` | Edit Vehicle, Update Pricing, Update Thresholds | Mark Available, Send to Maint, Send to Cleaning |
| **Operations Manager** | `/admin/operations`, `/admin/bookings`, `/admin/kyc` | `/api/bookings/dispatch`, `/api/admin/fleet/update` | `bookings`, `vehicles`, `vehicle_health`, `users` | Dispatch Checkout, Dispatch Check-in | Send to Cleaning, Send to Maint |
| **Finance** | `/admin/finance`, `/admin/reports` | `/api/finance/*`, `/api/revenue/*` | `payments`, `bookings`, `users` | Trigger Refund, Clear Payment, Release Deposit | Export Finance CSV |
| **Support** | `/admin/bookings`, `/admin/customers`, `/admin/kyc` | `/api/customer-360/*` | Read: `users`, `bookings`, `driver_licenses` | View Dossier, Upload Docs | Export Customer List |
| **Inspector** | `/admin/operations` | `/api/fleet-health/*` | Read/Write: `vehicle_health`, `vehicle_incidents` | Complete Pickup Check, Complete Return Check | None |
| **Cleaner** | `/admin/operations` | `/api/fleet-health/*` | Read/Write: `vehicle_health` | Mark Clean, Mark Detailing | None |
| **Workshop** | `/admin/fleet` | `/api/fleet-health/*` | Read/Write: `vehicle_health`, `vehicle_maintenance_logs` | Log Service, Complete Maintenance | None |
| **Driver** | `/dashboard`, `/onboarding` | `/api/vehicles/*`, `/api/bookings/*` | Read: `vehicles`. Read/Write: `bookings` (own) | Book Ride, Upload Licence | None |

---

## 3. Implementation Guidelines (Router Guards)

Use granular permission checks on pages:

```typescript
import { requireAdmin } from "@/services/auth-helpers";
import { rbac } from "@/utils/rbac-helper";

export async function Page() {
  const resolved = await requireAdmin();
  
  // Verify specific permission scope
  if (!rbac.hasPermission(resolved.role, "page:view:finance")) {
    redirect("/admin/unauthorized");
  }

  return <FinanceConsole />;
}
```
