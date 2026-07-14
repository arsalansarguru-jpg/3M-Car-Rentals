# 3M Car Rentals Database Optimization Plan
**Enterprise SQL Migrations, Index Tuning, Partitioning & Soft Deletes Schema Design**

*Prepared by: Principal Database Architect*

---

## 1. Database Table Audits & Recommendations

We have audited the core schemas of the 3M Car Rentals database and compiled the following optimization recommendations:

### 1. Indexing Strategy
* **`bookings`**: Create a composite index on `(pickup_datetime, booking_status)` for scheduler queries, and a partial index on `booking_status` where status is `active` or `confirmed`.
* **`vehicles`**: Create a partial index on `(availability_status, is_visible)` where availability is `available` and visibility is `true` for customer search queries.
* **`payments`**: Create index on `(payment_status, created_at)` to optimize financial ledger reconciliations.

### 2. Materialized Views (Analytics Caching)
* Create `mv_monthly_financials` to pre-calculate and cache monthly revenues, transaction counts, and refund counts, refreshed asynchronously via a scheduler.

### 3. Triggers & Functions
* Implement an automated trigger on the `bookings` table to update the associated `vehicles.availability_status` to `reserved` when a booking is created, and back to `available` when a booking is completed or cancelled.

### 4. Partitioning Strategy
* The `audit_logs` and `notifications` tables are high-growth audit tables. We recommend partitioning `audit_logs` by **RANGE** on the `timestamp` column (e.g. creating monthly partitions) to keep query indexes small and performant.

### 5. Soft Deletes
* Add `deleted_at timestamp with time zone DEFAULT null` to `users`, `vehicles`, and `bookings` tables, and configure Row-Level Security policies to automatically filter out soft-deleted records (`WHERE deleted_at IS NULL`) for standard application queries.

### 6. Historical Archiving
* Archive completed bookings older than 2 years from `public.bookings` into a secondary cold archive table `archive.bookings`, freeing up primary index space.

---

## 2. SQL Migration Script

The proposed SQL migration script contains the DDL schemas for these recommendations:

```sql
-- DDL Migration Script: Database Performance Tuning & Soft Deletes

-- ─── 1. SOFT DELETES SYSTEM ──────────────────────────────────────────────────

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT null;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT null;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT null;

-- Reconfigure RLS policies to auto-exclude soft deleted records
-- Example for Vehicles:
-- CREATE POLICY "Exclude soft deleted vehicles" ON public.vehicles
-- FOR SELECT USING (deleted_at IS NULL);

-- ─── 2. INDEX OPTIMIZATIONS ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_bookings_lookup_status 
ON public.bookings(pickup_datetime, booking_status) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_availability_search 
ON public.vehicles(availability_status, is_visible) 
WHERE deleted_at IS NULL AND is_visible = true;

CREATE INDEX IF NOT EXISTS idx_payments_reconciliation 
ON public.payments(payment_status, created_at);

-- ─── 3. MATERIALIZED VIEWS ───────────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_monthly_financials AS
SELECT 
    date_trunc('month', created_at) AS transaction_month,
    payment_status,
    COUNT(id) AS transaction_count,
    SUM(amount) AS total_amount
FROM public.payments
GROUP BY 1, 2;

-- Unique index to support concurrent refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_financials_unique 
ON public.mv_monthly_financials(transaction_month, payment_status);

-- ─── 4. AUTOMATED TRIGGERS & FUNCTIONS ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.sync_vehicle_status_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.booking_status = 'confirmed' THEN
        UPDATE public.vehicles
        SET availability_status = 'reserved'
        WHERE id = NEW.vehicle_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.booking_status IN ('completed', 'cancelled') THEN
            UPDATE public.vehicles
            SET availability_status = 'available'
            WHERE id = NEW.vehicle_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_sync_vehicle_status
    AFTER INSERT OR UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.sync_vehicle_status_on_booking();

-- ─── 5. PARTITIONING DESIGN (AUDIT LOGS) ──────────────────────────────────────

-- Note: In PostgreSQL, a table must be defined as partitioned at creation time.
-- Below is the schema layout for a partitioned audit logs structure.

-- CREATE TABLE public.partitioned_audit_logs (
--     id uuid DEFAULT gen_random_uuid(),
--     user_email text NOT NULL,
--     action text NOT NULL,
--     timestamp timestamp with time zone DEFAULT now() NOT NULL,
--     PRIMARY KEY (id, timestamp)
-- ) PARTITION BY RANGE (timestamp);

-- Example monthly partition creation:
-- CREATE TABLE public.audit_logs_y2026m07 PARTITION OF public.partitioned_audit_logs
-- FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');
```
