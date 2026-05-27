# Vehicle Catalog

Vehicle Catalog is the planned source for selectable vehicle options in the calculator.
It will replace manual entry of brand, model, year, engine and vehicle price with a
controlled catalog flow:

```text
country -> brand -> model -> year -> engine type -> engine volume -> source_price_usd
```

## Source Of Truth

Supabase is the source of truth for catalog data used by the website. CSV or Excel files
are only an import and maintenance format for managers or scripts. After data is imported,
the calculator should read options from Supabase, not from local spreadsheets.

The catalog stores the base vehicle price in `vehicle_variants.source_price_usd`. USD is
the canonical price because the current calculation already converts vehicle prices through
exchange rates, and one canonical currency avoids mixing source currencies in business
logic. The app may display USD, RUB, EUR or CNY values, but those values must be calculated
from USD using the current exchange rates/settings.

`vehicle_variants.display_currency` is only a UI preference for displaying a variant. It is
not the source of truth and must not replace `source_price_usd`.

## Import Template

The initial CSV template lives at `data/vehicle-catalog-template.csv`. It contains demo
placeholder rows only. Those demo prices are in USD and must not be presented as real market
prices, guaranteed commercial offers or production pricing.

The import flow should normalize CSV rows into:

- `vehicle_brands`: country, brand name and brand slug.
- `vehicle_models`: model name and model slug under a brand.
- `vehicle_variants`: year, engine, source market and canonical USD price under a model.

## Demo Seed Catalog

The demo seed SQL lives at `supabase/vehicle_catalog_seed_demo.sql`. It prepares a focused
catalog for UI testing across 3 countries, 15 brands, up to 60 models and up to 180
variants. The current seed contains 15 brands, 60 models and 180 variants.

Brand/model/variant taxonomy uses real-world vehicle names, but demo seed prices are
placeholders and must not be treated as market prices.

Every demo variant uses:

- `source_price_usd` as an approximate placeholder value for testing.
- `display_currency = 'USD'`.
- `source_name = 'demo catalog seed'`.
- `source_url = null`.
- `last_checked_at = null`.

The seed is repeatable: it upserts catalog rows and does not drop, truncate or delete
existing catalog data.

## Real Data Requirements

Production catalog rows need enough source context for review:

- `country`
- `brand`
- `model`
- `year`
- `engine_type`
- `engine_volume_liters`
- `source_market`
- `source_price_usd`
- `source_name`
- `source_url`
- `last_checked_at`
- `is_active`

Real prices should have a non-empty `source_url` and a meaningful `last_checked_at` timestamp.
Rows without source proof should be treated as draft/demo data and not marketed as reliable
commercial prices.

Production price enrichment should add:

- `source_url`: the listing, auction, aggregator or data provider URL.
- `source_name`: the source/provider name.
- `last_checked_at`: when the price was verified.
- Price update method: manual manager update, CSV/Excel import, API sync or aggregator sync.

## Public Read Model

Public calculator screens should read only active catalog data. The SQL schema enables RLS
and allows `anon` and `authenticated` users to select active brands, active models under
active brands and active variants under active models/brands.

Management actions use the server-side service role. The service role can read and manage
catalog rows for imports, manual admin edits and future automation.

## Future Admin Workflow

Future phases can add an admin catalog screen for:

- Manual price updates.
- Activating or disabling brands, models and variants.
- Uploading CSV/Excel imports.
- Updating prices through APIs or market aggregators.
- Recording source URLs and last checked timestamps for auditability.

The next application step after applying the SQL is to add server-side catalog read helpers
and connect calculator dropdowns to Supabase without allowing the client to manually change
the selected vehicle's source price.

## Calculator Integration

The public calculator reads active catalog rows through `lib/vehicle-catalog.ts`. UI
components receive prepared catalog data and do not instantiate Supabase clients directly.

The dependent dropdown flow is:

```text
country -> brand -> model -> year -> engine type -> engine volume
```

After a variant is selected, its catalog price is applied automatically. The user can switch
the display currency, but the app derives that displayed amount from USD using the current
demo exchange rates. The price itself is not manually editable in the calculator.

If Supabase catalog reads are unavailable, the calculator uses a small local demo fallback
and shows a clear message. The fallback is only for keeping the page usable during local
setup and must not be treated as production catalog data.
