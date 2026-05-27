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
- [ ] Calculator accepts country, car, year, engine, price, currency, budget and city.
- [ ] Changing price/currency/options changes the result.
- [ ] Result breakdown shows car price, customs fee, recycle fee, logistics, company fee,
      extra costs and total.
- [ ] Demo-mode info alert is visible near the calculation result.
- [ ] “Оставить заявку” opens the lead form.
- [ ] Submitting the lead form shows loading and then success or an actionable error.
- [ ] With Supabase env/table permissions configured, a submitted lead appears in `public.leads`.
- [ ] Without Supabase env, the form clearly falls back to demo confirmation without persistence.

## Admin Flow

- [ ] With `ADMIN_DEMO_PASSWORD` set, `/admin` requires the demo password.
- [ ] With admin access and `SUPABASE_SERVICE_ROLE_KEY` set, `/admin` opens the real lead list.
- [ ] Without `ADMIN_DEMO_PASSWORD`, `/admin` falls back to the demo lead list.
- [ ] Admin shell explains server-side service-role reads with demo fallback.
- [ ] `/admin/leads/[id]` opens a Supabase lead detail page after admin access when that id exists.
- [ ] `/admin/leads/1` opens a demo lead detail page in fallback/demo mode.
- [ ] `/admin/leads/unknown` returns 404.
- [ ] Status and comment controls clearly state they do not persist yet.
- [ ] `/admin/settings` opens demo calculation settings.
- [ ] Settings save action is disabled or clearly marked as not connected.

## Documentation

- [ ] README has the live demo URL.
- [ ] README states lead insert can use Supabase when configured and OpenAI is not connected.
- [ ] README states formulas are demo-only.
- [ ] PROJECT_NOTES reflects the current status and next high-impact step.
- [ ] AGENTS.md points to the right project files and checks.

## Security

- [ ] No real API keys are committed.
- [ ] `.env.example` contains names only.
- [ ] No client component imports a service-role key or server-only secret.
- [ ] Git remote points to the intended GitHub repository.
