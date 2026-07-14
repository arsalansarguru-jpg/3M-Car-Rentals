-- =============================================================================
-- RentalOS Maintenance Subsystem Migration (Sprint 1)
-- =============================================================================

-- 1. Create Enums (Idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_priority') THEN
        CREATE TYPE public.maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_status') THEN
        CREATE TYPE public.maintenance_status AS ENUM (
            'scheduled', 'awaiting_inspection', 'inspection_complete', 'awaiting_approval',
            'in_workshop', 'waiting_parts', 'repairing', 'qc_pending', 'qc_passed', 'closed', 'cancelled'
        );
    END IF;
END$$;

-- 2. Job Number Sequence
CREATE SEQUENCE IF NOT EXISTS public.maintenance_job_number_seq START 1;

-- 3. Maintenance Jobs Table
CREATE TABLE IF NOT EXISTS public.maintenance_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    job_number text UNIQUE NOT NULL,
    trigger_type text NOT NULL CHECK (trigger_type IN ('mileage', 'incident', 'duration', 'manual')),
    priority public.maintenance_priority DEFAULT 'medium'::public.maintenance_priority NOT NULL,
    status public.maintenance_status DEFAULT 'scheduled'::public.maintenance_status NOT NULL,
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    workshop text,
    estimated_cost numeric(10, 2) DEFAULT 0.00 NOT NULL CHECK (estimated_cost >= 0),
    actual_cost numeric(10, 2) DEFAULT 0.00 NOT NULL CHECK (actual_cost >= 0),
    description text,
    estimated_completion date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone,
    deleted_at timestamp with time zone
);

-- 4. Job Number Auto-Generator Trigger
CREATE OR REPLACE FUNCTION public.set_maintenance_job_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year text;
  seq_val integer;
BEGIN
  current_year := to_char(now(), 'YYYY');
  seq_val := nextval('public.maintenance_job_number_seq');
  NEW.job_number := 'MT-' || current_year || '-' || lpad(seq_val::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_maintenance_job_number ON public.maintenance_jobs;
CREATE TRIGGER trigger_set_maintenance_job_number
    BEFORE INSERT ON public.maintenance_jobs
    FOR EACH ROW
    WHEN (NEW.job_number IS NULL OR NEW.job_number = '')
    EXECUTE FUNCTION public.set_maintenance_job_number();

-- 5. Maintenance Tasks Table
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    task_name text NOT NULL,
    notes text,
    is_completed boolean DEFAULT false NOT NULL,
    completed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Maintenance Parts Table
CREATE TABLE IF NOT EXISTS public.maintenance_parts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    part_name text NOT NULL,
    part_type text NOT NULL CHECK (part_type IN ('oem', 'aftermarket')),
    vendor_name text NOT NULL,
    cost numeric(10, 2) NOT NULL CHECK (cost >= 0),
    quantity integer DEFAULT 1 NOT NULL CHECK (quantity > 0),
    warranty_months integer DEFAULT 0 NOT NULL CHECK (warranty_months >= 0),
    invoice_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Maintenance Photos Table
CREATE TABLE IF NOT EXISTS public.maintenance_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    photo_url text NOT NULL,
    category text NOT NULL CHECK (category IN ('pre_inspection', 'repair_work', 'post_qc', 'invoice')),
    uploaded_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Maintenance History / Audit Logs Table
CREATE TABLE IF NOT EXISTS public.maintenance_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
    changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    action_type text NOT NULL, -- 'created', 'status_changed', 'part_added', 'task_completed'
    old_value text,
    new_value text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Auto Update Timestamp Trigger
DROP TRIGGER IF EXISTS update_maintenance_jobs_updated_at ON public.maintenance_jobs;
CREATE TRIGGER update_maintenance_jobs_updated_at
    BEFORE UPDATE ON public.maintenance_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_tasks_updated_at ON public.maintenance_tasks;
CREATE TRIGGER update_maintenance_tasks_updated_at
    BEFORE UPDATE ON public.maintenance_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Database Indexes
DROP INDEX IF EXISTS idx_m_jobs_vehicle;
DROP INDEX IF EXISTS idx_m_jobs_status;
DROP INDEX IF EXISTS idx_m_tasks_job;
DROP INDEX IF EXISTS idx_m_parts_job;
DROP INDEX IF EXISTS idx_m_photos_job;
DROP INDEX IF EXISTS idx_m_history_job;

CREATE INDEX idx_m_jobs_vehicle ON public.maintenance_jobs(vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_m_jobs_status ON public.maintenance_jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_m_tasks_job ON public.maintenance_tasks(job_id);
CREATE INDEX idx_m_parts_job ON public.maintenance_parts(job_id);
CREATE INDEX idx_m_photos_job ON public.maintenance_photos(job_id);
CREATE INDEX idx_m_history_job ON public.maintenance_history(job_id);

-- 11. Enable Row-Level Security (RLS)
ALTER TABLE public.maintenance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies
DROP POLICY IF EXISTS "Allow read access to maintenance_jobs for staff" ON public.maintenance_jobs;
CREATE POLICY "Allow read access to maintenance_jobs for staff" ON public.maintenance_jobs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write access to maintenance_jobs for staff" ON public.maintenance_jobs;
CREATE POLICY "Allow write access to maintenance_jobs for staff" ON public.maintenance_jobs
    FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to maintenance_tasks for staff" ON public.maintenance_tasks;
CREATE POLICY "Allow read access to maintenance_tasks for staff" ON public.maintenance_tasks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write access to maintenance_tasks for staff" ON public.maintenance_tasks;
CREATE POLICY "Allow write access to maintenance_tasks for staff" ON public.maintenance_tasks
    FOR ALL WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read/write access to sub-tables for staff" ON public.maintenance_parts;
CREATE POLICY "Allow read/write access to sub-tables for staff" ON public.maintenance_parts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to sub-tables for staff" ON public.maintenance_photos;
CREATE POLICY "Allow read/write access to sub-tables for staff" ON public.maintenance_photos FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read/write access to sub-tables for staff" ON public.maintenance_history;
CREATE POLICY "Allow read/write access to sub-tables for staff" ON public.maintenance_history FOR ALL USING (true);
