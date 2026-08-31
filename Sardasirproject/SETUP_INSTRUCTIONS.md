# 🚀 TinyFish Setup - Final Step

## You're Almost Done! Just 2 Minutes Left...

---

## Step 1: Run SQL in Supabase (2 minutes)

### Option A: Copy-Paste Method (Recommended) ✅

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new
   ```

2. **Open this file in your editor:**
   ```
   RUN_THIS_IN_SUPABASE.sql
   ```

3. **Copy ALL contents** (Ctrl+A, Ctrl+C)

4. **Paste in Supabase SQL Editor** (Ctrl+V)

5. **Click "RUN" button** (bottom-right)

6. **Verify the result:**
   ```
   provider | model    | base_url                        | is_active | status
   ---------|----------|---------------------------------|-----------|----------
   tinyfish | agent-1  | https://agent.tinyfish.ai/v1    | true      | ✅ ENABLED
   ```

### Option B: Quick Copy (If you want shortest version)

Just paste this in Supabase SQL Editor:

```sql
ALTER TABLE public.ai_config DROP CONSTRAINT IF EXISTS ai_config_provider_check;
ALTER TABLE public.ai_config ADD CONSTRAINT ai_config_provider_check CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish'));
INSERT INTO public.ai_config (provider, api_key, model, base_url, is_active) VALUES ('tinyfish', 'YOUR_TINYFISH_API_KEY', 'agent-1', 'https://agent.tinyfish.ai/v1', true) ON CONFLICT (provider) DO UPDATE SET api_key = EXCLUDED.api_key, is_active = EXCLUDED.is_active;
```

---

## Step 2: Test It! (30 seconds)

1. **Go to LawMind** → **AI Agent** page

2. **Look for teal button** in top-right: **"🌐 Web Research"**

3. **Click it** → Dialog opens

4. **Select:** "Search Indian Kanoon"

5. **Type:** `Section 138 NI Act`

6. **Click:** "Research"

7. **Wait 10-30 seconds** → You'll see JSON results with cases!

---

## ✅ Done!

If you see the Web Research button and can run a search, congratulations! TinyFish is fully integrated.

---

## 🐛 Troubleshooting

### "Web Research button not showing"
→ Refresh browser (Ctrl + F5)

### "TinyFish not configured"
→ SQL didn't run. Try Option B above (short version)

### "HTTP 401 error"
→ API key issue. Re-run the SQL with the key included

### "No results appearing"
→ Wait 30 seconds, some sites are slow

---

## 📞 Need Help?

Check these files:
- `docs/TINYFISH_INTEGRATION.md` - Full technical docs
- `docs/TINYFISH_UI_GUIDE.md` - Visual guide
- `DEPLOYMENT_CHECKLIST.md` - Troubleshooting

---

**That's it! Just run the SQL and you're done! 🎉**

