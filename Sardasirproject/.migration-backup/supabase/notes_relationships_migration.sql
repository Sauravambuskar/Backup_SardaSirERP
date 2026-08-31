  -- ============================================================
  -- Add Foreign Key Relationships to Notes Table
  -- ============================================================
  -- The Notes table is missing explicit foreign key relationships
  -- which prevents PostgREST from performing left joins like `cases(title)`, causing the query to fail.
  -- Run this in your Supabase SQL Editor.

  DO $$ 
  BEGIN
    -- 1. Link notes to users
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_notes_user' AND table_name = 'notes'
    ) THEN
      ALTER TABLE public.notes
        ADD CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- 2. Link notes to cases
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_notes_case' AND table_name = 'notes'
    ) THEN
      ALTER TABLE public.notes
        ADD CONSTRAINT fk_notes_case FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;
    END IF;

    -- 3. Link notes to clients
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_notes_client' AND table_name = 'notes'
    ) THEN
      ALTER TABLE public.notes
        ADD CONSTRAINT fk_notes_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
  END $$;
