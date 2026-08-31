---
name: Supabase wiring
description: How LAWMIND connects to Supabase — secret injection, client setup, schema push
---

The frontend needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as Replit secrets.
Replit secrets are NOT auto-exposed to Vite — they must be injected via the `define` block in vite.config.ts:

```ts
define: {
  "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL ?? ""),
  "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY ?? ""),
},
```

The real Supabase client lives at artifacts/lawmind/src/integrations/supabase/client.ts.
All 45 source files already import from @/integrations/supabase/client — no file-by-file changes needed.

To push schema to Supabase:
  cd lib/db && DATABASE_URL="$SUPABASE_DB_URL" npx drizzle-kit push

**Why:** Replit secrets are process.env at build time but Vite only exposes VITE_-prefixed vars from .env files, not from process.env set at runtime by the OS. The define block bridges this gap.
