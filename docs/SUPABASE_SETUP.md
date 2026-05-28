# Supabase Setup

This project uses Supabase for lead persistence, server-side admin lead reads and Vehicle
Catalog data. Real keys belong only in `.env.local` or hosting environment variables.

## Required Env Vars

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_DEMO_PASSWORD=
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL used by public/server helpers.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anon key used for lead form insert and active
  Vehicle Catalog reads.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used by admin reads and catalog
  management/import jobs.
- `ADMIN_DEMO_PASSWORD`: current demo gate for `/admin`.

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to client components and must not use a
`NEXT_PUBLIC_` prefix.

## Vercel Notes

Production env must define:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DEMO_PASSWORD`

After changing Vercel environment variables, redeploy the project so Next.js receives the
new values.

## SQL Application Order

Apply these files manually in the Supabase SQL editor in this order:

1. `supabase/schema.sql`
2. `supabase/lead_statuses.sql`
3. `supabase/lead_number.sql`
4. `supabase/vehicle_catalog.sql`
5. `supabase/drop_vehicle_catalog_display_currency.sql` for existing projects that still
   have the old catalog display-currency column.
6. `supabase/vehicle_catalog_seed_demo.sql`

## What Each File Does

`supabase/schema.sql`

- Enables `pgcrypto`.
- Creates `public.leads` for submitted lead form payloads and calculation results.
- Creates `public.calculation_settings` for future calculation configuration.
- Creates `public.lead_comments` for future manager/internal comments.
- Adds lead and comment indexes.

After applying `schema.sql`, verify:

```sql
select to_regclass('public.leads') as leads_table;
select to_regclass('public.calculation_settings') as calculation_settings_table;
select to_regclass('public.lead_comments') as lead_comments_table;
```

`supabase/lead_statuses.sql`

- Migrates legacy `completed` lead statuses to `closed`.
- Replaces the `public.leads.status` check constraint with the current CRM status set:
  `new`, `in_progress`, `waiting_client`, `closed`, `rejected`.
- Grants service-role update access for lead status changes.
- Grants service-role select/insert access for manager comments in `public.lead_comments`.

After applying `lead_statuses.sql`, verify:

```sql
select distinct status from public.leads order by status;
```

`supabase/lead_number.sql`

- Adds `public.leads.lead_number`.
- Creates `public.leads_lead_number_seq`.
- Backfills missing human-readable lead numbers.
- Sets the default sequence value and unique index.
- Grants sequence usage/select to `anon`, `authenticated` and `service_role` so anon
  lead insert can receive a generated lead number.

After applying `lead_number.sql`, verify:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'leads'
  and column_name = 'lead_number';

select to_regclass('public.leads_lead_number_seq') as lead_number_sequence;
```

`supabase/vehicle_catalog.sql`

- Creates `public.vehicle_brands`.
- Creates `public.vehicle_models`.
- Creates `public.vehicle_variants`.
- Adds catalog constraints, comments and indexes.
- Enables RLS for the catalog tables.
- Adds policies allowing `anon` and `authenticated` users to select only active catalog
  rows.
- Grants catalog write access to `service_role` for management/import flows.

After applying `vehicle_catalog.sql`, verify:

```sql
select to_regclass('public.vehicle_brands') as vehicle_brands_table;
select to_regclass('public.vehicle_models') as vehicle_models_table;
select to_regclass('public.vehicle_variants') as vehicle_variants_table;

select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('vehicle_brands', 'vehicle_models', 'vehicle_variants')
order by tablename, policyname;
```

`supabase/vehicle_catalog_seed_demo.sql`

- Upserts demo Vehicle Catalog rows.
- Seeds 15 brands, 60 models and 180 variants.
- Uses real-world taxonomy with placeholder `source_price_usd` values.
- Does not delete existing catalog data.

`supabase/drop_vehicle_catalog_display_currency.sql`

- Removes the old `public.vehicle_variants.display_currency` column when it exists.
- Keeps catalog currency canonical: `source_price_usd` remains the only catalog price
  currency, while client display currency belongs to calculator sessions and leads.

After applying `vehicle_catalog_seed_demo.sql`, verify:

```sql
select count(*) from public.vehicle_brands;
select count(*) from public.vehicle_models;
select count(*) from public.vehicle_variants;
```

Expected demo seed counts:

- `vehicle_brands = 15`
- `vehicle_models = 60`
- `vehicle_variants = 180`

## Tables Created

- `public.leads`
- `public.calculation_settings`
- `public.lead_comments`
- `public.vehicle_brands`
- `public.vehicle_models`
- `public.vehicle_variants`

## Grants And Policies

Lead form:

- Needs anon `INSERT` on `public.leads`.
- Needs sequence usage/select from `supabase/lead_number.sql`.
- Does not need anon `SELECT` on `public.leads`.
- Anon `SELECT` on `public.leads` is forbidden for this portfolio admin model.

Apply this lead form permissions block after `supabase/schema.sql` and
`supabase/lead_number.sql`:

```sql
grant usage on schema public to anon;
grant insert on table public.leads to anon;

alter table public.leads enable row level security;

drop policy if exists "Allow anonymous lead inserts" on public.leads;
create policy "Allow anonymous lead inserts"
  on public.leads
  for insert
  to anon
  with check (true);
```

Admin read:

- Uses `SUPABASE_SERVICE_ROLE_KEY` server-side.
- `service_role` needs usage on schema `public`, `SELECT` on the admin-read tables,
  `UPDATE` on lead status fields and `INSERT` on `public.lead_comments`.
- Admin read should not use the public anon key.

Apply this admin read grants block:

```sql
grant usage on schema public to service_role;
grant select on table public.leads to service_role;
grant select on table public.lead_comments to service_role;
grant select on table public.calculation_settings to service_role;
grant update (status, updated_at) on table public.leads to service_role;
grant insert on table public.lead_comments to service_role;
```

Catalog read:

- `anon` and `authenticated` may select only active catalog rows from
  `public.vehicle_brands`, `public.vehicle_models` and `public.vehicle_variants`.
- `supabase/vehicle_catalog.sql` enables RLS and defines these active-row policies.

Catalog management/import:

- CSV import and admin catalog management use `service_role` server-side.
- `service_role` may write `vehicle_brands`, `vehicle_models` and `vehicle_variants`.

Recommended lead table posture:

- Do not grant anon `SELECT` on `public.leads`.
- If RLS is enabled on `public.leads`, add an insert-only policy for anon lead creation
  and keep read policies absent for anon.
- Keep admin reads behind server-side service-role helpers.

## Do Not Do

- Do not grant anon `SELECT` on `public.leads`.
- Do not commit `.env.local`.
- Do not use `SUPABASE_SERVICE_ROLE_KEY` in client components.
- Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.
- Do not treat demo catalog seed prices as market prices.

## Verification

1. Submit a lead through the public calculator/lead form.
2. In Supabase, verify the row exists in `public.leads`.
3. Open `/admin`, pass the demo password gate and verify the lead appears from
   server-side admin read.
4. Verify Vehicle Catalog counts:

```sql
select count(*) from public.vehicle_brands;
select count(*) from public.vehicle_models;
select count(*) from public.vehicle_variants;
```

Expected demo seed counts:

- `vehicle_brands = 15`
- `vehicle_models = 60`
- `vehicle_variants = 180`
