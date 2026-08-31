
-- 1. Make legal-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'legal-files';

-- 2. Add missing UPDATE policy on storage.objects
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'legal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Fix profiles SELECT policy to owner-only
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
