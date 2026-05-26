# AutoImport AI Calculator

Portfolio MVP for a vehicle import business. The app includes a public turnkey import
cost calculator, lead form, demo admin screens, demo formulas and integration-ready
structure for Supabase and OpenAI.

## Live demo

https://autoimport-ai-calculator.vercel.app/

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- shadcn/ui-ready component layout
- Supabase-ready SQL schema
- OpenAI API-ready env structure

## MVP Features

- Public calculator for Korea, China and Europe import scenarios.
- Clean calculation logic in `lib/calculate.ts`.
- Result breakdown with budget status and delta.
- Demo lead form.
- Admin draft: leads list, lead detail card and calculator settings.
- Project docs: PRD, architecture and formulas.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Useful checks:

```bash
npm run typecheck
npm run build
```

## Project Structure

```text
app/                    Next.js routes
components/calculator/  Calculator UI
components/result/      Result and breakdown UI
components/lead-form/   Lead form UI
components/admin/       Demo admin UI
components/ui/          shadcn/ui-ready primitives
lib/                    Business logic and utilities
docs/                   Product and architecture docs
supabase/               SQL schema draft
reference/figma/        Original Figma export reference
```

## Environment

Copy `.env.example` to `.env.local` and fill values only when integrations are added.
Do not commit real secrets.

## Demo Formulas Disclaimer

The current formulas are demo-only. They are intentionally simple and are not real
customs formulas. Replace them with verified business/legal rules before any real use.

## Roadmap

- Persist leads in Supabase.
- Add admin authentication and row-level security.
- Replace demo calculations with verified formulas.
- Add OpenAI-powered explanation and manager message drafts.
- Add tests for calculation logic.
- Improve Vercel deployment metadata and add production environment variables when integrations are connected.
