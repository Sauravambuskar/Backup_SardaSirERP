-- ============================================================
-- AI Config Table — run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/wfwlfpnrwbqlajqxrxci/sql
-- ============================================================

-- Table to store AI provider configurations globally (set by admin, used by all)
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

-- Enable RLS
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- All authenticated users can READ the config (to use the AI agent)
CREATE POLICY "All authenticated users can read ai_config"
  ON public.ai_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admin and admin can INSERT
CREATE POLICY "Admins can insert ai_config"
  ON public.ai_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only super_admin and admin can UPDATE
CREATE POLICY "Admins can update ai_config"
  ON public.ai_config
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Only super_admin and admin can DELETE
CREATE POLICY "Admins can delete ai_config"
  ON public.ai_config
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Seed default rows for each provider so upsert works smoothly
INSERT INTO public.ai_config (provider, api_key, model, is_active) VALUES
  ('groq', '', 'llama-3.3-70b-versatile', true),
  ('openai', '', 'gpt-4o-mini', false),
  ('gemini', '', 'gemini-2.0-flash', false),
  ('custom', '', '', false);
