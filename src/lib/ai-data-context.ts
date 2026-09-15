import { restGet, restCount } from "@/lib/restClient";

/** Fetch rows for AI context; returns [] on any failure. */
async function fetchFromRest(path: string): Promise<any[]> {
  try { return await restGet<any>(path); } catch { return []; }
}

// ΓöÇΓöÇ Token budget ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Groq free tier: ~8k token context window for the system prompt.
// We keep the whole system + data block under ~6000 chars (~1500 tokens).
const MAX_CONTEXT_CHARS = 5500;

function truncate(str: string): string {
  if (str.length <= MAX_CONTEXT_CHARS) return str;
  return str.slice(0, MAX_CONTEXT_CHARS) + "\n\n_[Context truncated to fit token limit. Ask for specific data if needed.]_";
}

// ΓöÇΓöÇ Summary stats (always small) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function fetchSummaryStats(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  const [total, open, pending, disposed, hearingsCount, clients, invoices] = await Promise.all([
    restCount("cases"),
    restCount("cases", "status=eq.open"),
    restCount("cases", "status=eq.pending"),
    restCount("cases", "status=eq.disposed"),
    restCount("hearings", `hearing_date=gte.${today}&status=neq.cancelled`),
    restCount("clients"),
    restCount("invoices"),
  ]);
  return [
    `Total Cases: ${total}`,
    `Open: ${open} | Pending: ${pending} | Disposed: ${disposed}`,
    `Upcoming Hearings: ${hearingsCount}`,
    `Clients: ${clients} | Invoices: ${invoices}`,
  ].join("\n");
}

// ΓöÇΓöÇ Data fetchers (small limits to avoid 413) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

async function fetchActiveCases() {
  const [open, pending] = await Promise.all([
    fetchFromRest(`cases?select=case_number,title,status,court_name,case_type,filing_date&status=eq.open&order=created_at.desc&limit=20`),
    fetchFromRest(`cases?select=case_number,title,status,court_name,case_type,filing_date&status=eq.pending&order=created_at.desc&limit=20`),
  ]);
  return [...open, ...pending];
}

async function fetchDisposedCases() {
  return fetchFromRest(`cases?select=case_number,title,status,court_name,filing_date&status=in.(disposed,closed)&order=updated_at.desc&limit=15`);
}

async function fetchUpcomingHearings() {
  const today = new Date().toISOString().split("T")[0];
  return fetchFromRest(`hearings?select=hearing_date,court_name,judge_name,purpose,status&hearing_date=gte.${today}&status=neq.cancelled&order=hearing_date.asc&limit=15`);
}

async function fetchTodayHearings() {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  return fetchFromRest(`hearings?select=hearing_date,court_name,judge_name,purpose,status&hearing_date=gte.${today}&hearing_date=lt.${tomorrow}&order=hearing_date.asc`);
}

async function fetchClients() {
  return fetchFromRest(`clients?select=name,email,phone,city&order=created_at.desc&limit=20`);
}

async function fetchInvoices() {
  return fetchFromRest(`invoices?select=invoice_number,amount,total,status,due_date&order=created_at.desc&limit=20`);
}

async function fetchExpenses() {
  return fetchFromRest(`expenses?select=title,amount,category,expense_date&order=expense_date.desc&limit=15`);
}

async function fetchAdvocates() {
  return fetchFromRest(`advocates?select=name,phone,specialization,status&order=created_at.desc&limit=15`);
}

async function fetchTasks() {
  return fetchFromRest(`tasks?select=title,status,due_date,priority&order=due_date.asc&limit=15`);
}

async function fetchDocuments() {
  return fetchFromRest(`documents?select=title,document_type,created_at&order=created_at.desc&limit=15`);
}

// ΓöÇΓöÇ Compact table (key columns only, no wrap) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function toTable(rows: Record<string, unknown>[]): string {
  if (!rows?.length) return "_No records found._";
  const keys = Object.keys(rows[0]);
  const header = `| ${keys.join(" | ")} |`;
  const sep    = `| ${keys.map(() => "---").join(" | ")} |`;
  const body   = rows.map(r => `| ${keys.map(k => String(r[k] ?? "ΓÇö").slice(0, 40)).join(" | ")} |`).join("\n");
  return `${header}\n${sep}\n${body}`;
}

// ΓöÇΓöÇ Main builder ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export async function buildDataContext(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase();
  const parts: string[] = [];

  // Always include compact summary
  parts.push(`## Summary\n${await fetchSummaryStats()}`);

  // ΓöÇΓöÇ Cases ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (/pending|open|active|show.*case|all.*case|list.*case/i.test(lower)) {
    const rows = await fetchActiveCases();
    parts.push(`\n## Active Cases (open + pending) ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  if (/disposed|closed|completed|finished/i.test(lower)) {
    const rows = await fetchDisposedCases();
    parts.push(`\n## Disposed/Closed Cases ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  // ΓöÇΓöÇ Hearings ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (/today.*hearing|hearing.*today/i.test(lower)) {
    const rows = await fetchTodayHearings();
    parts.push(`\n## Today's Hearings ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  if (/hearing|calendar|next.*date|upcoming/i.test(lower)) {
    const rows = await fetchUpcomingHearings();
    parts.push(`\n## Upcoming Hearings ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  // ΓöÇΓöÇ Clients ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (/client|customer|party/i.test(lower)) {
    const rows = await fetchClients();
    parts.push(`\n## Clients ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  // ΓöÇΓöÇ Financial ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (/invoice|bill|payment|fee|financial|revenue|money/i.test(lower)) {
    const rows = await fetchInvoices();
    parts.push(`\n## Invoices ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  if (/expense|cost|spend/i.test(lower)) {
    const rows = await fetchExpenses();
    parts.push(`\n## Expenses ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  // ΓöÇΓöÇ Advocates ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (/advocate|lawyer|counsel/i.test(lower)) {
    const rows = await fetchAdvocates();
    parts.push(`\n## Advocates ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  // ΓöÇΓöÇ Tasks ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (/task|todo|to-do|action/i.test(lower)) {
    const rows = await fetchTasks();
    parts.push(`\n## Tasks ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  // ΓöÇΓöÇ Documents ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (/document|file|attachment/i.test(lower)) {
    const rows = await fetchDocuments();
    parts.push(`\n## Documents ΓÇö ${rows.length} records\n${toTable(rows)}`);
  }

  // ΓöÇΓöÇ Default: show active cases + upcoming hearings ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (parts.length === 1) {
    const [cases, hearings] = await Promise.all([fetchActiveCases(), fetchUpcomingHearings()]);
    parts.push(`\n## Active Cases (top 20)\n${toTable(cases.slice(0, 15))}`);
    parts.push(`\n## Upcoming Hearings (next 10)\n${toTable(hearings.slice(0, 10))}`);
  }

  // Hard truncate to stay under token limit
  return truncate(parts.join("\n\n"));
}

// ΓöÇΓöÇ System prompt (kept compact) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export function getSystemPrompt(dataContext: string): string {
  return `You are LawMind AI ΓÇö legal practice assistant for Advocate Manmohan D. Sarda, Akola/Washim, Maharashtra.

**DB SCHEMA:**
- cases: case_number, title, status (open/pending/disposed/closed), case_type, court_name, filing_date
- hearings: hearing_date, court_name, judge_name, purpose, status
- clients: name, email, phone, city
- invoices: invoice_number, amount, total, status, due_date
- expenses: title, amount, category, expense_date
- advocates: name, phone, specialization

**RULES:**
- Use ONLY the data below ΓÇö it is LIVE and REAL
- "pending cases" = open + pending status combined
- Show markdown tables for lists
- All amounts in Γé╣
- If data shows 0 records but summary shows non-zero, say "data loaded partially"

**LIVE DATA:**
${dataContext}`;
}
