# Project Notes

## Goal

AutoImport AI Calculator is a working MVP for a vehicle import business. It includes
a public import-cost calculator, lead capture flow, admin workflow draft, preliminary
formulas, implemented Supabase integration for leads and Vehicle Catalog, and a structure
for future AI-assisted workflows.

## Current Status

- Next.js App Router project scaffolded.
- TypeScript, Tailwind CSS, Zod and node:test-based unit tests are configured.
- Public calculator UI implemented from the Figma wireframe as React components.
- Result breakdown and Supabase-backed lead form submission are implemented.
- Admin pages are available for leads, lead detail and settings.
- Supabase insert/read is implemented: `lib/leads.ts` can insert submitted leads
  server-side through service_role when configured, fall back to anon insert when needed,
  and read admin leads server-side through service_role when env vars and permissions are
  configured.
- `lib/leads.ts` remains the lead data boundary: server-side lead insert, server-side
  service-role admin reads after demo-password access, and mock fallback when admin env
  is missing.
- Vehicle Catalog schema, demo seed and calculator dropdown are implemented.
- Public calculator reads Vehicle Catalog options from Supabase through a `lib/` helper
  and uses dependent dropdowns instead of manual vehicle price entry.
- CSV import MVP for Vehicle Catalog is implemented through `/admin/catalog/import`:
  upload, validate, preview, confirm and server-side service_role upsert.
- Admin Vehicle Catalog management MVP is implemented through `/admin/catalog`: managers
  can review variants, filter/search, edit price/source/active fields and deactivate rows
  without hard delete.
- Human-readable lead numbers are implemented with `lead_number`, displayed as
  `AIC-000001`; UUID remains the technical id and URL key.
- Documentation refresh done: PRD, architecture, README, Vehicle Catalog notes and
  Supabase setup now describe the current Supabase-backed MVP instead of the older
  demo-only state.
- GitHub Actions CI is prepared for tests, typecheck and build.
- No real API keys are present.
- First version is deployed on Vercel: https://autoimport-ai-calculator.vercel.app/
- Presentation polish completed: public and admin UI copy no longer exposes portfolio,
  demo/mock, Supabase-ready or OpenAI-ready language to clients.
- Documentation alignment completed: PRD, README, architecture, quality notes and review
  checklist now reflect implemented CSV import, variant-level admin catalog management,
  commercial presentation copy and CRM persistence.
- CRM-minimum implemented: admin lead status changes now persist to `public.leads.status`,
  and manager comments persist to `public.lead_comments` with newest-first history.
- Optional Telegram manager notifications are implemented for successful lead submissions
  when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_LEADS_CHAT_ID` are configured server-side.

## Review Findings

- Lead form, admin status/comment controls and settings looked more functional than they are.
- Some UI copy still looked like developer placeholder text.
- Unknown admin lead ids fell back to the first mock lead.
- Calculation logic had no unit tests.
- README needed to present the project as a portfolio case, not only as a scaffold.

## Critical Polish Completed

- Replaced client-facing demo/test copy with commercial Russian copy for presentation.
- Removed visible demo/admin technical alerts from public and admin UI.
- Removed KRW from user-facing currency options and confirmed UI currency logic uses
  USD/RUB/EUR/CNY.
- Earlier demo-mode alerts were removed from the client/admin presentation UI.
- Replaced English/placeholder copy with Russian product copy.
- Changed unknown `/admin/leads/[id]` behavior to `notFound()`.
- Disabled settings save action and explained Supabase-backed saving is planned.
- Added unit tests for `calculateImportCost`.
- Reworked README into a portfolio-oriented presentation.

## Harness Improvements

- Added `.github/workflows/ci.yml` for automated verification.
- Expanded `AGENTS.md` into a repository map for future agent work.
- Added `docs/QUALITY.md` with quality gates and known gaps.
- Added `docs/REVIEW_CHECKLIST.md` for manual smoke review.
- Added `lib/leads.ts` to keep UI separated from direct Supabase access.

## Supabase Lead Insert

- Added `@supabase/supabase-js` and a small helper in `lib/supabase.ts`.
- Added `createLead()` in `lib/leads.ts` to map lead form payloads into `public.leads`.
- Added a server action so the client form does not import Supabase directly.
- Kept demo success fallback when Supabase env vars are not configured.
- Successful lead submissions can optionally notify managers in Telegram. Missing or
  failed Telegram delivery does not block lead creation.
- When `SUPABASE_SERVICE_ROLE_KEY` is configured, `createLead()` uses service_role insert
  with a returned `id` and `lead_number` so Telegram notifications can link to the admin
  lead card without enabling anon `SELECT` on `public.leads`.

## Supabase Admin Reads

- Added `getLeads()` and `getLeadById()` in `lib/leads.ts`.
- Admin list/detail pages read `public.leads` through the data boundary with a server-only
  service-role helper.
- Added a simple `ADMIN_DEMO_PASSWORD` gate before real admin reads.
- Mock fallback remains for local demo mode or missing admin env vars.
- Anon SELECT on `public.leads` is intentionally not required and should not be added
  for the portfolio admin.
- Supabase admin reads require manual grants for `service_role`: usage on the `public`
  schema and `SELECT` on the app's admin-read tables.
- Vercel needs `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_DEMO_PASSWORD` configured as
  server-side environment variables before the deployed admin can read real leads.
- `/admin` is forced dynamic so new Supabase leads are not frozen at build time.
- Admin lead detail now displays the full submitted payload: client contacts, vehicle,
  catalog price, budget, calculation breakdown, selected services and client comment.
- UUID remains the technical lead id and URL key. `lead_number` is the human-readable
  admin number displayed as `AIC-000001`.
- Admin status changes and manager comments are persisted through server-side service-role
  helpers. Legacy `completed` status is migrated to `closed` by `supabase/lead_statuses.sql`.

## Vehicle Catalog

- Added `supabase/vehicle_catalog.sql` for `vehicle_brands`, `vehicle_models` and
  `vehicle_variants`.
- Added `data/vehicle-catalog-template.csv` as an import template with demo placeholder
  rows only.
- Added `supabase/vehicle_catalog_seed_demo.sql` with repeatable demo seed data using
  real-world brand/model taxonomy and placeholder USD prices.
- Added `docs/VEHICLE_CATALOG.md` to document the catalog source-of-truth model.
- Catalog base vehicle price is stored as `source_price_usd`; USD/RUB/EUR/CNY display
  values should be calculated in the app through exchange rates/settings.
- Catalog display currency is not stored in Vehicle Catalog or CSV imports. Client-selected
  display currency belongs to calculator sessions and submitted leads.
- CSV/Excel is only an import format. Supabase is the source of truth for the website.
- Added `lib/vehicle-catalog.ts` as the catalog data boundary for public calculator reads
  with a local demo fallback when Supabase catalog data is unavailable.
- Connected the calculator to dependent catalog dropdowns:
  country -> brand -> model -> year -> engine type -> engine volume.
- Added admin CSV import for bulk catalog maintenance. Preview validates rows without
  writing, and confirm upserts brands, models and variants server-side through service_role.
- Added filtered CSV export for `/admin/catalog`; it exports the current country/brand/
  activity/search selection with the same columns as the import template.
- Admin catalog row saves now return inline per-row feedback instead of redirecting the
  page after each update.
- Admin catalog availability is managed with a single activate/deactivate row action
  instead of an `is_active` selector.
- Admin catalog list now uses Supabase server-side pagination with dependent
  country -> brand -> model filters and 10, 50 and 100 cards per page.
- Public calculator catalog options include only brands and models that still have active
  variants.
- Catalog `source_url` accepts short domains such as `aaa.com` and normalizes them to HTTPS;
  invalid domains such as `aaa_com` or values with spaces are rejected.
- Catalog `source_price_usd` remains the source of truth. The UI displays the selected
  currency through demo exchange-rate conversion and does not allow manual price edits.
- Real price enrichment with source URLs, checked timestamps and update methods remains
  a separate phase.

## Next Version

- Replace demo catalog prices with sourced production price enrichment.
- Add richer CRM workflows around persisted status and comment history.
- Add real admin authentication.
- Replace demo formulas with verified business/legal calculation rules.
- Add OpenAI-powered explanation and manager message generation.

## Next High-Impact Step

Real admin authentication is the next recommended security step. Richer CRM workflow
filters and automation can build on persisted status and comment history.
