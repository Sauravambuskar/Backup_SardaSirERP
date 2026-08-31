-- ============================================================
-- LAWMIND2 — ALL PENDING MIGRATIONS (Run in Supabase SQL Editor)
-- https://supabase.com/dashboard/project/wfwlfpnrwbqlajqxrxci/sql/new
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. PAYMENTS TABLE (partial payment tracking for invoices)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_paid numeric(10,2) NOT NULL CHECK (amount_paid > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  method text NOT NULL CHECK (method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'dd', 'other')),
  reference_no text,
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read payments"
  ON public.payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

CREATE OR REPLACE FUNCTION public.update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_total_invoice numeric;
  v_total_paid numeric;
BEGIN
  SELECT total INTO v_total_invoice FROM public.invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_paid FROM public.payments WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  IF v_total_paid >= v_total_invoice THEN
    UPDATE public.invoices SET status = 'paid', paid_date = CURRENT_DATE WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  ELSIF v_total_paid > 0 THEN
    UPDATE public.invoices SET status = 'partial', paid_date = NULL WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  ELSE
    UPDATE public.invoices SET status = CASE WHEN due_date < CURRENT_DATE THEN 'overdue' ELSE 'sent' END, paid_date = NULL WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_status ON public.payments;
CREATE TRIGGER trg_update_invoice_status
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_invoice_status_on_payment();


-- ════════════════════════════════════════════════════════════
-- 2. CASE TEMPLATES (workflow automation)
-- ════════════════════════════════════════════════════════════

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
  days_offset integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_template_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read case_templates"
  ON public.case_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read case_template_tasks"
  ON public.case_template_tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their case_templates"
  ON public.case_templates FOR ALL TO authenticated USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Users can manage case_template_tasks"
  ON public.case_template_tasks FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.case_templates WHERE case_templates.id = template_id AND (case_templates.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))))
  );

CREATE INDEX IF NOT EXISTS idx_case_templates_user ON public.case_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_case_template_tasks_template ON public.case_template_tasks(template_id);


-- ════════════════════════════════════════════════════════════
-- 3. COMMUNICATION LOGS (client/case interaction tracking)
-- ════════════════════════════════════════════════════════════

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

ALTER TABLE public.communication_logs ADD CONSTRAINT require_client_or_case CHECK (
  client_id IS NOT NULL OR case_id IS NOT NULL
);

ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read communication_logs"
  ON public.communication_logs FOR SELECT TO authenticated USING (true);

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

CREATE INDEX IF NOT EXISTS idx_comms_client ON public.communication_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_comms_case ON public.communication_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_comms_date ON public.communication_logs(date);


-- ════════════════════════════════════════════════════════════
-- 4. LINK CASES TO MATTERS (matter classification for cases)
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS matter_id uuid REFERENCES public.matters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cases_matter ON public.cases(matter_id);


-- ════════════════════════════════════════════════════════════
-- 5. AUDIT LOGS TABLE (system activity tracking)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  table_name text NOT NULL,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit_logs"
  ON public.audit_logs FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Authenticated users can insert audit_logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON public.audit_logs(created_at);


-- ════════════════════════════════════════════════════════════
-- 6. NOTES RELATIONSHIPS (fix for missing joins in queries)
-- ════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_notes_user' AND table_name = 'notes') THEN
    ALTER TABLE public.notes ADD CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_notes_case' AND table_name = 'notes') THEN
    ALTER TABLE public.notes ADD CONSTRAINT fk_notes_case FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_notes_client' AND table_name = 'notes') THEN
    ALTER TABLE public.notes ADD CONSTRAINT fk_notes_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════
-- DONE! All migrations applied successfully.
-- ════════════════════════════════════════════════════════════
