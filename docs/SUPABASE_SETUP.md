# Supabase Setup

This project uses Supabase for lead persistence, server-side admin lead reads and Vehicle
Catalog data. Real keys belong only in `.env.local` or hosting environment variables.

## Environment Variables

Core Supabase/admin mode:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_DEMO_PASSWORD=
```

Optional integrations:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_LEADS_CHAT_ID=
TELEGRAM_OWNER_CHAT_ID=
APP_BASE_URL=
N8N_NEW_LEAD_WEBHOOK_URL=
N8N_SHARED_SECRET=
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL used by public/server helpers.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anon key used for active Vehicle Catalog reads
  and lead insert fallback.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used by lead creation with returned
  admin identifiers, admin reads and catalog management/import jobs.
- `ADMIN_DEMO_PASSWORD`: current demo gate for `/admin`.
- `TELEGRAM_BOT_TOKEN`: optional server-only Telegram bot token for new lead
  notifications.
- `TELEGRAM_LEADS_CHAT_ID`: optional Telegram chat id for the employee group that
  receives new lead and reminder notifications.
- `TELEGRAM_OWNER_CHAT_ID`: optional Telegram chat id for owner-only RED ALERT and
  daily status report notifications.
- `APP_BASE_URL`: optional public app URL used to build admin lead links in
  notifications when a lead URL is available.
- `N8N_NEW_LEAD_WEBHOOK_URL`: optional n8n production webhook URL called after a
  successful Supabase lead insert.
- `N8N_SHARED_SECRET`: server-only shared secret used for outgoing n8n webhook headers
  and for protected n8n status/count reads plus automation status updates at
  `/api/n8n/leads`.

`SUPABASE_SERVICE_ROLE_KEY`, Telegram secrets and n8n shared secrets must never be
exposed to client components and must not use a `NEXT_PUBLIC_` prefix.

## Vercel Notes

Production env must define:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DEMO_PASSWORD`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_LEADS_CHAT_ID` and `TELEGRAM_OWNER_CHAT_ID` if
  Telegram notifications should be enabled.
- `APP_BASE_URL` if notification links should use an explicit production URL.
- `N8N_NEW_LEAD_WEBHOOK_URL` and `N8N_SHARED_SECRET` if n8n lead intake/reminder
  automation should be enabled.

After changing Vercel environment variables, redeploy the project so Next.js receives the
new values. Production redeploys should go through GitHub push/Actions; direct local
`vercel deploy --prod` is intentionally avoided unless the user explicitly changes that
rule in the current turn.

Do not run `vercel env pull` into `.env.local` or overwrite `.env.local` unless the user
explicitly permits that exact action. For inspection, pull to a separate temporary file.

## SQL Application Order

Apply these files manually in the Supabase SQL editor in this order:

1. `supabase/schema.sql`
2. `supabase/lead_statuses.sql`
3. `supabase/lead_number.sql`
4. `supabase/lead_access_policies.sql`
5. `supabase/vehicle_catalog.sql`
6. `supabase/drop_vehicle_catalog_display_currency.sql` for existing projects that still
   have the old catalog display-currency column.
7. `supabase/vehicle_catalog_seed_demo.sql`

## What Each File Does

`supabase/schema.sql`

- Enables `pgcrypto`.
- Creates `public.leads` for submitted lead form payloads and calculation results.
- Creates `public.calculation_settings` for future calculation configuration.
- Creates `public.lead_comments` for manager/internal comments.
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
- Grants sequence usage/select to `anon`, `authenticated` and `service_role` so lead
  creation can receive a generated lead number.

After applying `lead_number.sql`, verify:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'leads'
  and column_name = 'lead_number';

select to_regclass('public.leads_lead_number_seq') as lead_number_sequence;
```

`supabase/lead_access_policies.sql`

- Grants anon insert-only fallback access to `public.leads`.
- Revokes anon/authenticated read, update and delete access on `public.leads`.
- Revokes anon/authenticated access on `public.lead_comments` and
  `public.calculation_settings`.
- Enables RLS on `public.leads`.
- Adds an anon insert policy and intentionally does not add anon read policies.
- Grants the service-role privileges used by server-side lead creation, admin reads,
  status updates, manager comments and settings reads.
- Replaces any broad service-role `UPDATE` on `public.leads` from earlier setup steps
  with a column-level grant for `status` and `updated_at`.

After applying `lead_access_policies.sql`, verify:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'leads';

select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'leads'
order by policyname;
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

Lead creation:

- Preferred flow uses `SUPABASE_SERVICE_ROLE_KEY` server-side for lead creation and read
  of returned admin identifiers such as `id` and `lead_number`.
- Anon `INSERT` on `public.leads` remains available as a fallback path.
- Needs sequence usage/select from `supabase/lead_number.sql`.
- Does not need anon `SELECT` on `public.leads`.
- Anon `SELECT` on `public.leads` is forbidden for this portfolio admin model.

`supabase/lead_access_policies.sql` applies this anon fallback permissions block after
`supabase/schema.sql` and `supabase/lead_number.sql`:

```sql
grant usage on schema public to anon;
revoke select, update, delete on table public.leads from anon, authenticated;
revoke select, insert, update, delete on table public.lead_comments from anon, authenticated;
revoke select, insert, update, delete on table public.calculation_settings from anon, authenticated;
grant insert on table public.leads to anon;

alter table public.leads enable row level security;

drop policy if exists "Allow anonymous lead inserts" on public.leads;
create policy "Allow anonymous lead inserts"
  on public.leads
  for insert
  to anon
  with check (true);
```

Server-side lead creation/read:

- Uses `SUPABASE_SERVICE_ROLE_KEY` server-side.
- `service_role` needs usage on schema `public`, `INSERT` and `SELECT` on
  `public.leads`, `SELECT` on the other admin-read tables, `UPDATE` on lead status fields
  and `INSERT` on `public.lead_comments`.
- Lead creation/read should not use anon `SELECT`.

`supabase/lead_access_policies.sql` also applies this service_role grants block:

```sql
grant usage on schema public to service_role;
grant select on table public.leads to service_role;
grant insert on table public.leads to service_role;
grant select on table public.lead_comments to service_role;
grant select on table public.calculation_settings to service_role;
revoke update on table public.leads from service_role;
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
4. Open `/admin/leads/[id]` for the submitted lead and verify lead detail, status changes
   and manager comments load through server-side service-role helpers.
5. Keep `/admin/leads/[id]` open, change the same lead status externally and verify the
   page updates status/comments through the protected snapshot polling endpoint.
6. With `N8N_SHARED_SECRET`, verify `POST /api/n8n/leads` can update a submitted lead
   status and writes a Telegram/internal status-change comment.
7. If n8n env vars are configured, verify lead submission calls the n8n webhook and the
   n8n workflow sends new lead/reminder messages to the employee group while RED ALERT
   and owner report messages go to the owner chat.
8. Verify Telegram status buttons update the lead, remove the clicked-message buttons and
   post a group confirmation message.
9. If n8n is not configured but Telegram env vars are configured, verify the direct
   Telegram fallback notification is delivered. If Telegram env vars are not configured,
   verify lead submission still succeeds.
10. Verify Vehicle Catalog counts:

```sql
select count(*) from public.vehicle_brands;
select count(*) from public.vehicle_models;
select count(*) from public.vehicle_variants;
```

Expected demo seed counts:

- `vehicle_brands = 15`
- `vehicle_models = 60`
- `vehicle_variants = 180`
