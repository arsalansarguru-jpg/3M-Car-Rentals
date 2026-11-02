import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/lib/workshop-migration.sql");
    const sql = fs.readFileSync(filePath, "utf8");
    
    console.log("Executing workshop-migration.sql RPC...");
    const { data, error } = await supabaseAdmin.rpc("exec_sql", { sql });
    
    if (error) {
      console.error("Migration execution failed:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
    
    console.log("Migration executed successfully!");
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Migration server error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
