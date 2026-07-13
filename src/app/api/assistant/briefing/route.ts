import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { generateDailyBriefing } from "@/lib/ai-assistant-engine";

const ALLOWED_ROLES = ["admin", "super_admin", "manager", "operations_manager"];

export async function GET() {
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select(`*, role:roles (name)`)
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  
  const roleName = (profile.role as { name: string } | null)?.name || "";
  if (!ALLOWED_ROLES.includes(roleName)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const adminName = profile.first_name || "Admin";
    const briefing = await generateDailyBriefing(adminName);
    return NextResponse.json({ briefing });
  } catch (err) {
    console.error("AI Briefing Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
