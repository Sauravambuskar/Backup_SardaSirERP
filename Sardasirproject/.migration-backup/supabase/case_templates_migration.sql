-- ============================================================
-- Case Templates Tables — run this in Supabase SQL Editor
-- Adds ability to define templates with predefined tasks for new cases.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.case_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.case_template_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.case_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  days_offset integer NOT NULL DEFAULT 0, -- Days after case creation when this is due
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_template_tasks ENABLE ROW LEVEL SECURITY;

-- Read policies: all authenticated users can read templates
CREATE POLICY "Authenticated users can read case_templates"
  ON public.case_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read case_template_tasks"
  ON public.case_template_tasks FOR SELECT TO authenticated USING (true);

-- Write policies: templates are manageable by admins or the user who created them
CREATE POLICY "Users can manage their case_templates"
  ON public.case_templates FOR ALL TO authenticated USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Users can manage case_template_tasks"
  ON public.case_template_tasks FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.case_templates WHERE case_templates.id = template_id AND (case_templates.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_templates_user ON public.case_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_case_template_tasks_template ON public.case_template_tasks(template_id);
