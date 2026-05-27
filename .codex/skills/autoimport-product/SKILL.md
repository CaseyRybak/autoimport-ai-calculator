---
name: autoimport-product
description: Use when working on AutoImport AI Suite product logic, car import calculator, leads, CRM, demo-mode UI, and portfolio positioning.
---

# AutoImport Product

Use this skill when changing product behavior, copy, data flow, or portfolio positioning for AutoImport AI Suite.

## Product Context

* AutoImport AI Suite is a portfolio MVP for car import calculation, lead capture, and a demo CRM/admin workflow.
* Supabase is already connected for lead insert, server-side admin lead reads, and Vehicle Catalog reads when environment variables and permissions are configured.
* Calculation formulas are demo-only and must not be represented as real customs formulas.
* Demo-mode UI must honestly label mocked, read-only, placeholder, or non-persistent behavior.
* The public calculator works from implemented Vehicle Catalog options, not manual vehicle price entry.
* Vehicle Catalog is implemented in Supabase and read through the application data boundary.
* The catalog base vehicle price is stored in USD as `source_price_usd`.
* Users must not manually edit a selected catalog vehicle price in the calculator.
* CSV/Excel is only an import or catalog maintenance format, not the primary website backend.
* Demo seed catalog prices are placeholder prices and must not be presented as real market prices.
* Real catalog prices should include `source_url`, `source_name`, and `last_checked_at`.
* Lead form submissions save leads to Supabase when the required environment variables and permissions are configured.
* Admin reads leads server-side through the Supabase `service_role` key after the admin access gate.
* UUID is the technical lead id and URL key. `lead_number` is the human-readable admin number, displayed as `AIC-000001`.

## Project Rules

* Work only inside this project directory.
* Do not touch `/mnt/c` or other Windows disk paths.
* Do not use `sudo`.
* Do not commit `.env.local`.
* Do not add real API keys or secrets.
* Keep business logic in `lib/`.
* Do not import Supabase directly from UI components.
* Treat `lib/leads.ts` and `lib/vehicle-catalog.ts` as data boundaries.
* Do not grant anon `SELECT` access to `public.leads`.
* Keep the Supabase `service_role` key server-side only; never expose it to client components or `NEXT_PUBLIC_` variables.
* Do not commit or push unless the user explicitly asks for it.
