import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


// Never hardcode the service role key — this repository is public and that key
// grants full read/write on the database, bypassing every RLS policy.
function envVar(name) {
  const line = fs.readFileSync(new URL(".env", import.meta.url), "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${name}=`));
  if (!line) throw new Error(`${name} is missing from .env`);
  return line.slice(line.indexOf("=") + 1).trim();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVICE_KEY = envVar("SUPABASE_SERVICE_ROLE_KEY");
const PROJECT_REF = "xfbbxtrzyeocbpwnjhcz";

// Use Supabase Management API to run SQL
function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: "/rest/v1/rpc/",
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    };

    // Try using the pg_net approach via fetch
    const req = https.request(options, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Execute SQL via Supabase's SQL endpoint (Management API)
function execSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: "api.supabase.com",
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("Testing SQL execution via Supabase Management API...\n");

  // First test with a simple query
  const test = await execSQL("SELECT 1 as test;");
  console.log("Test query result:", test.status, test.body.slice(0, 200));
  
  if (test.status !== 200 && test.status !== 201) {
    console.log("\nManagement API not available. Will output SQL for manual execution.");
    console.log("Please run the following in your Supabase SQL Editor:");
    console.log("https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new\n");
    
    // Output the combined SQL
    const sqlFiles = [
      ".migration-backup/supabase/migrations/20260403181323_900d9844-b2a8-47b2-9aa6-f50f64864d5a.sql",
      ".migration-backup/supabase/migrations/20260403182532_404a14df-ee36-4ced-ace2-1de1e0fe579a.sql",
      ".migration-backup/supabase/migrations/20260403190926_873bb7cf-524a-4fed-9a22-f6c485d9dba1.sql",
      ".migration-backup/supabase/migrations/20260427000000_add_user_roles.sql",
      ".migration-backup/supabase/migrations/20260427100000_add_audit_error_logs_and_rpcs.sql",
      ".migration-backup/supabase/run_all_migrations.sql",
      ".migration-backup/supabase/ai_config_migration.sql",
      ".migration-backup/supabase/tasks_migration.sql",
      ".migration-backup/supabase/important_documents_migration.sql",
      ".migration-backup/supabase/autofill_settings_migration.sql",
    ];

    let combined = "";
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        combined += `\n-- ======== ${file} ========\n`;
        combined += fs.readFileSync(filePath, "utf-8");
        combined += "\n";
      }
    }
    
    const outPath = path.join(__dirname, "FULL_SCHEMA.sql");
    fs.writeFileSync(outPath, combined);
    console.log(`Full SQL written to: ${outPath}`);
    console.log("Copy and paste this into the Supabase SQL Editor to set up all tables.");
    return;
  }

  // If management API works, run each file
  const sqlFiles = [
    ".migration-backup/supabase/migrations/20260403181323_900d9844-b2a8-47b2-9aa6-f50f64864d5a.sql",
    ".migration-backup/supabase/migrations/20260403182532_404a14df-ee36-4ced-ace2-1de1e0fe579a.sql",
    ".migration-backup/supabase/migrations/20260403190926_873bb7cf-524a-4fed-9a22-f6c485d9dba1.sql",
    ".migration-backup/supabase/migrations/20260427000000_add_user_roles.sql",
    ".migration-backup/supabase/migrations/20260427100000_add_audit_error_logs_and_rpcs.sql",
    ".migration-backup/supabase/run_all_migrations.sql",
    ".migration-backup/supabase/ai_config_migration.sql",
    ".migration-backup/supabase/tasks_migration.sql",
    ".migration-backup/supabase/important_documents_migration.sql",
    ".migration-backup/supabase/autofill_settings_migration.sql",
  ];

  for (const file of sqlFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;
    const sql = fs.readFileSync(filePath, "utf-8");
    console.log(`Running: ${file}...`);
    const result = await execSQL(sql);
    if (result.status >= 400) {
      console.log(`  ⚠ Error: ${result.body.slice(0, 200)}`);
    } else {
      console.log(`  ✓ OK`);
    }
  }

  console.log("\n✅ Database setup complete!");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
