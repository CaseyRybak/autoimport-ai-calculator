import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterCatalogAdminItems } from "./vehicle-catalog-admin-filters";

const items = [
  {
    country: "korea",
    brandId: "brand-hyundai",
    brand: "Hyundai",
    model: "Sonata",
    isActive: true,
  },
  {
    country: "china",
    brandId: "brand-byd",
    brand: "BYD",
    model: "Atto 3",
    isActive: true,
  },
  {
    country: "europe",
    brandId: "brand-volkswagen",
    brand: "Volkswagen",
    model: "Golf",
    isActive: false,
  },
];

describe("filterCatalogAdminItems", () => {
  it("shows all rows by default", () => {
    assert.deepEqual(
      filterCatalogAdminItems(items, {}).map((item) => item.model),
      ["Sonata", "Atto 3", "Golf"],
    );
  });

  it("filters active rows when requested", () => {
    assert.deepEqual(
      filterCatalogAdminItems(items, { active: "active" }).map((item) => item.model),
      ["Sonata", "Atto 3"],
    );
  });

  it("filters inactive rows when requested", () => {
    assert.deepEqual(
      filterCatalogAdminItems(items, { active: "inactive" }).map((item) => item.model),
      ["Golf"],
    );
  });

  it("supports country and brand filters", () => {
    assert.deepEqual(
      filterCatalogAdminItems(items, {
        active: "all",
        country: "china",
        brand: "brand-byd",
      }).map((item) => item.model),
      ["Atto 3"],
    );
  });

  it("searches brand and model case-insensitively", () => {
    assert.deepEqual(
      filterCatalogAdminItems(items, { active: "all", search: "volks" }).map(
        (item) => item.model,
      ),
      ["Golf"],
    );
  });
});
