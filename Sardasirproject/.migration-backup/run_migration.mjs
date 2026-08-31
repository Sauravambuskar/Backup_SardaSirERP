// Run the ai_config migration via Supabase Management API
// Usage: node run_migration.mjs

const SUPABASE_URL = "https://wfwlfpnrwbqlajqxrxci.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd2xmcG5yd2JxbGFqcXhyeGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzMzODUsImV4cCI6MjA5MDgwOTM4NX0.tXVvivyqesT3aLz19tXgJcGGpXYHzey00ObgE2MX47k";

// Step 1: Sign in as admin to get a session
async function run() {
  console.log("1. Signing in as admin...");
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
    },
    body: JSON.stringify({
      email: "admin@lawmind.com",
      password: "adminpassword123",
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error("Login failed:", loginData);
    return;
  }
  const token = loginData.access_token;
  console.log("   Logged in! User ID:", loginData.user?.id);

  // Step 2: Check if table already exists by trying to query it
  console.log("\n2. Checking if ai_config table exists...");
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/ai_config?select=provider&limit=1`, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (checkRes.ok) {
    const rows = await checkRes.json();
    console.log("   Table already exists! Rows:", rows.length);
    if (rows.length > 0) {
      console.log("   Providers found:", rows.map(r => r.provider).join(", "));
      console.log("\n✅ ai_config table is ready. No migration needed.");
      return;
    }
    // Table exists but no rows — insert seed data
    console.log("   Table exists but empty. Inserting seed data...");
  } else {
    const errText = await checkRes.text();
    console.log("   Table does NOT exist (", checkRes.status, "):", errText);
    console.log("\n❌ The ai_config table must be created via Supabase SQL Editor.");
    console.log("   The anon key cannot create tables (DDL operations need admin access).");
    console.log("\n   Please open this URL in your browser:");
    console.log("   https://supabase.com/dashboard/project/wfwlfpnrwbqlajqxrxci/sql/new");
    console.log("\n   And paste the contents of: supabase/ai_config_migration.sql");
    return;
  }

  // Step 3: Insert seed rows if table is empty
  console.log("\n3. Inserting seed provider rows...");
  const seedRes = await fetch(`${SUPABASE_URL}/rest/v1/ai_config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${token}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify([
      { provider: "groq", api_key: "", model: "llama-3.3-70b-versatile", is_active: true },
      { provider: "openai", api_key: "", model: "gpt-4o-mini", is_active: false },
      { provider: "gemini", api_key: "", model: "gemini-2.0-flash", is_active: false },
      { provider: "custom", api_key: "", model: "", is_active: false },
    ]),
  });

  if (seedRes.ok) {
    console.log("   ✅ Seed data inserted successfully!");
  } else {
    const errText = await seedRes.text();
    console.log("   Seed insert result:", seedRes.status, errText);
  }

  // Step 4: Verify
  console.log("\n4. Verifying...");
  const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/ai_config?select=provider,model,is_active`, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });
  const verifyData = await verifyRes.json();
  console.log("   Final rows:", JSON.stringify(verifyData, null, 2));
  console.log("\n✅ Done! Refresh your app and go to AI Settings.");
}

run().catch(console.error);
