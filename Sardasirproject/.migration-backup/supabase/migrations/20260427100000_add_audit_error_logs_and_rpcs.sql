-- ============================================================
-- audit_logs: tracks who changed what and when
-- ============================================================
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,          -- 'insert' | 'update' | 'delete'
  table_name  text not null,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Only the owner or super_admin can read their own logs
create policy "audit_logs_select" on public.audit_logs
  for select using (auth.uid() = user_id);

-- Any authenticated user can insert their own log entry
create policy "audit_logs_insert" on public.audit_logs
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- error_logs: captures frontend errors for observability
-- ============================================================
create table if not exists public.error_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  message     text not null,
  context     text,
  stack       text,
  created_at  timestamptz not null default now()
);

alter table public.error_logs enable row level security;

create policy "error_logs_insert" on public.error_logs
  for insert with check (true);

create policy "error_logs_select" on public.error_logs
  for select using (auth.uid() = user_id);

-- ============================================================
-- RPC: get_case_status_counts
-- Returns open/in-progress/closed/won/lost counts in one query
-- ============================================================
create or replace function public.get_case_status_counts()
returns table (status text, cnt bigint)
language sql stable security definer
as $$
  select status, count(*) as cnt
  from public.cases
  group by status;
$$;

-- ============================================================
-- RPC: get_monthly_advice_counts(months_back int)
-- Returns advice counts grouped by year-month for last N months
-- ============================================================
create or replace function public.get_monthly_advice_counts(months_back int default 10)
returns table (yr_month text, cnt bigint)
language sql stable security definer
as $$
  select to_char(date_trunc('month', advice_date::date), 'YYYY-MM') as yr_month,
         count(*) as cnt
  from public.advice
  where advice_date::date >= date_trunc('month', now() - (months_back || ' months')::interval)
  group by yr_month
  order by yr_month;
$$;

-- ============================================================
-- RPC: get_monthly_case_counts(months_back int)
-- Returns cases created grouped by year-month for last N months
-- ============================================================
create or replace function public.get_monthly_case_counts(months_back int default 5)
returns table (yr_month text, cnt bigint)
language sql stable security definer
as $$
  select to_char(date_trunc('month', created_at), 'YYYY-MM') as yr_month,
         count(*) as cnt
  from public.cases
  where created_at >= date_trunc('month', now() - (months_back || ' months')::interval)
  group by yr_month
  order by yr_month;
$$;
