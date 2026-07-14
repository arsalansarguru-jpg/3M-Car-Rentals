-- =============================================================================
-- RentalOS Workshop Management Subsystem Migration (Sprint 5)
-- =============================================================================

-- 1. Create Enums (Idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workshop_job_status') THEN
        CREATE TYPE public.workshop_job_status AS ENUM (
            'pending', 'assigned', 'in_progress', 'waiting_parts', 'quality_check', 'completed'
        );
    END IF;
END$$;

-- 2. Workshop Active Repair Jobs Table
CREATE TABLE IF NOT EXISTS public.workshop_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    status public.workshop_job_status DEFAULT 'pending'::public.workshop_job_status NOT NULL,
    start_time timestamp with time zone,
    expected_finish timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Technician Allocation Assignments Table
CREATE TABLE IF NOT EXISTS public.technician_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    assigned_to uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    assigned_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    assigned_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    estimated_hours numeric(6, 2) DEFAULT 0.00 NOT NULL CHECK (estimated_hours >= 0),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Technician Inspection and Repair Notes Table
CREATE TABLE IF NOT EXISTS public.technician_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    technician_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    note_type text NOT NULL CHECK (note_type IN ('inspection', 'recommendation', 'general')),
    note_content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Parts Consumed Table
CREATE TABLE IF NOT EXISTS public.service_parts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    part_name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL CHECK (quantity > 0),
    unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price numeric(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    supplier text NOT NULL,
    batch_number text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Labour Hours Log Table
CREATE TABLE IF NOT EXISTS public.service_labour (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    work_done text NOT NULL,
    hours numeric(6, 2) NOT NULL CHECK (hours > 0),
    hourly_rate numeric(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    total_price numeric(10, 2) GENERATED ALWAYS AS (hours * hourly_rate) STORED,
    technician_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Stage Images Table
CREATE TABLE IF NOT EXISTS public.service_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    photo_url text NOT NULL,
    stage text NOT NULL CHECK (stage IN ('before_service', 'during_repair', 'after_repair')),
    uploaded_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. QA Checklists Table
CREATE TABLE IF NOT EXISTS public.quality_checks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    oil_filled boolean DEFAULT false NOT NULL,
    brake_tested boolean DEFAULT false NOT NULL,
    tyre_pressure boolean DEFAULT false NOT NULL,
    ac_checked boolean DEFAULT false NOT NULL,
    lights_working boolean DEFAULT false NOT NULL,
    test_drive_done boolean DEFAULT false NOT NULL,
    checked_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Final Reports Table
CREATE TABLE IF NOT EXISTS public.service_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    technician_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    duration_hours numeric(6, 2) NOT NULL CHECK (duration_hours >= 0),
    labour_cost numeric(10, 2) NOT NULL CHECK (labour_cost >= 0),
    parts_cost numeric(10, 2) NOT NULL CHECK (parts_cost >= 0),
    total_cost numeric(10, 2) NOT NULL CHECK (total_cost >= 0),
    observations text,
    recommendations text,
    next_service_due date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Auto Update Timestamps Triggers
DROP TRIGGER IF EXISTS update_workshop_jobs_updated_at ON public.workshop_jobs;
CREATE TRIGGER update_workshop_jobs_updated_at
    BEFORE UPDATE ON public.workshop_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Database Indexes
DROP INDEX IF EXISTS idx_ws_jobs_job;
DROP INDEX IF EXISTS idx_ws_jobs_status;
DROP INDEX IF EXISTS idx_ws_assign_job;
DROP INDEX IF EXISTS idx_ws_notes_job;
DROP INDEX IF EXISTS idx_ws_parts_job;
DROP INDEX IF EXISTS idx_ws_labour_job;
DROP INDEX IF EXISTS idx_ws_photos_job;
DROP INDEX IF EXISTS idx_ws_qc_job;
DROP INDEX IF EXISTS idx_ws_reports_job;

CREATE INDEX idx_ws_jobs_job ON public.workshop_jobs(job_id);
CREATE INDEX idx_ws_jobs_status ON public.workshop_jobs(status);
CREATE INDEX idx_ws_assign_job ON public.technician_assignments(job_id);
CREATE INDEX idx_ws_notes_job ON public.technician_notes(job_id);
CREATE INDEX idx_ws_parts_job ON public.service_parts(job_id);
CREATE INDEX idx_ws_labour_job ON public.service_labour(job_id);
CREATE INDEX idx_ws_photos_job ON public.service_photos(job_id);
CREATE INDEX idx_ws_qc_job ON public.quality_checks(job_id);
CREATE INDEX idx_ws_reports_job ON public.service_reports(job_id);

-- 12. Enable Row-Level Security (RLS)
ALTER TABLE public.workshop_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_labour ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies
DROP POLICY IF EXISTS "Allow read access to workshop tables for staff" ON public.workshop_jobs;
CREATE POLICY "Allow read access to workshop tables for staff" ON public.workshop_jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write access to workshop tables for staff" ON public.workshop_jobs;
CREATE POLICY "Allow write access to workshop tables for staff" ON public.workshop_jobs FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read/write access to allocations for staff" ON public.technician_assignments;
CREATE POLICY "Allow read/write access to allocations for staff" ON public.technician_assignments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to notes for staff" ON public.technician_notes;
CREATE POLICY "Allow read/write access to notes for staff" ON public.technician_notes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to service sub-tables for staff" ON public.service_parts;
CREATE POLICY "Allow read/write access to service sub-tables for staff" ON public.service_parts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to service sub-tables for staff" ON public.service_labour;
CREATE POLICY "Allow read/write access to service sub-tables for staff" ON public.service_labour FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to service sub-tables for staff" ON public.service_photos;
CREATE POLICY "Allow read/write access to service sub-tables for staff" ON public.service_photos FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to service sub-tables for staff" ON public.quality_checks;
CREATE POLICY "Allow read/write access to service sub-tables for staff" ON public.quality_checks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to service sub-tables for staff" ON public.service_reports;
CREATE POLICY "Allow read/write access to service sub-tables for staff" ON public.service_reports FOR ALL USING (true);
