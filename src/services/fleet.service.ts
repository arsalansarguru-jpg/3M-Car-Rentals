import { createClient } from "@supabase/supabase-js";
import type { VehicleCategory, VehicleWithCategory } from "@/types/database";
import fs from "fs";
import path from "path";

// Fleet service functions run on the server only.
// They query Supabase directly using the anon client (RLS enforced).
// Never import this file in a "use client" component.

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[getServerSupabase] Warning: Missing Supabase environment variables. Returning null.");
    return null;
  }
  return createClient(url, key);
}

// -----------------------------------------------------------------------------
// Helper to read local metadata file
// -----------------------------------------------------------------------------
function getLocalMetadata(): Record<string, any> {
  try {
    const filePath = path.join(process.cwd(), "src/data/fleet_metadata.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    console.error("[fleet.service] Error reading local metadata:", e);
  }
  return {};
}

// -----------------------------------------------------------------------------
// getAvailableVehicles
// Returns all vehicles with availability_status = 'available', sorted by
// daily_rate ascending, with their category joined.
// -----------------------------------------------------------------------------
export async function getAvailableVehicles(): Promise<VehicleWithCategory[]> {
  const supabase = getServerSupabase();
  if (!supabase) {
    console.warn("[getAvailableVehicles] Warning: Supabase client not initialized. Returning empty array.");
    return [];
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      category:vehicle_categories (*)
    `)
    .eq("availability_status", "available")
    .order("daily_rate", { ascending: true });

  if (error) {
    console.error("[fleet.service] getAvailableVehicles error:", error.message);
    return [];
  }

  const metadata = getLocalMetadata();
  const enriched = (data ?? []).map((v) => ({
    ...v,
    ...(metadata[v.id] || {}),
  }));

  // Filter only visible vehicles on public page
  return enriched.filter((v) => v.is_visible !== false) as VehicleWithCategory[];
}

// -----------------------------------------------------------------------------
// getAllVehicles (Used in Admin Dashboard)
// Returns all vehicles (no status filter), sorted by created_at.
// -----------------------------------------------------------------------------
export async function getAllVehicles(): Promise<VehicleWithCategory[]> {
  const supabase = getServerSupabase();
  if (!supabase) {
    console.warn("[getAllVehicles] Warning: Supabase client not initialized. Returning empty array.");
    return [];
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      category:vehicle_categories (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fleet.service] getAllVehicles error:", error.message);
    return [];
  }

  const metadata = getLocalMetadata();
  const enriched = (data ?? []).map((v) => ({
    ...v,
    ...(metadata[v.id] || {}),
  }));

  return enriched as VehicleWithCategory[];
}

// -----------------------------------------------------------------------------
// getVehicleCategories
// Returns all vehicle categories ordered by their base daily rate.
// Used to populate the category filter tabs on the fleet page.
// -----------------------------------------------------------------------------
export async function getVehicleCategories(): Promise<VehicleCategory[]> {
  const supabase = getServerSupabase();
  if (!supabase) {
    console.warn("[getVehicleCategories] Warning: Supabase client not initialized. Returning empty array.");
    return [];
  }

  const { data, error } = await supabase
    .from("vehicle_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[fleet.service] getVehicleCategories error:", error.message);
    return [];
  }

  return (data ?? []) as VehicleCategory[];
}

// -----------------------------------------------------------------------------
// getVehicleById
// Returns a single vehicle with its category. Used on the vehicle detail page.
// -----------------------------------------------------------------------------
export async function getVehicleById(
  id: string
): Promise<VehicleWithCategory | null> {
  const supabase = getServerSupabase();
  if (!supabase) {
    console.warn("[getVehicleById] Warning: Supabase client not initialized. Returning null.");
    return null;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      category:vehicle_categories (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("[fleet.service] getVehicleById error:", error.message);
    return null;
  }

  const metadata = getLocalMetadata();
  const enriched = {
    ...data,
    ...(metadata[id] || {}),
  };

  return enriched as VehicleWithCategory;
}
