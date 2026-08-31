-- ============================================================
-- Link Cases to Matters Migration — run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS matter_id uuid REFERENCES public.matters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cases_matter ON public.cases(matter_id);
