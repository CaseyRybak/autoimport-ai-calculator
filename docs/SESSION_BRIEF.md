# Session Brief

Short startup context for new Codex sessions. Read this file first. Do not load
`AGENTS.md`, `PROJECT_NOTES.md`, skills, README, package metadata, or other docs
unless the task needs them or the user explicitly asks.

## Project

- Path: `/home/enzomonro/projects/AutoImport AI Suite`
- Product: AutoImport AI Calculator MVP for vehicle import calculation, lead
  capture, and admin CRM workflow.
- Deployed first version: `https://autoimport-ai-calculator.vercel.app/`
- n8n lead automation is live on the Vercel production site.

## Status

- Next.js App Router app with TypeScript, Tailwind CSS, Zod, and node:test tests.
- Public calculator is implemented from the Vehicle Catalog, not manual vehicle
  price entry.
- Supabase is connected for lead creation, admin reads, Vehicle Catalog, lead
  statuses/comments and catalog management when env vars and grants are configured.
- Optional Telegram lead notifications are available when Telegram env vars are
  configured.
- n8n workflows `AutoImport - New Lead Intake` and `AutoImport - Owner Status Report`
  are active. The new-lead workflow writes to Google Sheet `AutoImport Leads`, sends
  Telegram notifications and performs reminder/status checks through `/api/n8n/leads`.
- Admin pages cover leads, lead detail, settings, catalog management, and catalog
  CSV import/export.
- Demo/mock fallback remains when env vars or permissions are missing.

## Important Rules

- Work only inside `/home/enzomonro/projects/AutoImport AI Suite`.
- Do not touch `/mnt/c` or other Windows disk paths.
- Do not use `sudo` without explicit user permission.
- Do not commit `.env.local`.
- Do not edit, overwrite, regenerate or run `vercel env pull` into `.env.local` unless
  the user explicitly permits it in that turn. Use a separate temporary file for env
  inspection.
- Do not add real API keys or secrets.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only; never expose it to client
  components or `NEXT_PUBLIC_` env vars.
- Never grant anon `SELECT` on `public.leads`; anon only needs lead insert and
  active Vehicle Catalog reads.
- UI should not import Supabase directly. Use `lib/leads.ts`,
  `lib/vehicle-catalog.ts`, server actions, or admin data boundaries.
- Do not commit or push unless the user explicitly asks.
- For simple read-only checks, run only the requested command/file read and avoid
  loading skills or long docs.

## Env Vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DEMO_PASSWORD`

Optional integrations:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_LEADS_CHAT_ID`
- `TELEGRAM_OWNER_CHAT_ID`
- `APP_BASE_URL`
- `N8N_NEW_LEAD_WEBHOOK_URL`
- `N8N_SHARED_SECRET`

## Live Automation

- Production site: `https://autoimport-ai-calculator.vercel.app/`
- n8n new-lead workflow id: `5qXRyji4Yv3bbFMo`
- n8n owner-report workflow id: `rLze04ap1PeGahCf`
- Google Sheet: `https://docs.google.com/spreadsheets/d/130cZrwdQwiW2-56mwHxZamxAqTkb2A_Yr4jGpyx1vjY/edit`
- A production UI test lead submitted on June 2, 2026 verified webhook receipt,
  Google Sheets append and Telegram notification.
- Telegram routing: new lead and reminder messages go to the employee group through
  `TELEGRAM_LEADS_CHAT_ID`; RED ALERT and daily owner reports go to
  `TELEGRAM_OWNER_CHAT_ID`.

## Known Limitations

- No real admin authentication yet; current admin gate is a demo password flow.
- No backups on Supabase Free unless configured outside the app.
- Calculation formulas are preliminary/demo-only and not verified real customs
  formulas.

## Recommended Next Step

- Current automation is live. Next likely implementation steps are production admin
  authentication, real catalog price enrichment, or converting n8n reminder/report
  settings from hardcoded workflow values into editable settings.

## Startup

- Read only `docs/SESSION_BRIEF.md` at startup.
- Do not read `AGENTS.md`, `PROJECT_NOTES.md`, skills, README, or package files
  unless needed for the specific task.
- If the user says "read only" or "check only", do exactly that.
