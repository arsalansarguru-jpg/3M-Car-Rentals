-- SQL Migration script to add metadata, featured, and is_visible fields to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
