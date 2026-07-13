import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const FILE_PATH = path.join(DATA_DIR, "fleet_metadata.json");

function getMetadata(): Record<string, any> {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({}));
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
  } catch (e) {
    return {};
  }
}

function saveMetadata(data: Record<string, any>) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

export async function POST() {
  try {
    // 1. Get categories
    const { data: categories, error: catError } = await supabaseAdmin
      .from("vehicle_categories")
      .select("*");

    if (catError || !categories || categories.length === 0) {
      return NextResponse.json({ error: "No vehicle categories found. Add categories first." }, { status: 500 });
    }

    const catMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, string>);

    // 2. Define 6 premium mock vehicles with full rich metadata
    const mockVehicles = [
      {
        registration_number: "GA-03-X-1122",
        brand: "Mahindra",
        model: "Thar 4x4",
        variant: "LX Hard Top Diesel",
        year: 2024,
        category_slug: "suv",
        fuel_type: "Diesel",
        transmission: "Automatic",
        seating_capacity: 4,
        luggage_capacity: 2,
        hourly_rate: 350,
        daily_rate: 3500,
        security_deposit: 10000,
        availability_status: "available",
        // Metadata
        color: "Rocky Beige",
        vin: "MHRTHAR4X420240992",
        odometer: 14500,
        mileage: "12 km/l",
        engine: "2.2L mHawk 130",
        doors: 3,
        boot_capacity: "150L",
        description: "Explore the roads and off-roads of Goa in the legendary Mahindra Thar. Features rugged 4x4 capabilities combined with modern creature comforts.",
        highlights: ["Ultimate Goan Adventure vehicle", "Rugged 4x4 drive type", "High commanding view of the road"],
        features: ["ABS", "Airbags", "Android Auto", "Apple CarPlay", "GPS", "Bluetooth", "Reverse Camera", "Hill Hold Assist"],
        images: [
          "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
        ],
        featured_image: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=800&q=80",
        featured: true,
        is_visible: true,
        pricing_options: {
          weekend_rate: 4200,
          weekly_rate: 22000,
          monthly_rate: 80000,
          half_day_rate: 2000,
          peak_season_rate: 5500,
          off_season_rate: 2800,
        },
        documents: [
          { type: "RC Book", number: "GA-03-X-1122", expiry: "2039-05-15", url: "#" },
          { type: "Insurance", number: "INS-MAH-90112", expiry: "2025-11-20", url: "#" },
          { type: "PUC Certificate", number: "PUC-GA03-88221", expiry: "2025-06-30", url: "#" }
        ],
        maintenance: [
          { type: "Scheduled Service", cost: 6500, date: "2025-03-10", notes: "10,000 km general checkup and oil change done.", status: "completed" },
          { type: "Brake Pad Replacement", cost: 3200, date: "2025-02-15", notes: "Front brake pads replaced.", status: "completed" }
        ]
      },
      {
        registration_number: "GA-01-M-8899",
        brand: "Maruti Suzuki",
        model: "Baleno Alpha",
        variant: "1.2 Dualjet CVT",
        year: 2023,
        category_slug: "hatchback",
        fuel_type: "Petrol",
        transmission: "Automatic",
        seating_capacity: 5,
        luggage_capacity: 3,
        hourly_rate: 200,
        daily_rate: 2000,
        security_deposit: 5000,
        availability_status: "available",
        // Metadata
        color: "Nexa Blue",
        vin: "MSBALENOALPHA88921",
        odometer: 28200,
        mileage: "19.5 km/l",
        engine: "1.2L K12N",
        doors: 5,
        boot_capacity: "318L",
        description: "The perfect city hatchback for cruising Goa's narrow streets. Extremely fuel-efficient, easy to park, and loaded with high-tech features.",
        highlights: ["Best hatchback for tight streets", "Superb fuel efficiency", "360-degree parking camera"],
        features: ["ABS", "Airbags", "Apple CarPlay", "Android Auto", "Cruise Control", "360 Camera", "GPS", "Bluetooth", "Fast Charger", "Push Start", "Reverse Camera"],
        images: [
          "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
        ],
        featured_image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        featured: false,
        is_visible: true,
        pricing_options: {
          weekend_rate: 2400,
          weekly_rate: 13000,
          monthly_rate: 45000,
          half_day_rate: 1200,
          peak_season_rate: 3200,
          off_season_rate: 1600,
        },
        documents: [
          { type: "RC Book", number: "GA-01-M-8899", expiry: "2038-02-10", url: "#" },
          { type: "Insurance", number: "INS-MS-88129", expiry: "2025-09-15", url: "#" },
          { type: "PUC Certificate", number: "PUC-GA01-09827", expiry: "2025-08-22", url: "#" }
        ],
        maintenance: [
          { type: "Scheduled Service", cost: 4200, date: "2025-01-20", notes: "Engine oil change, filter replacements.", status: "completed" }
        ]
      },
      {
        registration_number: "GA-08-K-0077",
        brand: "Audi",
        model: "A6 Matrix",
        variant: "45 TFSI Technology",
        year: 2024,
        category_slug: "luxury",
        fuel_type: "Hybrid",
        transmission: "Automatic",
        seating_capacity: 5,
        luggage_capacity: 4,
        hourly_rate: 1200,
        daily_rate: 12000,
        security_deposit: 30000,
        availability_status: "available",
        // Metadata
        color: "Mythos Black Metallic",
        vin: "WAUA6MATRIX2024001",
        odometer: 8200,
        mileage: "14 km/l",
        engine: "2.0L Turbocharged Inline-4",
        doors: 4,
        boot_capacity: "530L",
        description: "Ultimate luxury and absolute prestige. Indulge in premium leather upholstery, Matrix LED headlights, and a soundproof cabin for a state-of-the-art Goan holiday.",
        highlights: ["Premium Executive Saloon", "Sunroof & Ambient Lighting", "Bang & Olufsen 3D Sound"],
        features: ["ABS", "Airbags", "Apple CarPlay", "Android Auto", "Sunroof", "Cruise Control", "360 Camera", "GPS", "Bluetooth", "Ventilated Seats", "Leather Seats", "Push Start", "Reverse Camera"],
        images: [
          "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
        ],
        featured_image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
        featured: true,
        is_visible: true,
        pricing_options: {
          weekend_rate: 14500,
          weekly_rate: 75000,
          monthly_rate: 250000,
          half_day_rate: 7000,
          peak_season_rate: 18000,
          off_season_rate: 9500,
        },
        documents: [
          { type: "RC Book", number: "GA-08-K-0077", expiry: "2039-01-30", url: "#" },
          { type: "Insurance", number: "INS-AUDI-0027", expiry: "2025-05-15", url: "#" },
          { type: "PUC Certificate", number: "PUC-GA08-8877", expiry: "2025-11-12", url: "#" }
        ],
        maintenance: [
          { type: "First Inspection", cost: 12000, date: "2024-12-05", notes: "Complimentary matrix calibration & health checks.", status: "completed" }
        ]
      }
    ];

    const metadata = getMetadata();
    const createdVehicles = [];

    for (const mock of mockVehicles) {
      // Resolve category_id
      const catId = catMap[mock.category_slug];
      if (!catId) continue;

      // Check if registration number already exists
      const { data: existing } = await supabaseAdmin
        .from("vehicles")
        .select("id")
        .eq("registration_number", mock.registration_number)
        .maybeSingle();

      if (existing) {
        // Just update metadata entry
        metadata[existing.id] = {
          color: mock.color,
          vin: mock.vin,
          odometer: mock.odometer,
          mileage: mock.mileage,
          engine: mock.engine,
          doors: mock.doors,
          boot_capacity: mock.boot_capacity,
          description: mock.description,
          highlights: mock.highlights,
          features: mock.features,
          images: mock.images,
          featured_image: mock.featured_image,
          featured: mock.featured,
          is_visible: mock.is_visible,
          pricing_options: mock.pricing_options,
          documents: mock.documents,
          maintenance: mock.maintenance,
          blocked_dates: [],
        };
        createdVehicles.push({ id: existing.id, brand: mock.brand, model: mock.model });
        continue;
      }

      // Insert base fields
      const { data: newCar, error: insertErr } = await supabaseAdmin
        .from("vehicles")
        .insert({
          registration_number: mock.registration_number,
          brand: mock.brand,
          model: mock.model,
          variant: mock.variant,
          year: mock.year,
          category_id: catId,
          fuel_type: mock.fuel_type,
          transmission: mock.transmission,
          seating_capacity: mock.seating_capacity,
          luggage_capacity: mock.luggage_capacity,
          hourly_rate: mock.hourly_rate,
          daily_rate: mock.daily_rate,
          security_deposit: mock.security_deposit,
          availability_status: mock.availability_status,
        })
        .select()
        .single();

      if (insertErr || !newCar) {
        console.error("Error inserting vehicle:", insertErr);
        continue;
      }

      // Store metadata
      metadata[newCar.id] = {
        color: mock.color,
        vin: mock.vin,
        odometer: mock.odometer,
        mileage: mock.mileage,
        engine: mock.engine,
        doors: mock.doors,
        boot_capacity: mock.boot_capacity,
        description: mock.description,
        highlights: mock.highlights,
        features: mock.features,
        images: mock.images,
        featured_image: mock.featured_image,
        featured: mock.featured,
        is_visible: mock.is_visible,
        pricing_options: mock.pricing_options,
        documents: mock.documents,
        maintenance: mock.maintenance,
        blocked_dates: [],
      };
      createdVehicles.push(newCar);
    }

    saveMetadata(metadata);

    return NextResponse.json({ success: true, seeded: createdVehicles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
