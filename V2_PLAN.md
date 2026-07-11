# Command Center — v2 Plan

## Status: COMPLETE (April 26, 2026)

All four planned v2 features have been addressed. Features 1 and 2 are fully live. Features 3 and 4 are promoted to v3.

---

## Completed in v2

### ✅ Feature 1: Real weather
- open-meteo.com, no API key required
- `lib/weather.ts` — fetches current temp, condition, high/low, icon
- 15-minute server cache via `next: { revalidate: 900 }`
- Graceful fallback if API unreachable

### ✅ Feature 2: Today + Tomorrow schedule from iCal
- Three feeds: Gmail (secret iCal URL), Outlook (published ICS), iCloud (published webcal)
- `lib/calendar.ts` — fetches, parses with ical.js, filters to today + tomorrow in ET
- Events sorted by time (numeric sort key, not string — 12h format sorts incorrectly as strings)
- Tomorrow section renders below Today with subdued styling

### ✅ Layout redesign (done alongside v2)
- Goals moved to compact panel in top row (replaces old To Do box)
- Full-width 2-column To Do at bottom: Open (due_date asc) | Recently Done
- Today panel made wider (1.25fr vs 0.875fr for This Week and Goals)
- `due_date` column added to todos table in Supabase

---

## Promoted to v3

### Feature 3: Add-task form
First client component. Small form in the To Do panel. Fields: task, bucket, due_date. Server Action inserts into `todos`, revalidates page.

### Feature 4: Time entries logging
New `time_entries` table. Form to log hours per bucket per day. Rewires the This Week bars to show real data.

---

## v3 roadmap (next session)

Suggested order:
1. Add-task form (Feature 3) — introduces "use client" pattern
2. Time entries logging (Feature 4) — new table + form + view
3. Click tiles → detail modals
4. Edit UI for goals
5. Mobile-responsive layout

---

## How to kick off v3

Open a new Cowork session. Read PROJECT_STATE.md first, then V2_PLAN.md. Start with Feature 3 (add-task form).
