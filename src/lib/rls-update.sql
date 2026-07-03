-- Run this script in the Supabase SQL Editor to allow admin users to insert, update, and delete vehicles

-- Drop existing policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Allow insert to vehicles for admin staff" ON public.vehicles;
DROP POLICY IF EXISTS "Allow update to vehicles for admin staff" ON public.vehicles;
DROP POLICY IF EXISTS "Allow delete to vehicles for admin staff" ON public.vehicles;

-- Allow users with an admin or staff role to insert into the vehicles table
CREATE POLICY "Allow insert to vehicles for admin staff" ON public.vehicles FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.auth_user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager', 'staff')
    )
);

-- Allow users with an admin or staff role to update the vehicles table
CREATE POLICY "Allow update to vehicles for admin staff" ON public.vehicles FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.auth_user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager', 'staff')
    )
);

-- Allow users with an admin or staff role to delete from the vehicles table
CREATE POLICY "Allow delete to vehicles for admin staff" ON public.vehicles FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        JOIN public.roles r ON u.role_id = r.id 
        WHERE u.auth_user_id = auth.uid() AND r.name IN ('admin', 'super_admin', 'manager', 'staff')
    )
);

