-- 3M Car Rentals Database Migration: Premium Booking Schema Extension

-- 1. Extend Bookings table with luxury reservation parameters and admin checklists
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS pickup_method text CHECK (pickup_method IN ('Office', 'Airport', 'Hotel', 'Home Delivery')),
ADD COLUMN IF NOT EXISTS insurance_tier text CHECK (insurance_tier IN ('Basic', 'Premium', 'Zero-Deductible')),
ADD COLUMN IF NOT EXISTS addons jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS signature_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preparation_checklist jsonb DEFAULT '{"cleaning": false, "fuel": false, "inspection": false}'::jsonb,
ADD COLUMN IF NOT EXISTS assigned_vehicle_reg text,
ADD COLUMN IF NOT EXISTS internal_notes text,
ADD COLUMN IF NOT EXISTS audit_trail jsonb DEFAULT '[]'::jsonb;
