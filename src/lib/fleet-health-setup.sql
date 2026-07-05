-- =============================================================================
-- 3M Car Rentals — AI Fleet Health Center SQL Setup Migration
-- Run this script in the Supabase SQL Editor
-- =============================================================================

-- 1. Create Vehicle Health Table (1:1 with vehicles)
CREATE TABLE IF NOT EXISTS public.vehicle_health (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid UNIQUE NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    insurance_expiry date NOT NULL,
    rc_expiry date NOT NULL,
    puc_expiry date NOT NULL,
    fastag_balance numeric(10, 2) DEFAULT 0.00 NOT NULL,
    last_service_date date NOT NULL,
    next_service_date date NOT NULL,
    last_service_odometer integer NOT NULL CHECK (last_service_odometer >= 0),
    last_oil_change_date date NOT NULL,
    last_oil_change_odometer integer NOT NULL CHECK (last_oil_change_odometer >= 0),
    next_oil_change_odometer integer NOT NULL CHECK (next_oil_change_odometer >= 0),
    tyre_tread_depth_mm numeric(3, 1) DEFAULT 8.0 NOT NULL CHECK (tyre_tread_depth_mm >= 0.0 AND tyre_tread_depth_mm <= 15.0),
    tyre_install_date date NOT NULL,
    tyre_alignment_date date NOT NULL,
    battery_health_pct integer DEFAULT 100 NOT NULL CHECK (battery_health_pct >= 0 AND battery_health_pct <= 100),
    battery_install_date date NOT NULL,
    battery_voltage numeric(4, 2) DEFAULT 12.60 NOT NULL CHECK (battery_voltage >= 0.0 AND battery_voltage <= 16.0),
    cleanliness_score integer DEFAULT 10 NOT NULL CHECK (cleanliness_score >= 1 AND cleanliness_score <= 10),
    cleanliness_status text DEFAULT 'Clean' NOT NULL CHECK (cleanliness_status IN ('Clean', 'Dirty', 'Detailing')),
    current_odometer integer DEFAULT 0 NOT NULL CHECK (current_odometer >= 0),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Vehicle Incidents Table (1:M accidents/damages logs)
CREATE TABLE IF NOT EXISTS public.vehicle_incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    incident_type text NOT NULL CHECK (incident_type IN ('accident', 'damage')),
    date date NOT NULL,
    description text NOT NULL,
    severity text NOT NULL CHECK (severity IN ('minor', 'moderate', 'major')),
    cost numeric(10, 2) DEFAULT 0.00 NOT NULL CHECK (cost >= 0),
    status text DEFAULT 'reported' NOT NULL CHECK (status IN ('reported', 'repairing', 'resolved')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Vehicle Maintenance Logs Table (1:M service history)
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    service_type text NOT NULL CHECK (service_type IN ('scheduled_service', 'oil_change', 'tyre_replacement', 'battery_replacement', 'general_repair', 'detailing')),
    date date NOT NULL,
    odometer integer NOT NULL CHECK (odometer >= 0),
    cost numeric(10, 2) DEFAULT 0.00 NOT NULL CHECK (cost >= 0),
    details text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row-Level Security
ALTER TABLE public.vehicle_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function to Check Admin/Staff role
CREATE OR REPLACE FUNCTION public.is_admin_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.auth_user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager', 'staff', 'operations_manager', 'branch_manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Define RLS Policies
DROP POLICY IF EXISTS "Allow read access to vehicle_health for everyone" ON public.vehicle_health;
CREATE POLICY "Allow read access to vehicle_health for everyone" ON public.vehicle_health
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all access to vehicle_health for admin staff" ON public.vehicle_health;
CREATE POLICY "Allow all access to vehicle_health for admin staff" ON public.vehicle_health
    FOR ALL USING (public.is_admin_staff());

DROP POLICY IF EXISTS "Allow all access to incidents for admin staff" ON public.vehicle_incidents;
CREATE POLICY "Allow all access to incidents for admin staff" ON public.vehicle_incidents
    FOR ALL USING (public.is_admin_staff());

DROP POLICY IF EXISTS "Allow all access to maintenance_logs for admin staff" ON public.vehicle_maintenance_logs;
CREATE POLICY "Allow all access to maintenance_logs for admin staff" ON public.vehicle_maintenance_logs
    FOR ALL USING (public.is_admin_staff());

-- 7. Seed vehicle health records dynamically for all vehicles that exist in public.vehicles
DO $$
DECLARE
    v_rec RECORD;
    v_index INTEGER := 1;
    v_puc date;
    v_ins date;
    v_fastag numeric;
    v_tread numeric;
    v_batt_health integer;
    v_cleanliness text;
    v_clean_score integer;
    v_odo integer;
BEGIN
    FOR v_rec IN SELECT id FROM public.vehicles LOOP
        v_odo := 12000 + v_index * 3500;
        
        -- Generate slightly different parameters based on index to demonstrate UI alerts
        IF v_index = 1 THEN
            -- Swift (index 1) - Perfect
            v_ins := '2027-04-15';
            v_puc := '2026-12-05';
            v_fastag := 1250.00;
            v_tread := 6.2;
            v_batt_health := 92;
            v_cleanliness := 'Clean';
            v_clean_score := 9;
        ELSIF v_index = 2 THEN
            -- i20 (index 2) - Low FASTag (₹180)
            v_ins := '2027-02-18';
            v_puc := '2026-10-14';
            v_fastag := 180.00;
            v_tread := 5.8;
            v_batt_health := 88;
            v_cleanliness := 'Clean';
            v_clean_score := 8;
        ELSIF v_index = 3 THEN
            -- Honda City (index 3) - Expired PUC (blocks booking)
            v_ins := '2027-05-20';
            v_puc := '2026-07-01'; -- expired
            v_fastag := 850.00;
            v_tread := 4.2;
            v_batt_health := 76;
            v_cleanliness := 'Clean';
            v_clean_score := 8;
        ELSIF v_index = 4 THEN
            -- Ciaz (index 4) - Expiring Insurance, low battery
            v_ins := '2026-07-18'; -- expiring soon
            v_puc := '2026-09-12';
            v_fastag := 1500.00;
            v_tread := 5.0;
            v_batt_health := 25; -- low battery
            v_cleanliness := 'Clean';
            v_clean_score := 9;
        ELSIF v_index = 5 THEN
            -- Creta (index 5) - Worn tyres, dirty
            v_ins := '2027-01-10';
            v_puc := '2026-11-20';
            v_fastag := 650.00;
            v_tread := 2.5; -- worn tyres
            v_batt_health := 82;
            v_cleanliness := 'Dirty';
            v_clean_score := 4;
        ELSE
            -- Healthy defaults
            v_ins := '2027-06-01';
            v_puc := '2026-12-31';
            v_fastag := 2000.00;
            v_tread := 7.0;
            v_batt_health := 95;
            v_cleanliness := 'Clean';
            v_clean_score := 9;
        END IF;

        INSERT INTO public.vehicle_health (
          vehicle_id, insurance_expiry, rc_expiry, puc_expiry, fastag_balance,
          last_service_date, next_service_date, last_service_odometer,
          last_oil_change_date, last_oil_change_odometer, next_oil_change_odometer,
          tyre_tread_depth_mm, tyre_install_date, tyre_alignment_date,
          battery_health_pct, battery_install_date, battery_voltage,
          cleanliness_score, cleanliness_status, current_odometer
        ) VALUES (
          v_rec.id, v_ins, '2039-01-01', v_puc, v_fastag,
          '2026-05-10', '2026-11-10', v_odo - 5000,
          '2026-05-10', v_odo - 5000, v_odo + 5000,
          v_tread, '2025-06-10', '2026-05-10',
          v_batt_health, '2025-06-10', 12.60,
          v_clean_score, v_cleanliness, v_odo
        ) ON CONFLICT (vehicle_id) DO NOTHING;

        v_index := v_index + 1;
    END LOOP;
END $$;

-- Seed some incidents for existing vehicles dynamically
DO $$
DECLARE
    v_id uuid;
BEGIN
    SELECT id INTO v_id FROM public.vehicles LIMIT 1;
    IF v_id IS NOT NULL THEN
        INSERT INTO public.vehicle_incidents (vehicle_id, incident_type, date, description, severity, cost, status) VALUES
          (v_id, 'damage', '2026-06-15', 'Rear bumper minor dent from parallel parking backup.', 'minor', 4500.00, 'reported');
          
        INSERT INTO public.vehicle_maintenance_logs (vehicle_id, service_type, date, odometer, cost, details) VALUES
          (v_id, 'scheduled_service', '2026-05-10', 12000, 5600.00, '12k standard periodic checkup, cabin filter replacement.'),
          (v_id, 'oil_change', '2026-05-10', 12000, 3200.00, 'Fully synthetic engine oil and oil filter change.');
    END IF;
END $$;
