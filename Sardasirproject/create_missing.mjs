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
const MGMT_HOST = "api.supabase.com";

// Try Management API with service role key
function execSQLMgmt(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: MGMT_HOST,
      path: `/v1/projects/xfbbxtrzyeocbpwnjhcz/database/query`,
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

// Try via RPC endpoint (if function exists)
function execSQLRPC(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: HOST,
      path: `/rest/v1/rpc/exec_sql`,
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
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

// Try the pg_graphql or other exposed endpoints
function execSQLGraphQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      query: `mutation { execute(sql: ${JSON.stringify(sql)}) { rows } }`
    });
    const options = {
      hostname: HOST,
      path: `/graphql/v1`,
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
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
  console.log("Attempting to create missing tables...\n");

  // First create an exec_sql function via RPC if possible
  const createFnSQL = `
    CREATE OR REPLACE FUNCTION public.exec_sql(query text)
    RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
    BEGIN EXECUTE query; END;
    $$;
  `;

  // Try Management API first
  console.log("1. Trying Management API...");
  let r = await execSQLMgmt("SELECT 1;");
  console.log(`   Status: ${r.status} - ${r.body.slice(0, 100)}`);

  if (r.status === 200 || r.status === 201) {
    console.log("   Management API works! Running migrations...\n");
    
    const aiConfigSQL = `
      CREATE TABLE IF NOT EXISTS public.ai_config (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        provider text NOT NULL CHECK (provider IN ('groq', 'openai', 'gemini', 'custom')),
        api_key text NOT NULL DEFAULT '',
        model text NOT NULL DEFAULT '',
        base_url text DEFAULT '',
        is_active boolean NOT NULL DEFAULT false,
        updated_by uuid REFERENCES auth.users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(provider)
      );
      ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "All authenticated users can read ai_config" ON public.ai_config;
      DROP POLICY IF EXISTS "Admins can insert ai_config" ON public.ai_config;
      DROP POLICY IF EXISTS "Admins can update ai_config" ON public.ai_config;
      DROP POLICY IF EXISTS "Admins can delete ai_config" ON public.ai_config;
      CREATE POLICY "All authenticated users can read ai_config" ON public.ai_config FOR SELECT TO authenticated USING (true);
      CREATE POLICY "Admins can insert ai_config" ON public.ai_config FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
      CREATE POLICY "Admins can update ai_config" ON public.ai_config FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
      CREATE POLICY "Admins can delete ai_config" ON public.ai_config FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
      INSERT INTO public.ai_config (provider, api_key, model, is_active) VALUES
        ('groq', '', 'groq/compound', true),
        ('openai', '', 'gpt-4o-mini', false),
        ('gemini', '', 'gemini-2.0-flash', false),
        ('custom', '', '', false)
      ON CONFLICT (provider) DO NOTHING;
    `;

    const appSettingsSQL = `
      CREATE TABLE IF NOT EXISTS public.app_settings (
        key text PRIMARY KEY, value jsonb NOT NULL DEFAULT '{}',
        updated_by uuid REFERENCES auth.users(id),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Authenticated users can read app_settings" ON public.app_settings;
      DROP POLICY IF EXISTS "Admins can manage app_settings" ON public.app_settings;
      CREATE POLICY "Authenticated users can read app_settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
      CREATE POLICY "Admins can manage app_settings" ON public.app_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
      INSERT INTO public.app_settings (key, value) VALUES ('ai_autofill', '{"enabled": false}') ON CONFLICT (key) DO NOTHING;
    `;

    console.log("Creating ai_config...");
    r = await execSQLMgmt(aiConfigSQL);
    console.log(`   ${r.status}: ${r.body.slice(0, 150)}`);

    console.log("Creating app_settings...");
    r = await execSQLMgmt(appSettingsSQL);
    console.log(`   ${r.status}: ${r.body.slice(0, 150)}`);
    return;
  }

  // Try RPC approach
  console.log("\n2. Trying RPC endpoint...");
  r = await execSQLRPC("SELECT 1");
  console.log(`   Status: ${r.status} - ${r.body.slice(0, 100)}`);

  if (r.status === 404) {
    // Function doesn't exist, try to create it via GraphQL or give instructions
    console.log("\n3. No exec_sql function exists. Outputting minimal SQL for manual execution:");
    console.log("\n========= COPY THIS INTO SUPABASE SQL EDITOR =========\n");
    console.log(`
CREATE TABLE IF NOT EXISTS public.ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('groq', 'openai', 'gemini', 'custom')),
  api_key text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  base_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider)
);
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can read ai_config" ON public.ai_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert ai_config" ON public.ai_config FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE POLICY "Admins can update ai_config" ON public.ai_config FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE POLICY "Admins can delete ai_config" ON public.ai_config FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
INSERT INTO public.ai_config (provider, api_key, model, is_active) VALUES ('groq', '', 'groq/compound', true), ('openai', '', 'gpt-4o-mini', false), ('gemini', '', 'gemini-2.0-flash', false), ('custom', '', '', false) ON CONFLICT (provider) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY, value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read app_settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage app_settings" ON public.app_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
INSERT INTO public.app_settings (key, value) VALUES ('ai_autofill', '{"enabled": false}') ON CONFLICT (key) DO NOTHING;
    `);
    console.log("\n========= END =========");
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
