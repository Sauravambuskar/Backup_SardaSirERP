-- ============================================================
-- Migration: Add role-based access control to profiles
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'agent',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add constraints
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('super_admin', 'admin', 'agent', 'lawyer'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- 3. Helper function: get the role of a user
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- 4. Drop old restrictive SELECT policy and replace with role-aware one
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- 5. Drop old UPDATE policy and replace with role-aware one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;

CREATE POLICY "Users can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      get_user_role(auth.uid()) IN ('admin', 'super_admin')
      AND NOT (role = 'super_admin' AND get_user_role(auth.uid()) = 'admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR (
      get_user_role(auth.uid()) IN ('admin', 'super_admin')
      AND NOT (role = 'super_admin' AND get_user_role(auth.uid()) = 'admin')
    )
  );

-- 6. ⚠ IMPORTANT: Set YOUR account as super_admin
-- Find your user_id by running:
--   SELECT id, email FROM auth.users;
-- Then run:
--   UPDATE public.profiles SET role = 'super_admin' WHERE user_id = 'YOUR-USER-UUID-HERE';

-- ============================================================
-- Done. Refresh your app after running this migration.
-- ============================================================
