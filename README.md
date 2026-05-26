# AutoImport AI Calculator

Portfolio MVP for a vehicle import business. The project demonstrates a public
turnkey import-cost calculator, lead capture flow, demo admin workspace and a clean
foundation for Supabase/OpenAI integrations.

## Live demo

https://autoimport-ai-calculator.vercel.app/

## What I built

- A responsive public calculator for estimating turnkey vehicle import costs.
- A result breakdown with budget status, delta and demo explanation.
- A lead form flow that is clearly marked as demo-mode.
- A mock admin area with lead list, lead detail and calculation settings.
- Shared calculation logic in `lib/calculate.ts` with unit tests.
- Documentation, Supabase schema draft and deployment-ready project structure.

## Business problem

Vehicle import clients need a fast way to understand whether a car fits their budget
before talking to a manager. Import teams need structured lead data, a clear calculation
breakdown and a place to review requests. This MVP models that flow without pretending
to be a production customs calculator.

## MVP features

- Calculator for Korea, China and Europe scenarios.
- Demo formulas for price conversion, customs fee, recycle fee, logistics, company fee
  and extra services.
- Budget status: within budget or over budget.
- Demo lead form with honest “not saved yet” messaging.
- Mock admin: leads table, lead detail card, status/comment placeholders and settings.
- Vercel deployment and GitHub-ready repository.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- node:test + tsx
- shadcn/ui-ready component structure
- Supabase-ready SQL schema
- OpenAI API-ready environment structure

## Architecture decisions

- Calculation logic is isolated in `lib/calculate.ts` so UI components do not own
  business formulas.
- Zod validates calculation input before producing a result.
- App Router routes are kept small and delegate UI to `components/*`.
- Admin data is intentionally mocked in `components/admin/mock-data.ts` until Supabase
  persistence is connected.
- Secrets are not committed. Environment variable names live in `.env.example`.

## Demo limitations

- Form submissions are not saved yet.
- Admin data is mock data, not database-backed.
- Settings are read-only demo controls.
- Supabase and OpenAI are prepared but not connected.
- Formulas are demo-only and are not real customs formulas.

## Roadmap

- Connect Supabase and persist leads.
- Load admin leads from Supabase.
- Add authentication and row-level security for admin routes.
- Replace demo formulas with verified business/legal calculation rules.
- Add OpenAI-powered calculation explanation and manager message drafts.
- Add screenshots and deployment metadata after the next UI pass.

## How to run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Useful checks:

```bash
npm test
npm run typecheck
npm run build
```

## Project structure

```text
app/                    Next.js routes
components/calculator/  Calculator UI
components/result/      Result and breakdown UI
components/lead-form/   Lead form UI
components/admin/       Demo admin UI and mock data
components/ui/          shadcn/ui-ready primitives
lib/                    Business logic, validation and tests
docs/                   Product and architecture docs
supabase/               SQL schema draft
reference/figma/        Original Figma export reference
```
