import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  convertUsdPrice,
  findCatalogVariant,
  getAvailableEngineTypes,
  getAvailableEngineVolumes,
  getAvailableYears,
  getBrandsByCountry,
  getModelsByBrand,
  type VehicleCatalogData,
} from "./vehicle-catalog";

const catalog: VehicleCatalogData = {
  source: "fallback",
  error: null,
  brands: [
    { id: "brand-kia", country: "korea", name: "Kia", slug: "kia" },
    { id: "brand-byd", country: "china", name: "BYD", slug: "byd" },
  ],
  models: [
    { id: "model-k5", brandId: "brand-kia", name: "K5", slug: "k5" },
    { id: "model-atto-3", brandId: "brand-byd", name: "Atto 3", slug: "atto-3" },
  ],
  variants: [
    {
      id: "variant-k5-2022",
      modelId: "model-k5",
      year: 2022,
      engineType: "gasoline",
      engineVolumeLiters: 2,
      sourceMarket: "korea",
      sourcePriceUsd: 20_000,
      displayCurrency: "USD",
      sourceName: "demo catalog seed",
      sourceUrl: null,
      lastCheckedAt: null,
    },
    {
      id: "variant-k5-2023",
      modelId: "model-k5",
      year: 2023,
      engineType: "hybrid",
      engineVolumeLiters: 1.6,
      sourceMarket: "korea",
      sourcePriceUsd: 23_000,
      displayCurrency: "USD",
      sourceName: "demo catalog seed",
      sourceUrl: null,
      lastCheckedAt: null,
    },
  ],
};

describe("vehicle catalog selectors", () => {
  it("returns dependent brand and model options", () => {
    assert.deepEqual(getBrandsByCountry(catalog, "korea"), [catalog.brands[0]]);
    assert.deepEqual(getModelsByBrand(catalog, "brand-kia"), [catalog.models[0]]);
  });

  it("returns dependent variant option dimensions", () => {
    assert.deepEqual(getAvailableYears(catalog, "model-k5"), [2023, 2022]);
    assert.deepEqual(getAvailableEngineTypes(catalog, "model-k5", 2023), ["hybrid"]);
    assert.deepEqual(getAvailableEngineVolumes(catalog, "model-k5", 2023, "hybrid"), [1.6]);
  });

  it("finds the selected variant", () => {
    const variant = findCatalogVariant(catalog, "model-k5", 2022, "gasoline", 2);

    assert.equal(variant?.id, "variant-k5-2022");
    assert.equal(variant?.sourcePriceUsd, 20_000);
  });

  it("converts USD source price into selected demo currency", () => {
    assert.equal(convertUsdPrice(20_000, "usd"), 20_000);
    assert.equal(convertUsdPrice(20_000, "rub"), 1_900_000);
    assert.equal(convertUsdPrice(20_000, "eur"), 18_095);
  });
});
