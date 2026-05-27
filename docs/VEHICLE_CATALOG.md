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
logic. The app may display RUB, EUR, CNY or KRW values, but those values must be calculated
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
