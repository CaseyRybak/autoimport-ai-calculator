# Project Notes

This file keeps only the high-signal project evolution notes. For day-to-day startup
context, read `docs/SESSION_BRIEF.md` first.

## Goal

AutoImport AI Calculator is a working MVP for a vehicle import business: public import
calculator, lead capture, admin CRM workflow, Vehicle Catalog maintenance, Supabase data
integration and live n8n automation. Formulas are demo-only until replaced with verified
business/legal rules.

## Key Evolution

- Started as a Next.js App Router calculator with TypeScript, Tailwind CSS, Zod and
  `node:test`.
- Public UI was polished from developer/demo copy into commercial Russian presentation
  copy; visible mock/Supabase/OpenAI implementation details were removed from client UI.
- Calculation logic moved into `lib/calculate.ts` with unit coverage. UI must not own
  formulas.
- Lead capture became Supabase-backed through `lib/leads.ts`: service-role insert is the
  preferred path, anon insert remains fallback, and mock/demo success remains available
  for local mode.
- Admin lead reads moved server-side behind `ADMIN_DEMO_PASSWORD` and
  `SUPABASE_SERVICE_ROLE_KEY`; anon `SELECT` on `public.leads` remains forbidden.
- Human-readable `lead_number` was added and displayed as `AIC-000001`; UUID remains the
  technical id and route key.
- CRM minimum was implemented: status persistence in `public.leads.status`, manager
  comments in `public.lead_comments`, lead detail, filters/search/sort and 10/50/100
  pagination.
- Vehicle Catalog became the calculator source of truth: Supabase tables, demo seed,
  dependent dropdowns, CSV import/preview/upsert, filtered CSV export and variant-level
  admin editing.
- n8n automation became live: new Supabase leads call n8n, append to Google Sheets,
  notify Telegram, run reminders/RED ALERT and send owner status reports.
- Repository handoff docs were consolidated around `SESSION_BRIEF`, `QUALITY`,
  `REVIEW_CHECKLIST`, `SUPABASE_SETUP`, `VEHICLE_CATALOG` and `N8N_WORKFLOW_PLAN`.

## Current Architecture Snapshot

- Lead data boundary: `lib/leads.ts`.
- Catalog read boundary: `lib/vehicle-catalog.ts`.
- Catalog admin/import/export boundary: `lib/vehicle-catalog-admin.ts` and admin server
  actions/routes.
- n8n webhook payload/dispatch: `lib/n8n.ts`.
- Telegram direct notification helper is fallback only when n8n is not configured or
  fails; normal production notifications route through n8n.
- Production site: `https://autoimport-ai-calculator.vercel.app/`.

## Live n8n Automation

- New Lead Intake workflow id: `5qXRyji4Yv3bbFMo`.
- Owner Status Report workflow id: `rLze04ap1PeGahCf`.
- Google Sheet: `AutoImport Leads`, sheet `Leads`.
- New lead and reminder messages route to the employee Telegram group.
- RED ALERT and daily status report route to the owner Telegram chat.
- Current reminder behavior: 10-minute interval, RED ALERT immediately after the third
  reminder while the lead remains `new`.
- Owner report schedule: daily at 20:20 Moscow time target.

## Non-Negotiable Rules

- Do not commit real secrets.
- Do not edit, overwrite, regenerate or run `vercel env pull` into `.env.local` unless
  the user explicitly permits that exact action in the current turn.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Do not grant anon `SELECT` on `public.leads`.
- Keep catalog prices honest: demo seed prices are placeholders, not market prices.
- Keep formulas honest: current formulas are demo-only.

## Known Gaps

- Admin auth is still a demo password gate, not production authentication.
- n8n reminder/report settings are hardcoded workflow values, not editable app settings.
- Catalog prices need real source URLs, source names and checked timestamps before
  commercial use.
- Real customs/business formulas are not implemented.
- No E2E or visual regression tests yet.
- AI-assisted explanation/message generation is roadmap-only.

## Next High-Impact Steps

1. Add production-grade admin authentication.
2. Move n8n reminder/report settings into editable app or n8n settings.
3. Replace demo catalog prices with sourced production price enrichment.
4. Replace demo formulas with verified rules.
