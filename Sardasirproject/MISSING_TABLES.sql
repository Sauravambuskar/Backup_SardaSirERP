-- Only 2 tables missing: ai_config and app_settings
-- Paste this in: https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new

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
INSERT INTO public.ai_config (provider, api_key, model, is_active) VALUES
  ('groq', '', 'groq/compound', true),
  ('openai', '', 'gpt-4o-mini', false),
  ('gemini', '', 'gemini-2.0-flash', false),
  ('custom', '', '', false)
ON CONFLICT (provider) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read app_settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage app_settings" ON public.app_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
INSERT INTO public.app_settings (key, value) VALUES ('ai_autofill', '{"enabled": false}') ON CONFLICT (key) DO NOTHING;
