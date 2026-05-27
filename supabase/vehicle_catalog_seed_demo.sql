-- Demo Vehicle Catalog seed.
-- Brand/model names are real-world vehicle taxonomy, but source_price_usd values are
-- demo placeholders for UX/calculation testing only. They are not market prices.
-- Do not use this file as a production pricing source.

with seed_brands(country, name, slug) as (
  values
    ('korea', 'Hyundai', 'hyundai'),
    ('korea', 'Kia', 'kia'),
    ('korea', 'Genesis', 'genesis'),
    ('korea', 'Toyota', 'toyota'),
    ('korea', 'Lexus', 'lexus'),
    ('europe', 'Volkswagen', 'volkswagen'),
    ('europe', 'BMW', 'bmw'),
    ('europe', 'Mercedes-Benz', 'mercedes-benz'),
    ('europe', 'Audi', 'audi'),
    ('europe', 'Volvo', 'volvo'),
    ('china', 'BYD', 'byd'),
    ('china', 'Geely', 'geely'),
    ('china', 'Chery', 'chery'),
    ('china', 'Changan', 'changan'),
    ('china', 'Haval', 'haval')
),
upserted_brands as (
  insert into public.vehicle_brands (country, name, slug, is_active, updated_at)
  select country, name, slug, true, now()
  from seed_brands
  on conflict (country, slug) do update
    set name = excluded.name,
        is_active = true,
        updated_at = now()
  returning id, country, slug
),
seed_models(country, brand_slug, name, slug, engine_type, engine_volume_liters, base_price_usd) as (
  values
    ('korea', 'hyundai', 'Sonata', 'sonata', 'gasoline', 2.0, 18500),
    ('korea', 'hyundai', 'Avante', 'avante', 'gasoline', 1.6, 15500),
    ('korea', 'hyundai', 'Santa Fe', 'santa-fe', 'hybrid', 1.6, 28500),
    ('korea', 'hyundai', 'Tucson', 'tucson', 'gasoline', 2.0, 22500),
    ('korea', 'kia', 'K5', 'k5', 'gasoline', 2.0, 19000),
    ('korea', 'kia', 'Sportage', 'sportage', 'gasoline', 2.0, 23500),
    ('korea', 'kia', 'Sorento', 'sorento', 'hybrid', 1.6, 30000),
    ('korea', 'kia', 'Carnival', 'carnival', 'diesel', 2.2, 32000),
    ('korea', 'genesis', 'G70', 'g70', 'gasoline', 2.0, 28500),
    ('korea', 'genesis', 'G80', 'g80', 'gasoline', 2.5, 39000),
    ('korea', 'genesis', 'GV70', 'gv70', 'gasoline', 2.5, 42000),
    ('korea', 'genesis', 'GV80', 'gv80', 'gasoline', 2.5, 52000),
    ('korea', 'toyota', 'Camry', 'camry', 'hybrid', 2.5, 26000),
    ('korea', 'toyota', 'RAV4', 'rav4', 'hybrid', 2.5, 30000),
    ('korea', 'toyota', 'Prius', 'prius', 'hybrid', 1.8, 23000),
    ('korea', 'toyota', 'Highlander', 'highlander', 'hybrid', 2.5, 39000),
    ('korea', 'lexus', 'ES', 'es', 'hybrid', 2.5, 36000),
    ('korea', 'lexus', 'NX', 'nx', 'hybrid', 2.5, 41000),
    ('korea', 'lexus', 'RX', 'rx', 'hybrid', 2.5, 52000),
    ('korea', 'lexus', 'UX', 'ux', 'hybrid', 2.0, 32000),
    ('europe', 'volkswagen', 'Golf', 'golf', 'gasoline', 1.5, 23000),
    ('europe', 'volkswagen', 'Passat', 'passat', 'diesel', 2.0, 27000),
    ('europe', 'volkswagen', 'Tiguan', 'tiguan', 'gasoline', 2.0, 31000),
    ('europe', 'volkswagen', 'ID.4', 'id-4', 'electric', 0.0, 36000),
    ('europe', 'bmw', '3 Series', '3-series', 'gasoline', 2.0, 34000),
    ('europe', 'bmw', '5 Series', '5-series', 'diesel', 2.0, 46000),
    ('europe', 'bmw', 'X3', 'x3', 'gasoline', 2.0, 50000),
    ('europe', 'bmw', 'i4', 'i4', 'electric', 0.0, 52000),
    ('europe', 'mercedes-benz', 'C-Class', 'c-class', 'gasoline', 2.0, 39000),
    ('europe', 'mercedes-benz', 'E-Class', 'e-class', 'diesel', 2.0, 51000),
    ('europe', 'mercedes-benz', 'GLC', 'glc', 'gasoline', 2.0, 55000),
    ('europe', 'mercedes-benz', 'EQE', 'eqe', 'electric', 0.0, 65000),
    ('europe', 'audi', 'A3', 'a3', 'gasoline', 1.5, 26000),
    ('europe', 'audi', 'A4', 'a4', 'diesel', 2.0, 34000),
    ('europe', 'audi', 'Q5', 'q5', 'gasoline', 2.0, 50000),
    ('europe', 'audi', 'e-tron GT', 'e-tron-gt', 'electric', 0.0, 82000),
    ('europe', 'volvo', 'XC40', 'xc40', 'gasoline', 2.0, 33000),
    ('europe', 'volvo', 'XC60', 'xc60', 'hybrid', 2.0, 48000),
    ('europe', 'volvo', 'XC90', 'xc90', 'hybrid', 2.0, 63000),
    ('europe', 'volvo', 'S60', 's60', 'gasoline', 2.0, 36000),
    ('china', 'byd', 'Atto 3', 'atto-3', 'electric', 0.0, 22000),
    ('china', 'byd', 'Dolphin', 'dolphin', 'electric', 0.0, 16000),
    ('china', 'byd', 'Seal', 'seal', 'electric', 0.0, 29000),
    ('china', 'byd', 'Song Plus', 'song-plus', 'hybrid', 1.5, 23000),
    ('china', 'geely', 'Monjaro', 'monjaro', 'gasoline', 2.0, 25500),
    ('china', 'geely', 'Tugella', 'tugella', 'gasoline', 2.0, 24000),
    ('china', 'geely', 'Coolray', 'coolray', 'gasoline', 1.5, 17000),
    ('china', 'geely', 'Preface', 'preface', 'gasoline', 2.0, 21000),
    ('china', 'chery', 'Tiggo 7 Pro', 'tiggo-7-pro', 'gasoline', 1.6, 19000),
    ('china', 'chery', 'Tiggo 8 Pro', 'tiggo-8-pro', 'gasoline', 1.6, 24000),
    ('china', 'chery', 'Arrizo 8', 'arrizo-8', 'gasoline', 1.6, 18000),
    ('china', 'chery', 'Omoda 5', 'omoda-5', 'gasoline', 1.5, 17000),
    ('china', 'changan', 'CS55 Plus', 'cs55-plus', 'gasoline', 1.5, 18000),
    ('china', 'changan', 'CS75 Plus', 'cs75-plus', 'gasoline', 1.5, 21000),
    ('china', 'changan', 'Uni-K', 'uni-k', 'gasoline', 2.0, 24000),
    ('china', 'changan', 'Uni-V', 'uni-v', 'gasoline', 1.5, 17000),
    ('china', 'haval', 'Jolion', 'jolion', 'gasoline', 1.5, 17000),
    ('china', 'haval', 'H6', 'h6', 'gasoline', 1.5, 20000),
    ('china', 'haval', 'Dargo', 'dargo', 'gasoline', 2.0, 23000),
    ('china', 'haval', 'H9', 'h9', 'gasoline', 2.0, 30000)
),
upserted_models as (
  insert into public.vehicle_models (brand_id, name, slug, is_active, updated_at)
  select upserted_brands.id, seed_models.name, seed_models.slug, true, now()
  from seed_models
  join upserted_brands
    on upserted_brands.country = seed_models.country
   and upserted_brands.slug = seed_models.brand_slug
  on conflict (brand_id, slug) do update
    set name = excluded.name,
        is_active = true,
        updated_at = now()
  returning id, brand_id, slug
),
catalog_models as (
  select
    seed_models.country,
    seed_models.brand_slug,
    seed_models.slug as model_slug,
    seed_models.engine_type,
    seed_models.engine_volume_liters,
    seed_models.base_price_usd,
    upserted_models.id as model_id
  from seed_models
  join upserted_brands
    on upserted_brands.country = seed_models.country
   and upserted_brands.slug = seed_models.brand_slug
  join upserted_models
    on upserted_models.brand_id = upserted_brands.id
   and upserted_models.slug = seed_models.slug
)
insert into public.vehicle_variants (
  model_id,
  year,
  engine_type,
  engine_volume_liters,
  source_market,
  source_price_usd,
  display_currency,
  source_name,
  source_url,
  last_checked_at,
  is_active,
  updated_at
)
select
  catalog_models.model_id,
  variant_years.year,
  catalog_models.engine_type,
  catalog_models.engine_volume_liters,
  catalog_models.country,
  catalog_models.base_price_usd + variant_years.price_delta_usd,
  'USD',
  'demo catalog seed',
  null::text,
  null::timestamptz,
  true,
  now()
from catalog_models
cross join (
  values
    (2021, 0),
    (2022, 1500),
    (2023, 3000)
) as variant_years(year, price_delta_usd)
on conflict on constraint vehicle_variants_model_year_engine_market_key do update
  set source_price_usd = excluded.source_price_usd,
      display_currency = 'USD',
      source_name = 'demo catalog seed',
      source_url = null,
      last_checked_at = null,
      is_active = true,
      updated_at = now();
