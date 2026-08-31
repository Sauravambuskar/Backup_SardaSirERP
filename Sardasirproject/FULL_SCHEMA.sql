-- ============================================================
-- LAWMIND — COMPLETE DATABASE SCHEMA (Safe to re-run)
-- All CREATE TABLE use IF NOT EXISTS
-- All policies use DROP IF EXISTS before CREATE
-- ============================================================

-- 1. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Profiles table (add missing columns if needed)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'agent',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_role_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('super_admin', 'admin', 'agent', 'lawyer'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_status_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR get_user_role(auth.uid()) IN ('admin', 'super_admin'));
CREATE POLICY "Users can update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR (get_user_role(auth.uid()) IN ('admin', 'super_admin') AND NOT (role = 'super_admin' AND get_user_role(auth.uid()) = 'admin')))
  WITH CHECK (auth.uid() = user_id OR (get_user_role(auth.uid()) IN ('admin', 'super_admin') AND NOT (role = 'super_admin' AND get_user_role(auth.uid()) = 'admin')));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 4. CLIENTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, email text, phone text, city text, state text, country text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════════════════════
-- 5. ADVOCATES (uses created_by instead of user_id)
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.advocates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own advocates" ON public.advocates;
DROP POLICY IF EXISTS "Users can insert own advocates" ON public.advocates;
DROP POLICY IF EXISTS "Users can update own advocates" ON public.advocates;
DROP POLICY IF EXISTS "Users can delete own advocates" ON public.advocates;
DROP POLICY IF EXISTS "advocates_select" ON public.advocates;
DROP POLICY IF EXISTS "advocates_insert" ON public.advocates;
DROP POLICY IF EXISTS "advocates_update" ON public.advocates;
DROP POLICY IF EXISTS "advocates_delete" ON public.advocates;
CREATE POLICY "advocates_select" ON public.advocates FOR SELECT TO authenticated USING (true);
CREATE POLICY "advocates_insert" ON public.advocates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "advocates_update" ON public.advocates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "advocates_delete" ON public.advocates FOR DELETE TO authenticated USING (true);

-- ════════════════════════════════════════════════════════════
-- 6. CASES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_number text NOT NULL, title text NOT NULL, description text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  advocate_id uuid REFERENCES public.advocates(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open', case_type text, court_name text, filing_date date,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON public.cases;
CREATE POLICY "Users can view own cases" ON public.cases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cases" ON public.cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.cases FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cases" ON public.cases FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════════════════════
-- 7. HEARINGS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.hearings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  hearing_date timestamptz NOT NULL, court_name text, judge_name text, purpose text,
  status text NOT NULL DEFAULT 'scheduled', notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own hearings" ON public.hearings;
DROP POLICY IF EXISTS "Users can insert own hearings" ON public.hearings;
DROP POLICY IF EXISTS "Users can update own hearings" ON public.hearings;
DROP POLICY IF EXISTS "Users can delete own hearings" ON public.hearings;
CREATE POLICY "Users can view own hearings" ON public.hearings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hearings" ON public.hearings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hearings" ON public.hearings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hearings" ON public.hearings FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_hearings_updated_at ON public.hearings;
CREATE TRIGGER update_hearings_updated_at BEFORE UPDATE ON public.hearings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════════════════════
-- 8. ADVICE
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid, case_id uuid,
  subject text NOT NULL, description text,
  advice_date date NOT NULL DEFAULT CURRENT_DATE, status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.advice ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own advice" ON public.advice;
DROP POLICY IF EXISTS "Users can insert own advice" ON public.advice;
DROP POLICY IF EXISTS "Users can update own advice" ON public.advice;
DROP POLICY IF EXISTS "Users can delete own advice" ON public.advice;
CREATE POLICY "Users can view own advice" ON public.advice FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own advice" ON public.advice FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own advice" ON public.advice FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own advice" ON public.advice FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 9. EVIDENCE
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id uuid, title text NOT NULL, description text,
  evidence_type text, file_url text, submitted_date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can insert own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can update own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can delete own evidence" ON public.evidence;
CREATE POLICY "Users can view own evidence" ON public.evidence FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own evidence" ON public.evidence FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own evidence" ON public.evidence FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own evidence" ON public.evidence FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 10. INVOICES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id uuid, client_id uuid,
  invoice_number text NOT NULL, amount numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft', due_date date, paid_date date, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 11. DOCUMENTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id uuid, title text NOT NULL, description text, document_type text, file_url text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 12. EXPENSES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id uuid, title text NOT NULL, description text,
  amount numeric(12,2) NOT NULL DEFAULT 0, expense_date date NOT NULL DEFAULT CURRENT_DATE,
  category text, receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 13. CONTACTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL, email TEXT, phone TEXT,
  company TEXT, designation TEXT, contact_type TEXT NOT NULL DEFAULT 'general', notes TEXT,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
CREATE POLICY "Users can view own contacts" ON public.contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.contacts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 14. NOTES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, case_id UUID, client_id UUID,
  title TEXT NOT NULL, content TEXT,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 15. MATTERS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own matters" ON public.matters;
DROP POLICY IF EXISTS "Users can insert own matters" ON public.matters;
DROP POLICY IF EXISTS "Users can update own matters" ON public.matters;
DROP POLICY IF EXISTS "Users can delete own matters" ON public.matters;
CREATE POLICY "Users can view own matters" ON public.matters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matters" ON public.matters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own matters" ON public.matters FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own matters" ON public.matters FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 16. TAGS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL, color TEXT DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON public.tags;
CREATE POLICY "Users can view own tags" ON public.tags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON public.tags FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON public.tags FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 17. EXPENSE TYPES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.expense_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own expense_types" ON public.expense_types;
DROP POLICY IF EXISTS "Users can insert own expense_types" ON public.expense_types;
DROP POLICY IF EXISTS "Users can update own expense_types" ON public.expense_types;
DROP POLICY IF EXISTS "Users can delete own expense_types" ON public.expense_types;
CREATE POLICY "Users can view own expense_types" ON public.expense_types FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expense_types" ON public.expense_types FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expense_types" ON public.expense_types FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expense_types" ON public.expense_types FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 18. PAYMENTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_paid numeric(10,2) NOT NULL CHECK (amount_paid > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  method text NOT NULL CHECK (method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'dd', 'other')),
  reference_no text, notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
CREATE POLICY "Authenticated users can read payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));

-- ════════════════════════════════════════════════════════════
-- 19. CASE TEMPLATES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.case_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, description text, category text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.case_template_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.case_templates(id) ON DELETE CASCADE,
  title text NOT NULL, description text,
  days_offset integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.case_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_template_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read case_templates" ON public.case_templates;
DROP POLICY IF EXISTS "Users can manage their case_templates" ON public.case_templates;
DROP POLICY IF EXISTS "Authenticated users can read case_template_tasks" ON public.case_template_tasks;
DROP POLICY IF EXISTS "Users can manage case_template_tasks" ON public.case_template_tasks;
CREATE POLICY "Authenticated users can read case_templates" ON public.case_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their case_templates" ON public.case_templates FOR ALL TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE POLICY "Authenticated users can read case_template_tasks" ON public.case_template_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage case_template_tasks" ON public.case_template_tasks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.case_templates WHERE case_templates.id = template_id AND (case_templates.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')))));

-- ════════════════════════════════════════════════════════════
-- 20. TASKS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text DEFAULT '',
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  due_date date, case_id uuid,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks or admins can delete any" ON public.tasks;
CREATE POLICY "Authenticated users can read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own tasks or admins can delete any" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- ════════════════════════════════════════════════════════════
-- 21. AI CONFIG
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish')),
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
DROP POLICY IF EXISTS "All authenticated users can read ai_config" ON public.ai_config;
DROP POLICY IF EXISTS "Admins can insert ai_config" ON public.ai_config;
DROP POLICY IF EXISTS "Admins can update ai_config" ON public.ai_config;
DROP POLICY IF EXISTS "Admins can delete ai_config" ON public.ai_config;
CREATE POLICY "All authenticated users can read ai_config" ON public.ai_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert ai_config" ON public.ai_config FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE POLICY "Admins can update ai_config" ON public.ai_config FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE POLICY "Admins can delete ai_config" ON public.ai_config FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));

INSERT INTO public.ai_config (provider, api_key, model, is_active) VALUES
  ('groq', '', 'groq/compound', true),
  ('openai', '', 'gpt-4o-mini', false),
  ('gemini', '', 'gemini-2.0-flash', false),
  ('custom', '', '', false),
  ('tinyfish', '', 'agent-1', false)
ON CONFLICT (provider) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 22. AUDIT LOGS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL, table_name text NOT NULL, record_id text,
  old_data jsonb, new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));
CREATE POLICY "Authenticated users can insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 23. ERROR LOGS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL, context text, stack text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "error_logs_insert" ON public.error_logs;
DROP POLICY IF EXISTS "error_logs_select" ON public.error_logs;
CREATE POLICY "error_logs_insert" ON public.error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "error_logs_select" ON public.error_logs FOR SELECT USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 24. IMPORTANT DOCUMENTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.important_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, filename TEXT NOT NULL, type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.important_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.important_documents;
DROP POLICY IF EXISTS "Allow admins to manage" ON public.important_documents;
CREATE POLICY "Allow authenticated read" ON public.important_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to manage" ON public.important_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

INSERT INTO public.important_documents (name, filename, type) VALUES
  ('Adjournment Application', 'Adjournment application.docx', 'DOCX'),
  ('Personal Exception', 'Personal Exception.docx', 'DOCX'),
  ('Pursis', 'Pursis.docx', 'DOCX'),
  ('Summon New Marathi', 'Summon New marathi.rtf.doc', 'DOC'),
  ('Warrant CRPC 421', 'WARRANT CRPC 421.docx', 'DOCX'),
  ('Warrant Format JMFC', 'WARRANT FORMAT jmfc.docx', 'DOCX'),
  ('Show Cause Notice (English)', 'show couse Notice english.docx', 'DOCX')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 25. APP SETTINGS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY, value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can manage app_settings" ON public.app_settings;
CREATE POLICY "Authenticated users can read app_settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage app_settings" ON public.app_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin')));

INSERT INTO public.app_settings (key, value) VALUES ('ai_autofill', '{"enabled": false}') ON CONFLICT (key) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 26. CASES: add matter_id column
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS matter_id uuid;

-- ════════════════════════════════════════════════════════════
-- 27. RPC FUNCTIONS
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_case_status_counts()
RETURNS TABLE (status text, cnt bigint) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT status, count(*) as cnt FROM public.cases GROUP BY status;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_advice_counts(months_back int default 10)
RETURNS TABLE (yr_month text, cnt bigint) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT to_char(date_trunc('month', advice_date::date), 'YYYY-MM') as yr_month, count(*) as cnt
  FROM public.advice WHERE advice_date::date >= date_trunc('month', now() - (months_back || ' months')::interval)
  GROUP BY yr_month ORDER BY yr_month;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_case_counts(months_back int default 5)
RETURNS TABLE (yr_month text, cnt bigint) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') as yr_month, count(*) as cnt
  FROM public.cases WHERE created_at >= date_trunc('month', now() - (months_back || ' months')::interval)
  GROUP BY yr_month ORDER BY yr_month;
$$;

-- ════════════════════════════════════════════════════════════
-- 28. Ensure super admin profile
-- ════════════════════════════════════════════════════════════
UPDATE public.profiles SET role = 'super_admin', status = 'active', email = 'admin@lawmind.com', full_name = 'Super Admin'
WHERE user_id = 'f4001e03-f23a-418a-944e-27479c0e2459';

-- ════════════════════════════════════════════════════════════
-- DONE! All tables and policies created successfully.
-- ════════════════════════════════════════════════════════════
