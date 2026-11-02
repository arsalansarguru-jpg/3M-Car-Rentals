import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const CARS_FILE = path.join(DATA_DIR, "cars.json");

function getCars(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CARS_FILE)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(CARS_FILE, "utf8"));
  } catch (error) {
    console.error("[api/fleet] Error reading cars.json:", error);
    return [];
  }
}

function saveCars(cars: any[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CARS_FILE, JSON.stringify(cars, null, 2), "utf8");
}

// GET: Fetch cars (optionally filtered by public visibility)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";
    const category = searchParams.get("category");

    let cars = getCars();

    if (publicOnly) {
      cars = cars.filter((c) => c.is_displayed !== false);
    }

    if (category && category !== "all") {
      cars = cars.filter((c) => c.category?.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({ success: true, cars });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Add a new car
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.daily_rate) {
      return NextResponse.json(
        { success: false, error: "Car name and daily rate are required" },
        { status: 400 }
      );
    }

    const cars = getCars();
    const newCar = {
      id: `car-${Date.now()}`,
      name: body.name,
      category: body.category || "suv",
      daily_rate: Number(body.daily_rate),
      seats: Number(body.seats) || 5,
      transmission: body.transmission || "Automatic",
      fuel_type: body.fuel_type || "Petrol",
      image:
        body.image ||
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
      is_displayed: body.is_displayed !== undefined ? body.is_displayed : true,
      is_featured: body.is_featured || false,
      availability_status: body.availability_status || "available",
      features: body.features || ["Air Conditioning", "Bluetooth Audio", "Reverse Camera"],
      created_at: new Date().toISOString(),
    };

    cars.unshift(newCar);
    saveCars(cars);

    return NextResponse.json({ success: true, car: newCar });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Update an existing car (e.g. toggle display, update price, edit details)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Car ID is required" },
        { status: 400 }
      );
    }

    const cars = getCars();
    const index = cars.findIndex((c) => c.id === body.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    cars[index] = {
      ...cars[index],
      ...body,
      daily_rate: body.daily_rate !== undefined ? Number(body.daily_rate) : cars[index].daily_rate,
      seats: body.seats !== undefined ? Number(body.seats) : cars[index].seats,
      updated_at: new Date().toISOString(),
    };

    saveCars(cars);

    return NextResponse.json({ success: true, car: cars[index] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a car
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Car ID parameter is required" },
        { status: 400 }
      );
    }

    let cars = getCars();
    const initialLen = cars.length;
    cars = cars.filter((c) => c.id !== id);

    if (cars.length === initialLen) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    saveCars(cars);
    return NextResponse.json({ success: true, message: "Car deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
