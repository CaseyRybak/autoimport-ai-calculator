import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateImportCost,
  DEMO_CALCULATION_SETTINGS,
  type CalculationInput,
} from "./calculate";

const baseInput: CalculationInput = {
  country: "korea",
  brand: "Toyota",
  model: "Camry",
  year: 2022,
  engineType: "gasoline",
  engineVolumeLiters: 2.5,
  carPrice: 25_000,
  currency: "usd",
  budgetRub: 3_000_000,
  destinationCity: "Москва",
  includeCarrier: false,
  includeInsurance: false,
  includeCertificates: false,
  includeBroker: false,
  includeDelivery: false,
};

describe("calculateImportCost", () => {
  it("calculates the baseline demo import cost breakdown", () => {
    const result = calculateImportCost(baseInput);

    assert.deepEqual(result, {
      carPriceRub: 2_375_000,
      customsFeeRub: 356_250,
      recycleFeeRub: 350_000,
      logisticsRub: 180_000,
      companyFeeRub: 240_000,
      extraCostsRub: 0,
      totalRub: 3_501_250,
      budgetStatus: "over_budget",
      budgetDeltaRub: -501_250,
    });
  });

  it("uses the selected currency exchange rate", () => {
    const result = calculateImportCost({
      ...baseInput,
      carPrice: 180_000,
      currency: "cny",
    });

    assert.equal(result.carPriceRub, 2_340_000);
  });

  it("supports ruble display price without extra conversion", () => {
    const result = calculateImportCost({
      ...baseInput,
      carPrice: 2_000_000,
      currency: "rub",
    });

    assert.equal(result.carPriceRub, 2_000_000);
  });

  it("marks the calculation as within budget when total does not exceed budget", () => {
    const result = calculateImportCost({
      ...baseInput,
      budgetRub: 4_000_000,
    });

    assert.equal(result.budgetStatus, "within_budget");
    assert.equal(result.budgetDeltaRub, 498_750);
  });

  it("marks the calculation as over budget when total exceeds budget", () => {
    const result = calculateImportCost({
      ...baseInput,
      budgetRub: 3_000_000,
    });

    assert.equal(result.budgetStatus, "over_budget");
    assert.equal(result.budgetDeltaRub, -501_250);
  });

  it("adds selected extra services to the total", () => {
    const withoutOptions = calculateImportCost(baseInput);
    const withOptions = calculateImportCost({
      ...baseInput,
      includeCarrier: true,
      includeInsurance: true,
      includeCertificates: true,
      includeBroker: true,
      includeDelivery: true,
    });

    const expectedExtras = Object.values(DEMO_CALCULATION_SETTINGS.extraServicesRub).reduce(
      (sum, value) => sum + value,
      0,
    );

    assert.equal(withOptions.extraCostsRub, expectedExtras);
    assert.equal(withOptions.totalRub, withoutOptions.totalRub + expectedExtras);
  });

  it("rejects unsupported currency values", () => {
    assert.throws(() =>
      calculateImportCost({
        ...baseInput,
        currency: "gbp" as CalculationInput["currency"],
      }),
    );
  });
});
