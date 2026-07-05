import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { applyPricingRecommendation } from "@/lib/pricing-engine";

async function verifyAdminAccess() {
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
  
  if (["admin", "super_admin", "manager", "revenue_manager"].includes(roleName)) {
    return profile;
  }
  return null;
}

export async function POST(req: Request) {
  const profile = await verifyAdminAccess();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { logId } = await req.json();
    if (!logId) {
      return NextResponse.json({ error: "Missing logId" }, { status: 400 });
    }

    const success = await applyPricingRecommendation(logId, profile.id);
    if (!success) {
      return NextResponse.json({ error: "Suggestion not found or already processed" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Price change approved and applied." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
