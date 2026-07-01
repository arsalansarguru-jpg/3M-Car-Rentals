-- Supabase PostgreSQL Database Schema Migration Script
-- Project: 3M Car Rentals Next-Generation Web Platform
-- Phase 2: Database Schema & Row-Level Security Configuration

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. DROP EXISTING CONFLICTING TABLES & FUNCTIONS (Safety Reset)
-- =========================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.driver_licenses CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.vehicle_categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- =========================================================================
-- 2. CREATE HELPER FUNCTIONS & TRIGGERS
-- =========================================================================

-- Trigger function to automatically update "updated_at" timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- =========================================================================
-- 3. DEFINE TABLES SCHEMA
-- =========================================================================

-- Roles table mapping user permission levels
CREATE TABLE public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users table linking public profiles to auth.users
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text UNIQUE,
    role_id uuid REFERENCES public.roles(id) ON DELETE RESTRICT,
    status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'pending')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Driver Licenses table storing KYC credentials
CREATE TABLE public.driver_licenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    license_number text NOT NULL,
    issuing_country text NOT NULL,
    expiry_date date NOT NULL,
    verified_status text DEFAULT 'pending' NOT NULL CHECK (verified_status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_driver_licenses_updated_at
    BEFORE UPDATE ON public.driver_licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vehicle Categories table (e.g. Hatchback, Sedan, SUV, Luxury)
CREATE TABLE public.vehicle_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vehicles table representing the fleet
CREATE TABLE public.vehicles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number text UNIQUE NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    variant text,
    year integer NOT NULL CHECK (year >= 1900 AND year <= extract(year from now()) + 1),
    category_id uuid NOT NULL REFERENCES public.vehicle_categories(id) ON DELETE RESTRICT,
    fuel_type text NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid')),
    transmission text NOT NULL CHECK (transmission IN ('Automatic', 'Manual')),
    seating_capacity integer NOT NULL CHECK (seating_capacity > 0),
    luggage_capacity integer CHECK (luggage_capacity >= 0),
    hourly_rate numeric(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    daily_rate numeric(10, 2) NOT NULL CHECK (daily_rate >= 0),
    security_deposit numeric(10, 2) NOT NULL CHECK (security_deposit >= 0),
    availability_status text DEFAULT 'available' NOT NULL CHECK (availability_status IN ('available', 'limited', 'reserved', 'maintenance', 'coming_soon')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bookings table handling reservations
CREATE TABLE public.bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference text UNIQUE NOT NULL,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    pickup_location text NOT NULL,
    return_location text NOT NULL,
    pickup_datetime timestamp with time zone NOT NULL,
    return_datetime timestamp with time zone NOT NULL CHECK (return_datetime > pickup_datetime),
    booking_status text DEFAULT 'pending' NOT NULL CHECK (booking_status IN ('pending', 'confirmed', 'ready_for_pickup', 'active', 'completed', 'cancelled', 'refunded')),
    payment_status text DEFAULT 'unpaid' NOT NULL CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),
    total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
    deposit_amount numeric(10, 2) NOT NULL CHECK (deposit_amount >= 0),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payments table tracking commercial operations
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    payment_gateway text NOT NULL,
    transaction_reference text UNIQUE,
    amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
    payment_status text NOT NULL CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
    payment_method text CHECK (payment_method IN ('UPI', 'CreditCard', 'DebitCard', 'NetBanking', 'Wallet')),
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews table capturing feedback
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table logging communication audit trail
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type text NOT NULL CHECK (notification_type IN ('BookingConfirmation', 'PaymentReceipt', 'PickupReminder', 'ReturnReminder', 'MaintenanceAlert')),
    delivery_channel text NOT NULL CHECK (delivery_channel IN ('Email', 'SMS', 'WhatsApp')),
    status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'delivered', 'failed')),
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 4. CREATE DATABASE INDEXES FOR low-latency API PERFORMANCE
-- =========================================================================
CREATE INDEX idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX idx_vehicles_status ON public.vehicles(availability_status);
CREATE INDEX idx_vehicles_category ON public.vehicles(category_id);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_vehicle ON public.bookings(vehicle_id);
CREATE INDEX idx_bookings_dates ON public.bookings(pickup_datetime, return_datetime);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_reviews_vehicle ON public.reviews(vehicle_id);

-- =========================================================================
-- 5. ENABLE ROW-LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5a. Roles policies
CREATE POLICY "Allow read access to roles for everyone" ON public.roles FOR SELECT USING (true);

-- 5b. Users policies
CREATE POLICY "Allow read access to user profile for owner" ON public.users FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Allow update to user profile for owner" ON public.users FOR UPDATE USING (auth.uid() = auth_user_id);

-- 5c. Vehicle categories & Fleet policies
CREATE POLICY "Allow read access to vehicle categories for everyone" ON public.vehicle_categories FOR SELECT USING (true);
CREATE POLICY "Allow read access to vehicles for everyone" ON public.vehicles FOR SELECT USING (true);

-- 5d. Bookings policies
CREATE POLICY "Allow read bookings for owner" ON public.bookings FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
);
CREATE POLICY "Allow insert bookings for authenticated users" ON public.bookings FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

-- 5e. Payments policies
CREATE POLICY "Allow read payments for booking owner" ON public.payments FOR SELECT USING (
    auth.uid() IN (
        SELECT u.auth_user_id 
        FROM public.users u 
        JOIN public.bookings b ON b.user_id = u.id 
        WHERE b.id = booking_id
    )
);

-- 5f. Reviews policies
CREATE POLICY "Allow read reviews for everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert reviews for booking owner" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

-- =========================================================================
-- 6. AUTH SIGNUP DATABASE SYNCHRONIZATION FUNCTION & TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, first_name, last_name, email, phone, role_id, status)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    new.phone,
    (SELECT id FROM public.roles WHERE name = 'customer' LIMIT 1),
    'active'
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Roles data
INSERT INTO public.roles (name) VALUES ('customer'), ('staff'), ('manager'), ('admin'), ('super_admin') ON CONFLICT DO NOTHING;
