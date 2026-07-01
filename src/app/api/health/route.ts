import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// GET /api/health
// Verifies that the Supabase database is reachable and the schema is loaded.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { status: "error", message: "Missing Supabase environment variables." },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query the roles table — seeded in schema.sql — as our connectivity probe
    const { data, error } = await supabase
      .from("roles")
      .select("name")
      .order("name");

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
          hint: "Have you run the schema.sql script in the Supabase SQL Editor?",
        },
        { status: 503 }
      );
    }

    const roleNames = data.map((r: { name: string }) => r.name);

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        project: supabaseUrl,
        roles: roleNames,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
