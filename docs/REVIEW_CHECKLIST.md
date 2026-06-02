# Review Checklist

Use this checklist before portfolio review, Vercel deploys or major handoffs.

For release-oriented QA, use [`docs/QA_CHECKLIST.md`](QA_CHECKLIST.md) alongside this
manual review checklist.

## Local Checks

- [ ] `npm install` or `npm ci` completes.
- [ ] `npm test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `git status` is clean or changes are intentionally staged for review.

## Public Flow

- [ ] `/` opens without runtime errors.
- [ ] Hero copy is Russian, commercial and does not expose portfolio/demo/mock implementation details.
- [ ] Calculator loads Vehicle Catalog options or a clear fallback state.
- [ ] Calculator dropdown uses catalog data and not manual vehicle price entry.
- [ ] Changing country updates available catalog brands.
- [ ] Changing brand updates available catalog models.
- [ ] Changing model updates available year, engine and volume options.
- [ ] Selected catalog price is displayed as read-only.
- [ ] Changing currency, budget and options changes the result.
- [ ] Result breakdown shows car price, customs fee, recycle fee, logistics, company fee,
      extra costs and total.
- [ ] Result shows a neutral notice that the calculation is preliminary and final cost is
      confirmed by a manager.
- [ ] “Оставить заявку” opens the lead form.
- [ ] Submitting the lead form shows loading and then success or an actionable error.
- [ ] With Supabase env/table permissions configured, a submitted lead appears in `public.leads`.
- [ ] With n8n env configured, a submitted Supabase lead calls the configured n8n webhook.
- [ ] With n8n automation active, new lead and reminder Telegram messages route to the
      employee group, while RED ALERT and owner report messages route to owner chat.
- [ ] With n8n webhook missing or failing, direct Telegram fallback does not block lead
      creation.
- [ ] Without Supabase env, the form shows neutral success confirmation without exposing
      technical fallback details to clients.
- [ ] Documentation states that leads save to Supabase when env/permissions are configured
      and otherwise use demo/mock fallback.

## Admin Flow

- [ ] With `ADMIN_DEMO_PASSWORD` set, `/admin` requires the demo password.
- [ ] With admin access and `SUPABASE_SERVICE_ROLE_KEY` set, `/admin` opens the real lead list.
- [ ] `/admin` displays human-readable lead numbers like `AIC-000001`.
- [ ] Without `ADMIN_DEMO_PASSWORD`, `/admin` falls back to the demo lead list.
- [ ] `/admin/leads/[id]` opens a Supabase lead detail page after admin access when that id exists.
- [ ] `/admin/leads/1` opens a demo lead detail page in fallback/demo mode.
- [ ] `/admin/leads/unknown` returns 404.
- [ ] Status changes persist and remain visible after reload.
- [ ] Manager comments save to history and are shown newest first.
- [ ] `/admin/settings` opens demo calculation settings.
- [ ] Settings save action is disabled.
- [ ] `/admin/catalog/import` opens after admin access.
- [ ] CSV upload preview validates rows without writing to Supabase.
- [ ] CSV template/import does not include catalog display currency.
- [ ] CSV source URLs accept short domains like `aaa.com` and reject invalid domains like `aaa_com`.
- [ ] Confirm import is available only when there are no blocking validation errors.
- [ ] Confirm import upserts catalog rows through server-side service_role.
- [ ] `/admin/catalog` CSV export downloads the current filtered country/brand/model/activity/search view.
- [ ] `/admin/catalog` row save shows inline success without a visible page refresh.
- [ ] `/admin/catalog` paginates filtered catalog rows server-side and supports 10, 50 and 100 cards per page.
- [ ] `/admin/catalog` filters are dependent: country limits brands, brand limits models, and changes reset to page 1.

## Documentation

- [ ] README has the live demo URL.
- [ ] README states lead creation/admin read/Vehicle Catalog use Supabase when configured
      and AI-assisted flows are not connected.
- [ ] README states formulas are demo-only.
- [ ] `PROJECT_NOTES.md`, when updated for a major change, reflects the current status
      and next high-impact step.
- [ ] AGENTS.md points to the right project files and checks.
- [ ] AGENTS.md does not say Supabase is future-only or admin is mock-only.

## Supabase Setup

- [ ] Supabase SQL order was applied: `schema.sql`, `lead_statuses.sql`,
      `lead_number.sql`, `lead_access_policies.sql`, `vehicle_catalog.sql`,
      `drop_vehicle_catalog_display_currency.sql`, `vehicle_catalog_seed_demo.sql`.
- [ ] Anon `INSERT` on `public.leads` exists.
- [ ] Anon `SELECT` on `public.leads` is absent.
- [ ] `service_role` has required grants for lead/admin flows: `INSERT`/`SELECT` on
      `public.leads`, `UPDATE(status, updated_at)` on `public.leads`, `INSERT`/`SELECT`
      on `public.lead_comments` and `SELECT` on `public.calculation_settings`.
- [ ] Vehicle Catalog counts match demo seed expectations: 15 brands, 60 models,
      180 variants.
- [ ] Vercel env vars exist: `NEXT_PUBLIC_SUPABASE_URL`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
      `ADMIN_DEMO_PASSWORD`.
- [ ] Optional notification env vars exist when Telegram lead notifications are in scope:
      `TELEGRAM_BOT_TOKEN`, `TELEGRAM_LEADS_CHAT_ID`, `TELEGRAM_OWNER_CHAT_ID` and,
      when explicit links are needed, `APP_BASE_URL`.
- [ ] Optional n8n env vars exist when automation is in scope:
      `N8N_NEW_LEAD_WEBHOOK_URL` and `N8N_SHARED_SECRET`.
- [ ] Vercel env changes are followed by a production redeploy when they affect runtime
      server behavior.

## Security

- [ ] No real API keys are committed.
- [ ] `.env.example` contains names only.
- [ ] `.env.local` was not edited, overwritten or regenerated without explicit user
      permission in that turn.
- [ ] No client component imports a service-role key or server-only secret.
- [ ] `/api/n8n/leads` returns 401 without the `x-n8n-shared-secret` header.
- [ ] Git remote points to the intended GitHub repository.
