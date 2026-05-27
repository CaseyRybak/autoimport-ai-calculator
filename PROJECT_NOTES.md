# Project Notes

## Goal

AutoImport AI Calculator is a portfolio MVP for a vehicle import business. It demonstrates
a public import-cost calculator, lead capture flow, admin workflow draft, demo formulas,
and readiness for Supabase and OpenAI integrations.

## Current Status

- Next.js App Router project scaffolded.
- TypeScript, Tailwind CSS, Zod and node:test-based unit tests are configured.
- Public calculator UI implemented from the Figma wireframe as React components.
- Demo result breakdown and Supabase-backed lead form submission are implemented.
- Demo admin pages are available for leads, lead detail and settings.
- Supabase schema is drafted and `lib/leads.ts` can insert and read submitted leads when env vars are configured.
- `lib/leads.ts` remains the lead data boundary: anon Supabase insert for form submissions,
  server-side service-role admin reads after demo-password access, and mock fallback
  when admin env is missing.
- Vehicle Catalog Phase 1 is prepared as a separate Supabase SQL file and CSV import
  template.
- Public calculator now reads Vehicle Catalog options from Supabase through a `lib/`
  helper and uses dependent dropdowns instead of manual vehicle price entry.
- GitHub Actions CI is prepared for tests, typecheck and build.
- No real API keys are present.
- First version is deployed on Vercel: https://autoimport-ai-calculator.vercel.app/

## Review Findings

- Lead form, admin status/comment controls and settings looked more functional than they are.
- Some UI copy still looked like developer placeholder text.
- Unknown admin lead ids fell back to the first mock lead.
- Calculation logic had no unit tests.
- README needed to present the project as a portfolio case, not only as a scaffold.

## Critical Polish Completed

- Added clear demo-mode info alerts for lead form, result, mock admin and settings.
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
- Added `lib/leads.ts` to keep UI separated from the future Supabase implementation.

## Supabase Lead Insert

- Added `@supabase/supabase-js` and a small helper in `lib/supabase.ts`.
- Added `createLead()` in `lib/leads.ts` to map lead form payloads into `public.leads`.
- Added a server action so the client form does not import Supabase directly.
- Kept demo success fallback when Supabase env vars are not configured.

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
- CSV/Excel is only an import format. Supabase is the source of truth for the website.
- Added `lib/vehicle-catalog.ts` as the catalog data boundary for public calculator reads
  with a local demo fallback when Supabase catalog data is unavailable.
- Connected the calculator to dependent catalog dropdowns:
  country -> brand -> model -> year -> engine type -> engine volume.
- Catalog `source_price_usd` remains the source of truth. The UI displays the selected
  currency through demo exchange-rate conversion and does not allow manual price edits.
- Real price enrichment with source URLs, checked timestamps and update methods remains
  a separate phase.

## Next Version

- Replace demo catalog prices with sourced production price enrichment.
- Save admin status changes and manager comments.
- Add real admin authentication.
- Replace demo formulas with verified business/legal calculation rules.
- Add OpenAI-powered explanation and manager message generation.

## Next High-Impact Step

Persist admin status changes and manager comments through the same data boundary, then
replace the demo-password gate with real authentication.
