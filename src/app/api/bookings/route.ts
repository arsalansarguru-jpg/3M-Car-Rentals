import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const TMP_BOOKINGS_FILE = path.join("/tmp", "bookings.json");
const OWNER_PHONE = "919637901501";
const OWNER_EMAIL = "3mcarrentals321@gmail.com";

declare global {
  // eslint-disable-next-line no-var
  var __3m_bookings_cache: any[] | undefined;
}

function getBookings(): any[] {
  if (globalThis.__3m_bookings_cache && Array.isArray(globalThis.__3m_bookings_cache)) {
    return globalThis.__3m_bookings_cache;
  }

  // 1. Try reading from /tmp (if serverless environment previously wrote updates)
  try {
    if (fs.existsSync(TMP_BOOKINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_BOOKINGS_FILE, "utf8"));
      if (Array.isArray(data)) {
        globalThis.__3m_bookings_cache = data;
        return data;
      }
    }
  } catch {
    // fallback
  }

  // 2. Read from source project repository
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf8"));
      if (Array.isArray(data)) {
        globalThis.__3m_bookings_cache = data;
        return data;
      }
    }
  } catch (error) {
    console.error("[api/bookings] Error reading bookings.json:", error);
  }

  return [];
}

function saveBookings(bookings: any[]) {
  globalThis.__3m_bookings_cache = bookings;

  // 1. Try writing to local project filesystem (standard in local development)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf8");
  } catch (err: any) {
    // On Vercel / serverless runtime, filesystem is read-only (EROFS) - safely catch and fallback
    console.warn("[api/bookings] Local BOOKINGS_FILE read-only or not writable on serverless:", err?.message);
  }

  // 2. Also write to /tmp so serverless lambdas can persist across requests within the instance
  try {
    fs.writeFileSync(TMP_BOOKINGS_FILE, JSON.stringify(bookings, null, 2), "utf8");
  } catch {
    // ignore platforms without /tmp
  }
}

// GET: Retrieve all bookings
export async function GET() {
  try {
    const bookings = getBookings();
    const pendingCount = bookings.filter((b) => b.status === "pending").length;

    return NextResponse.json({
      success: true,
      bookings,
      stats: {
        total: bookings.length,
        pending: pendingCount,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        completed: bookings.filter((b) => b.status === "completed").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Client submits a new booking enquiry / reservation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      car_id,
      car_name,
      customer_name,
      customer_phone,
      customer_email,
      pickup_location,
      pickup_date,
      pickup_time,
      return_date,
      daily_rate,
      notes,
    } = body;

    if (!customer_name || !customer_phone || !pickup_date || !return_date) {
      return NextResponse.json(
        { success: false, error: "Please provide Name, Phone, and Dates." },
        { status: 400 }
      );
    }

    // Calculate total days
    const start = new Date(pickup_date);
    const end = new Date(return_date);
    const diffTime = Math.max(1, end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const rate = Number(daily_rate) || 2500;
    const totalAmount = totalDays * rate;

    const bookingId = `BK-3M-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: bookingId,
      car_id: car_id || "unspecified",
      car_name: car_name || "Self Drive Car",
      customer_name,
      customer_phone,
      customer_email: customer_email || "",
      pickup_location: pickup_location || "Mopa Airport (GOX)",
      pickup_date,
      pickup_time: pickup_time || "10:00 AM",
      return_date,
      total_days: totalDays,
      total_amount: totalAmount,
      notes: notes || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const bookings = getBookings();
    bookings.unshift(newBooking);
    saveBookings(bookings);

    // Format pre-filled WhatsApp message for Owner
    const whatsappMessage = encodeURIComponent(
      `🚗 *NEW BOOKING ALERT - 3M Car Rentals Goa*\n\n` +
      `*Booking ID:* ${bookingId}\n` +
      `*Car:* ${newBooking.car_name}\n` +
      `*Customer:* ${newBooking.customer_name}\n` +
      `*Phone:* ${newBooking.customer_phone}\n` +
      `*Email:* ${newBooking.customer_email || "N/A"}\n` +
      `*Pickup Location:* ${newBooking.pickup_location}\n` +
      `*Dates:* ${newBooking.pickup_date} (${newBooking.pickup_time}) to ${newBooking.return_date}\n` +
      `*Duration:* ${totalDays} Day(s)\n` +
      `*Estimated Total:* ₹${totalAmount.toLocaleString("en-IN")}\n` +
      `*Notes:* ${newBooking.notes || "None"}\n\n` +
      `_Please confirm availability and dispatch booking confirmation._`
    );

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${OWNER_PHONE}&text=${whatsappMessage}`;

    // Notification summary for response & logs
    console.log(`[New Booking Notification] Booking ID ${bookingId} for ${customer_name}. Alert sent to owner: ${OWNER_PHONE} / ${OWNER_EMAIL}`);

    return NextResponse.json({
      success: true,
      booking: newBooking,
      whatsappUrl,
      ownerNotification: {
        phone: OWNER_PHONE,
        email: OWNER_EMAIL,
        status: "sent",
      },
      message: "Booking submitted successfully! Owner has been notified.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update booking status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Booking ID and status are required" },
        { status: 400 }
      );
    }

    const bookings = getBookings();
    const index = bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    bookings[index].status = status;
    bookings[index].updated_at = new Date().toISOString();
    saveBookings(bookings);

    return NextResponse.json({
      success: true,
      booking: bookings[index],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
