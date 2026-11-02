-- =============================================================================
-- 3M Car Rentals — Preventive Maintenance Rules SQL Setup Migration
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.maintenance_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    brand text DEFAULT '*' NOT NULL,
    model text DEFAULT '*' NOT NULL,
    trigger_type text NOT NULL CHECK (trigger_type IN ('mileage', 'time', 'vehicle_age', 'both', 'all')),
    interval_km integer, -- Odometer interval limit
    interval_months integer, -- Elapsed time interval limit
    age_limit_months integer, -- Vehicle age limit threshold
    actions text[] DEFAULT ARRAY['create_ticket', 'notify_staff']::text[] NOT NULL,
    service_type text NOT NULL CHECK (service_type IN ('scheduled_service', 'oil_change', 'tyre_replacement', 'battery_replacement', 'general_repair', 'detailing')),
    priority text DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.maintenance_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to maintenance_rules for everyone" ON public.maintenance_rules;
CREATE POLICY "Allow read access to maintenance_rules for everyone" ON public.maintenance_rules
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all access to maintenance_rules for admin staff" ON public.maintenance_rules;
CREATE POLICY "Allow all access to maintenance_rules for admin staff" ON public.maintenance_rules
    FOR ALL USING (public.is_admin_staff());

-- Seeding default data-driven rules
INSERT INTO public.maintenance_rules (name, brand, model, trigger_type, interval_km, interval_months, age_limit_months, actions, service_type, priority, description)
VALUES
  (
    'Standard Periodic Service', '*', '*', 'both', 10000, 6, NULL,
    ARRAY['create_ticket', 'notify_staff'], 'scheduled_service', 'medium',
    'Standard 10,000 km / 6 months checkup for normal fleet.'
  ),
  (
    'Engine Oil Replacement Check', '*', '*', 'mileage', 5000, NULL, NULL,
    ARRAY['create_ticket', 'notify_staff'], 'oil_change', 'medium',
    'Synthetic engine oil and filter renewal check.'
  ),
  (
    'Luxury Vehicle Annual Audit', 'BMW', '*', 'time', NULL, 12, NULL,
    ARRAY['create_ticket', 'notify_staff', 'notify_operations'], 'scheduled_service', 'high',
    'High priority annual service schedule checkup for luxury brands.'
  ),
  (
    'Luxury Vehicle Annual Audit Mercedes', 'Mercedes-Benz', '*', 'time', NULL, 12, NULL,
    ARRAY['create_ticket', 'notify_staff', 'notify_operations'], 'scheduled_service', 'high',
    'High priority annual service schedule checkup for luxury brands.'
  ),
  (
    'Swift Routine Checkup', 'Maruti Suzuki', 'Swift', 'both', 8000, 6, NULL,
    ARRAY['create_ticket', 'notify_staff'], 'scheduled_service', 'low',
    'Custom routine mileage schedule for Suzuki Swift hatchbacks.'
  ),
  (
    'Older Fleet Safety Check', '*', '*', 'vehicle_age', NULL, NULL, 36,
    ARRAY['notify_staff'], 'general_repair', 'medium',
    'Special diagnostics inspection check for cars older than 3 years.'
  ),
  (
    'Tyre Wear Check', '*', '*', 'mileage', 15000, NULL, NULL,
    ARRAY['create_ticket', 'notify_staff'], 'tyre_replacement', 'low',
    'Evaluate tyres replacement schedule every 15,000 km.'
  )
ON CONFLICT DO NOTHING;
