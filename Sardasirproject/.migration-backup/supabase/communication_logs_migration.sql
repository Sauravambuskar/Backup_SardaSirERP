-- ============================================================
-- Communication Logs Table — run this in Supabase SQL Editor
-- Tracks client/case communications (calls, emails, meetings)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'message', 'letter', 'other')),
  date timestamptz NOT NULL DEFAULT now(),
  summary text NOT NULL,
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Require at least client_id or case_id
ALTER TABLE public.communication_logs ADD CONSTRAINT require_client_or_case CHECK (
  client_id IS NOT NULL OR case_id IS NOT NULL
);

-- Enable RLS
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Read policy
CREATE POLICY "Authenticated users can read communication_logs"
  ON public.communication_logs FOR SELECT TO authenticated USING (true);

-- Write policies
CREATE POLICY "Authenticated users can insert communication_logs"
  ON public.communication_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communication_logs"
  ON public.communication_logs FOR UPDATE TO authenticated USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Users can delete their own communication_logs"
  ON public.communication_logs FOR DELETE TO authenticated USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comms_client ON public.communication_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_comms_case ON public.communication_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_comms_date ON public.communication_logs(date);
