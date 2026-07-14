-- 3M Car Rentals Database Migration: KYC & Premium Onboarding Schema Extension

-- 1. Extend Users table with KYC progress & customer preferences
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'under_review', 'approved', 'action_required')),
ADD COLUMN IF NOT EXISTS profile_completed_percent integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS dob date,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
ADD COLUMN IF NOT EXISTS preferred_locations text[],
ADD COLUMN IF NOT EXISTS preferred_categories text[],
ADD COLUMN IF NOT EXISTS loyalty_tier text DEFAULT 'Silver' CHECK (loyalty_tier IN ('Silver', 'Gold', 'Platinum', 'Black'));

-- 2. Extend Driver Licenses table to hold all KYC uploaded files & verify logs
-- First make existing columns nullable to support multi-step draft saves
ALTER TABLE public.driver_licenses 
ALTER COLUMN license_number DROP NOT NULL,
ALTER COLUMN issuing_country DROP NOT NULL,
ALTER COLUMN expiry_date DROP NOT NULL;

-- Add new columns for document scans, KYC verification checklist & audit trails
ALTER TABLE public.driver_licenses
ADD COLUMN IF NOT EXISTS license_front_url text,
ADD COLUMN IF NOT EXISTS license_back_url text,
ADD COLUMN IF NOT EXISTS govt_id_type text CHECK (govt_id_type IN ('Aadhaar', 'Passport', 'PAN')),
ADD COLUMN IF NOT EXISTS govt_id_number text,
ADD COLUMN IF NOT EXISTS govt_id_url text,
ADD COLUMN IF NOT EXISTS selfie_url text,
ADD COLUMN IF NOT EXISTS address_proof_url text,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS audit_trail jsonb DEFAULT '[]'::jsonb;

-- 3. Update existing policies if necessary to grant admin full select, update, delete for kyc review
DROP POLICY IF EXISTS "Allow select to driver_licenses for admin staff" ON public.driver_licenses;
DROP POLICY IF EXISTS "Allow update to driver_licenses for admin staff" ON public.driver_licenses;

CREATE POLICY "Allow select to driver_licenses for admin staff" ON public.driver_licenses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.auth_user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager', 'staff')
    )
);

CREATE POLICY "Allow update to driver_licenses for admin staff" ON public.driver_licenses FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.auth_user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager', 'staff')
    )
);
