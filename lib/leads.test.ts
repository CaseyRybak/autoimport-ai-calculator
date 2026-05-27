import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CalculationBreakdown, CalculationInput } from "./calculate";
import { createLead } from "./leads";

const calculationInput: CalculationInput = {
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

const calculationBreakdown: CalculationBreakdown = {
  carPriceRub: 2_375_000,
  customsFeeRub: 356_250,
  recycleFeeRub: 350_000,
  logisticsRub: 180_000,
  companyFeeRub: 240_000,
  extraCostsRub: 0,
  totalRub: 3_501_250,
  budgetStatus: "over_budget",
  budgetDeltaRub: -501_250,
};

describe("createLead", () => {
  it("returns demo success when Supabase env is not configured", async () => {
    const result = await createLead({
      customerName: "Иван Иванов",
      phone: "+7 (999) 123-45-67",
      telegram: "@ivan",
      comment: "Нужна проверка",
      calculationInput,
      calculationBreakdown,
    });

    assert.deepEqual(result, {
      ok: true,
      mode: "demo",
      id: null,
    });
  });
});
