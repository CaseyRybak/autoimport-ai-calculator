# Quality Notes

This document defines the current quality gates and known gaps for the portfolio MVP.

## Current Quality Gates

Before a change is considered ready:

```bash
npm test
npm run typecheck
npm run build
```

GitHub Actions runs the same checks on pushes and pull requests to `main`.

## Current Coverage

- Unit tests cover the pure calculation flow in `lib/calculate.ts`.
- Unit tests cover demo fallback for the lead persistence boundary in `lib/leads.ts`.
- Next.js production build verifies routes compile and prerender correctly.
- TypeScript strict mode is enabled.
- Demo-mode warnings are visible where data is mocked or not persisted.

## Known Gaps

- No end-to-end browser tests yet.
- No visual regression tests yet.
- Lead submissions require configured anon Supabase env vars and compatible insert permissions.
- Admin reads use Supabase server-side through `SUPABASE_SERVICE_ROLE_KEY` after
  `ADMIN_DEMO_PASSWORD` access, with mock fallback when admin env is missing.
- Lead UUID remains the technical id and route key; `lead_number` is used for
  human-readable admin display numbers like `AIC-000001`.
- Vercel must provide `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_DEMO_PASSWORD` as server
  environment variables for real admin reads.
- Supabase must grant `service_role` usage on the `public` schema and `SELECT` on the
  admin-read tables used by the app.
- Do not add anon `SELECT` policy for `public.leads`.
- Settings are read-only demo controls.
- OpenAI is prepared but not connected.
- Calculation formulas are demo-only and not real customs formulas.

## Codex Project Setup

- Project-scoped Codex skills live in `.codex/skills/autoimport-product/` and `.codex/skills/nextjs-supabase-mvp/`.
- MCP servers enabled in `.codex/config.toml`: Context7 via `@upstash/context7-mcp` and Playwright via `@playwright/mcp`.
- Supabase MCP is intentionally deferred for now and should not be added until the project is ready to expose that integration.

## Quality Bar Before Employer Demo

- Live demo opens successfully.
- Main calculator updates result from user input.
- Lead form clearly communicates demo-mode.
- Admin list and detail routes load Supabase leads through server-side service-role reads
  after demo-password access, with demo fallback when admin env is missing.
- Unknown admin lead ids return 404.
- Settings page clearly communicates read-only demo behavior.
- `npm test`, `npm run typecheck` and `npm run build` pass locally or in CI.

## Quality Bar Before Supabase Integration

- Keep UI calls routed through `lib/leads.ts` or server actions instead of Supabase imports.
- Keep mock data available as a fallback for local demo mode.
- Add broader tests around lead input normalization and Supabase error handling.
- Update `supabase/schema.sql` and docs together.
- Do not expose service-role keys to client components.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in `.env.local` and Vercel server env.
- Keep anon access limited to public insert/read paths; anon `SELECT` on `public.leads`
  is intentionally not granted for admin.
