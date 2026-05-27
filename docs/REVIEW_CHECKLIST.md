# Review Checklist

Use this checklist before portfolio review, Vercel deploys or major handoffs.

## Local Checks

- [ ] `npm install` or `npm ci` completes.
- [ ] `npm test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `git status` is clean or changes are intentionally staged for review.

## Public Flow

- [ ] `/` opens without runtime errors.
- [ ] Hero copy is Russian and clearly states this is a portfolio/demo MVP.
- [ ] Calculator loads Vehicle Catalog options or a clear fallback state.
- [ ] Calculator dropdown uses catalog data and not manual vehicle price entry.
- [ ] Changing country updates available catalog brands.
- [ ] Changing brand updates available catalog models.
- [ ] Changing model updates available year, engine and volume options.
- [ ] Selected catalog price is displayed as read-only.
- [ ] Changing currency, budget and options changes the result.
- [ ] Result breakdown shows car price, customs fee, recycle fee, logistics, company fee,
      extra costs and total.
- [ ] Demo-mode info alert is visible near the calculation result.
- [ ] “Оставить заявку” opens the lead form.
- [ ] Submitting the lead form shows loading and then success or an actionable error.
- [ ] With Supabase env/table permissions configured, a submitted lead appears in `public.leads`.
- [ ] Without Supabase env, the form clearly falls back to demo confirmation.
- [ ] Documentation states: "Заявки сохраняются в Supabase при настроенных env; иначе используется demo/mock fallback."

## Admin Flow

- [ ] With `ADMIN_DEMO_PASSWORD` set, `/admin` requires the demo password.
- [ ] With admin access and `SUPABASE_SERVICE_ROLE_KEY` set, `/admin` opens the real lead list.
- [ ] `/admin` displays human-readable lead numbers like `AIC-000001`.
- [ ] Without `ADMIN_DEMO_PASSWORD`, `/admin` falls back to the demo lead list.
- [ ] Admin shell explains server-side service-role reads with demo fallback.
- [ ] `/admin/leads/[id]` opens a Supabase lead detail page after admin access when that id exists.
- [ ] `/admin/leads/1` opens a demo lead detail page in fallback/demo mode.
- [ ] `/admin/leads/unknown` returns 404.
- [ ] Status and comment controls clearly state they do not persist yet.
- [ ] `/admin/settings` opens demo calculation settings.
- [ ] Settings save action is disabled or clearly marked as not connected.
- [ ] `/admin/catalog/import` opens after admin access.
- [ ] CSV upload preview validates rows without writing to Supabase.
- [ ] Confirm import is available only when there are no blocking validation errors.
- [ ] Confirm import upserts catalog rows through server-side service_role.

## Documentation

- [ ] README has the live demo URL.
- [ ] README states lead insert/admin read/Vehicle Catalog use Supabase when configured and OpenAI is not connected.
- [ ] README states formulas are demo-only.
- [ ] PROJECT_NOTES reflects the current status and next high-impact step.
- [ ] AGENTS.md points to the right project files and checks.
- [ ] AGENTS.md does not say Supabase is future-only or admin is mock-only.

## Supabase Setup

- [ ] Supabase SQL order was applied: `schema.sql`, `lead_number.sql`,
      `vehicle_catalog.sql`, `vehicle_catalog_seed_demo.sql`.
- [ ] Anon `INSERT` on `public.leads` exists.
- [ ] Anon `SELECT` on `public.leads` is absent.
- [ ] `service_role` has `SELECT` grants on `public.leads`, `public.lead_comments` and
      `public.calculation_settings`.
- [ ] Vehicle Catalog counts match demo seed expectations: 15 brands, 60 models,
      180 variants.
- [ ] Vercel env vars exist: `NEXT_PUBLIC_SUPABASE_URL`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
      `ADMIN_DEMO_PASSWORD`.

## Security

- [ ] No real API keys are committed.
- [ ] `.env.example` contains names only.
- [ ] No client component imports a service-role key or server-only secret.
- [ ] Git remote points to the intended GitHub repository.
