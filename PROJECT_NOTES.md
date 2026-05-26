# Project Notes

## Goal

AutoImport AI Calculator is a portfolio MVP for a vehicle import business. It demonstrates
a public import-cost calculator, lead capture flow, admin workflow draft, demo formulas,
and readiness for Supabase and OpenAI integrations.

## Current Status

- Next.js App Router project scaffolded.
- TypeScript, Tailwind CSS and Zod are configured.
- Public calculator UI implemented from the Figma wireframe as React components.
- Demo result breakdown and lead form are implemented.
- Demo admin pages are available for leads, lead detail and settings.
- Supabase schema is drafted.
- No real API keys are present.

## Next Steps

- Connect Supabase client and persist leads.
- Add real admin authentication.
- Replace demo formulas with verified business/legal calculation rules.
- Add OpenAI-powered explanation and manager message generation.
- Add tests for `lib/calculate.ts`.
- Deploy to Vercel and connect a GitHub repository.
