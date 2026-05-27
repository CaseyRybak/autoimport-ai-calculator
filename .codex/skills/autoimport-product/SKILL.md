---
name: autoimport-product
description: Use when working on AutoImport AI Suite product logic, car import calculator, leads, CRM, demo-mode UI, and portfolio positioning.
---

# AutoImport Product

Use this skill when changing product behavior, copy, data flow, or portfolio positioning for AutoImport AI Suite.

## Product Context

- AutoImport AI Suite is a portfolio MVP for car import calculation and lead capture.
- Calculation formulas are demo-only. Do not claim that real customs formulas are implemented unless the code and docs prove it.
- Demo-mode UI must honestly label mocked, read-only, or non-persistent behavior.
- Lead form submission already saves leads to Supabase when the required environment variables are configured.
- Admin and settings areas are gradually moving from mock data to Supabase-backed data.

## Project Rules

- Work only inside this project directory.
- Do not touch `/mnt/c` or other Windows disk paths.
- Do not use `sudo`.
- Do not commit `.env.local`.
- Do not add real API keys or secrets.
- Keep business logic in `lib/`.
- Do not import Supabase directly from UI components.
- Treat `lib/leads.ts` as the lead data boundary.
