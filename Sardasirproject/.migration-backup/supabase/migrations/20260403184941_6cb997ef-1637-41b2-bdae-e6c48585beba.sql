
-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-files', 'legal-files', false);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'legal-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'legal-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'legal-files' AND (storage.foldername(name))[1] = auth.uid()::text);
