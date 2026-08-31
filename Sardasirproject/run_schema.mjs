import https from "https";

import { readFileSync } from "fs";

// Never hardcode the service role key — this repository is public and that key
// grants full read/write on the database, bypassing every RLS policy.
function envVar(name) {
  const line = readFileSync(new URL(".env", import.meta.url), "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${name}=`));
  if (!line) throw new Error(`${name} is missing from .env`);
  return line.slice(line.indexOf("=") + 1).trim();
}

const SERVICE_KEY = envVar("SUPABASE_SERVICE_ROLE_KEY");
const HOST = "xfbbxtrzyeocbpwnjhcz.supabase.co";

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: HOST, path, method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
    };
    const req = https.request(options, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST, path, method: "GET",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
    };
    const req = https.request(options, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.end();
  });
}

// Check which tables already exist
async function checkTable(name) {
  const r = await get(`/rest/v1/${name}?select=*&limit=0`);
  return r.status === 200;
}

async function main() {
  console.log("Checking existing tables...\n");
  
  const tables = ["profiles","clients","advocates","cases","hearings","advice","evidence",
    "invoices","documents","expenses","contacts","notes","matters","tags","expense_types",
    "payments","case_templates","case_template_tasks","tasks","ai_config","audit_logs",
    "error_logs","important_documents","app_settings","communication_logs"];
  
  const existing = {};
  for (const t of tables) {
    existing[t] = await checkTable(t);
    console.log(`  ${existing[t] ? "✓" : "✗"} ${t}`);
  }
  
  console.log("\n--- Missing tables need to be created via SQL Editor ---");
  const missing = tables.filter(t => !existing[t]);
  if (missing.length === 0) {
    console.log("All tables exist! No action needed.");
  } else {
    console.log("Missing:", missing.join(", "));
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
