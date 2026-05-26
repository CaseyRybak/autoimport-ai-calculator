# AGENTS.md

Repository map and operating rules for Codex or other coding agents working on
AutoImport AI Calculator.

## Boundaries

- Work only inside this project directory.
- Do not touch `/mnt/c` or other Windows disk paths.
- Do not use `sudo` without explicit user permission.
- Do not change Git remotes or force push unless explicitly requested.
- Do not add real API keys or secrets.
- Use `.env.example` for environment variable names only.
- Do not edit `reference/figma` unless explicitly required.

## Where Things Live

- `app/` - Next.js App Router routes.
- `components/calculator/` - public calculator experience.
- `components/result/` - calculation result and breakdown UI.
- `components/lead-form/` - demo lead form.
- `components/admin/` - mock admin UI and demo data presentation.
- `components/ui/` - small shadcn/ui-ready primitives.
- `lib/calculate.ts` - calculation input schema, demo settings and pure calculation logic.
- `lib/calculate.test.ts` - unit tests for calculation logic.
- `lib/leads.ts` - lead data boundary: mock implementation now, Supabase later.
- `docs/` - product, architecture, formula and quality documents.
- `supabase/schema.sql` - planned database schema.

## Architecture Rules

- Keep business logic in `lib/`.
- Keep calculation formulas in `lib/calculate.ts` or related `lib/` modules.
- UI should not import Supabase directly. Route data access through `lib/leads.ts`
  or a future adjacent data-access module.
- Real customs formulas are not implemented. Current formulas are demo-only.
- Demo-mode UX must be honest when data is mocked or not persisted.

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
- Keep README truthful: Supabase/OpenAI are prepared but not connected until code proves otherwise.
