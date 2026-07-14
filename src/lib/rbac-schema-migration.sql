-- Enterprise Role-Based Access Control (RBAC) Migration Script
-- Project: 3M Car Rentals Next-Generation Web Platform
-- Focus: Granular Roles & Permissions Mapping

-- 1. Create Permissions Registry Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL, -- e.g. 'page:view:finance', 'api:execute:refund'
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Role-Permissions Many-to-Many Join Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (role_id, permission_id)
);

-- 3. Reseed Permissions Schema
-- We will write a seed script to populate permissions for:
-- Pages: 'page:view:dashboard', 'page:view:bookings', 'page:view:customers', 'page:view:finance', 'page:view:reports', 'page:view:operations', 'page:view:fleet'
-- APIs: 'api:execute:update_fleet', 'api:execute:refund', 'api:execute:dispatch'
-- Database tables: 'db:read:audit_logs', 'db:write:vehicles'
-- Buttons / Bulk Actions: 'ui:click:suspend_user', 'ui:bulk:clean_vehicles', 'ui:bulk:maintenance_vehicles'
