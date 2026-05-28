import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type {
  CatalogAdminActiveFilter,
  CatalogAdminFilters,
} from "@/lib/vehicle-catalog-admin-filters";
import type { VehicleCatalogImportRow } from "@/lib/vehicle-catalog-import";

export type { CatalogAdminActiveFilter, CatalogAdminFilters };

export type CatalogAdminItem = {
  id: string;
  country: string;
  brandId: string;
  brand: string;
  modelId: string;
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
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: CatalogAdminSummary;
  countries: string[];
  brands: Array<{ id: string; name: string; country: string }>;
  models: Array<{ id: string; name: string; brandId: string; country: string }>;
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
  model_id: string;
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

type CatalogModelJoinedRow = {
  id: string;
  name: string;
  brand_id: string;
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

const pageSizeOptions = [10, 50, 100] as const;

const normalizeText = (value: string | null | undefined) => value?.trim() ?? "";

const normalizeActiveFilter = (active: CatalogAdminFilters["active"]): CatalogAdminActiveFilter =>
  active === "active" || active === "inactive" ? active : "all";

const normalizePageSize = (value: number | undefined) => {
  const pageSize = Number(value);

  return pageSizeOptions.includes(pageSize as (typeof pageSizeOptions)[number])
    ? pageSize
    : 10;
};

const normalizePage = (value: number | undefined) => {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

const emptyListResult = (
  source: CatalogAdminListResult["source"],
  error: string | null,
  page = 1,
  pageSize = 10,
): CatalogAdminListResult => ({
  source,
  error,
  items: [],
  totalCount: 0,
  page,
  pageSize,
  totalPages: 1,
  summary: emptySummary,
  countries: [],
  brands: [],
  models: [],
});

type FilterableVariantQuery = {
  eq: (column: string, value: unknown) => FilterableVariantQuery;
  in: (column: string, values: string[]) => FilterableVariantQuery;
};

const applyVariantFilters = <T>(
  // Supabase's fluent query builder has very deep generated types for joined selects.
  // Keeping this helper structurally typed avoids type-instantiation blowups in tsc.
  query: T,
  activeFilter: CatalogAdminActiveFilter,
  modelIds: string[] | null,
) => {
  let nextQuery = query as unknown as FilterableVariantQuery;

  if (activeFilter === "active") {
    nextQuery = nextQuery.eq("is_active", true);
  }

  if (activeFilter === "inactive") {
    nextQuery = nextQuery.eq("is_active", false);
  }

  if (modelIds) {
    nextQuery = nextQuery.in("model_id", modelIds);
  }

  return nextQuery as unknown as T;
};

const omitPagination = (
  result: CatalogAdminListResult,
): Omit<CatalogAdminListResult, "page" | "pageSize" | "totalPages"> => ({
  source: result.source,
  error: result.error,
  items: result.items,
  totalCount: result.totalCount,
  summary: result.summary,
  countries: result.countries,
  brands: result.brands,
  models: result.models,
});

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
    modelId: model.id,
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

function toCatalogModelOption(row: CatalogModelJoinedRow) {
  const brand = getSingle(row.vehicle_brands);

  if (!brand) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    brandId: row.brand_id,
    country: brand.country,
    brandName: brand.name,
  };
}

async function listCatalogFilterOptions(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  filters: CatalogAdminFilters,
) {
  const country = normalizeText(filters.country);
  const brand = normalizeText(filters.brand);

  const brandsResult = await supabase
    .from("vehicle_brands")
    .select("id, country, name")
    .order("name", { ascending: true });

  if (brandsResult.error) {
    return {
      error: brandsResult.error.message,
      countries: [],
      brands: [],
      models: [],
    };
  }

  const allBrands = (brandsResult.data ?? []) as Array<{
    id: string;
    country: string;
    name: string;
  }>;
  const countries = [...new Set(allBrands.map((item) => item.country))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
  const brands = allBrands
    .filter((item) => !country || item.country === country)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  let modelsQuery = supabase
    .from("vehicle_models")
    .select(
      `
      id,
      name,
      brand_id,
      vehicle_brands!inner (
        id,
        country,
        name
      )
    `,
    )
    .order("name", { ascending: true });

  if (country) {
    modelsQuery = modelsQuery.eq("vehicle_brands.country", country);
  }

  if (brand) {
    modelsQuery = modelsQuery.eq("brand_id", brand);
  }

  const modelsResult = await modelsQuery;

  if (modelsResult.error) {
    return {
      error: modelsResult.error.message,
      countries,
      brands,
      models: [],
    };
  }

  const models = ((modelsResult.data ?? []) as CatalogModelJoinedRow[])
    .map(toCatalogModelOption)
    .filter((item): item is NonNullable<ReturnType<typeof toCatalogModelOption>> => item !== null)
    .map((item) => ({
      id: item.id,
      name: item.name,
      brandId: item.brandId,
      country: item.country,
    }));

  return {
    error: null,
    countries,
    brands,
    models,
  };
}

async function resolveFilteredModelIds(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  filters: CatalogAdminFilters,
) {
  const country = normalizeText(filters.country);
  const brand = normalizeText(filters.brand);
  const model = normalizeText(filters.model);
  const search = normalizeText(filters.search).toLowerCase();

  if (!country && !brand && !model && !search) {
    return {
      error: null,
      modelIds: null,
    };
  }

  let query = supabase
    .from("vehicle_models")
    .select(
      `
      id,
      name,
      brand_id,
      vehicle_brands!inner (
        id,
        country,
        name
      )
    `,
    );

  if (country) {
    query = query.eq("vehicle_brands.country", country);
  }

  if (brand) {
    query = query.eq("brand_id", brand);
  }

  if (model) {
    query = query.eq("id", model);
  }

  const result = await query;

  if (result.error) {
    return {
      error: result.error.message,
      modelIds: [],
    };
  }

  const modelIds = ((result.data ?? []) as CatalogModelJoinedRow[])
    .map(toCatalogModelOption)
    .filter((item): item is NonNullable<ReturnType<typeof toCatalogModelOption>> => item !== null)
    .filter((item) => {
      if (!search) {
        return true;
      }

      return `${item.brandName} ${item.name}`.toLowerCase().includes(search);
    })
    .map((item) => item.id);

  return {
    error: null,
    modelIds,
  };
}

export async function listCatalogAdminItems(
  filters: CatalogAdminFilters = {},
): Promise<CatalogAdminListResult> {
  const supabase = createSupabaseAdminClient();
  const pageSize = normalizePageSize(filters.pageSize);
  const requestedPage = normalizePage(filters.page);

  if (!supabase) {
    return emptyListResult(
      "unconfigured",
      "Supabase admin client is not configured.",
      requestedPage,
      pageSize,
    );
  }

  const options = await listCatalogFilterOptions(supabase, filters);

  if (options.error) {
    return {
      ...emptyListResult("error", options.error, requestedPage, pageSize),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    };
  }

  const resolvedModels = await resolveFilteredModelIds(supabase, filters);

  if (resolvedModels.error) {
    return {
      ...emptyListResult("error", resolvedModels.error, requestedPage, pageSize),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    };
  }

  if (resolvedModels.modelIds?.length === 0) {
    return {
      ...emptyListResult("supabase", null, 1, pageSize),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    };
  }

  const activeFilter = normalizeActiveFilter(filters.active);
  const countResult = await applyVariantFilters(
    supabase.from("vehicle_variants").select("id", { count: "exact", head: true }),
    activeFilter,
    resolvedModels.modelIds,
  );

  if (countResult.error) {
    return {
      ...emptyListResult("error", countResult.error.message, requestedPage, pageSize),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    };
  }

  const totalCount = countResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize;
  const to = totalCount === 0 ? 0 : from + pageSize - 1;
  const query = applyVariantFilters(
    supabase
    .from("vehicle_variants")
    .select(
      `
      id,
      model_id,
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
    ),
    activeFilter,
    resolvedModels.modelIds,
  )
    .order("updated_at", { ascending: false })
    .order("year", { ascending: false });
  const result = totalCount === 0 ? { data: [], error: null } : await query.range(from, to);

  if (result.error) {
    return {
      ...emptyListResult("error", result.error.message, page, pageSize),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    };
  }

  const items = ((result.data ?? []) as CatalogVariantJoinedRow[])
    .map(toCatalogAdminItem)
    .filter((item): item is CatalogAdminItem => item !== null);
  const activeCountResult = await applyVariantFilters(
    supabase.from("vehicle_variants").select("id", { count: "exact", head: true }),
    "active",
    resolvedModels.modelIds,
  );
  const inactiveCountResult = await applyVariantFilters(
    supabase.from("vehicle_variants").select("id", { count: "exact", head: true }),
    "inactive",
    resolvedModels.modelIds,
  );
  const summary = {
    totalVariants: (activeCountResult.count ?? 0) + (inactiveCountResult.count ?? 0),
    activeVariants: activeCountResult.count ?? 0,
    inactiveVariants: inactiveCountResult.count ?? 0,
  };

  return {
    source: "supabase",
    error: null,
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
    summary,
    countries: options.countries,
    brands: options.brands,
    models: options.models,
  };
}

export async function listCatalogAdminItemsForExport(
  filters: CatalogAdminFilters = {},
): Promise<Omit<CatalogAdminListResult, "page" | "pageSize" | "totalPages">> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return omitPagination(
      emptyListResult("unconfigured", "Supabase admin client is not configured."),
    );
  }

  const options = await listCatalogFilterOptions(supabase, filters);

  if (options.error) {
    return omitPagination({
      ...emptyListResult("error", options.error),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    });
  }

  const resolvedModels = await resolveFilteredModelIds(supabase, filters);

  if (resolvedModels.error) {
    return omitPagination({
      ...emptyListResult("error", resolvedModels.error),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    });
  }

  if (resolvedModels.modelIds?.length === 0) {
    return omitPagination({
      ...emptyListResult("supabase", null),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    });
  }

  const activeFilter = normalizeActiveFilter(filters.active);
  const query = applyVariantFilters(
    supabase
      .from("vehicle_variants")
      .select(
        `
        id,
        model_id,
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
        { count: "exact" },
      ),
    activeFilter,
    resolvedModels.modelIds,
  )
    .order("updated_at", { ascending: false })
    .order("year", { ascending: false });
  const queryResult = await query;

  if (queryResult.error) {
    return omitPagination({
      ...emptyListResult("error", queryResult.error.message),
      countries: options.countries,
      brands: options.brands,
      models: options.models,
    });
  }

  const items = ((queryResult.data ?? []) as CatalogVariantJoinedRow[])
    .map(toCatalogAdminItem)
    .filter((item): item is CatalogAdminItem => item !== null);
  const summary = {
    totalVariants: queryResult.count ?? items.length,
    activeVariants: items.filter((item) => item.isActive).length,
    inactiveVariants: items.filter((item) => !item.isActive).length,
  };

  return {
    source: "supabase",
    error: null,
    items,
    totalCount: queryResult.count ?? items.length,
    summary,
    countries: options.countries,
    brands: options.brands,
    models: options.models,
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
