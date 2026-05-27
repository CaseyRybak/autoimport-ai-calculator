---
name: nextjs-supabase-mvp
description: Use when implementing Next.js App Router, Supabase data access, server actions/API routes, TypeScript validation, and MVP-quality checks.
---

# Next.js Supabase MVP

Use this skill when implementing application behavior, Supabase data access, server actions, API routes, validation, or quality checks.

## Stack

- Use Next.js App Router patterns.
- Use TypeScript for application code and validation boundaries.
- Use Tailwind for styling, following the existing UI conventions.
- Route Supabase access through `lib/` helpers or adjacent server-side data-access modules.
- UI components should not directly know about or instantiate a Supabase client.

## Environment

- Keep secrets only in `.env.local` and Vercel environment variables.
- Keep `.env.example` limited to placeholder names and non-secret examples.
- Do not add real API keys, tokens, service-role keys, or database credentials to the repository.

## Quality And Release

- After code changes, run:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
- For markdown/config-only changes, build checks may be skipped when the change cannot affect runtime behavior.
- Commit or push only after an explicit user request.
