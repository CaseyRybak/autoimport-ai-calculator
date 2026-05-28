import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseVehicleCatalogCsv, slugifyCatalogValue } from "./vehicle-catalog-import";

const header =
  "country,brand,model,year,engine_type,engine_volume_liters,source_market,source_price_usd,source_name,source_url,last_checked_at,is_active";

describe("vehicle catalog CSV import parsing", () => {
  it("validates and normalizes valid rows", () => {
    const preview = parseVehicleCatalogCsv(`${header}
korea,Kia,K5,2024,gasoline,2.0,,21000,market source,https://example.com/k5,2026-05-01,true`);

    assert.equal(preview.totalRows, 1);
    assert.equal(preview.validRows, 1);
    assert.equal(preview.invalidRows, 0);
    assert.equal(preview.errors.length, 0);
    assert.deepEqual(preview.validCatalogRows[0], {
      rowNumber: 2,
      country: "korea",
      brand: "Kia",
      brandSlug: "kia",
      model: "K5",
      modelSlug: "k5",
      year: 2024,
      engineType: "gasoline",
      engineVolumeLiters: 2,
      sourceMarket: "korea",
      sourcePriceUsd: 21000,
      sourceName: "market source",
      sourceUrl: "https://example.com/k5",
      lastCheckedAt: "2026-05-01T00:00:00.000Z",
      isActive: true,
    });
  });

  it("reports blocking validation errors by CSV row number", () => {
    const preview = parseVehicleCatalogCsv(`${header}
usa,,K5,1980,,not-a-number,korea,0,,aaa_com,,maybe`);

    assert.equal(preview.totalRows, 1);
    assert.equal(preview.validRows, 0);
    assert.equal(preview.invalidRows, 1);
    assert.equal(preview.skippedRows, 1);
    assert.ok(preview.errors.some((error) => error.startsWith("Row 2: country")));
    assert.ok(preview.errors.some((error) => error.startsWith("Row 2: brand")));
    assert.ok(preview.errors.some((error) => error.startsWith("Row 2: year")));
    assert.ok(preview.errors.some((error) => error.startsWith("Row 2: source_url")));
    assert.ok(preview.errors.some((error) => error.startsWith("Row 2: is_active")));
  });

  it("accepts short source URLs and normalizes them", () => {
    const preview = parseVehicleCatalogCsv(`${header}
korea,Kia,K5,2024,gasoline,2.0,,21000,market source,aaa.com,2026-05-01,true`);

    assert.equal(preview.validRows, 1);
    assert.equal(preview.validCatalogRows[0].sourceUrl, "https://aaa.com/");
  });

  it("detects missing required columns", () => {
    const preview = parseVehicleCatalogCsv("country,brand\nkorea,Kia");

    assert.equal(preview.validRows, 0);
    assert.ok(preview.errors.some((error) => error.includes("Missing columns")));
  });

  it("creates stable slugs", () => {
    assert.equal(slugifyCatalogValue("Mercedes-Benz"), "mercedes-benz");
    assert.equal(slugifyCatalogValue("Song Plus"), "song-plus");
  });
});
