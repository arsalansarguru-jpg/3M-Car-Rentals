# Implementation Plan — Complete Fleet Management Module

Expand the Admin Dashboard with a comprehensive, enterprise-grade Fleet Management operating system.

## User Review Required

> [!IMPORTANT]
> To support custom fields (such as unlimited galleries, weekend/weekly/monthly rates, documents, checklist features, and maintenance logs) without modifying the main PostgreSQL tables, we will use a **hybrid storage engine**:
> - Base vehicle fields are written to the Supabase `vehicles` table via `supabaseAdmin`.
> - Rich metadata fields are automatically saved in a local JSON file (`src/data/fleet_metadata.json`) indexed by `vehicle_id`.
> - The `fleet.service.ts` helper on the server will automatically merge the base data and metadata on load. This ensures complete data integrity and instant syncing to the public pages.

## Proposed Changes

### 1. Database & Services Integration

#### [MODIFY] [fleet.service.ts](file:///c:/Users/DELL/Desktop/3MCarRentals/src/services/fleet.service.ts)
- Modify `getAvailableVehicles`, `getVehicleById`, and add a new `getAllVehicles` function to read `src/data/fleet_metadata.json` and merge metadata.

### 2. API Routes

#### [NEW] [route.ts](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/api/vehicles/route.ts)
- Create CRUD route handler for `/api/vehicles`:
  - `GET`: Returns list of all vehicles (base + metadata).
  - `POST`: Inserts vehicle to database + writes rich metadata.
  - `PUT`: Updates base fields + updates metadata.
  - `DELETE`: Deletes from database + deletes metadata.
- Create `/api/vehicles/import` to seed mock initial vehicles.

### 3. Sidebar Navigation

#### [MODIFY] [layout.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/layout.tsx)
- Add "Fleet Management" section group in the sidebar layout with sub-links:
  - Fleet Overview
  - Vehicle Inventory
  - Vehicle Gallery
  - Availability Calendar
  - Maintenance
  - Documents
  - Pricing
  - Vehicle Analytics

### 4. Admin Fleet Management Sub-pages

#### [NEW] [overview/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/overview/page.tsx)
- KPI widgets: utilization, service statuses, revenue overview, newest addition.
- Quick actions menu linked to modals or pages.

#### [NEW] [inventory/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/inventory/page.tsx)
- Inventory datatable showing specs, pricing tiers, badges.
- Bulk actions bar (price update, visibility, delete).
- Form for adding/editing vehicles with comprehensive tabs (Basic, Features checklist, Pricing, Gallery, Docs, Maintenance).

#### [NEW] [gallery/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/gallery/page.tsx)
- Image manager (featured image picker, upload files simulated, reorder, compress/rotate mockup).

#### [NEW] [availability/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/availability/page.tsx)
- Calendar dashboard per vehicle. Manage blockages and maintenance intervals.

#### [NEW] [maintenance/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/maintenance/page.tsx)
- Maintenance logs, upcoming service dates, tyre/battery checks, service invoice uploads.

#### [NEW] [documents/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/documents/page.tsx)
- File vault for RC, Insurance, PUC with expiration highlights and countdowns.

#### [NEW] [pricing/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/pricing/page.tsx)
- Dynamic rate configuration (hourly, weekend, peak/off-season rules).

#### [NEW] [analytics/page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/dashboard/admin/fleet-management/analytics/page.tsx)
- Metrics dashboard: revenue charts, bookings timeline, utilization charts.

### 5. Public Website Visual Sync

#### [MODIFY] [VehicleCard.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/components/fleet/VehicleCard.tsx)
- Render the first uploaded image instead of the SVG silhouette when available.

#### [MODIFY] [page.tsx](file:///c:/Users/DELL/Desktop/3MCarRentals/src/app/(main)/fleet/[id]/page.tsx)
- Premium image gallery with interactive thumbnail strips, zoom, lazy loading.
- Detailed features checklist and specs table.

## Verification Plan

### Automated Tests
- Run `npm run build` to confirm compilation is clean.

### Manual Verification
- Create a vehicle using the new form, select checklist options, save it.
- Verify it is listed in the inventory table.
- Open the public Fleet page and ensure the new vehicle appears with correct images, pricing tiers, and attributes.
