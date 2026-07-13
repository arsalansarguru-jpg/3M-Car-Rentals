-- Create the staff_performance table
CREATE TABLE IF NOT EXISTS public.staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name TEXT NOT NULL,
  role TEXT NOT NULL,
  completed_pickups INTEGER DEFAULT 0,
  late_deliveries INTEGER DEFAULT 0,
  customer_rating NUMERIC(3,2) DEFAULT 0.00,
  average_response_time INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  attendance_status TEXT DEFAULT 'Present',
  performance_score NUMERIC(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data for fresh seed
TRUNCATE TABLE public.staff_performance CASCADE;

-- Insert mock staff data
INSERT INTO public.staff_performance (
  staff_name, role, completed_pickups, late_deliveries, customer_rating, 
  average_response_time, completed_tasks, pending_tasks, attendance_status, performance_score
) VALUES 
  ('Rajesh Kumar', 'Senior Driver', 142, 3, 4.85, 12, 45, 2, 'Present', 94.50),
  ('Priya Sharma', 'Operations Lead', 89, 1, 4.92, 8, 120, 5, 'Present', 98.00),
  ('Amit Patel', 'Delivery Agent', 215, 12, 4.60, 18, 55, 8, 'Present', 82.30),
  ('Sneha Desai', 'Fleet Inspector', 0, 0, 4.75, 15, 88, 12, 'On Leave', 88.50),
  ('Vikram Singh', 'Valet', 340, 22, 4.40, 25, 30, 4, 'Present', 76.00),
  ('Neha Gupta', 'Customer Liaison', 50, 0, 4.95, 5, 210, 1, 'Present', 99.10),
  ('Ravi Menon', 'Delivery Agent', 110, 8, 4.55, 20, 42, 6, 'Absent', 79.50),
  ('Kavita Reddy', 'Fleet Inspector', 0, 0, 4.80, 14, 95, 3, 'Present', 91.20);
