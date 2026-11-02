import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('#')) return acc;
  const eqIdx = cleanLine.indexOf('=');
  if (eqIdx === -1) return acc;
  const key = cleanLine.substring(0, eqIdx).trim();
  const value = cleanLine.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
  if (key && value) acc[key] = value;
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Applying workshop-migration.sql...");
  const sql = fs.readFileSync('src/lib/workshop-migration.sql', 'utf8');
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error("Migration error:", error);
  } else {
    console.log("Migration applied successfully!");
  }

  console.log("Applying preventive-maintenance-setup.sql...");
  const sqlPm = fs.readFileSync('src/lib/preventive-maintenance-setup.sql', 'utf8');
  const { error: errorPm } = await supabase.rpc('exec_sql', { sql: sqlPm });
  if (errorPm) {
    console.error("Preventive maintenance migration error:", errorPm);
  } else {
    console.log("Preventive maintenance migration applied successfully!");
  }
}

run();
