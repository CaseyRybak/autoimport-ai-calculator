import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  filterCatalogAdminItems,
  type CatalogAdminActiveFilter,
  type CatalogAdminFilters,
} from "@/lib/vehicle-catalog-admin-filters";
import type { VehicleCatalogImportRow } from "@/lib/vehicle-catalog-import";

export type { CatalogAdminActiveFilter, CatalogAdminFilters };

export type CatalogAdminItem = {
  id: string;
  country: string;
  brandId: string;
  brand: string;
  model: string;
  year: number;
  engineType: string;
  engineVolumeLiters: number;
  sourceMarket: string;
  sourcePriceUsd: number;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  isActive: boolean;
};

export type CatalogAdminSummary = {
  totalVariants: number;
  activeVariants: number;
  inactiveVariants: number;
};

export type CatalogAdminListResult = {
  source: "supabase" | "unconfigured" | "error";
  error: string | null;
  items: CatalogAdminItem[];
  summary: CatalogAdminSummary;
  countries: string[];
  brands: Array<{ id: string; name: string; country: string }>;
};

export type CatalogAdminUpdateInput = {
  id: string;
  sourcePriceUsd: number;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
};

export const catalogAdminCsvColumns = [
  "country",
  "brand",
  "model",
  "year",
  "engine_type",
  "engine_volume_liters",
  "source_market",
  "source_price_usd",
  "source_name",
  "source_url",
  "last_checked_at",
  "is_active",
] as const;

export type VehicleCatalogImportWriteResult =
  | {
      ok: true;
      totalRows: number;
      validRows: number;
      invalidRows: number;
      skippedRows: number;
      brandsUpserted: number;
      modelsUpserted: number;
      variantsUpserted: number;
      errors: string[];
    }
  | {
      ok: false;
      totalRows: number;
      validRows: number;
      invalidRows: number;
      skippedRows: number;
      brandsUpserted: number;
      modelsUpserted: number;
      variantsUpserted: number;
      errors: string[];
    };

type BrandResultRow = {
  id: string;
  country: string;
  slug: string;
};

type ModelResultRow = {
  id: string;
  brand_id: string;
  slug: string;
};

type CatalogVariantJoinedRow = {
  id: string;
  year: number;
  engine_type: string;
  engine_volume_liters: number | string;
  source_market: string;
  source_price_usd: number | string;
  source_name: string | null;
  source_url: string | null;
  last_checked_at: string | null;
  is_active: boolean;
  vehicle_models:
    | {
        id: string;
        name: string;
        vehicle_brands:
          | {
              id: string;
              country: string;
              name: string;
            }
          | Array<{
              id: string;
              country: string;
              name: string;
            }>
          | null;
      }
    | Array<{
        id: string;
        name: string;
        vehicle_brands:
          | {
              id: string;
              country: string;
              name: string;
            }
          | Array<{
              id: string;
              country: string;
              name: string;
            }>
          | null;
      }>
    | null;
};

const uniqueBy = <T>(items: T[], getKey: (item: T) => string) => {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(getKey(item), item);
  }

  return [...map.values()];
};

const emptySummary: CatalogAdminSummary = {
  totalVariants: 0,
  activeVariants: 0,
  inactiveVariants: 0,
};

const getSingle = <T>(value: T | T[] | null | undefined) =>
  Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

function toCatalogAdminItem(row: CatalogVariantJoinedRow): CatalogAdminItem | null {
  const model = getSingle(row.vehicle_models);
  const brand = getSingle(model?.vehicle_brands);

  if (!model || !brand) {
    return null;
  }

  return {
    id: row.id,
    country: brand.country,
    brandId: brand.id,
    brand: brand.name,
    model: model.name,
    year: Number(row.year),
    engineType: row.engine_type,
    engineVolumeLiters: Number(row.engine_volume_liters),
    sourceMarket: row.source_market,
    sourcePriceUsd: Number(row.source_price_usd),
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    lastCheckedAt: row.last_checked_at,
    isActive: row.is_active,
  };
}

export async function listCatalogAdminItems(
  filters: CatalogAdminFilters = {},
): Promise<CatalogAdminListResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      source: "unconfigured",
      error: "Supabase admin client is not configured.",
      items: [],
      summary: emptySummary,
      countries: [],
      brands: [],
    };
  }

  const result = await supabase
    .from("vehicle_variants")
    .select(
      `
      id,
      year,
      engine_type,
      engine_volume_liters,
      source_market,
      source_price_usd,
      source_name,
      source_url,
      last_checked_at,
      is_active,
      vehicle_models!inner (
        id,
        name,
        vehicle_brands!inner (
          id,
          country,
          name
        )
      )
    `,
    )
    .order("updated_at", { ascending: false })
    .order("year", { ascending: false });

  if (result.error) {
    return {
      source: "error",
      error: result.error.message,
      items: [],
      summary: emptySummary,
      countries: [],
      brands: [],
    };
  }

  const items = ((result.data ?? []) as CatalogVariantJoinedRow[])
    .map(toCatalogAdminItem)
    .filter((item): item is CatalogAdminItem => item !== null);
  const summary = {
    totalVariants: items.length,
    activeVariants: items.filter((item) => item.isActive).length,
    inactiveVariants: items.filter((item) => !item.isActive).length,
  };
  const countries = [...new Set(items.map((item) => item.country))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
  const brands = uniqueBy(
    items.map((item) => ({
      id: item.brandId,
      name: item.brand,
      country: item.country,
    })),
    (brand) => brand.id,
  ).sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return {
    source: "supabase",
    error: null,
    items: filterCatalogAdminItems(items, filters),
    summary,
    countries,
    brands,
  };
}

export async function updateCatalogVariant(input: CatalogAdminUpdateInput) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase admin client is not configured.",
    };
  }

  const sourceName = input.sourceName?.trim() || null;
  const sourceUrl = input.sourceUrl?.trim() || null;
  const lastCheckedAt = input.lastCheckedAt?.trim() || null;

  const result = await supabase
    .from("vehicle_variants")
    .update({
      source_price_usd: input.sourcePriceUsd,
      source_name: sourceName,
      source_url: sourceUrl,
      last_checked_at: lastCheckedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select("id")
    .single();

  if (result.error) {
    return {
      ok: false,
      error: result.error.message,
    };
  }

  return {
    ok: true,
    error: null,
  };
}

export async function setCatalogVariantActive(id: string, isActive: boolean) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      error: "Supabase admin client is not configured.",
    };
  }

  const result = await supabase
    .from("vehicle_variants")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (result.error) {
    return {
      ok: false,
      error: result.error.message,
    };
  }

  return {
    ok: true,
    error: null,
  };
}

const escapeCsvCell = (value: string | number | boolean | null) => {
  const text = value === null ? "" : String(value);

  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

export function formatCatalogAdminItemsCsv(items: CatalogAdminItem[]) {
  const lines = [
    catalogAdminCsvColumns.join(","),
    ...items.map((item) =>
      [
        item.country,
        item.brand,
        item.model,
        item.year,
        item.engineType,
        item.engineVolumeLiters,
        item.sourceMarket,
        item.sourcePriceUsd,
        item.sourceName,
        item.sourceUrl,
        item.lastCheckedAt,
        item.isActive,
      ]
        .map(escapeCsvCell)
        .join(","),
    ),
  ];

  return `${lines.join("\n")}\n`;
}

const baseFailure = (
  rows: VehicleCatalogImportRow[],
  error: string,
): VehicleCatalogImportWriteResult => ({
  ok: false,
  totalRows: rows.length,
  validRows: rows.length,
  invalidRows: 0,
  skippedRows: 0,
  brandsUpserted: 0,
  modelsUpserted: 0,
  variantsUpserted: 0,
  errors: [error],
});

export async function importVehicleCatalogRows(
  rows: VehicleCatalogImportRow[],
): Promise<VehicleCatalogImportWriteResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return baseFailure(rows, "Supabase admin client is not configured.");
  }

  if (rows.length === 0) {
    return baseFailure(rows, "No valid rows to import.");
  }

  const brandRows = uniqueBy(
    rows.map((row) => ({
      country: row.country,
      name: row.brand,
      slug: row.brandSlug,
      is_active: true,
      updated_at: new Date().toISOString(),
    })),
    (row) => `${row.country}:${row.slug}`,
  );
  const brandsResult = await supabase
    .from("vehicle_brands")
    .upsert(brandRows, { onConflict: "country,slug" })
    .select("id, country, slug");

  if (brandsResult.error) {
    return baseFailure(rows, brandsResult.error.message);
  }

  const brands = (brandsResult.data ?? []) as BrandResultRow[];
  const brandIdByKey = new Map(brands.map((brand) => [`${brand.country}:${brand.slug}`, brand.id]));
  const modelRows = uniqueBy(
    rows.map((row) => {
      const brandId = brandIdByKey.get(`${row.country}:${row.brandSlug}`);

      return {
        brand_id: brandId ?? "",
        name: row.model,
        slug: row.modelSlug,
        is_active: true,
        updated_at: new Date().toISOString(),
      };
    }),
    (row) => `${row.brand_id}:${row.slug}`,
  ).filter((row) => row.brand_id);

  if (modelRows.length === 0) {
    return baseFailure(rows, "No model rows could be matched to upserted brands.");
  }

  const modelsResult = await supabase
    .from("vehicle_models")
    .upsert(modelRows, { onConflict: "brand_id,slug" })
    .select("id, brand_id, slug");

  if (modelsResult.error) {
    return baseFailure(rows, modelsResult.error.message);
  }

  const models = (modelsResult.data ?? []) as ModelResultRow[];
  const modelIdByKey = new Map(
    models.map((model) => [`${model.brand_id}:${model.slug}`, model.id]),
  );
  const variantRows = uniqueBy(
    rows
      .map((row) => {
        const brandId = brandIdByKey.get(`${row.country}:${row.brandSlug}`);
        const modelId = brandId ? modelIdByKey.get(`${brandId}:${row.modelSlug}`) : null;

        return {
          model_id: modelId ?? "",
          year: row.year,
          engine_type: row.engineType,
          engine_volume_liters: row.engineVolumeLiters,
          source_market: row.sourceMarket,
          source_price_usd: row.sourcePriceUsd,
          source_name: row.sourceName,
          source_url: row.sourceUrl,
          last_checked_at: row.lastCheckedAt,
          is_active: row.isActive,
          updated_at: new Date().toISOString(),
        };
      })
      .filter((row) => row.model_id),
    (row) =>
      [
        row.model_id,
        row.year,
        row.engine_type,
        row.engine_volume_liters,
        row.source_market,
      ].join(":"),
  );

  if (variantRows.length === 0) {
    return baseFailure(rows, "No variant rows could be matched to upserted models.");
  }

  const variantsResult = await supabase
    .from("vehicle_variants")
    .upsert(variantRows, {
      onConflict: "model_id,year,engine_type,engine_volume_liters,source_market",
    })
    .select("id");

  if (variantsResult.error) {
    return baseFailure(rows, variantsResult.error.message);
  }

  return {
    ok: true,
    totalRows: rows.length,
    validRows: rows.length,
    invalidRows: 0,
    skippedRows: 0,
    brandsUpserted: brands.length,
    modelsUpserted: models.length,
    variantsUpserted: variantsResult.data?.length ?? variantRows.length,
    errors: [],
  };
}
