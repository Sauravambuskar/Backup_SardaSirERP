# LawMind AI ΓÇö Complete Developer & AI Agent Guide

## What Is This Product

LawMind AI is a **legal practice management system** for advocates practising in District & Sessions Courts at **Akola and Washim, Maharashtra, India**. It manages cases (primarily Sec. 138 NI Act cheque dishonour prosecutions), clients, hearings, documents, invoices, expenses, and generates ready-to-file court documents.

**Live URL:** https://lawmind-ai.vercel.app  
**Repo:** https://github.com/Sauravambuskar/Lawmind_Ai  
**Owner:** Advocate Manmohan D. Sarda (ispdgt2@gmail.com)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 + shadcn/ui components |
| Routing | react-router-dom v7 |
| State/Data | TanStack React Query v5 |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage + RLS) |
| PDF Generation | jsPDF |
| Charts | Recharts |
| Deployment | Vercel (auto-deploy from `main` branch) |
| Package Manager | npm |

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://xfbbxtrzyeocbpwnjhcz.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

These are in `.env` at the project root. For Vercel, set them in the dashboard under Environment Variables.

---

## Project Structure

```
lawmind/
Γö£ΓöÇΓöÇ public/                  # Static assets, court document templates (docx)
Γöé   ΓööΓöÇΓöÇ impdocs/             # Important document templates (Warrant, Summon, etc.)
Γö£ΓöÇΓöÇ migrations/              # SQL migration files for Supabase
Γö£ΓöÇΓöÇ src/
Γöé   Γö£ΓöÇΓöÇ App.tsx              # Main router with all routes
Γöé   Γö£ΓöÇΓöÇ main.tsx             # Entry point
Γöé   Γö£ΓöÇΓöÇ index.css            # Global styles + CSS variables
Γöé   Γö£ΓöÇΓöÇ components/
Γöé   Γöé   Γö£ΓöÇΓöÇ ui/              # shadcn/ui primitives (button, input, dialog, etc.)
Γöé   Γöé   Γö£ΓöÇΓöÇ AppLayout.tsx    # Main layout wrapper with sidebar
Γöé   Γöé   Γö£ΓöÇΓöÇ AppSidebar.tsx   # Navigation sidebar with all menu items
Γöé   Γöé   Γö£ΓöÇΓöÇ AppHeader.tsx    # Top header with search + user actions
Γöé   Γöé   Γö£ΓöÇΓöÇ CaseFileImport.tsx # CSV import for cases (maps 22 columns)
Γöé   Γöé   Γö£ΓöÇΓöÇ CSVImport.tsx    # Generic CSV import component
Γöé   Γöé   Γö£ΓöÇΓöÇ DeleteConfirm.tsx # Confirmation dialog for deletions
Γöé   Γöé   Γö£ΓöÇΓöÇ PageHeader.tsx   # Breadcrumb + title component
Γöé   Γöé   Γö£ΓöÇΓöÇ PageLoader.tsx   # Loading spinner
Γöé   Γöé   Γö£ΓöÇΓöÇ TablePagination.tsx # Pagination controls
Γöé   Γöé   ΓööΓöÇΓöÇ ...
Γöé   Γö£ΓöÇΓöÇ pages/
Γöé   Γöé   Γö£ΓöÇΓöÇ Dashboard.tsx    # Main dashboard with real data charts
Γöé   Γöé   Γö£ΓöÇΓöÇ CasesPage.tsx    # Case list with CRUD, import, export, filters
Γöé   Γöé   Γö£ΓöÇΓöÇ CaseDetailPage.tsx # Case detail with 10 tabs (hearings, tasks, etc.)
Γöé   Γöé   Γö£ΓöÇΓöÇ ClientsPage.tsx  # Client management
Γöé   Γöé   Γö£ΓöÇΓöÇ HearingsPage.tsx # Hearings management
Γöé   Γöé   Γö£ΓöÇΓöÇ TasksPage.tsx    # Task management
Γöé   Γöé   Γö£ΓöÇΓöÇ InvoicesPage.tsx # Invoice management
Γöé   Γöé   Γö£ΓöÇΓöÇ ExpensesPage.tsx # Expense tracking
Γöé   Γöé   Γö£ΓöÇΓöÇ DocumentsPage.tsx # Document management
Γöé   Γöé   Γö£ΓöÇΓöÇ QuickDocsPage.tsx # Court document generation (templates)
Γöé   Γöé   Γö£ΓöÇΓöÇ NoticeMakerPage.tsx # Legal notice builder
Γöé   Γöé   Γö£ΓöÇΓöÇ ImpDocsPage.tsx  # Important document viewer
Γöé   Γöé   Γö£ΓöÇΓöÇ AdvocatesPage.tsx # Advocate directory
Γöé   Γöé   Γö£ΓöÇΓöÇ ContactsPage.tsx # Contacts
Γöé   Γöé   Γö£ΓöÇΓöÇ AuthPage.tsx     # Login/signup
Γöé   Γöé   Γö£ΓöÇΓöÇ ProfilePage.tsx  # User profile
Γöé   Γöé   ΓööΓöÇΓöÇ ...
Γöé   Γö£ΓöÇΓöÇ hooks/
Γöé   Γöé   Γö£ΓöÇΓöÇ useAuth.tsx      # Auth context + user session
Γöé   Γöé   Γö£ΓöÇΓöÇ AuthContext.tsx  # Auth provider
Γöé   Γöé   Γö£ΓöÇΓöÇ usePagination.ts # Client-side pagination helper
Γöé   Γöé   Γö£ΓöÇΓöÇ useMinLoader.ts  # Minimum loader display time
Γöé   Γöé   Γö£ΓöÇΓöÇ useRole.ts       # User role detection
Γöé   Γöé   ΓööΓöÇΓöÇ useTheme.tsx     # Dark/light theme
Γöé   Γö£ΓöÇΓöÇ integrations/
Γöé   Γöé   ΓööΓöÇΓöÇ supabase/
Γöé   Γöé       Γö£ΓöÇΓöÇ client.ts    # Supabase client initialization
Γöé   Γöé       ΓööΓöÇΓöÇ types.ts     # Generated TypeScript types for all tables
Γöé   ΓööΓöÇΓöÇ lib/
Γöé       Γö£ΓöÇΓöÇ constants.ts     # Case statuses, currencies, config values
Γöé       Γö£ΓöÇΓöÇ auditLog.ts      # Audit log writer (best-effort)
Γöé       Γö£ΓöÇΓöÇ errorLog.ts      # Error logging utility
Γöé       Γö£ΓöÇΓöÇ export.ts        # CSV export utility
Γöé       Γö£ΓöÇΓöÇ utils.ts         # cn() and common utils
Γöé       ΓööΓöÇΓöÇ storage.ts       # Supabase storage helpers
Γö£ΓöÇΓöÇ vercel.json              # Vercel deployment config (SPA rewrites)
Γö£ΓöÇΓöÇ vite.config.ts           # Vite config (React plugin, path aliases)
Γö£ΓöÇΓöÇ tailwind.config.ts       # Tailwind config with custom theme
Γö£ΓöÇΓöÇ tsconfig.json            # TypeScript config
Γö£ΓöÇΓöÇ package.json             # Dependencies and scripts
ΓööΓöÇΓöÇ .env                     # Environment variables
```

---

## Database Schema (Supabase PostgreSQL)

### Key Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `cases` | All court cases | id, case_number, title, status, court_name, court_type, cnr_number, file_number, case_stage, stage, next_hearing_date, last_hearing_date, filing_date, case_side, fir_number, police_station, case_tags, case_notes_1, case_notes_2, disposed_date, document_size, case_imported_date, created_by |
| `clients` | Client directory | id, name, email, phone, city, state, user_id |
| `advocates` | Advocate directory | id, name, email, phone, specialization, user_id |
| `hearings` | Court hearings | id, case_id, hearing_date, court_name, judge_name, purpose, status, notes, user_id |
| `tasks` | Task management | id, case_id, title, description, status (todo/in_progress/done), priority (high/medium/low), due_date, user_id |
| `invoices` | Billing | id, case_id, client_id, invoice_number, amount, tax, total, status (draft/sent/paid/overdue), due_date, user_id |
| `expenses` | Expense tracking | id, case_id, title, amount, category, expense_date, user_id |
| `documents` | File records | id, case_id, title, description, document_type, file_url, user_id |
| `communication_logs` | Notes & communications | id, case_id, client_id, type (call/email/meeting/message/letter/other), summary, notes, user_id |
| `audit_logs` | Activity tracking | id, user_id, action, table_name, record_id, new_data |
| `contacts` | Contact book | id, name, email, phone, company, designation, contact_type, user_id |

### Important Notes About the Schema

**Always use `src/lib/restClient.ts` for database access.** It attaches the logged-in
user's JWT, throws `NotAuthenticatedError` instead of silently returning nothing,
and `restGetAll()` paginates past PostgREST's hard 1000-row cap.

**Owner column: `created_by` almost everywhere.** Only these five tables use
`user_id`: `profiles`, `audit_logs`, `error_logs`, `case_judgments`,
`hearing_reminders`. Everything else (`cases`, `clients`, `advocates`, `invoices`,
`payments`, `expenses`, `documents`, `hearings`, `tasks`, `notes`, `evidence`,
`advice`, `contacts`, `tags`, `matters`, `expense_types`, `case_templates`,
`important_documents`, `communication_logs`) uses `created_by`.

**Column names that differ from the UI field names.** The forms use friendlier
names, so queries alias them (`select=id,title:name`) and writes map them back:

| Table | UI field | Actual DB column |
|-------|----------|------------------|
| `invoices` | `total` | `total_amount` |
| `invoices` | `tax` | `tax_amount` |
| `payments` | `amount_paid` | `amount` |
| `payments` | `method` | `payment_method` |
| `documents` | `title` | `name` |
| `documents` | `document_type` | `category` |
| `hearings` | `purpose` | `title` |
| `hearings` | `judge_name` | `judge` |
| `matters` | `name` | `title` |
| `communication_logs` | `summary` | `subject` |
| `communication_logs` | `notes` | `content` |
| `communication_logs` | `date` | `communication_date` |

**Columns that do NOT exist** (don't query them): `cases.case_type`,
`cases.matter_id`, `tasks.completed_at`, `expenses.expense_type_id` is the FK
while `expenses.category` is a free-text label.

**RLS is ON for all tables** with an `authenticated_full_access` policy: any
signed-in user has full access to all rows; anonymous requests get zero rows.
Per-user row filtering would be a follow-up.

**Foreign keys now exist** (18 of them, all `ON DELETE SET NULL`), so PostgREST
embedded selects like `clients(name)` and `cases(title)` work. Adding a new FK
requires `notify pgrst, 'reload schema'` before the join resolves.

**Per-user permissions:** `profiles.sections` (jsonb, nullable) overrides the
role's section list from `role_permissions`. `null` means inherit the role.

---

## How Data Flows (Cases Section)

### Fetch Cases
```typescript
// Paginate through all rows (PostgREST limits to 1000)
const all = [];
let offset = 0;
while (true) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cases?select=...&order=created_at.desc&offset=${offset}&limit=1000`, {
    headers: { "apikey": ANON_KEY, "Authorization": `Bearer ${accessToken}` }
  });
  const batch = await res.json();
  all.push(...batch);
  if (batch.length < 1000) break;
  offset += 1000;
}
```

### Create/Update Case
```typescript
// Use raw fetch to bypass schema cache
await fetch(`${SUPABASE_URL}/rest/v1/cases`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "apikey": KEY, "Authorization": `Bearer ${token}`, "Prefer": "return=representation" },
  body: JSON.stringify({ ...payload, created_by: userId })
});
// For update:
await fetch(`${SUPABASE_URL}/rest/v1/cases?id=eq.${caseId}`, { method: "PATCH", ... });
```

### Import Cases from CSV
- Component: `src/components/CaseFileImport.tsx`
- Accepts CSV with columns: NextHearingDate, CaseNumber, CaseTitle, CNRNumber, FileNumber, CourtType, CourtName, FilingDate, CaseStage, Stage, Client, CaseStatus, Lawyer, LastHearingDate, caseImportedDate, CaseTag(s), CaseSide, DisposedDate, DocumentSize, FIRNumer, policeStation, CaseNotes-1, CaseNotes-2
- Maps CSV headers (case-insensitive) to DB column names
- Normalizes all rows to have identical keys before batch insert
- Uses `Prefer: resolution=ignore-duplicates` to skip existing records

---

## Case Detail Page (10 Tabs)

Each tab has full CRUD (Add/Edit/Delete):

| Tab | Table | Actions |
|-----|-------|---------|
| Case History | (combined view) | Read-only timeline |
| Case Documents | `documents` | Add, Edit, Delete |
| Notes | `communication_logs` | Add, Delete |
| Notify to Clients | ΓÇö | Placeholder (coming soon) |
| Related Judgments | ΓÇö | Placeholder (coming soon) |
| Tasks | `tasks` | Add, Edit, Delete |
| Appointments | `hearings` | Add, Edit, Delete |
| Invoice | `invoices` | Add, Edit, Delete |
| Expenses | `expenses` | Add, Edit, Delete |
| Time Entries | ΓÇö | Placeholder (coming soon) |

---

## Quick Docs (Court Document Templates)

Location: `src/pages/QuickDocsPage.tsx`

Templates generate ready-to-file court documents:

| Template | Category | Format |
|----------|----------|--------|
| Application for Issue Process (Sec. 204 CrPC) | Criminal | English |
| Application for Replacing Authorized Person | Criminal | English |
| Warrant (Bailable/Non-Bailable) Sec. 75 CrPC | Criminal | English (2 copies) |
| Warrant for Recovery (Sec. 421 CrPC) | Criminal | English (2 copies) |
| Proclamation Notice (Form No. 4, Sec. 82 CrPC) | Criminal | English |
| Show Cause Notice to Police Station | Criminal | English |
| Application to File Documents | Civil | English |
| List of Documents | Civil | English |
| Pursis | Civil | English |
| Adjournment Application | General | English |
| Personal Exception (Exemption from Appearance) | General | English |

### Template Rules (CRITICAL)
- Fixed legal text must NEVER be changed, paraphrased, or shortened
- Variable fields use `${value}` interpolation or `"________________"` as fallback
- Marathi templates (legacy Kruti Dev font) must be preserved byte-for-byte
- Warrant template outputs TWO identical copies
- All Supreme Court directions in summons must be reproduced in full

---

## Filter Categories (Cases Page)

| Filter | Logic |
|--------|-------|
| All | Show everything |
| Pending | `status === "pending"` |
| Disposed | `status === "disposed"` |
| Not Applicable | `status === "not applicable"` |
| Court | Cases with `court_name` or `court_type` containing "court" |
| Affidavit | Cases where `case_stage` or `title` contains "affidavit" |

---

## Authentication

- Supabase Auth (email/password)
- Session token used for all API calls
- Fallback to anon key when no session (RLS is open)
- Login page: `/auth`
- Protected routes wrapped in `<ProtectedRoute>`

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build (output: dist/)
npm run preview      # Preview production build locally
```

---

## Deployment (Vercel)

1. Push to `main` branch ΓåÆ auto-deploys
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables set in Vercel dashboard
6. `vercel.json` handles SPA routing (all paths ΓåÆ index.html)

---

## Known Issues & Gotchas

1. **Use `restClient.ts`, not `supabase.from()`** ΓÇö the generated Supabase types are
   out of sync with the live schema, so `supabase.from()` rejects valid columns.
   `restClient` calls PostgREST directly with the user's JWT.
2. **1000 row limit** ΓÇö PostgREST caps responses at 1000. Use `restGetAll()`.
3. **Owner column is `created_by`** on all but five tables ΓÇö see the schema notes above.
4. **UI field names differ from DB columns** on invoices, payments, documents,
   hearings, matters and communication_logs ΓÇö see the mapping table above.
5. **Date fields** ΓÇö Stored as `date` type (YYYY-MM-DD). Frontend displays as DD/MM/YYYY.
6. **Hearing data lives in `cases.next_hearing_date`.** The `hearings` table is empty
   (0 rows), so never report hearing counts from it alone.
7. **Never generate `package-lock.json` inside the parent pnpm workspace** ΓÇö it writes
   local symlink paths that break the Vercel build.
8. **After any `ALTER TABLE` or new FK**, run `notify pgrst, 'reload schema'` or
   PostgREST will keep rejecting the change.

---

## File Storage (Cloudinary)

Instead of using Supabase Storage (1 GB free limit), we use **Cloudinary** for file/document uploads:

| Feature | Free Limit |
|---------|-----------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Max file size | 10 MB (raw files) |
| Supported | PDF, DOCX, JPG, PNG, any file |

### Setup Steps:
1. Go to https://cloudinary.com and create a free account
2. Go to **Settings ΓåÆ Upload ΓåÆ Upload Presets**
3. Click **Add Upload Preset**
4. Set "Signing Mode" to **Unsigned**
5. Name it `lawmind_docs` (or anything)
6. Copy your **Cloud Name** from dashboard
7. Add to `.env` and Vercel environment variables:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=lawmind_docs
   ```

### How It Works:
- Files upload directly from browser ΓåÆ Cloudinary (no server needed)
- Cloudinary returns a permanent URL
- URL is stored in Supabase `documents.file_url` column
- Zero Supabase storage used for files

---

## How to Add a New Feature

1. **New page:** Create in `src/pages/NewPage.tsx`, add route in `src/App.tsx`, add sidebar link in `src/components/AppSidebar.tsx`
2. **New DB table:** Write migration SQL in `migrations/`, run in Supabase SQL Editor, add types to `src/integrations/supabase/types.ts`
3. **New template (Quick Docs):** Add to the `TEMPLATES` array in `src/pages/QuickDocsPage.tsx` following the existing pattern
4. **New case field:** Add column via ALTER TABLE, update `CaseRow` type in CasesPage, update `emptyForm`, update `openEdit`, add form field in dialog

---

## Users

| Email | Role |
|-------|------|
| admin@lawmind.com | Admin |
| ispdgt2@gmail.com | Primary user (all data belongs to this user) |
| mis.corelearn@gmail.com | Developer |
| mis.mdsarda@gmail.com | Staff |

---

## Design Philosophy

- Professional, clean UI suited for legal professionals
- Dark/light theme support
- Mobile-responsive
- All actions provide toast feedback
- Optimistic UI updates with React Query
- No external API dependencies (fully self-contained with Supabase)
