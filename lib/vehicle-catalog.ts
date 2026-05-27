import type { CalculationInput, Country, Currency } from "@/lib/calculate";
import { DEMO_CALCULATION_SETTINGS } from "@/lib/calculate";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export type VehicleCatalogBrand = {
  id: string;
  country: Country;
  name: string;
  slug: string;
};

export type VehicleCatalogModel = {
  id: string;
  brandId: string;
  name: string;
  slug: string;
};

export type VehicleCatalogVariant = {
  id: string;
  modelId: string;
  year: number;
  engineType: CalculationInput["engineType"];
  engineVolumeLiters: number;
  sourceMarket: Country;
  sourcePriceUsd: number;
  displayCurrency: "USD";
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
};

export type VehicleCatalogData = {
  source: "supabase" | "fallback";
  error: string | null;
  brands: VehicleCatalogBrand[];
  models: VehicleCatalogModel[];
  variants: VehicleCatalogVariant[];
};

type BrandRow = {
  id: string;
  country: Country;
  name: string;
  slug: string;
};

type ModelRow = {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
};

type VariantRow = {
  id: string;
  model_id: string;
  year: number;
  engine_type: CalculationInput["engineType"];
  engine_volume_liters: number | string;
  source_market: Country;
  source_price_usd: number | string;
  display_currency: string | null;
  source_name: string | null;
  source_url: string | null;
  last_checked_at: string | null;
};

const fallbackCatalog: VehicleCatalogData = {
  source: "fallback",
  error: null,
  brands: [
    { id: "fallback-hyundai", country: "korea", name: "Hyundai", slug: "hyundai" },
    { id: "fallback-volkswagen", country: "europe", name: "Volkswagen", slug: "volkswagen" },
    { id: "fallback-byd", country: "china", name: "BYD", slug: "byd" },
  ],
  models: [
    { id: "fallback-sonata", brandId: "fallback-hyundai", name: "Sonata", slug: "sonata" },
    { id: "fallback-golf", brandId: "fallback-volkswagen", name: "Golf", slug: "golf" },
    { id: "fallback-atto-3", brandId: "fallback-byd", name: "Atto 3", slug: "atto-3" },
  ],
  variants: [
    {
      id: "fallback-sonata-2022",
      modelId: "fallback-sonata",
      year: 2022,
      engineType: "gasoline",
      engineVolumeLiters: 2,
      sourceMarket: "korea",
      sourcePriceUsd: 20_000,
      displayCurrency: "USD",
      sourceName: "demo fallback catalog",
      sourceUrl: null,
      lastCheckedAt: null,
    },
    {
      id: "fallback-golf-2022",
      modelId: "fallback-golf",
      year: 2022,
      engineType: "gasoline",
      engineVolumeLiters: 1.5,
      sourceMarket: "europe",
      sourcePriceUsd: 24_500,
      displayCurrency: "USD",
      sourceName: "demo fallback catalog",
      sourceUrl: null,
      lastCheckedAt: null,
    },
    {
      id: "fallback-atto-3-2022",
      modelId: "fallback-atto-3",
      year: 2022,
      engineType: "electric",
      engineVolumeLiters: 0,
      sourceMarket: "china",
      sourcePriceUsd: 23_500,
      displayCurrency: "USD",
      sourceName: "demo fallback catalog",
      sourceUrl: null,
      lastCheckedAt: null,
    },
  ],
};

const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, "ru"));

const sortNumeric = (items: number[]) => [...items].sort((a, b) => b - a);

export function getVehicleCatalogFallback(error: string | null = null): VehicleCatalogData {
  return {
    ...fallbackCatalog,
    error,
  };
}

export async function getVehicleCatalog(): Promise<VehicleCatalogData> {
  if (!isSupabaseConfigured()) {
    return getVehicleCatalogFallback("Supabase env vars are not configured.");
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    return getVehicleCatalogFallback("Supabase client is not available.");
  }

  const [brandsResult, modelsResult, variantsResult] = await Promise.all([
    supabase
      .from("vehicle_brands")
      .select("id, country, name, slug")
      .eq("is_active", true)
      .order("country")
      .order("name"),
    supabase
      .from("vehicle_models")
      .select("id, brand_id, name, slug")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("vehicle_variants")
      .select(
        "id, model_id, year, engine_type, engine_volume_liters, source_market, source_price_usd, display_currency, source_name, source_url, last_checked_at",
      )
      .eq("is_active", true)
      .order("year", { ascending: false }),
  ]);

  const error = brandsResult.error ?? modelsResult.error ?? variantsResult.error;

  if (error) {
    return getVehicleCatalogFallback(error.message);
  }

  const brands = ((brandsResult.data ?? []) as BrandRow[]).map((brand) => ({
    id: brand.id,
    country: brand.country,
    name: brand.name,
    slug: brand.slug,
  }));
  const brandIds = new Set(brands.map((brand) => brand.id));

  const models = ((modelsResult.data ?? []) as ModelRow[])
    .filter((model) => brandIds.has(model.brand_id))
    .map((model) => ({
      id: model.id,
      brandId: model.brand_id,
      name: model.name,
      slug: model.slug,
    }));
  const modelIds = new Set(models.map((model) => model.id));

  const variants = ((variantsResult.data ?? []) as VariantRow[])
    .filter((variant) => modelIds.has(variant.model_id))
    .map((variant) => ({
      id: variant.id,
      modelId: variant.model_id,
      year: Number(variant.year),
      engineType: variant.engine_type,
      engineVolumeLiters: Number(variant.engine_volume_liters),
      sourceMarket: variant.source_market,
      sourcePriceUsd: Number(variant.source_price_usd),
      displayCurrency: "USD" as const,
      sourceName: variant.source_name,
      sourceUrl: variant.source_url,
      lastCheckedAt: variant.last_checked_at,
    }));

  if (brands.length === 0 || models.length === 0 || variants.length === 0) {
    return getVehicleCatalogFallback("Vehicle catalog is empty.");
  }

  return {
    source: "supabase",
    error: null,
    brands,
    models,
    variants,
  };
}

export function getCatalogCountries(catalog: VehicleCatalogData): Country[] {
  const countries = new Set(catalog.brands.map((brand) => brand.country));
  const order: Country[] = ["korea", "china", "europe"];

  return order.filter((country) => countries.has(country));
}

export function getBrandsByCountry(catalog: VehicleCatalogData, country: Country) {
  return sortByName(catalog.brands.filter((brand) => brand.country === country));
}

export function getModelsByBrand(catalog: VehicleCatalogData, brandId: string) {
  return sortByName(catalog.models.filter((model) => model.brandId === brandId));
}

export function getVariantsByModel(catalog: VehicleCatalogData, modelId: string) {
  return catalog.variants.filter((variant) => variant.modelId === modelId);
}

export function getAvailableYears(catalog: VehicleCatalogData, modelId: string) {
  return sortNumeric([
    ...new Set(getVariantsByModel(catalog, modelId).map((variant) => variant.year)),
  ]);
}

export function getAvailableEngineTypes(
  catalog: VehicleCatalogData,
  modelId: string,
  year: number,
) {
  return [
    ...new Set(
      getVariantsByModel(catalog, modelId)
        .filter((variant) => variant.year === year)
        .map((variant) => variant.engineType),
    ),
  ].sort();
}

export function getAvailableEngineVolumes(
  catalog: VehicleCatalogData,
  modelId: string,
  year: number,
  engineType: CalculationInput["engineType"],
) {
  return sortNumeric([
    ...new Set(
      getVariantsByModel(catalog, modelId)
        .filter((variant) => variant.year === year && variant.engineType === engineType)
        .map((variant) => variant.engineVolumeLiters),
    ),
  ]);
}

export function findCatalogVariant(
  catalog: VehicleCatalogData,
  modelId: string,
  year: number,
  engineType: CalculationInput["engineType"],
  engineVolumeLiters: number,
) {
  return getVariantsByModel(catalog, modelId).find(
    (variant) =>
      variant.year === year &&
      variant.engineType === engineType &&
      variant.engineVolumeLiters === engineVolumeLiters,
  );
}

export function convertUsdPrice(sourcePriceUsd: number, currency: Currency) {
  const rates = DEMO_CALCULATION_SETTINGS.exchangeRates;
  const targetRate = rates[currency];

  return Math.round((sourcePriceUsd * rates.usd) / targetRate);
}
