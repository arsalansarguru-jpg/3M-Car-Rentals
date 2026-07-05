-- =============================================================================
-- 3M Car Rentals — AI Dynamic Pricing & Revenue Management Setup
-- Run this script in the Supabase SQL Editor to configure tables & RLS policies.
-- =============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if the current user belongs to the administrative staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.auth_user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager', 'staff', 'revenue_manager')
  );
END;
$$ language plpgsql;

-- -----------------------------------------------------------------------------
-- 1. Create Tables
-- -----------------------------------------------------------------------------

-- Pricing Rules Table
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name text UNIQUE NOT NULL,
    rule_type text NOT NULL CHECK (rule_type IN ('utilization', 'season', 'holiday', 'weekend', 'lead_time', 'popularity')),
    adjustment_type text NOT NULL CHECK (adjustment_type IN ('percentage', 'flat')),
    adjustment_value numeric(10, 2) NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Holidays Table
CREATE TABLE IF NOT EXISTS public.holidays (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    holiday_name text UNIQUE NOT NULL,
    date date UNIQUE NOT NULL,
    pricing_multiplier numeric(5, 2) NOT NULL DEFAULT 1.0 CHECK (pricing_multiplier >= 0),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    season_name text UNIQUE NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    multiplier numeric(5, 2) NOT NULL DEFAULT 1.0 CHECK (multiplier >= 0),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pricing Settings Table (Single-row Table)
CREATE TABLE IF NOT EXISTS public.pricing_settings (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    minimum_price numeric(10, 2) NOT NULL DEFAULT 500.00 CHECK (minimum_price >= 0),
    maximum_price numeric(10, 2) NOT NULL DEFAULT 100000.00 CHECK (maximum_price >= minimum_price),
    maximum_daily_increase numeric(5, 2) NOT NULL DEFAULT 50.00 CHECK (maximum_daily_increase >= 0),
    maximum_daily_decrease numeric(5, 2) NOT NULL DEFAULT 50.00 CHECK (maximum_daily_decrease >= 0),
    approval_required boolean NOT NULL DEFAULT true,
    auto_pricing_enabled boolean NOT NULL DEFAULT false,
    pricing_interval text NOT NULL DEFAULT 'hourly',
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pricing Decision Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.pricing_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    old_price numeric(10, 2) NOT NULL CHECK (old_price >= 0),
    new_price numeric(10, 2) NOT NULL CHECK (new_price >= 0),
    base_price numeric(10, 2) NOT NULL CHECK (base_price >= 0),
    final_price numeric(10, 2) NOT NULL CHECK (final_price >= 0),
    reason text NOT NULL,
    confidence_score integer NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    utilization numeric(5, 2) NOT NULL CHECK (utilization >= 0 AND utilization <= 100),
    demand_score integer NOT NULL CHECK (demand_score >= 0 AND demand_score <= 100),
    season text,
    holiday text,
    approved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'auto_applied')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to keep pricing_settings updated_at current
CREATE OR REPLACE TRIGGER update_pricing_settings_updated_at
    BEFORE UPDATE ON public.pricing_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 2. Configure Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_logs ENABLE ROW LEVEL SECURITY;

-- pricing_rules policies
CREATE POLICY "Allow read rules to authenticated users" ON public.pricing_rules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow write rules to admin staff" ON public.pricing_rules FOR ALL USING (public.is_staff());

-- holidays policies
CREATE POLICY "Allow read holidays to everyone" ON public.holidays FOR SELECT USING (true);
CREATE POLICY "Allow write holidays to admin staff" ON public.holidays FOR ALL USING (public.is_staff());

-- seasons policies
CREATE POLICY "Allow read seasons to everyone" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Allow write seasons to admin staff" ON public.seasons FOR ALL USING (public.is_staff());

-- pricing_settings policies
CREATE POLICY "Allow read settings to authenticated users" ON public.pricing_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow write settings to admin staff" ON public.pricing_settings FOR ALL USING (public.is_staff());

-- pricing_logs policies
CREATE POLICY "Allow read logs to admin staff" ON public.pricing_logs FOR SELECT USING (public.is_staff());
CREATE POLICY "Allow insert logs to admin staff" ON public.pricing_logs FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "Allow update logs to admin staff" ON public.pricing_logs FOR UPDATE USING (public.is_staff());

-- -----------------------------------------------------------------------------
-- 3. Seed Reference Data
-- -----------------------------------------------------------------------------

-- Seed default pricing settings (Single row)
INSERT INTO public.pricing_settings (id, minimum_price, maximum_price, maximum_daily_increase, maximum_daily_decrease, approval_required, auto_pricing_enabled, pricing_interval)
VALUES (1, 1000.00, 50000.00, 40.00, 30.00, true, false, 'hourly')
ON CONFLICT (id) DO UPDATE SET
  minimum_price = EXCLUDED.minimum_price,
  maximum_price = EXCLUDED.maximum_price;

-- Seed default holidays
INSERT INTO public.holidays (holiday_name, date, pricing_multiplier)
VALUES
  ('New Year Celebration', '2026-01-01', 1.50),
  ('Diwali Festival',       '2026-11-12', 1.20),
  ('Goa Carnival',          '2026-02-20', 1.25),
  ('Christmas Day',         '2026-12-25', 1.30)
ON CONFLICT (holiday_name) DO NOTHING;

-- Seed default seasons (Using generic 2026 bounds)
INSERT INTO public.seasons (season_name, start_date, end_date, multiplier)
VALUES
  ('Peak Summer / New Year Season', '2026-11-01', '2026-01-31', 1.20),
  ('Mid-Season / Autumn Spring',    '2026-02-01', '2026-05-31', 1.10),
  ('Monsoon Off-Season',            '2026-06-01', '2026-10-31', 0.90)
ON CONFLICT (season_name) DO NOTHING;

-- Seed default pricing rules
INSERT INTO public.pricing_rules (rule_name, rule_type, adjustment_type, adjustment_value, priority, active)
VALUES
  ('Utilization High (>90%)',    'utilization', 'percentage',  15.00, 10, true),
  ('Utilization Normal-High (80-90%)', 'utilization', 'percentage',   5.00,  8, true),
  ('Utilization Normal-Low (40-60%)',  'utilization', 'percentage',  -5.00,  6, true),
  ('Utilization Low (<40%)',     'utilization', 'percentage', -15.00,  5, true),
  ('Early Bird Booking (>30 days)', 'lead_time',   'percentage', -10.00,  4, true),
  ('Last Minute Booking (<24h)',  'lead_time',   'percentage',  10.00,  3, true),
  ('Same Day Urgency Booking',    'lead_time',   'percentage',  15.00,  2, true),
  ('Weekend Premium Saturday',    'weekend',     'percentage',  10.00,  9, true),
  ('Weekend Premium Sunday',      'weekend',     'percentage',   8.00,  8, true),
  ('Weekend Premium Friday',      'weekend',     'percentage',   5.00,  7, true),
  ('High Popularity Vehicle Rating', 'popularity', 'percentage',   5.00,  4, true),
  ('Low Popularity Vehicle Promo',   'popularity', 'percentage',  -5.00,  3, true)
ON CONFLICT (rule_name) DO NOTHING;

-- Insert revenue_manager role to register access control
INSERT INTO public.roles (name) VALUES ('revenue_manager') ON CONFLICT DO NOTHING;
