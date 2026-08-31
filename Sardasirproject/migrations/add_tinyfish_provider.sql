-- Migration: Add TinyFish web agent provider to ai_config
-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- Step 1: Drop existing CHECK constraint on provider
ALTER TABLE public.ai_config
DROP CONSTRAINT IF EXISTS ai_config_provider_check;

-- Step 2: Add new CHECK constraint including 'tinyfish'
ALTER TABLE public.ai_config
ADD CONSTRAINT ai_config_provider_check
CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish'));

-- Step 3: Insert default TinyFish config row (if it doesn't exist)
INSERT INTO public.ai_config (provider, api_key, model, base_url, is_active)
VALUES ('tinyfish', '', 'agent-1', 'https://agent.tinyfish.ai/v1', false)
ON CONFLICT (provider) DO NOTHING;

-- Verification query (optional):
-- SELECT provider, model, base_url, is_active FROM public.ai_config WHERE provider = 'tinyfish';
