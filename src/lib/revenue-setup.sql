-- SQL Migration Script: AI Revenue Management System V2.0 Additions
-- Run this in the Supabase SQL Editor

-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    city text NOT NULL,
    latitude numeric(9,6),
    longitude numeric(9,6),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add branch_id to Vehicles Table (Nullable initially, to avoid breaking existing queries)
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL;

-- 3. Customer Revenue Stats (CLV and Segmentation cache)
CREATE TABLE IF NOT EXISTS public.customer_revenue_stats (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    segment text DEFAULT 'General' NOT NULL CHECK (segment IN (
        'VIP', 'Corporate', 'Tourist', 'Repeat', 'Weekend Traveler', 
        'Business Traveler', 'Luxury Customer', 'Budget Customer', 'Risk Customer', 'General'
    )),
    clv_score numeric(12, 2) DEFAULT 0.00 NOT NULL CHECK (clv_score >= 0),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Promotions Table (Targeted campaign triggers)
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_name text UNIQUE NOT NULL,
    promo_code text UNIQUE NOT NULL,
    discount_pct numeric(5, 2) NOT NULL CHECK (discount_pct >= 0 AND discount_pct <= 100),
    active boolean DEFAULT true NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Executive Reports Table (Historical Daily/Weekly/Monthly AI summaries)
CREATE TABLE IF NOT EXISTS public.executive_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type text NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    report_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Fleet Relocations Logs
CREATE TABLE IF NOT EXISTS public.fleet_relocations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    from_branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
    to_branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'in_transit', 'completed', 'cancelled')),
    reason text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Upgrades Offered (Upsell logs and probabilities)
CREATE TABLE IF NOT EXISTS public.upgrades_offered (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    original_vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    upgraded_vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    acceptance_probability numeric(5, 2) NOT NULL CHECK (acceptance_probability >= 0 AND acceptance_probability <= 100),
    expected_revenue_increase numeric(10, 2) NOT NULL CHECK (expected_revenue_increase >= 0),
    accepted boolean, -- NULL = pending check, true = accepted, false = rejected
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Maintenance Plans (Low-demand slot scheduling)
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_type text NOT NULL CHECK (maintenance_type IN ('service', 'repair', 'detail')),
    scheduled_date date NOT NULL,
    cost numeric(10, 2) DEFAULT 0.00 NOT NULL CHECK (cost >= 0),
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Insert new security roles to roles table
INSERT INTO public.roles (name) VALUES 
  ('finance_manager'),
  ('operations_manager'),
  ('branch_manager'),
  ('viewer')
ON CONFLICT (name) DO NOTHING;

-- 10. Seed default branches
INSERT INTO public.branches (name, city, latitude, longitude) VALUES
  ('Goa Airport Hub',      'Goa',    15.380000, 73.830000),
  ('Goa City Center',      'Goa',    15.498900, 73.827800),
  ('Mumbai Airport Terminal','Mumbai', 19.089600, 72.865600),
  ('Pune IT Park Hub',     'Pune',   18.520400, 73.856700)
ON CONFLICT (name) DO NOTHING;

-- 11. Seed default promotions
INSERT INTO public.promotions (promo_name, promo_code, discount_pct, active, description) VALUES
  ('10% Flat Occupancy Saver', 'SAVER10', 10.00, true, 'Triggered automatically when utilization falls below 50%.'),
  ('Weekend Explorer Package',  'WEEKEND20',20.00, true, 'Special Friday-Sunday bookings discount.'),
  ('Airport Landing Campaign',  'AIRPORT15',15.00, true, 'Promotion for airport terminal pickup locations.'),
  ('Long-Term Leasers Deal',   'LONGTERM25',25.00, true, 'Applied on bookings exceeding 14 days duration.')
ON CONFLICT (promo_name) DO NOTHING;

-- 12. Assign all existing vehicles to a branch dynamically if branch_id is empty
DO $$
DECLARE
    v_record RECORD;
    v_branch_id uuid;
BEGIN
    SELECT id INTO v_branch_id FROM public.branches LIMIT 1;
    IF v_branch_id IS NOT NULL THEN
        UPDATE public.vehicles SET branch_id = v_branch_id WHERE branch_id IS NULL;
    END IF;
END $$;
