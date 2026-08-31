# LAWMIND

A law practice management platform for case tracking, client management, hearings, invoices, documents, and more — built for M.D. Sarda & Associates.

## Run & Operate

- Frontend + API server run via Replit workflows (start from the Workflows panel)
- `pnpm --filter @workspace/lawmind run dev` — run the frontend manually
- `pnpm --filter @workspace/api-server run dev` — run the API server manually
- Required env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase project credentials (set as Replit secrets)
- Optional: `SUPABASE_DB_URL` — Supabase Postgres URL, used to push DB schema

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v3 + shadcn/ui (`artifacts/lawmind/`)
- API: Express 5 (`artifacts/api-server/`) — kept for file upload and RPC stubs
- DB: Supabase (PostgreSQL) — schema in `lib/db/src/schema/`
- Auth: Supabase Auth (email/password, password reset via email)

## Where things live

- `artifacts/lawmind/src/` — All React pages, components, hooks (33 pages)
- `artifacts/lawmind/src/integrations/supabase/client.ts` — Real Supabase client (`createClient` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)
- `artifacts/lawmind/src/integrations/supabase/types.ts` — Full generated Supabase DB types
- `artifacts/lawmind/src/hooks/AuthContext.tsx` — Supabase auth state, profile loading
- `lib/db/src/schema/` — Drizzle table definitions (23 tables); push to Supabase with `SUPABASE_DB_URL`

## Architecture decisions

- The frontend talks **directly** to Supabase for all data and auth — no Express middleware in the hot path.
- The Express API server (`artifacts/api-server/`) is retained for file uploads (GCS/object storage) and RPC stubs.
- All 45 frontend source files import `supabase` from `@/integrations/supabase/client` — single source of truth.
- `VITE_` secrets are injected via `vite.config.ts` `define` block (Replit secrets aren't auto-exposed to Vite).
- Tailwind v3 (not v4) — postcss-based config, not the `@tailwindcss/vite` plugin.

## Product

A full legal practice management suite: cases, clients, advocates, hearings, invoices, expenses, documents, evidence, notes, tasks, communications, audit logs, AI settings, and more.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The frontend uses `react-router-dom` (not wouter) — no base path changes needed for router.
- Tailwind v3 is used (not v4) — postcss-based, not the `@tailwindcss/vite` plugin.
- DB schema uses `uuid` primary keys throughout.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set as Replit secrets (they are injected into Vite via `define` in `vite.config.ts`).
- To push schema to Supabase: `cd lib/db && DATABASE_URL="$SUPABASE_DB_URL" npx drizzle-kit push`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
