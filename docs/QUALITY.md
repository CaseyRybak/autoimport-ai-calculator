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
- Next.js production build verifies routes compile and prerender correctly.
- TypeScript strict mode is enabled.
- Demo-mode warnings are visible where data is mocked or not persisted.

## Known Gaps

- No end-to-end browser tests yet.
- No visual regression tests yet.
- Lead submissions are not persisted.
- Admin data is mock data.
- Settings are read-only demo controls.
- Supabase and OpenAI are prepared but not connected.
- Calculation formulas are demo-only and not real customs formulas.

## Quality Bar Before Employer Demo

- Live demo opens successfully.
- Main calculator updates result from user input.
- Lead form clearly communicates demo-mode.
- Admin list and detail routes load demo data.
- Unknown admin lead ids return 404.
- Settings page clearly communicates read-only demo behavior.
- `npm test`, `npm run typecheck` and `npm run build` pass locally or in CI.

## Quality Bar Before Supabase Integration

- Add a small data-access boundary before UI calls any persistence layer.
- Keep mock data available as a fallback for local demo mode.
- Add tests around lead input normalization and persistence boundaries.
- Update `supabase/schema.sql` and docs together.
- Do not expose service-role keys to client components.
