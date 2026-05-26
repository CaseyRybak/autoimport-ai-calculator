# Project Notes

## Goal

AutoImport AI Calculator is a portfolio MVP for a vehicle import business. It demonstrates
a public import-cost calculator, lead capture flow, admin workflow draft, demo formulas,
and readiness for Supabase and OpenAI integrations.

## Current Status

- Next.js App Router project scaffolded.
- TypeScript, Tailwind CSS, Zod and node:test-based unit tests are configured.
- Public calculator UI implemented from the Figma wireframe as React components.
- Demo result breakdown and lead form are implemented.
- Demo admin pages are available for leads, lead detail and settings.
- Supabase schema is drafted.
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

## Next Version

- Connect Supabase client and persist submitted leads.
- Load admin lead list and lead detail from Supabase.
- Save admin status changes and manager comments.
- Add real admin authentication.
- Replace demo formulas with verified business/legal calculation rules.
- Add OpenAI-powered explanation and manager message generation.

## Next High-Impact Step

Connect Supabase for saving lead submissions. This will turn the current demo flow into
an end-to-end MVP while keeping the calculation logic and admin screens mostly unchanged.
