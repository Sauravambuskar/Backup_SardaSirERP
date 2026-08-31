# TinyFish Web Agent Integration

## Overview

TinyFish is an AI-powered web automation agent integrated into LawMind to enable automated legal research. It can navigate websites, extract structured data, and return results in JSON format - perfect for scraping case law from Indian legal databases.

## What It Does

- **Automates web browsing** - Navigates legal websites like Indian Kanoon, eCourts, and SCC Online
- **Extracts structured data** - Returns case details, citations, judgments in clean JSON format
- **Natural language tasks** - You describe what you want ("find top 5 cases on Section 138 NI Act"), and it figures out how to get it
- **Context-aware** - Results appear as AI chat messages so you can ask follow-up questions

## Architecture

### 1. Service Layer (`src/lib/tinyfishService.ts`)

**Functions:**
- `loadTinyFishConfig()` - Fetches API key from Supabase (`ai_config` table)
- `runTinyFishTask(request)` - Executes web automation via TinyFish `/run/sync` endpoint
- `LEGAL_RESEARCH_PRESETS` - Pre-configured tasks for common legal research scenarios

**Presets Included:**
1. **Indian Kanoon Search** - Searches cases by keyword, extracts case name, citation, court, year, summary
2. **SCC Online Search** - Finds judgments on SCC Online, extracts title, citation, court, date
3. **eCourts Case Status** - Checks case status via CNR number, extracts hearing dates and orders

### 2. UI Integration (`src/pages/AIAgentPage.tsx`)

**New Features:**
- **"Web Research" button** in the status bar (teal-colored, globe icon)
- **Research Dialog** with:
  - Dropdown to select preset (Indian Kanoon, SCC Online, eCourts)
  - Text area for query input
  - Real-time loading state during research
- **Results Display** - Research output appears as an assistant message in the chat with:
  - Formatted JSON
  - Execution time and step count
  - Full conversational context for follow-up AI questions

### 3. Database Schema (`FULL_SCHEMA.sql`)

**`ai_config` Table:**
```sql
CREATE TABLE public.ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish')),
  api_key text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  base_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  ...
);
```

**Default Row:**
```sql
INSERT INTO ai_config (provider, api_key, model, base_url, is_active)
VALUES ('tinyfish', '', 'agent-1', 'https://agent.tinyfish.ai/v1', false);
```

### 4. Migration Script (`migrations/add_tinyfish_provider.sql`)

Adds 'tinyfish' to the provider CHECK constraint and inserts the default config row.

## Setup Instructions

### Step 1: Run Database Migration

Go to your Supabase SQL Editor:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
```

Paste and run:
```sql
-- Drop existing CHECK constraint
ALTER TABLE public.ai_config
DROP CONSTRAINT IF EXISTS ai_config_provider_check;

-- Add new CHECK constraint including 'tinyfish'
ALTER TABLE public.ai_config
ADD CONSTRAINT ai_config_provider_check
CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish'));

-- Insert default TinyFish config row
INSERT INTO public.ai_config (provider, api_key, model, base_url, is_active)
VALUES ('tinyfish', '', 'agent-1', 'https://agent.tinyfish.ai/v1', false)
ON CONFLICT (provider) DO NOTHING;
```

### Step 2: Add TinyFish API Key

1. Open **AI Settings** page in LawMind
2. Scroll to **"TinyFish Web Agent"** card
3. Paste your API key: `YOUR_TINYFISH_API_KEY`
4. Toggle **"Enable"** to ON
5. Click **"Save"**

The API key is securely stored in Supabase with RLS policies - only admins can read/write.

### Step 3: Test Web Research

1. Go to **AI Agent** page
2. Click **"🌐 Web Research"** button (top-right, status bar)
3. Select **"Search Indian Kanoon"**
4. Enter query: `Section 138 NI Act dishonor of cheque`
5. Click **"Research"**

After 10-30 seconds, you'll see a JSON result with the top 5 cases:
```json
{
  "results": [
    {
      "case_name": "Rangappa vs Sri Mohan",
      "citation": "2010 (11) SCC 441",
      "court": "Supreme Court of India",
      "year": 2010,
      "summary": "...",
      "url": "https://indiankanoon.org/doc/..."
    },
    ...
  ]
}
```

You can then ask the AI: *"Summarize the key points from these cases"* or *"Which case is most relevant to XYZ situation?"*

## How It Works

1. **User clicks "Web Research"** → Dialog opens
2. **User selects preset + enters query** → e.g., "Search Indian Kanoon" + "Section 138 NI Act"
3. **Frontend calls `runTinyFishTask()`** with:
   - `url`: `https://indiankanoon.org/search/?formInput=Section%20138%20NI%20Act`
   - `goal`: "Search for cases related to: Section 138 NI Act. Extract top 5 results..."
   - `output_schema`: JSON schema defining expected result structure
4. **Service fetches TinyFish config** from Supabase (`loadTinyFishConfig()`)
5. **Service POSTs to TinyFish API** (`https://agent.tinyfish.ai/v1/run/sync`)
6. **TinyFish agent**:
   - Launches headless browser
   - Navigates to Indian Kanoon
   - Enters search query
   - Scrapes result elements
   - Extracts data per schema
   - Returns structured JSON
7. **Frontend receives result** → Inserts as assistant message in chat
8. **User sees formatted JSON** with metadata (duration, steps)

## Security & Best Practices

### API Key Storage
- **Never commit API keys to git** - They're stored in Supabase, not in code
- **RLS policies** ensure only admins can read/write `ai_config`
- **Frontend loads config per-request** - No client-side key exposure

### Error Handling
```typescript
if (!result.success) {
  toast.error(result.error || "Research failed");
  return;
}
```

Graceful failures if:
- TinyFish not configured (`"Add your API key in AI Settings"`)
- Network timeout
- Site blocked scraping
- Invalid query

### Rate Limiting
- TinyFish has usage limits per API key
- Each task has `max_duration_seconds: 120` (2 min timeout)
- `max_steps: 30` to prevent infinite loops

## Customization

### Adding New Research Presets

Edit `src/lib/tinyfishService.ts`:

```typescript
LEGAL_RESEARCH_PRESETS.push({
  id: "manupatra_search",
  label: "Search Manupatra",
  description: "Find judgments on Manupatra (requires login)",
  urlTemplate: "https://www.manupatrafast.com/pers/Search.aspx?q=",
  goalTemplate: "Login with credentials from env vars. Search for: {query}. Extract case details.",
  outputSchema: {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            citation: { type: "string" },
            date: { type: "string" },
          },
        },
      },
    },
  },
});
```

### Adjusting Timeouts

In `AIAgentPage.tsx`:

```typescript
const result = await runTinyFishTask({
  url,
  goal,
  output_schema: preset.outputSchema,
  max_steps: 50,              // Increase for complex sites
  max_duration_seconds: 180,  // 3 minutes for slow loads
});
```

## Troubleshooting

### "TinyFish not configured"
→ Go to AI Settings, add API key, enable, save

### "Network error"
→ Check internet connection, verify TinyFish service is up

### "HTTP 401"
→ Invalid API key - regenerate in TinyFish dashboard

### "HTTP 429"
→ Rate limit exceeded - wait or upgrade plan

### Empty/incorrect results
→ Site structure changed - update `goalTemplate` or `output_schema`

## API Reference

### `runTinyFishTask(request: TinyFishRequest)`

**Parameters:**
```typescript
{
  url: string;              // Target website URL
  goal: string;             // Natural language task description
  output_schema?: {         // Expected JSON structure
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
  max_steps?: number;       // Max browser actions (default: 50)
  max_duration_seconds?: number; // Timeout (default: 180)
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: any;               // Extracted data (if success)
  error?: string;           // Error message (if failed)
  steps?: number;           // Actions taken
  duration_ms?: number;     // Execution time
}
```

## Future Enhancements

- [ ] Support for authenticated sites (login credentials in env vars)
- [ ] Batch research (run multiple queries in parallel)
- [ ] Result caching (avoid re-scraping same query)
- [ ] Custom preset builder UI (no-code task creator)
- [ ] Integration with case management (save research directly to case files)
- [ ] Scheduled research (auto-update case status daily)

## Resources

- **TinyFish Docs:** https://docs.tinyfish.ai
- **API Playground:** https://agent.tinyfish.ai/playground
- **Dashboard:** https://agent.tinyfish.ai/dashboard
- **Supabase RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

**Integration completed:** January 2025  
**Last updated:** January 2025  
**Maintained by:** LawMind Development Team
