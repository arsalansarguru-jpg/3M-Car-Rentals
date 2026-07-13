import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const FILE_PATH = path.join(DATA_DIR, "fleet_metadata.json");

// Helper to read local metadata
function getMetadata(): Record<string, any> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({}));
  }
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
  } catch (e) {
    return {};
  }
}

// Helper to save local metadata
function saveMetadata(data: Record<string, any>) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// -----------------------------------------------------------------------------
// GET: Fetch all vehicles (base Supabase columns + JSON metadata extensions)
// -----------------------------------------------------------------------------
export async function GET() {
  try {
    const { data: dbVehicles, error } = await supabaseAdmin
      .from("vehicles")
      .select(`
        *,
        category:vehicle_categories (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const metadata = getMetadata();
    const enriched = (dbVehicles ?? []).map((v) => ({
      ...v,
      ...(metadata[v.id] || {}),
    }));

    return NextResponse.json({ vehicles: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// POST: Create a new vehicle
// -----------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Separate base database fields from metadata extensions
    const {
      registration_number,
      brand,
      model,
      variant,
      year,
      category_id,
      fuel_type,
      transmission,
      seating_capacity,
      luggage_capacity,
      hourly_rate,
      daily_rate,
      security_deposit,
      availability_status,
      // Metadata fields below
      color,
      vin,
      odometer,
      mileage,
      engine,
      doors,
      boot_capacity,
      description,
      highlights,
      features,
      images,
      featured_image,
      featured,
      is_visible,
      pricing_options,
      availability,
      documents,
      maintenance,
      blocked_dates,
    } = body;

    if (!registration_number || !brand || !model || !year || !category_id || !daily_rate) {
      return NextResponse.json({ error: "Missing required basic vehicle fields" }, { status: 400 });
    }

    // 2. Insert into database
    const dbPayload = {
      registration_number,
      brand,
      model,
      variant: variant || null,
      year: Number(year),
      category_id,
      fuel_type: fuel_type || "Petrol",
      transmission: transmission || "Automatic",
      seating_capacity: Number(seating_capacity || 5),
      luggage_capacity: luggage_capacity ? Number(luggage_capacity) : null,
      hourly_rate: Number(hourly_rate || 0),
      daily_rate: Number(daily_rate),
      security_deposit: Number(security_deposit || 0),
      availability_status: availability_status || "available",
    };

    const { data: dbVehicle, error: dbError } = await supabaseAdmin
      .from("vehicles")
      .insert(dbPayload)
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    const vehicleId = dbVehicle.id;

    // 3. Save extra fields in fleet_metadata.json
    const metadata = getMetadata();
    metadata[vehicleId] = {
      color: color || "",
      vin: vin || "",
      odometer: Number(odometer || 0),
      mileage: mileage || "",
      engine: engine || "",
      doors: Number(doors || 4),
      boot_capacity: boot_capacity || "",
      description: description || "",
      highlights: highlights || [],
      features: features || [],
      images: images || [],
      featured_image: featured_image || "",
      featured: !!featured,
      is_visible: is_visible !== false,
      pricing_options: pricing_options || {},
      availability: availability || {},
      documents: documents || [],
      maintenance: maintenance || [],
      blocked_dates: blocked_dates || [],
    };
    saveMetadata(metadata);

    // 4. Return the complete merged object
    return NextResponse.json({
      vehicle: {
        ...dbVehicle,
        ...metadata[vehicleId],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// PUT: Update an existing vehicle
// -----------------------------------------------------------------------------
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing vehicle ID for update" }, { status: 400 });
    }

    // 1. Separate base database fields
    const dbPayload: Record<string, any> = {};
    const baseKeys = [
      "registration_number",
      "brand",
      "model",
      "variant",
      "year",
      "category_id",
      "fuel_type",
      "transmission",
      "seating_capacity",
      "luggage_capacity",
      "hourly_rate",
      "daily_rate",
      "security_deposit",
      "availability_status",
    ];

    for (const key of baseKeys) {
      if (updateFields[key] !== undefined) {
        dbPayload[key] = updateFields[key];
        if (["year", "seating_capacity", "luggage_capacity", "hourly_rate", "daily_rate", "security_deposit"].includes(key) && dbPayload[key] !== null) {
          dbPayload[key] = Number(dbPayload[key]);
        }
      }
    }

    // Update database
    if (Object.keys(dbPayload).length > 0) {
      const { error: dbError } = await supabaseAdmin
        .from("vehicles")
        .update(dbPayload)
        .eq("id", id);

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }
    }

    // 2. Separate and update metadata fields
    const metadataKeys = [
      "color",
      "vin",
      "odometer",
      "mileage",
      "engine",
      "doors",
      "boot_capacity",
      "description",
      "highlights",
      "features",
      "images",
      "featured_image",
      "featured",
      "is_visible",
      "pricing_options",
      "availability",
      "documents",
      "maintenance",
      "blocked_dates",
    ];

    const metadata = getMetadata();
    const existingMeta = metadata[id] || {};

    for (const key of metadataKeys) {
      if (updateFields[key] !== undefined) {
        existingMeta[key] = updateFields[key];
      }
    }

    // Enforce types
    if (existingMeta.odometer !== undefined) existingMeta.odometer = Number(existingMeta.odometer);
    if (existingMeta.doors !== undefined) existingMeta.doors = Number(existingMeta.doors);
    if (existingMeta.featured !== undefined) existingMeta.featured = !!existingMeta.featured;
    if (existingMeta.is_visible !== undefined) existingMeta.is_visible = existingMeta.is_visible !== false;

    metadata[id] = existingMeta;
    saveMetadata(metadata);

    // 3. Return full updated object
    const { data: dbVehicle } = await supabaseAdmin
      .from("vehicles")
      .select(`
        *,
        category:vehicle_categories (*)
      `)
      .eq("id", id)
      .single();

    return NextResponse.json({
      vehicle: {
        ...dbVehicle,
        ...existingMeta,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// DELETE: Delete a vehicle
// -----------------------------------------------------------------------------
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing vehicle ID" }, { status: 400 });
    }

    // Delete from Supabase
    const { error: dbError } = await supabaseAdmin
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Delete from local metadata
    const metadata = getMetadata();
    if (metadata[id]) {
      delete metadata[id];
      saveMetadata(metadata);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
