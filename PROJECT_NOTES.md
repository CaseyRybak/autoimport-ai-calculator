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
- Supabase schema is drafted and `lib/leads.ts` can insert submitted leads when env vars are configured.
- `lib/leads.ts` remains the lead data boundary: Supabase insert for form submissions,
  mock fallback when env is missing, and mock admin data for now.
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
- Admin list/detail pages still use mock data.

## Next Version

- Load admin lead list and lead detail from Supabase.
- Save admin status changes and manager comments.
- Add real admin authentication.
- Replace demo formulas with verified business/legal calculation rules.
- Add OpenAI-powered explanation and manager message generation.

## Next High-Impact Step

Load admin lead list and lead detail from Supabase while keeping mock fallback for local
demo mode.
