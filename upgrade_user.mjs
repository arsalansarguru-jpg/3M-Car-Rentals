import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function upgrade() {
  console.log("Fetching admin role...");
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, name")
    .eq("name", "admin")
    .single();

  if (roleError || !role) {
    console.error("Failed to fetch admin role:", roleError);
    return;
  }

  console.log("Admin role ID:", role.id);
  const emailToUpgrade = "arsalan.sarguru@gmail.com";
  
  console.log(`Updating user ${emailToUpgrade}...`);
  const { error: updateError } = await supabase
    .from("users")
    .update({ role_id: role.id })
    .eq("email", emailToUpgrade);

  if (updateError) {
    console.error("Failed to update user:", updateError);
  } else {
    console.log("User updated successfully!");
  }
}

upgrade();
