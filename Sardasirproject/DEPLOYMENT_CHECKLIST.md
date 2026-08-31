# TinyFish Integration - Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Changes
- [x] `tinyfishService.ts` created with API integration
- [x] `AIAgentPage.tsx` updated with Web Research UI
- [x] `FULL_SCHEMA.sql` updated with 'tinyfish' provider
- [x] Migration script created
- [x] Documentation written
- [x] Build succeeds without errors
- [x] No TypeScript diagnostics
- [x] All imports resolved

### Files to Review Before Deployment
1. **Service:** `artifacts/lawmind/src/lib/tinyfishService.ts`
2. **UI:** `artifacts/lawmind/src/pages/AIAgentPage.tsx`
3. **Migration:** `migrations/add_tinyfish_provider.sql`
4. **Docs:** `docs/TINYFISH_INTEGRATION.md`

---

## 🚀 Deployment Steps

### Step 1: Database Migration (REQUIRED)

**Option A: Via Supabase Dashboard**
1. Open: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copy contents from: `migrations/add_tinyfish_provider.sql`
3. Click "Run"
4. Verify success message

**Option B: Manual SQL (Same Result)**
```sql
-- 1. Drop old constraint
ALTER TABLE public.ai_config 
DROP CONSTRAINT IF EXISTS ai_config_provider_check;

-- 2. Add new constraint with 'tinyfish'
ALTER TABLE public.ai_config 
ADD CONSTRAINT ai_config_provider_check 
CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish'));

-- 3. Insert default config row
INSERT INTO public.ai_config (provider, api_key, model, base_url, is_active)
VALUES ('tinyfish', '', 'agent-1', 'https://agent.tinyfish.ai/v1', false)
ON CONFLICT (provider) DO NOTHING;
```

**Verification Query:**
```sql
SELECT provider, model, base_url, is_active 
FROM public.ai_config 
WHERE provider = 'tinyfish';
```

Expected result:
```
provider | model    | base_url                        | is_active
---------|----------|---------------------------------|----------
tinyfish | agent-1  | https://agent.tinyfish.ai/v1    | false
```

### Step 2: Deploy Code

**Option A: Git Push (When Ready)**
```bash
git add .
git commit -m "feat: TinyFish web agent integration for legal research"
git push origin main
```

**Option B: Manual Deploy**
- Upload modified files to production server
- Run `npm run build` in production
- Restart application

### Step 3: Configure TinyFish API Key

1. **Login as Admin/Super Admin**
2. Navigate to: **Setup** → **AI Settings**
3. Scroll to: **"TinyFish Web Agent"** card
4. Enter API Key: `YOUR_TINYFISH_API_KEY`
5. Toggle **"Enabled"** to ON
6. Click **"Save"**

**Verification:**
- Card should show green checkmark
- Status: "Configured (Active)"

### Step 4: Test End-to-End

**Test Case 1: Indian Kanoon Search**
1. Go to: **AI Agent** page
2. Click: **"🌐 Web Research"** (teal button, top-right)
3. Select: **"Search Indian Kanoon"**
4. Query: `Section 138 NI Act dishonor of cheque`
5. Click: **"Research"**
6. Wait ~10-30 seconds
7. Verify: JSON results appear in chat with 5 cases

**Expected Output:**
```json
{
  "results": [
    {
      "case_name": "...",
      "citation": "...",
      "court": "...",
      "year": 2023,
      "summary": "...",
      "url": "https://indiankanoon.org/doc/..."
    },
    ...
  ]
}
```

**Test Case 2: eCourts Status**
1. Click: **"Web Research"**
2. Select: **"eCourts Case Status"**
3. Query: `[Valid CNR Number]`
4. Click: **"Research"**
5. Verify: Case status, hearing dates, orders extracted

**Test Case 3: SCC Online**
1. Click: **"Web Research"**
2. Select: **"Search SCC Online"**
3. Query: `trademark infringement`
4. Click: **"Research"**
5. Verify: Case titles and citations returned

### Step 5: User Training (Optional)

**For Admin:**
- Show AI Settings page
- Explain API key management
- Demonstrate enabling/disabling providers

**For Users:**
- Show Web Research button location
- Walk through preset selection
- Demonstrate query input
- Show how to ask AI follow-up questions about results

---

## 🔍 Post-Deployment Verification

### Checklist
- [ ] TinyFish card visible in AI Settings
- [ ] API key saved successfully
- [ ] "Web Research" button appears in AI Agent
- [ ] Dialog opens with 3 presets
- [ ] Indian Kanoon search returns results
- [ ] eCourts search works (if CNR available)
- [ ] SCC Online search returns data
- [ ] Results display as formatted JSON
- [ ] No console errors
- [ ] Loading states work correctly
- [ ] Error messages are user-friendly

### Database Verification
```sql
-- Check config exists and is active
SELECT * FROM public.ai_config WHERE provider = 'tinyfish';

-- Check RLS policies work (run as admin)
SELECT * FROM public.ai_config;

-- Verify non-admins can read but not write
-- (Test by switching to a 'user' role account)
```

### Application Logs
```bash
# Check for errors
tail -f /var/log/lawmind/error.log | grep -i tinyfish

# Check API calls
tail -f /var/log/lawmind/access.log | grep -i tinyfish
```

---

## 🐛 Troubleshooting

### Issue: "TinyFish not configured"
**Cause:** API key not set or provider disabled  
**Fix:**
1. Go to AI Settings
2. Add API key
3. Enable provider
4. Save

### Issue: "Network error"
**Cause:** Can't reach TinyFish API  
**Fix:**
1. Check internet connection
2. Verify firewall rules allow outbound HTTPS
3. Test endpoint: `curl https://agent.tinyfish.ai/v1/health`

### Issue: "HTTP 401"
**Cause:** Invalid API key  
**Fix:**
1. Verify key is correct: `YOUR_TINYFISH_API_KEY...`
2. Check for extra spaces
3. Regenerate key in TinyFish dashboard if needed

### Issue: "HTTP 429"
**Cause:** Rate limit exceeded  
**Fix:**
1. Wait 1 minute
2. Check TinyFish dashboard for usage limits
3. Consider upgrading plan

### Issue: Empty results
**Cause:** Site structure changed or query too broad  
**Fix:**
1. Try more specific query
2. Check if target site is up
3. Update `goalTemplate` in preset if needed

### Issue: Results not appearing in chat
**Cause:** State update issue  
**Fix:**
1. Check browser console for React errors
2. Refresh page
3. Clear browser cache

---

## 📊 Monitoring

### Metrics to Track
1. **Usage:**
   - Number of research queries per day
   - Most popular preset
   - Average execution time

2. **Errors:**
   - Rate of failed requests
   - Common error messages
   - Timeout frequency

3. **Performance:**
   - Average response time
   - Steps taken per query
   - Success rate by preset

### Recommended Logging
```typescript
// Add to tinyfishService.ts
console.log('[TinyFish] Starting research:', { preset: preset.id, query });
console.log('[TinyFish] Result:', { success: result.success, steps: result.steps });
```

---

## 🔐 Security Reminders

- ✅ API key stored in Supabase (encrypted at rest)
- ✅ RLS policies prevent unauthorized access
- ✅ Key never exposed to client-side code
- ✅ HTTPS used for all API calls
- ✅ No PII sent to TinyFish (only search queries)

**If API Key Compromised:**
1. Disable provider immediately in AI Settings
2. Regenerate key in TinyFish dashboard
3. Update in AI Settings
4. Monitor usage logs for suspicious activity

---

## 📝 Rollback Plan

**If Integration Causes Issues:**

### Step 1: Disable Provider
```sql
UPDATE public.ai_config 
SET is_active = false 
WHERE provider = 'tinyfish';
```

### Step 2: Revert Code (if needed)
```bash
git revert [commit-hash]
git push origin main
```

### Step 3: Remove Database Changes (if needed)
```sql
DELETE FROM public.ai_config WHERE provider = 'tinyfish';

ALTER TABLE public.ai_config 
DROP CONSTRAINT ai_config_provider_check;

ALTER TABLE public.ai_config 
ADD CONSTRAINT ai_config_provider_check 
CHECK (provider IN ('groq', 'openai', 'gemini', 'custom'));
```

---

## ✨ Success Criteria

Integration is successful when:
- [x] Build completes without errors
- [ ] Database migration runs successfully
- [ ] API key configured in AI Settings
- [ ] All 3 presets return valid results
- [ ] Results appear in AI chat
- [ ] No console errors or warnings
- [ ] Users can ask follow-up questions about results
- [ ] Loading states display correctly
- [ ] Error messages are clear and actionable

---

## 📞 Support

**For Issues:**
1. Check troubleshooting section above
2. Review `docs/TINYFISH_INTEGRATION.md`
3. Check Supabase logs
4. Check TinyFish dashboard: https://agent.tinyfish.ai/dashboard

**TinyFish Support:**
- Docs: https://docs.tinyfish.ai
- Support: support@tinyfish.ai

**LawMind Support:**
- Internal team channel
- Development lead

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Production URL:** _____________  
**Status:** ⏳ Pending → ✅ Complete

