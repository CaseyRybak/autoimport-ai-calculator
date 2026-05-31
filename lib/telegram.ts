import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { formatLeadDisplayNumber } from "@/lib/leads";

export type LeadCreatedNotificationLead = {
  id: string | null;
  leadNumber?: number | null;
  customerName: string;
  phone: string;
  telegram?: string | null;
  calculationInput: CalculationInput;
  calculationBreakdown: CalculationBreakdown;
};

export type TelegramNotificationResult =
  | {
      ok: true;
      skipped: false;
    }
  | {
      ok: true;
      skipped: true;
      reason: "env_not_configured";
    }
  | {
      ok: false;
      error: string;
    };

const countryLabels: Record<CalculationInput["country"], string> = {
  korea: "Корея",
  china: "Китай",
  europe: "Европа",
};

const engineTypeLabels: Record<CalculationInput["engineType"], string> = {
  gasoline: "бензин",
  diesel: "дизель",
  hybrid: "гибрид",
  electric: "электро",
};

const serviceLabels: Array<{
  key:
    | "includeCarrier"
    | "includeInsurance"
    | "includeCertificates"
    | "includeBroker"
    | "includeDelivery";
  label: string;
}> = [
  { key: "includeCarrier", label: "Автовоз" },
  { key: "includeInsurance", label: "Страховка" },
  { key: "includeCertificates", label: "СБКТС/ЭПТС" },
  { key: "includeBroker", label: "Брокер" },
  { key: "includeDelivery", label: "Доставка до города" },
];

const formatRub = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

const formatUsd = (value: number) =>
  `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value)} USD`;

const formatEngineVolume = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "не указан";
  }

  return `${String(value)} л`;
};

const formatCarPriceUsd = (input: CalculationInput) => {
  const sourcePriceUsd = input.sourcePriceUsd ?? (input.currency === "usd" ? input.carPrice : null);

  return sourcePriceUsd ? formatUsd(sourcePriceUsd) : "не указана";
};

const formatSelectedServices = (input: CalculationInput) => {
  const selected = serviceLabels
    .filter((service) => input[service.key])
    .map((service) => service.label);

  return selected.length > 0 ? selected.join(", ") : "не выбраны";
};

const cleanBaseUrl = (value: string | undefined | null) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
};

export const getAppBaseUrl = () => {
  const appBaseUrl = cleanBaseUrl(process.env.APP_BASE_URL);

  if (appBaseUrl) {
    return appBaseUrl;
  }

  const vercelUrl = cleanBaseUrl(process.env.VERCEL_URL);

  if (!vercelUrl) {
    return null;
  }

  return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
};

export const buildAdminLeadUrl = (leadId: string | null, baseUrl = getAppBaseUrl()) => {
  const normalizedBaseUrl = cleanBaseUrl(baseUrl);

  if (!leadId || !normalizedBaseUrl) {
    return null;
  }

  return `${normalizedBaseUrl}/admin/leads/${encodeURIComponent(leadId)}`;
};

export const formatLeadCreatedMessage = (
  lead: LeadCreatedNotificationLead,
  adminLeadUrl = buildAdminLeadUrl(lead.id),
) => {
  const input = lead.calculationInput;
  const breakdown = lead.calculationBreakdown;
  const displayNumber = lead.leadNumber ? formatLeadDisplayNumber(lead.leadNumber) : null;
  const lines = [
    displayNumber ? `Новая заявка ${displayNumber}` : "Новая заявка",
    "",
    `Клиент: ${lead.customerName.trim() || "Не указан"}`,
    `Телефон: ${lead.phone.trim() || "Не указан"}`,
    `Telegram: ${lead.telegram?.trim() || "Не указан"}`,
    "",
    `Авто: ${input.brand} ${input.model} ${input.year}`,
    `Страна: ${countryLabels[input.country] ?? input.country}`,
    `Двигатель: ${engineTypeLabels[input.engineType] ?? input.engineType}, ${formatEngineVolume(input.engineVolumeLiters)}`,
    `Цена авто: ${formatCarPriceUsd(input)}`,
    `Город доставки: ${input.destinationCity}`,
    "",
    `Бюджет: ${formatRub(input.budgetRub)}`,
    `Итог: ${formatRub(breakdown.totalRub)}`,
    `Услуги: ${formatSelectedServices(input)}`,
    adminLeadUrl ? "" : null,
    adminLeadUrl ? `Открыть заявку: ${adminLeadUrl}` : null,
  ];

  return lines.filter((line) => line !== null).join("\n");
};

export async function sendLeadCreatedNotification(
  lead: LeadCreatedNotificationLead,
): Promise<TelegramNotificationResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_LEADS_CHAT_ID?.trim();

  if (!token || !chatId) {
    return {
      ok: true,
      skipped: true,
      reason: "env_not_configured",
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      signal: AbortSignal.timeout(5_000),
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLeadCreatedMessage(lead),
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      console.error(`Telegram lead notification failed with status ${response.status}`);

      return {
        ok: false,
        error: `Telegram API returned ${response.status}`,
      };
    }

    return {
      ok: true,
      skipped: false,
    };
  } catch {
    console.error("Telegram lead notification failed");

    return {
      ok: false,
      error: "Telegram request failed",
    };
  }
}
