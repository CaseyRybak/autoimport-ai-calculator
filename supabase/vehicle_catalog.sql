create extension if not exists "pgcrypto";

create table if not exists public.vehicle_brands (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_brands_country_slug_key unique (country, slug)
);

create table if not exists public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.vehicle_brands(id) on delete cascade,
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_models_brand_id_slug_key unique (brand_id, slug)
);

create table if not exists public.vehicle_variants (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.vehicle_models(id) on delete cascade,
  year integer not null,
  engine_type text not null,
  engine_volume_liters numeric not null,
  source_market text not null,
  source_price_usd numeric not null,
  display_currency text not null default 'USD',
  source_name text,
  source_url text,
  last_checked_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_variants_source_price_usd_positive check (source_price_usd > 0),
  constraint vehicle_variants_engine_volume_liters_nonnegative check (engine_volume_liters >= 0),
  constraint vehicle_variants_model_year_engine_market_key unique (
    model_id,
    year,
    engine_type,
    engine_volume_liters,
    source_market
  )
);

comment on column public.vehicle_variants.source_price_usd is
  'Canonical catalog vehicle price in USD. RUB/EUR/CNY/KRW display values must be calculated in the application from exchange rates.';

comment on column public.vehicle_variants.display_currency is
  'Preferred UI display currency only. This is not the source of truth for vehicle price.';

create index if not exists vehicle_brands_country_idx
  on public.vehicle_brands(country);

create index if not exists vehicle_brands_is_active_idx
  on public.vehicle_brands(is_active);

create index if not exists vehicle_models_brand_id_idx
  on public.vehicle_models(brand_id);

create index if not exists vehicle_models_is_active_idx
  on public.vehicle_models(is_active);

create index if not exists vehicle_variants_model_id_idx
  on public.vehicle_variants(model_id);

create index if not exists vehicle_variants_year_idx
  on public.vehicle_variants(year);

create index if not exists vehicle_variants_source_market_idx
  on public.vehicle_variants(source_market);

create index if not exists vehicle_variants_is_active_idx
  on public.vehicle_variants(is_active);

alter table public.vehicle_brands enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.vehicle_variants enable row level security;

drop policy if exists "Public can read active vehicle brands" on public.vehicle_brands;
create policy "Public can read active vehicle brands"
  on public.vehicle_brands
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active vehicle models" on public.vehicle_models;
create policy "Public can read active vehicle models"
  on public.vehicle_models
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.vehicle_brands
      where vehicle_brands.id = vehicle_models.brand_id
        and vehicle_brands.is_active = true
    )
  );

drop policy if exists "Public can read active vehicle variants" on public.vehicle_variants;
create policy "Public can read active vehicle variants"
  on public.vehicle_variants
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.vehicle_models
      join public.vehicle_brands on vehicle_brands.id = vehicle_models.brand_id
      where vehicle_models.id = vehicle_variants.model_id
        and vehicle_models.is_active = true
        and vehicle_brands.is_active = true
    )
  );

grant usage on schema public to service_role;
grant select, insert, update, delete on public.vehicle_brands to service_role;
grant select, insert, update, delete on public.vehicle_models to service_role;
grant select, insert, update, delete on public.vehicle_variants to service_role;
grant select on public.vehicle_brands to anon, authenticated;
grant select on public.vehicle_models to anon, authenticated;
grant select on public.vehicle_variants to anon, authenticated;
