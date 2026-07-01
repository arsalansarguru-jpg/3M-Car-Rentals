import { createClient } from "@supabase/supabase-js";

// IMPORTANT: This file must NEVER be imported in client components ("use client").
// It uses the service_role key which bypasses Row Level Security.
// Only import this in:
//   - src/app/api/**/route.ts  (API Route Handlers)
//   - Server Actions (async functions with "use server")
//   - Server Components that run exclusively on the server

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

// Admin client — full database access, bypasses all RLS policies
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Disable auto session refresh — admin client is stateless per request
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
