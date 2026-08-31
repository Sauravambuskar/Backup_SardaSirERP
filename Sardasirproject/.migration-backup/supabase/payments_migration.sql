-- ============================================================
-- Payments Table — run this in Supabase SQL Editor
-- Adds partial payment tracking for invoices
-- ============================================================

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

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all payments
CREATE POLICY "Authenticated users can read payments"
  ON public.payments FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert payments
CREATE POLICY "Authenticated users can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can update/delete payments
CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

-- Update invoice status based on total payments
CREATE OR REPLACE FUNCTION public.update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_total_invoice numeric;
  v_total_paid numeric;
BEGIN
  -- Get total invoice amount
  SELECT total INTO v_total_invoice FROM public.invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get total payments for this invoice
  SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_paid FROM public.payments WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update status
  IF v_total_paid >= v_total_invoice THEN
    UPDATE public.invoices SET status = 'paid', paid_date = CURRENT_DATE WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  ELSIF v_total_paid > 0 THEN
    UPDATE public.invoices SET status = 'partial', paid_date = NULL WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  ELSE
    -- Revert to sent or overdue
    UPDATE public.invoices SET status = CASE WHEN due_date < CURRENT_DATE THEN 'overdue' ELSE 'sent' END, paid_date = NULL WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_status ON public.payments;
CREATE TRIGGER trg_update_invoice_status
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_invoice_status_on_payment();
