// =============================================================================
// 3M Car Rentals — Database TypeScript Types
// These types mirror the Supabase PostgreSQL schema exactly.
// Used across services, components, and pages for full type safety.
// =============================================================================

export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type TransmissionType = "Automatic" | "Manual";
export type AvailabilityStatus = "available" | "limited" | "reserved" | "maintenance" | "coming_soon";
export type BookingStatus = "pending" | "confirmed" | "ready_for_pickup" | "active" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "refunded";

// -----------------------------------------------------------------------------
// Vehicle Category
// -----------------------------------------------------------------------------
export interface VehicleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Vehicle (full record from DB)
// -----------------------------------------------------------------------------
export interface Vehicle {
  id: string;
  registration_number: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  category_id: string;
  fuel_type: FuelType;
  transmission: TransmissionType;
  seating_capacity: number;
  luggage_capacity: number | null;
  hourly_rate: number;
  daily_rate: number;
  security_deposit: number;
  availability_status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
  // Joined from vehicle_categories
  category?: VehicleCategory;
}

// -----------------------------------------------------------------------------
// Vehicle with category joined (used in fleet listing)
// -----------------------------------------------------------------------------
export type VehicleWithCategory = Vehicle & {
  category: VehicleCategory;
};

// -----------------------------------------------------------------------------
// User Profile
// -----------------------------------------------------------------------------
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role_name: string;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Booking
// -----------------------------------------------------------------------------
export interface Booking {
  id: string;
  booking_reference: string;
  customer_id: string;
  vehicle_id: string;
  staff_id: string | null;
  pickup_location_id: string | null;
  dropoff_location_id: string | null;
  start_datetime: string;
  end_datetime: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  base_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  security_deposit_amount: number;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  vehicle?: VehicleWithCategory;
  customer?: UserProfile;
}
