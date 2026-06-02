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
- Unit tests cover n8n lead webhook payload construction and skip paths.
- Unit tests cover Telegram lead message formatting and admin link generation.
- Unit tests cover Vehicle Catalog dependent selectors and USD-to-display-currency
  conversion.
- Unit tests cover Vehicle Catalog CSV import parsing, required columns, row validation,
  slug generation and source URL normalization.
- Unit tests cover admin catalog filtering behavior.
- Next.js production build verifies routes compile and prerender correctly.
- TypeScript strict mode is enabled.
- Public-facing UI uses commercial Russian copy. Demo/mock/Supabase-ready implementation
  details are documented here and in setup notes, not exposed as client-facing labels.

## Known Gaps

- No end-to-end browser tests yet.
- No visual regression tests yet.
- CSV import reads the uploaded file into memory during preview; admin access is required,
  but a production hardening pass should add an explicit upload size limit.
- Lead submissions prefer server-side Supabase creation through `SUPABASE_SERVICE_ROLE_KEY`.
  Anon insert remains a fallback when public Supabase env vars and insert-only permissions
  are configured.
- Admin reads use Supabase server-side through `SUPABASE_SERVICE_ROLE_KEY` after
  `ADMIN_DEMO_PASSWORD` access, with mock fallback when admin env is missing.
- Lead UUID remains the technical id and route key; `lead_number` is used for
  human-readable admin display numbers like `AIC-000001`.
- Vercel must provide `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_DEMO_PASSWORD` as server
  environment variables for real admin reads.
- `.env.local` contains real local secrets. Do not overwrite, regenerate or edit it
  without explicit user permission; inspect Vercel env into a separate temporary file
  when needed.
- Supabase must grant `service_role` usage on the `public` schema and `SELECT` on the
  admin-read tables used by the app.
- Do not add anon `SELECT` policy for `public.leads`.
- Settings are read-only controls backed by demo calculation settings.
- Admin lead status and manager comments persist through server-side service-role helpers.
- AI-assisted text generation is roadmap-only; runtime OpenAI env vars and requests are not
  connected.
- Calculation formulas are demo-only and not real customs formulas.

## Codex Project Setup

- Project-scoped Codex skills live in `.codex/skills/autoimport-product/`,
  `.codex/skills/nextjs-supabase-mvp/`, `.codex/skills/frontend-design/` and
  `.codex/skills/n8n-mcp-tools-expert/`.
- MCP servers enabled in `.codex/config.toml`: Context7 via `@upstash/context7-mcp`,
  Playwright via `@playwright/mcp` and n8n via `n8n-mcp`.
- Supabase MCP is intentionally deferred for now and should not be added until the project
  is ready to expose that integration.

## Quality Bar Before Employer Demo

- Live demo opens successfully.
- n8n new-lead automation is active and was verified through the production UI on
  June 2, 2026: webhook intake, Google Sheets append and Telegram notification passed.
- Telegram routing is split: new lead/reminder messages go to the employee group, while
  RED ALERT and owner status reports go to the owner chat.
- Main calculator updates result from user input.
- Public copy stays commercial and does not expose demo/mock/Supabase-ready implementation
  details.
- Calculation result clearly states that the amount is preliminary and final cost is
  confirmed by a manager.
- Admin list and detail routes load Supabase leads through server-side service-role reads
  after demo-password access, with demo fallback when admin env is missing.
- Unknown admin lead ids return 404.
- Settings save action is disabled.
- Admin status changes and manager comments persist and remain visible after reload.
- `npm test`, `npm run typecheck` and `npm run build` pass locally or in CI.

## Quality Bar For Supabase Changes

- Keep UI calls routed through `lib/leads.ts` or server actions instead of Supabase imports.
- Keep mock data available as a fallback for local demo mode.
- Add broader tests around lead input normalization and Supabase error handling.
- Update relevant `supabase/*.sql` files and docs together.
- Do not expose service-role keys to client components.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in `.env.local` and Vercel server env.
- Keep anon access limited to public lead insert and active Vehicle Catalog reads; anon
  `SELECT` on `public.leads` is intentionally not granted for admin.

## Quality Bar For Automation Changes

- Do not edit `.env.local` without explicit user permission in that turn.
- Keep production n8n workflows active only after test execution or targeted read-only
  verification.
- Keep new lead/reminder Telegram routes pointed at `TELEGRAM_LEADS_CHAT_ID`.
- Keep RED ALERT and owner report routes pointed at `TELEGRAM_OWNER_CHAT_ID`.
- Avoid duplicate new-lead Telegram sends: app direct Telegram is fallback only when n8n
  is not configured or fails.
- Update `docs/N8N_WORKFLOW_PLAN.md` and sanitized workflow exports when live workflow
  structure, schedule or routing changes.
