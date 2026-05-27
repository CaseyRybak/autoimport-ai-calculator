import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { VehicleCatalogImportRow } from "@/lib/vehicle-catalog-import";

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

const uniqueBy = <T>(items: T[], getKey: (item: T) => string) => {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(getKey(item), item);
  }

  return [...map.values()];
};

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
          display_currency: row.displayCurrency,
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
