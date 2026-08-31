# TinyFish Web Research - UI Guide

## What Users Will See

### 1. AI Settings Page

**Location:** Setup → AI Settings

**New Card: "TinyFish Web Agent"**

```
┌─────────────────────────────────────────────────┐
│  🌐 TinyFish Web Agent                          │
│  ─────────────────────────────────────────────  │
│  Web automation agent for legal research        │
│  (Indian Kanoon, eCourts, SCC Online)           │
│                                                  │
│  API Key                                        │
│  ┌───────────────────────────────────────────┐ │
│  │ YOUR_TINYFISH_API_KEY...                    │ │
│  └───────────────────────────────────────────┘ │
│                                                  │
│  Model: agent-1                                 │
│  Base URL: https://agent.tinyfish.ai/v1        │
│                                                  │
│  [x] Enabled                                    │
│                                                  │
│  [Test Connection]  [Save]                      │
└─────────────────────────────────────────────────┘
```

**Features:**
- Teal-themed card (matches research branding)
- Globe icon (🌐)
- Description mentions Indian legal databases
- Toggle to enable/disable
- Test button to verify API key
- Save button (admin/super admin only)

---

### 2. AI Agent Page - Status Bar

**Location:** AI Agent (main chat interface)

**Before:**
```
┌──────────────────────────────────────────────────────┐
│ ● Groq · llama-3.3-70b    [Data ON] [Clear]         │
└──────────────────────────────────────────────────────┘
```

**After Integration:**
```
┌──────────────────────────────────────────────────────┐
│ ● Groq · llama-3.3-70b    [🌐 Web Research] [Data ON] [Clear] │
└──────────────────────────────────────────────────────┘
```

**Button Details:**
- **Color:** Teal background (`bg-teal-500/10`)
- **Icon:** Globe (🌐)
- **Text:** "Web Research" (hidden on small screens, icon only)
- **Position:** Between provider info and "Data ON" toggle
- **Hover:** Slightly brighter teal
- **Tooltip:** "Legal Web Research with TinyFish"

---

### 3. Web Research Dialog

**Triggered by:** Clicking "🌐 Web Research" button

```
┌─────────────────────────────────────────────────────┐
│  🌐 Legal Web Research                        [X]   │
├─────────────────────────────────────────────────────┤
│  Automatically search legal databases and extract   │
│  structured results using TinyFish web agent.       │
│                                                      │
│  Research Source                                    │
│  ┌────────────────────────────────────────────────┐│
│  │ Select a legal database                      ▼││
│  └────────────────────────────────────────────────┘│
│                                                      │
│  Query                                              │
│  ┌────────────────────────────────────────────────┐│
│  │ e.g., Section 138 NI Act dishonor of cheque   ││
│  │ OR CNR number for case status                  ││
│  │                                                 ││
│  └────────────────────────────────────────────────┘│
│                                                      │
│  [Cancel]                        [🌐 Research]      │
└─────────────────────────────────────────────────────┘
```

**Dropdown Options:**
```
┌─────────────────────────────────────────────────────┐
│ Search Indian Kanoon                                │
│ Find judgments related to a legal query             │
├─────────────────────────────────────────────────────┤
│ Search SCC Online                                   │
│ Find judgments on SCC Online (free tier)            │
├─────────────────────────────────────────────────────┤
│ eCourts Case Status                                 │
│ Check case status on eCourts (CNR required)         │
└─────────────────────────────────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────────────────────────────────┐
│  🌐 Legal Web Research                        [X]   │
├─────────────────────────────────────────────────────┤
│  Research Source: Search Indian Kanoon              │
│  Query: Section 138 NI Act dishonor of cheque       │
│                                                      │
│  [Cancel]              [⚙️ Researching...]         │
│                         (button disabled)            │
└─────────────────────────────────────────────────────┘
```

---

### 4. Results in AI Chat

**After Research Completes:**

```
┌─────────────────────────────────────────────────────┐
│  🤖 AI Assistant                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ **🌐 Web Research Results for "Section 138 NI   ││
│  │ Act dishonor of cheque"** (Search Indian Kanoon)││
│  │                                                  ││
│  │ ```json                                          ││
│  │ {                                                ││
│  │   "results": [                                   ││
│  │     {                                            ││
│  │       "case_name": "Rangappa vs Sri Mohan",     ││
│  │       "citation": "2010 (11) SCC 441",          ││
│  │       "court": "Supreme Court of India",        ││
│  │       "year": 2010,                             ││
│  │       "summary": "Landmark judgment...",        ││
│  │       "url": "https://indiankanoon.org/..."    ││
│  │     },                                           ││
│  │     ...                                          ││
│  │   ]                                              ││
│  │ }                                                ││
│  │ ```                                              ││
│  │                                                  ││
│  │ _Completed in 12s, 14 steps_                    ││
│  │                                                  ││
│  │ 10:23 AM · agent-1                              ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Result Features:**
- **Header:** Bold with 🌐 emoji + query + preset name
- **JSON:** Syntax-highlighted code block
- **Metadata:** Execution time + steps taken (italics)
- **Timestamp:** When research completed
- **Copyable:** Click copy icon to copy JSON
- **Shareable:** WhatsApp, Email, PDF via share menu

---

### 5. Follow-Up Interactions

**User Can Ask:**
```
┌─────────────────────────────────────────────────────┐
│  👤 You                                              │
│  ┌─────────────────────────────────────────────────┐│
│  │ Summarize the key points from these cases       ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  🤖 AI Assistant                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ Based on the research results:                  ││
│  │                                                  ││
│  │ 1. **Rangappa vs Sri Mohan (2010)**: The       ││
│  │    Supreme Court held that...                   ││
│  │                                                  ││
│  │ 2. **XYZ Case**: Key principle established...   ││
│  │                                                  ││
│  │ Common themes across these judgments:           ││
│  │ - Dishonor of cheque requires proof of...      ││
│  │ - Defense available under Section 138...        ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Why This Works:**
- Research results stay in chat history
- AI has full context of JSON data
- User gets conversational interface
- Can drill down into specific cases
- Can compare judgments
- Can ask for citations

---

## User Flows

### Flow 1: Quick Case Search
```
User clicks "Web Research"
  ↓
Selects "Search Indian Kanoon"
  ↓
Types: "Trademark infringement"
  ↓
Clicks "Research"
  ↓
Waits 15 seconds (sees "Researching..." state)
  ↓
Gets JSON with 5 cases
  ↓
Asks AI: "Which case is most recent?"
  ↓
AI analyzes year field, responds with answer
```

### Flow 2: Check Case Status
```
User has CNR number from eCourts
  ↓
Clicks "Web Research"
  ↓
Selects "eCourts Case Status"
  ↓
Pastes CNR number
  ↓
Clicks "Research"
  ↓
Waits 20 seconds (site navigation takes time)
  ↓
Gets status, hearing dates, orders
  ↓
Asks AI: "When is the next hearing?"
  ↓
AI extracts "next_hearing_date" from JSON
```

### Flow 3: Deep Research
```
User clicks "Web Research"
  ↓
Searches Indian Kanoon for "Section 302 IPC murder"
  ↓
Gets 5 cases
  ↓
Asks AI: "Summarize these"
  ↓
AI provides summary
  ↓
User asks: "Which case has the strongest precedent?"
  ↓
AI analyzes court hierarchy (SC > HC) and cites Rangappa
  ↓
User clicks copy icon, pastes into case brief
```

---

## Error States

### 1. No API Key Configured
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ TinyFish not configured or disabled.            │
│  Add your API key in AI Settings.                   │
└─────────────────────────────────────────────────────┘
```

### 2. Network Error
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Network error                                    │
│  Check your connection and try again.               │
└─────────────────────────────────────────────────────┘
```

### 3. Invalid API Key
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ HTTP 401                                         │
│  Invalid API key. Update in AI Settings.            │
└─────────────────────────────────────────────────────┘
```

### 4. Rate Limit
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ HTTP 429                                         │
│  Rate limit exceeded. Wait a moment and retry.      │
└─────────────────────────────────────────────────────┘
```

### 5. Empty Query
```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Select a research source and enter a query      │
└─────────────────────────────────────────────────────┘
```

---

## Visual Design Notes

### Color Palette
- **Primary:** Teal/Cyan (`#14b8a6`)
- **Background:** `bg-teal-500/10` (10% opacity)
- **Border:** `border-teal-500/40` (40% opacity)
- **Text:** `text-teal-600` (dark) / `text-teal-400` (light mode)
- **Hover:** `hover:bg-teal-500/20` (20% opacity)

### Typography
- **Button text:** 11px, font-medium
- **Dialog title:** 18px, font-semibold
- **Dialog description:** 14px, text-muted-foreground
- **Result JSON:** Monospace font, 13px
- **Metadata:** 11px, italic

### Spacing
- **Button padding:** `px-2.5 py-1` (compact)
- **Dialog padding:** `p-4` (comfortable)
- **Gap between elements:** `gap-2` (8px)
- **Form fields spacing:** `space-y-4` (16px)

### Icons
- **Globe (🌐):** Main research icon
- **Loader (⚙️):** Spinning when loading
- **Checkmark (✓):** Success state
- **Warning (⚠️):** Error messages

---

## Accessibility

### Keyboard Navigation
- **Tab:** Move between button, dropdown, textarea
- **Enter:** Submit research (when focused on textarea)
- **Escape:** Close dialog
- **Space:** Open dropdown

### Screen Readers
- Button announces: "Web Research button, opens legal research dialog"
- Dialog announces: "Legal Web Research dialog, select research source and enter query"
- Loading state announces: "Researching, please wait"
- Results announce: "Research complete, 5 results found"

### Focus Management
- Dialog auto-focuses first input on open
- Focus returns to button when dialog closes
- Tab order: dropdown → textarea → cancel → research

---

## Mobile Responsiveness

### Small Screens (<640px)
```
┌──────────────────────┐
│ ● Groq · llama-3.3   │
│ [🌐] [📊] [🗑️]       │
└──────────────────────┘
```
- Button shows icon only (no "Web Research" text)
- Dialog takes full width
- Textarea adjusts to screen size

### Medium Screens (640px - 1024px)
```
┌────────────────────────────────┐
│ ● Groq · llama-3.3-70b         │
│ [🌐 Web Research] [Data ON]    │
└────────────────────────────────┘
```
- Full button text visible
- Dialog max-width: 32rem

### Large Screens (>1024px)
- Same as medium
- More breathing room around elements

---

## Animation Details

### Button Hover
```css
transition: all 0.2s ease
hover: background brightness +10%
```

### Dialog Open
```css
animate-in fade-in-0 slide-in-from-bottom-2
duration: 200ms
```

### Loading Spinner
```css
animate-spin
transform: rotate(360deg)
duration: 1s
infinite
```

### Result Fade-In
```css
animate-in fade-in-0 slide-in-from-bottom-2
duration: 300ms
```

---

## Example Queries Users Might Try

### Criminal Law
- "Section 138 NI Act dishonor of cheque"
- "Bail application under Section 437 CrPC"
- "Dishonor of cheque recent judgments"
- "Quashing of FIR under Section 482"

### Civil Law
- "Specific performance of contract"
- "Trademark infringement remedies"
- "Partition suit legal principles"
- "Rent control act Maharashtra"

### Case Status
- "[CNR Number]"
- "Case number: XYZ/2024"

---

## Tips for Users

1. **Be specific** - "Section 138 NI Act" better than just "cheque bounce"
2. **Use legal terms** - "Trademark infringement" better than "logo stealing"
3. **Include year** - "trademark infringement 2024" for recent cases
4. **Try different sources** - Indian Kanoon for case law, eCourts for status
5. **Ask follow-up questions** - AI has the JSON data in context

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Production Ready
