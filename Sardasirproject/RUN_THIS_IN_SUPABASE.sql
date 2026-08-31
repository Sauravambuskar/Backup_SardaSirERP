-- ============================================================
-- TinyFish Setup - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================
-- 
-- 📍 Go to: https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new
-- 📋 Paste this entire file and click "RUN"
-- ✅ Done! TinyFish will be ready to use.
--
-- ============================================================

-- Step 1: Update ai_config constraint to allow 'tinyfish'
ALTER TABLE public.ai_config 
DROP CONSTRAINT IF EXISTS ai_config_provider_check;

ALTER TABLE public.ai_config 
ADD CONSTRAINT ai_config_provider_check 
CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish'));

-- Step 2: Insert/Update TinyFish configuration
INSERT INTO public.ai_config (
  provider, 
  api_key, 
  model, 
  base_url, 
  is_active
)
VALUES (
  'tinyfish', 
  'YOUR_TINYFISH_API_KEY', 
  'agent-1', 
  'https://agent.tinyfish.ai/v1', 
  true
)
ON CONFLICT (provider) 
DO UPDATE SET 
  api_key = EXCLUDED.api_key,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Step 3: Verify the setup
SELECT 
  provider, 
  model, 
  base_url, 
  is_active,
  CASE 
    WHEN is_active THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM public.ai_config 
WHERE provider = 'tinyfish';

-- ============================================================
-- Expected Result:
-- ============================================================
-- provider | model    | base_url                        | is_active | status
-- ---------|----------|---------------------------------|-----------|----------
-- tinyfish | agent-1  | https://agent.tinyfish.ai/v1    | true      | ✅ ENABLED
-- ============================================================
--
-- 🎉 If you see the above result, setup is complete!
--
-- 📍 Next Steps:
--    1. Go to AI Agent page in LawMind
--    2. Click "🌐 Web Research" button (teal button, top-right)
--    3. Select "Search Indian Kanoon"
--    4. Enter: "Section 138 NI Act"
--    5. Click "Research"
--    6. Wait 10-30 seconds for results
--
-- ============================================================
