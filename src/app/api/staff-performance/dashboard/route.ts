import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getStaffPerformanceData } from "@/lib/staff-performance-engine";

const ALLOWED_ROLES = ["admin", "super_admin", "manager", "operations_manager"];

async function verifyStaffAccess() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select(`*, role:roles (name)`)
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return null;
  const roleName = (profile.role as { name: string } | null)?.name || "";
  
  if (ALLOWED_ROLES.includes(roleName)) {
    return profile;
  }
  return null;
}

export async function GET() {
  const profile = await verifyStaffAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const staffData = await getStaffPerformanceData();

    // Compute aggregated metrics
    const totalPickups = staffData.reduce((acc, curr) => acc + curr.completed_pickups, 0);
    const totalLate = staffData.reduce((acc, curr) => acc + curr.late_deliveries, 0);
    const averageRating = (staffData.reduce((acc, curr) => acc + curr.customer_rating, 0) / (staffData.length || 1)).toFixed(2);
    const avgResponseTime = Math.round(staffData.reduce((acc, curr) => acc + curr.average_response_time, 0) / (staffData.length || 1));
    const totalCompletedTasks = staffData.reduce((acc, curr) => acc + curr.completed_tasks, 0);
    const totalPendingTasks = staffData.reduce((acc, curr) => acc + curr.pending_tasks, 0);
    const avgPerformanceScore = (staffData.reduce((acc, curr) => acc + curr.performance_score, 0) / (staffData.length || 1)).toFixed(1);

    const onDutyCount = staffData.filter(s => s.attendance_status === "Present").length;

    return NextResponse.json({
      kpis: {
        totalPickups,
        totalLate,
        averageRating: parseFloat(averageRating),
        avgResponseTime,
        totalCompletedTasks,
        totalPendingTasks,
        avgPerformanceScore: parseFloat(avgPerformanceScore),
        onDutyCount,
        totalStaff: staffData.length
      },
      staff: staffData
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
