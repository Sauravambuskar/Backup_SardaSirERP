-- Create important_documents table
CREATE TABLE IF NOT EXISTS public.important_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.important_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read" ON public.important_documents
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins to manage" ON public.important_documents
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Insert initial data
INSERT INTO public.important_documents (name, filename, type)
VALUES 
    ('Adjournment Application', 'I am sharing ''Adjournment application'' with you.docx', 'DOCX'),
    ('Personal Exception', 'I am sharing ''Personal Exception'' with you.docx', 'DOCX'),
    ('Pursis', 'I am sharing ''Pursis'' with you.docx', 'DOCX'),
    ('Summon New Marathi', 'Summon New marathi.rtf.doc', 'DOC'),
    ('Warrant CRPC 421', 'WARRANT CRPC 421.docx', 'DOCX'),
    ('Warrant Format JMFC', 'WARRANT FORMAT jmfc.docx', 'DOCX'),
    ('Show Cause Notice (English)', 'show couse Notice  english - Copy.docx', 'DOCX');
