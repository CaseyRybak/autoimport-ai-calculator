import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { CalculationBreakdown, CalculationInput } from "./calculate";
import {
  buildN8nLeadWebhookPayload,
  sendLeadCreatedN8nWebhook,
  type N8nLeadPayload,
} from "./n8n";

const originalN8nWebhookUrl = process.env.N8N_NEW_LEAD_WEBHOOK_URL;
const originalN8nSharedSecret = process.env.N8N_SHARED_SECRET;

const restoreEnv = (key: "N8N_NEW_LEAD_WEBHOOK_URL" | "N8N_SHARED_SECRET", value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
};

const calculationInput: CalculationInput = {
  country: "korea",
  brand: "Kia",
  model: "Sorento",
  year: 2023,
  engineType: "diesel",
  engineVolumeLiters: 2.2,
  carPrice: 32_000,
  currency: "usd",
  sourcePriceUsd: 32_000,
  budgetRub: 3_000_000,
  destinationCity: "Москва",
  includeCarrier: true,
  includeInsurance: true,
  includeCertificates: true,
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
  totalRub: 4_681_050,
  budgetStatus: "over_budget",
  budgetDeltaRub: -501_250,
};

const lead: N8nLeadPayload = {
  id: "lead-id",
  leadNumber: 42,
  customerName: "Иван Иванов",
  phone: "+7 (999) 123-45-67",
  telegram: "@ivan",
  calculationInput,
  calculationBreakdown,
};

afterEach(() => {
  restoreEnv("N8N_NEW_LEAD_WEBHOOK_URL", originalN8nWebhookUrl);
  restoreEnv("N8N_SHARED_SECRET", originalN8nSharedSecret);
});

describe("buildN8nLeadWebhookPayload", () => {
  it("builds a structured lead.created payload", () => {
    const payload = buildN8nLeadWebhookPayload(lead);

    assert.equal(payload.event, "lead.created");
    assert.equal(payload.lead_id, "lead-id");
    assert.equal(payload.lead_number, "AIC-000042");
    assert.equal(payload.customer.name, "Иван Иванов");
    assert.equal(payload.vehicle.summary, "Kia Sorento 2023");
    assert.equal(payload.budget.total_rub, 4_681_050);
  });
});

describe("sendLeadCreatedN8nWebhook", () => {
  it("skips when webhook env is not configured", async () => {
    delete process.env.N8N_NEW_LEAD_WEBHOOK_URL;

    const result = await sendLeadCreatedN8nWebhook(lead);

    assert.deepEqual(result, {
      ok: true,
      skipped: true,
      reason: "env_not_configured",
    });
  });

  it("skips when lead id is missing", async () => {
    process.env.N8N_NEW_LEAD_WEBHOOK_URL = "https://example.com/webhook";

    const result = await sendLeadCreatedN8nWebhook({
      ...lead,
      id: null,
    });

    assert.deepEqual(result, {
      ok: true,
      skipped: true,
      reason: "missing_lead_id",
    });
  });
});
