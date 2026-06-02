# AGENTS.md

Repository map and operating rules for Codex or other coding agents working on
AutoImport AI Calculator.

## Fast Path

- For short new Codex sessions, read `docs/SESSION_BRIEF.md` first.
- Do not read this full file or `PROJECT_NOTES.md` by default when the brief is
  enough for the task.
- Read `PROJECT_NOTES.md` only for project history, audit context or when the user
  explicitly asks for it.
- For simple read-only checks such as `git status`, `date`, file existence,
  or short command output, do not load skills, `PROJECT_NOTES.md`, README, package
  metadata, or other docs unless the user explicitly asks.
- If the user says "read only" or "check only", follow that limit literally and
  avoid additional discovery.
- Load skills only when changing product behavior, code, docs, data flow, or
  when the user explicitly asks to use a skill.

## Boundaries

- Work only inside this project directory.
- Do not touch `/mnt/c` or other Windows disk paths.
- Do not use `sudo` without explicit user permission.
- Do not change Git remotes or force push unless explicitly requested.
- Do not add real API keys or secrets.
- Use `.env.example` for environment variable names only.
- Do not edit, overwrite, regenerate, truncate, or run `vercel env pull` into
  `.env.local` unless the user explicitly permits that exact action in the current turn.
  For env inspection, write to a separate temporary file.
- Do not edit `reference/figma` unless explicitly required.

## Where Things Live

- `app/` - Next.js App Router routes.
- `app/actions.ts` - public server actions, including lead submission.
- `app/admin/actions.ts` - admin password-gate server actions.
- `app/admin/catalog/` - admin Vehicle Catalog list, filters and row update actions.
- `app/admin/catalog/import/` - CSV upload, validation, preview and import flow.
- `app/admin/catalog/export/route.ts` - filtered Vehicle Catalog CSV export.
- `components/calculator/` - public calculator experience.
- `components/result/` - calculation result and breakdown UI.
- `components/lead-form/` - lead form UI; saves to Supabase when env and permissions are configured, with demo/mock fallback.
- `components/admin/` - admin UI; reads real leads server-side through service_role after the demo password gate, with demo/mock fallback.
- `components/ui/` - small shadcn/ui-ready primitives.
- `lib/calculate.ts` - calculation input schema, demo settings and pure calculation logic.
- `lib/calculate.test.ts` - unit tests for calculation logic.
- `lib/leads.ts` - lead data boundary: Supabase anon insert, server-side service_role admin reads and mock fallback.
- `lib/vehicle-catalog.ts` - Vehicle Catalog data boundary for Supabase catalog reads and local fallback.
- `lib/vehicle-catalog-admin.ts` - server-only Vehicle Catalog admin read/write, CSV export and import upsert boundary.
- `lib/vehicle-catalog-import.ts` - CSV parsing, validation and normalization.
- `lib/vehicle-catalog-admin-filters.ts` - admin catalog filter helpers and tests.
- `lib/admin-access.ts` - admin password verification and signed access cookie.
- `lib/supabase-admin.ts` - server-only Supabase service_role client helper.
- `docs/` - product, architecture, formula and quality documents.
- `supabase/schema.sql` - lead, calculation settings and lead comments schema.
- `supabase/lead_statuses.sql` - CRM lead status migration, legacy `completed` to `closed`, and service_role grants for status/comment writes.
- `supabase/lead_number.sql` - human-readable lead number migration and sequence.
- `supabase/vehicle_catalog.sql` - implemented Vehicle Catalog schema, RLS policies and grants.
- `supabase/vehicle_catalog_seed_demo.sql` - repeatable demo catalog seed.

## Architecture Rules

- Keep business logic in `lib/`.
- Keep calculation formulas in `lib/calculate.ts` or related `lib/` modules.
- UI should not import Supabase directly. Route data access through `lib/leads.ts`
  or `lib/vehicle-catalog.ts`/server actions.
- Admin catalog reads, updates, imports and exports should route through
  `lib/vehicle-catalog-admin.ts` and server actions/routes, never through client-side
  Supabase access.
- Lead form submissions save to `public.leads` through anon insert when Supabase env and
  permissions are configured; otherwise the app uses demo/mock fallback.
- `/admin` reads `public.leads` server-side through `SUPABASE_SERVICE_ROLE_KEY` after
  `ADMIN_DEMO_PASSWORD`.
- Never grant anon `SELECT` on `public.leads`; anon only needs lead insert and active
  Vehicle Catalog reads.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Never expose it in client components
  or with a `NEXT_PUBLIC_` prefix.
- Vehicle Catalog is implemented in Supabase and drives calculator dropdowns. CSV/Excel is
  an import/catalog maintenance format, not the website source of truth.
- `vehicle_variants.source_price_usd` is the catalog base price. Demo seed prices are
  placeholders, not market prices.
- Current admin catalog management is variant-level only: managers can update price/source
  fields and availability, but brand/model/year/engine structural editing is a later phase.
- UUID remains the technical lead id and URL key. `lead_number` is the human-readable
  admin number displayed as `AIC-000001`.
- Admin status changes and manager comments persist server-side through service_role:
  `public.leads.status` and `public.lead_comments`.
- Real customs formulas are not implemented. Current formulas are demo-only.
- Demo-mode UX must be honest when mock fallback is used or a planned control is not
  connected yet.

## Required Checks

Run these before handing off code changes:

```bash
npm test
npm run typecheck
npm run build
```

CI runs the same checks on GitHub Actions for pushes and pull requests to `main`.

## Documentation Updates

- Update `PROJECT_NOTES.md` after major changes.
- Update `docs/QUALITY.md` when quality gates or known gaps change.
- Update `docs/REVIEW_CHECKLIST.md` when routes or manual demo flows change.
- Keep README truthful: Supabase is connected for lead insert, admin read and Vehicle
  Catalog; OpenAI is prepared but not connected until code proves otherwise.
- Update `docs/SUPABASE_SETUP.md` when SQL order, grants, policies or required env vars change.
