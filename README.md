# AutoImport AI Calculator

Working MVP for a vehicle import business. The project includes a public turnkey
import-cost calculator, lead capture flow, manager workspace and Vehicle Catalog
maintenance tools.

## Live app

https://autoimport-ai-calculator.vercel.app/

## What I built

- A responsive public calculator for estimating turnkey vehicle import costs.
- A result breakdown with budget status, delta and manager-facing explanation.
- A lead form flow that can save to Supabase when environment variables are configured.
- An admin area with password access, server-side Supabase reads and local fallback.
- A lead data boundary in `lib/leads.ts` for Supabase insert, admin read and mock fallback.
- A Supabase Vehicle Catalog for calculator dropdown options and catalog base prices.
- Shared calculation logic in `lib/calculate.ts` with unit tests.
- Documentation, Supabase schema files and deployment-ready project structure.

## Business problem

Vehicle import clients need a fast way to understand whether a car fits their budget
before talking to a manager. Import teams need structured lead data, a clear calculation
breakdown and a place to review requests. This MVP models that flow without pretending
to be a production customs calculator.

## MVP features

- Calculator for Korea, China and Europe scenarios.
- Calculation formulas for price conversion, customs fee, recycle fee, logistics, company fee
  and extra services.
- Budget status: within budget or over budget.
- Lead form with server-side Supabase persistence when configured and neutral fallback
  confirmation.
- Admin lead list/detail can read Supabase server-side through a service-role key after
  password access.
- Admin lead list supports CRM filters, search, sorting and 10/50/100 pagination through
  URL query params.
- Admin lead detail shows the submitted calculator/form payload: client contacts, vehicle,
  catalog price, budget, calculation breakdown, selected services and client comment.
- Vehicle Catalog dropdown reads active catalog data and applies `source_price_usd` as
  the selected vehicle's base price.
- Admin CSV import validates, previews and upserts Vehicle Catalog rows server-side.
- Admin Vehicle Catalog management supports filtering, CSV export, variant price/source
  updates and activate/deactivate actions.
- Persisted admin status changes, manager comments and read-only calculation settings.
- Vercel deployment and GitHub-ready repository.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- node:test + tsx
- shadcn/ui-ready component structure
- Supabase SQL schema, lead insert boundary, server-side admin read helper and Vehicle
  Catalog read model
- Optional Telegram notification env structure and future AI extension points

## Architecture decisions

- Calculation logic is isolated in `lib/calculate.ts` so UI components do not own
  business formulas.
- Zod validates calculation input before producing a result.
- App Router routes are kept small and delegate UI to `components/*`.
- Lead form submissions are routed through `lib/leads.ts`, which prefers server-side
  Supabase lead creation through `SUPABASE_SERVICE_ROLE_KEY`, keeps anon insert as a
  fallback and falls back to a local success response when env vars are unavailable.
- Admin data is routed through `lib/leads.ts` and reads Supabase only on the server via
  `SUPABASE_SERVICE_ROLE_KEY` after `ADMIN_DEMO_PASSWORD` access.
- The public anon key is used for public Vehicle Catalog reads and remains available for
  lead insert fallback.
- Anon `SELECT` on `public.leads` is not needed and should not be granted.
- Public catalog reads may grant anon/authenticated `SELECT` only for active catalog rows.
- Admin lead reads use the server-side `SUPABASE_SERVICE_ROLE_KEY`, not the public anon key.
- GitHub Actions runs tests, typecheck and build on push/PR.
- Secrets are not committed. Environment variable names live in `.env.example`.

## Implementation Limits

- Form submissions are saved when Supabase env vars and insert permissions are configured;
  service_role creation is the preferred path and anon insert remains a fallback.
- Admin reads require `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_DEMO_PASSWORD` in server env.
- If admin env vars are missing, admin pages intentionally show demo/mock data.
- If catalog reads are unavailable, the calculator uses a local demo catalog fallback.
- Settings are read-only controls.
- AI-assisted text generation is not connected.
- Formulas are demo-only and are not real customs formulas.

## Current MVP status

- Lead persistence is implemented through the server-side lead data boundary. When
  `SUPABASE_SERVICE_ROLE_KEY` is configured, new lead creation uses service_role so the
  app can safely receive `id` and `lead_number` for admin links and notifications; anon
  insert remains a fallback when service_role is not configured.
- Admin real lead read is implemented server-side through `SUPABASE_SERVICE_ROLE_KEY`
  after the demo password gate.
- Admin lead list supports CRM filtering by status, search by lead/client/contact/vehicle
  fields, sorting by date, budget or total and 10/50/100 pagination.
- Vehicle Catalog dropdown is implemented and applies the selected variant's
  `source_price_usd`.
- CSV import MVP is implemented for bulk Vehicle Catalog maintenance.
- Admin catalog management MVP is implemented for variant-level price/source/availability
  updates.
- Admin lead status changes and manager comments are persisted through server-side
  service-role helpers.
- Human-readable lead numbers are implemented as `AIC-000001` while UUID remains the
  technical id and URL key.

## Roadmap

- Add richer structural catalog editing for brand/model/variant fields.
- Add richer CRM workflows around persisted statuses and manager comments.
- Add real admin authentication.
- Enrich catalog prices with real source URLs, source names and checked timestamps.
- Replace preliminary formulas with verified business/legal calculation rules.
- Add AI-assisted calculation explanation and manager message drafts.

## How to run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Local env names for Supabase/admin mode:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_DEMO_PASSWORD=
```

Optional integration env names:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_LEADS_CHAT_ID=
APP_BASE_URL=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` only in `.env.local` or Vercel server env. It must not
use a `NEXT_PUBLIC_` prefix. Telegram lead notifications are optional; when
`TELEGRAM_BOT_TOKEN` and `TELEGRAM_LEADS_CHAT_ID` are set, successful lead submissions
send a manager notification through the Telegram Bot API. Telegram secrets must also stay
server-side and must not use a `NEXT_PUBLIC_` prefix. `APP_BASE_URL` is optional and is
used to build admin lead links in notifications when a lead URL can be assembled.

Supabase setup order, grants and verification steps are documented in
[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

MVP QA release checks are documented in [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md).

Useful checks:

```bash
npm test
npm run typecheck
npm run build
```

## Project structure

```text
app/                    Next.js routes
components/calculator/  Calculator UI
components/result/      Result and breakdown UI
components/lead-form/   Lead form UI
components/admin/       Admin UI
components/ui/          shadcn/ui-ready primitives
lib/                    Business logic, data boundaries, validation and tests
docs/                   Product and architecture docs
supabase/               SQL schema, lead numbering and Vehicle Catalog setup
reference/              Design references; not application source of truth
```
