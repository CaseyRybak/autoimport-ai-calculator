import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CalculationBreakdown, CalculationInput } from "./calculate";
import {
  buildAdminLeadUrl,
  buildLeadStatusCallbackData,
  buildLeadStatusReplyMarkup,
  formatLeadCreatedMessage,
} from "./telegram";

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

describe("formatLeadCreatedMessage", () => {
  it("formats the lead notification with number and admin URL when available", () => {
    const message = formatLeadCreatedMessage(
      {
        id: "lead-id",
        leadNumber: 42,
        customerName: "Иван Иванов",
        phone: "+7 (999) 123-45-67",
        telegram: "@ivan",
        calculationInput,
        calculationBreakdown,
      },
      "https://example.com/admin/leads/lead-id",
    );

    assert.equal(
      message,
      [
        "Новая заявка AIC-000042",
        "",
        "Клиент: Иван Иванов",
        "Телефон: +7 (999) 123-45-67",
        "Telegram: @ivan",
        "",
        "Авто: Kia Sorento 2023",
        "Страна: Корея",
        "Двигатель: дизель, 2.2 л",
        "Цена авто: 32 000 USD",
        "Город доставки: Москва",
        "",
        "Бюджет: 3 000 000 ₽",
        "Итог: 4 681 050 ₽",
        "Услуги: Автовоз, Страховка, СБКТС/ЭПТС",
        "",
        "Открыть заявку: https://example.com/admin/leads/lead-id",
      ].join("\n"),
    );
  });

  it("omits optional number and URL when unavailable", () => {
    const message = formatLeadCreatedMessage({
      id: null,
      customerName: "Иван Иванов",
      phone: "+7 (999) 123-45-67",
      calculationInput,
      calculationBreakdown,
    });

    assert.equal(message.startsWith("Новая заявка\n"), true);
    assert.equal(message.includes("Открыть заявку:"), false);
    assert.equal(message.includes("Telegram: Не указан"), true);
  });

  it("shows when additional services are not selected", () => {
    const message = formatLeadCreatedMessage({
      id: null,
      customerName: "Иван Иванов",
      phone: "+7 (999) 123-45-67",
      calculationInput: {
        ...calculationInput,
        includeCarrier: false,
        includeInsurance: false,
        includeCertificates: false,
      },
      calculationBreakdown,
    });

    assert.equal(message.includes("Услуги: не выбраны"), true);
  });
});

describe("buildAdminLeadUrl", () => {
  it("uses the configured base URL when a lead id is available", () => {
    assert.equal(
      buildAdminLeadUrl("lead id", "https://example.com/"),
      "https://example.com/admin/leads/lead%20id",
    );
  });
});

describe("buildLeadStatusReplyMarkup", () => {
  it("builds Telegram status buttons for a persisted lead", () => {
    const leadId = "123e4567-e89b-12d3-a456-426614174000";
    const markup = buildLeadStatusReplyMarkup(leadId);

    assert.deepEqual(markup, {
      inline_keyboard: [
        [
          {
            text: "В работу",
            callback_data: `lead_status:in_progress:${leadId}`,
          },
          {
            text: "Ждем клиента",
            callback_data: `lead_status:waiting_client:${leadId}`,
          },
        ],
        [
          {
            text: "Закрыта",
            callback_data: `lead_status:closed:${leadId}`,
          },
          {
            text: "Отказ",
            callback_data: `lead_status:rejected:${leadId}`,
          },
        ],
      ],
    });
  });

  it("keeps callback data inside the Telegram 64-byte limit", () => {
    const callbackData = buildLeadStatusCallbackData(
      "123e4567-e89b-12d3-a456-426614174000",
      "waiting_client",
    );

    assert.equal(Buffer.byteLength(callbackData, "utf8") <= 64, true);
  });

  it("omits buttons when the lead is not persisted", () => {
    assert.equal(buildLeadStatusReplyMarkup(null), null);
  });
});
