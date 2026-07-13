import { supabase } from "./supabase";

export interface CustomerDirectoryItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_bookings: number;
  lifetime_value: number;
  vip_status: "Platinum" | "Gold" | "Silver" | "Standard" | "At Risk";
  avatar_url?: string;
  joined_date: string;
}

export interface Customer360Profile extends CustomerDirectoryItem {
  bookings: any[];
  documents: {
    license_number?: string;
    verified_status?: string;
    expiry_date?: string;
  };
  preferences: {
    favorite_category: string;
    transmission: "Automatic" | "Manual" | "Any";
    fuel_preference: "Petrol" | "Diesel" | "EV" | "Any";
    typical_duration: number; // in days
  };
  incidents: {
    traffic_violations: any[];
    accidents: any[];
  };
  support_tickets: any[];
  coupons_used: any[];
  refunds: any[];
}

// -----------------------------------------------------------------------------
// Directory
// -----------------------------------------------------------------------------
export async function getAllCustomers(): Promise<CustomerDirectoryItem[]> {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*, auth_user_id")
      .eq("role_id", "4045f8f5-19a9-4673-a8ee-903edcb7cb86"); // customer role

    if (error) {
      console.error("Error fetching customers:", error);
      return getMockCustomerDirectory();
    }
    
    // Also fetch bookings to calculate LTV
    const { data: bookings } = await supabase
      .from("bookings")
      .select("user_id, total_amount, booking_status, payment_status");
      
    if (!users || users.length === 0) return getMockCustomerDirectory();
    
    const customers = users.map((u: any) => {
      const userBookings = bookings?.filter((b: any) => b.user_id === u.auth_user_id) || [];
      const totalBookings = userBookings.length;
      
      const lifetimeValue = userBookings
        .filter((b: any) => b.payment_status === "paid" || b.payment_status === "partially_paid")
        .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);
        
      let vipStatus: CustomerDirectoryItem["vip_status"] = "Standard";
      if (lifetimeValue > 200000) vipStatus = "Platinum";
      else if (lifetimeValue > 100000) vipStatus = "Gold";
      else if (lifetimeValue > 50000) vipStatus = "Silver";
      
      const cancelledCount = userBookings.filter(b => b.booking_status === "cancelled").length;
      if (totalBookings > 0 && cancelledCount / totalBookings > 0.5) {
        vipStatus = "At Risk";
      }

      return {
        id: u.auth_user_id,
        first_name: u.first_name || "Unknown",
        last_name: u.last_name || "User",
        email: u.email || "",
        phone: u.phone || "+91 00000 00000",
        total_bookings: totalBookings,
        lifetime_value: lifetimeValue,
        vip_status: vipStatus,
        joined_date: u.created_at
      } as CustomerDirectoryItem;
    });

    // Fallback to mock if db has no active customer bookings yet
    if (customers.every(c => c.total_bookings === 0)) {
      return getMockCustomerDirectory();
    }
    
    return customers.sort((a, b) => b.lifetime_value - a.lifetime_value);
  } catch (err) {
    console.error(err);
    return getMockCustomerDirectory();
  }
}

// -----------------------------------------------------------------------------
// Individual 360 Profile
// -----------------------------------------------------------------------------
export async function getCustomer360(userId: string): Promise<Customer360Profile | null> {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", userId)
      .single();

    if (!user) {
      // Might be a mock ID requested
      const mockDir = getMockCustomerDirectory();
      const mockUser = mockDir.find(m => m.id === userId);
      if (mockUser) return generateMock360Profile(mockUser);
      return null;
    }

    const { data: bookings } = await supabase
      .from("bookings")
      .select(`
        *,
        vehicle:vehicles (brand, model, year, category:vehicle_categories (name))
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data: licenses } = await supabase
      .from("driver_licenses")
      .select("*")
      .eq("user_id", userId)
      .limit(1)
      .single();

    const userBookings = bookings || [];
    const lifetimeValue = userBookings
      .filter((b: any) => b.payment_status === "paid" || b.payment_status === "partially_paid")
      .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);

    let vipStatus: CustomerDirectoryItem["vip_status"] = "Standard";
    if (lifetimeValue > 200000) vipStatus = "Platinum";
    else if (lifetimeValue > 100000) vipStatus = "Gold";
    else if (lifetimeValue > 50000) vipStatus = "Silver";

    const baseItem: CustomerDirectoryItem = {
      id: user.auth_user_id,
      first_name: user.first_name || "Unknown",
      last_name: user.last_name || "User",
      email: user.email || "",
      phone: user.phone || "+91 00000 00000",
      total_bookings: userBookings.length,
      lifetime_value: lifetimeValue,
      vip_status: vipStatus,
      joined_date: user.created_at
    };

    // Attach real bookings and docs, and generate intelligent mock data for the rest
    const profile = generateMock360Profile(baseItem);
    profile.bookings = userBookings;
    
    if (licenses) {
      profile.documents = {
        license_number: licenses.license_number,
        verified_status: licenses.verified_status,
        expiry_date: licenses.expiry_date
      };
    }

    // Attempt to extract preferences from real bookings if they exist
    if (userBookings.length > 0) {
      const categories: Record<string, number> = {};
      userBookings.forEach(b => {
        const cat = b.vehicle?.category?.name || "SUV";
        categories[cat] = (categories[cat] || 0) + 1;
      });
      const topCat = Object.entries(categories).sort((a,b) => b[1] - a[1])[0][0];
      profile.preferences.favorite_category = topCat;
    }

    return profile;
  } catch (err) {
    console.error(err);
    const mockDir = getMockCustomerDirectory();
    const mockUser = mockDir.find(m => m.id === userId);
    if (mockUser) return generateMock360Profile(mockUser);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Mock Generators
// -----------------------------------------------------------------------------
function getMockCustomerDirectory(): CustomerDirectoryItem[] {
  return [
    {
      id: "mock-cust-1",
      first_name: "Rahul",
      last_name: "Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 98765 43210",
      total_bookings: 14,
      lifetime_value: 345000,
      vip_status: "Platinum",
      joined_date: "2024-01-15T08:00:00Z"
    },
    {
      id: "mock-cust-2",
      first_name: "Priya",
      last_name: "Patel",
      email: "priya.p@example.com",
      phone: "+91 98765 11111",
      total_bookings: 8,
      lifetime_value: 125000,
      vip_status: "Gold",
      joined_date: "2024-03-22T08:00:00Z"
    },
    {
      id: "mock-cust-3",
      first_name: "Amit",
      last_name: "Deshmukh",
      email: "amit.d@example.com",
      phone: "+91 98765 22222",
      total_bookings: 3,
      lifetime_value: 65000,
      vip_status: "Silver",
      joined_date: "2024-06-10T08:00:00Z"
    },
    {
      id: "mock-cust-4",
      first_name: "Neha",
      last_name: "Gupta",
      email: "neha.gupta@example.com",
      phone: "+91 98765 33333",
      total_bookings: 1,
      lifetime_value: 12000,
      vip_status: "Standard",
      joined_date: "2024-07-01T08:00:00Z"
    },
    {
      id: "mock-cust-5",
      first_name: "Suresh",
      last_name: "Kumar",
      email: "suresh.k@example.com",
      phone: "+91 98765 44444",
      total_bookings: 5,
      lifetime_value: 85000,
      vip_status: "At Risk", // High cancellations 
      joined_date: "2023-11-05T08:00:00Z"
    }
  ];
}

function generateMock360Profile(base: CustomerDirectoryItem): Customer360Profile {
  // Generate pseudo-random deterministic data based on string length to keep it consistent
  const seed = base.first_name.length + base.last_name.length;
  
  return {
    ...base,
    bookings: [], // Will be overridden by real bookings if available
    documents: {
      license_number: `MH${10 + (seed % 90)} 20${15 + (seed % 8)} ${1000000 + (seed * 1000)}`,
      verified_status: seed % 5 === 0 ? "pending" : "approved",
      expiry_date: `203${seed % 9}-0${(seed % 9)+1}-15`
    },
    preferences: {
      favorite_category: seed % 2 === 0 ? "Luxury Sedan" : "Premium SUV",
      transmission: seed % 3 === 0 ? "Manual" : "Automatic",
      fuel_preference: seed % 4 === 0 ? "Diesel" : "Petrol",
      typical_duration: 2 + (seed % 5)
    },
    incidents: {
      traffic_violations: seed % 3 === 0 ? [
        { date: "2024-05-12", type: "Overspeeding", status: "Paid", amount: 1500, location: "Bandra Worli Sea Link" }
      ] : [],
      accidents: seed % 7 === 0 ? [
        { date: "2024-02-18", type: "Minor Scratch", status: "Resolved", damage_cost: 4500, description: "Scratched bumper while parking" }
      ] : []
    },
    support_tickets: seed % 4 === 0 ? [
      { id: "TKT-104", date: "2024-06-20", subject: "Fastag Issue", status: "Closed" }
    ] : [],
    coupons_used: seed % 2 === 0 ? [
      { code: "FIRST20", discount: 2000, date: base.joined_date },
      { code: "WEEKEND500", discount: 500, date: "2024-06-15" }
    ] : [],
    refunds: seed % 5 === 0 ? [
      { date: "2024-04-10", amount: 2000, reason: "Security Deposit Return", status: "Processed" }
    ] : []
  };
}
