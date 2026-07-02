-- =============================================================================
-- 3M Car Rentals — Seed Data
-- Run this in the Supabase SQL Editor AFTER schema.sql has been executed.
-- Safe to run multiple times — uses ON CONFLICT DO NOTHING.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Vehicle Categories
-- -----------------------------------------------------------------------------
INSERT INTO public.vehicle_categories (id, name, slug, description, created_at)
VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Hatchback',   'hatchback',   'Compact and fuel-efficient city cars, perfect for exploring Goa''s streets.', now()),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Sedan',        'sedan',        'Comfortable saloons offering extra legroom for longer journeys.',             now()),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'SUV',          'suv',          'Spacious family SUVs ideal for beach trips and countryside drives.',          now()),
  ('a1b2c3d4-0001-0001-0001-000000000004', 'Luxury',       'luxury',       'Premium European luxury saloons for a first-class Goa experience.',           now()),
  ('a1b2c3d4-0001-0001-0001-000000000005', 'Premium SUV',  'premium-suv',  'Top-of-the-line SUVs combining performance with unmatched prestige.',         now())
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Sample Fleet (8 vehicles)
-- -----------------------------------------------------------------------------
INSERT INTO public.vehicles (
  id, registration_number, brand, model, variant, year, category_id,
  fuel_type, transmission, seating_capacity, luggage_capacity,
  hourly_rate, daily_rate, security_deposit, availability_status, created_at, updated_at
)
VALUES
  -- Hatchbacks
  (
    'b2c3d4e5-0001-0001-0001-000000000001',
    'GA01-AA-1001', 'Maruti Suzuki', 'Swift', 'ZXi', 2023,
    'a1b2c3d4-0001-0001-0001-000000000001',
    'petrol', 'manual', 5, 2,
    150.00, 1200.00, 5000.00, 'available', now(), now()
  ),
  (
    'b2c3d4e5-0001-0001-0001-000000000002',
    'GA01-AA-1002', 'Hyundai', 'i20', 'Asta', 2023,
    'a1b2c3d4-0001-0001-0001-000000000001',
    'petrol', 'automatic', 5, 2,
    175.00, 1400.00, 5000.00, 'available', now(), now()
  ),

  -- Sedans
  (
    'b2c3d4e5-0001-0001-0001-000000000003',
    'GA01-AB-2001', 'Honda', 'City', 'ZX CVT', 2024,
    'a1b2c3d4-0001-0001-0001-000000000002',
    'petrol', 'automatic', 5, 3,
    220.00, 2000.00, 8000.00, 'available', now(), now()
  ),
  (
    'b2c3d4e5-0001-0001-0001-000000000004',
    'GA01-AB-2002', 'Maruti Suzuki', 'Ciaz', 'Alpha', 2023,
    'a1b2c3d4-0001-0001-0001-000000000002',
    'petrol', 'automatic', 5, 3,
    200.00, 1800.00, 7000.00, 'available', now(), now()
  ),

  -- SUVs
  (
    'b2c3d4e5-0001-0001-0001-000000000005',
    'GA01-AC-3001', 'Hyundai', 'Creta', 'SX(O)', 2024,
    'a1b2c3d4-0001-0001-0001-000000000003',
    'diesel', 'automatic', 5, 4,
    300.00, 2800.00, 10000.00, 'available', now(), now()
  ),
  (
    'b2c3d4e5-0001-0001-0001-000000000006',
    'GA01-AC-3002', 'Mahindra', 'Thar', 'LX 4WD', 2024,
    'a1b2c3d4-0001-0001-0001-000000000003',
    'diesel', 'automatic', 4, 2,
    350.00, 3200.00, 12000.00, 'available', now(), now()
  ),

  -- Luxury
  (
    'b2c3d4e5-0001-0001-0001-000000000007',
    'GA01-AD-4001', 'BMW', '3 Series', '330i Sport', 2024,
    'a1b2c3d4-0001-0001-0001-000000000004',
    'petrol', 'automatic', 5, 3,
    650.00, 6000.00, 30000.00, 'available', now(), now()
  ),

  -- Premium SUV
  (
    'b2c3d4e5-0001-0001-0001-000000000008',
    'GA01-AE-5001', 'Mercedes-Benz', 'GLE', '400d 4MATIC', 2024,
    'a1b2c3d4-0001-0001-0001-000000000005',
    'diesel', 'automatic', 5, 5,
    1100.00, 10500.00, 50000.00, 'available', now(), now()
  )
ON CONFLICT (id) DO NOTHING;
