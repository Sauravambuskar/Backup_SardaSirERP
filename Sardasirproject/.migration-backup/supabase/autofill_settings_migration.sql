-- ============================================================
-- App Settings Table — run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/wfwlfpnrwbqlajqxrxci/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL DEFAULT '{}',
  updated_by  uuid REFERENCES auth.users(id),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can READ settings
CREATE POLICY "Authenticated users can read app_settings"
  ON public.app_settings FOR SELECT TO authenticated USING (true);

-- Only admins can INSERT / UPDATE / DELETE
CREATE POLICY "Admins can manage app_settings"
  ON public.app_settings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Seed default: autofill OFF
INSERT INTO public.app_settings (key, value) VALUES
  ('ai_autofill', '{"enabled": false}')
ON CONFLICT (key) DO NOTHING;
