import type {
  BudgetStatus,
  CalculationBreakdown,
  CalculationInput,
  Currency,
} from "@/lib/calculate";
import {
  demoLeads,
  getDemoLeadById,
  leadStatusLabels,
  type DemoLead,
  type LeadStatus,
} from "@/lib/lead-demo";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export {
  demoLeads,
  getDemoLeadById,
  leadStatusClasses,
  leadStatusLabels,
  type DemoLead,
  type LeadStatus,
} from "@/lib/lead-demo";

export type CreateLeadInput = {
  customerName: string;
  phone: string;
  telegram?: string;
  comment?: string;
  calculationInput: CalculationInput;
  calculationBreakdown: CalculationBreakdown;
};

export type CreateLeadResult =
  | {
      ok: true;
      mode: "supabase" | "demo";
      id: string | null;
    }
  | {
      ok: false;
      mode: "supabase";
      error: string;
    };

export type LeadReadDebug = {
  serviceRoleClientAvailable: boolean;
  adminClientUsesServiceRoleEnv: boolean;
  adminClientKeyPrefix: string | null;
  adminReadFunction: string;
  getLeadsSource: "supabase" | "mock";
  supabaseRowsCount: number | null;
  supabaseErrorCode: string | null;
  supabaseErrorMessage: string | null;
};

export type LeadReadResult = {
  leads: DemoLead[];
  debug: LeadReadDebug;
};

type LeadRow = {
  id: string;
  lead_number: number | string | null;
  created_at: string;
  status: string;
  customer_name: string;
  phone: string;
  telegram: string | null;
  country: CalculationInput["country"];
  brand: string;
  model: string;
  year: number;
  budget_rub: number;
  total_rub: number;
};

type LeadDetailRow = LeadRow & {
  updated_at: string;
  comment: string | null;
  engine_type: CalculationInput["engineType"];
  engine_volume_liters: number | string | null;
  car_price: number | string;
  currency: Currency;
  destination_city: string;
  calculation_input: unknown;
  calculation_breakdown: unknown;
  budget_status: BudgetStatus;
};

export type LeadDetailService = {
  key:
    | "includeCarrier"
    | "includeInsurance"
    | "includeCertificates"
    | "includeBroker"
    | "includeDelivery";
  label: string;
  selected: boolean;
};

export type LeadCalculationRow = {
  label: string;
  valueRub: number | null;
};

export type AdminLeadDetail = DemoLead & {
  createdAt: string;
  updatedAt: string;
  customerComment: string | null;
  vehicle: {
    country: string;
    brand: string;
    model: string;
    year: number | null;
    engineType: string;
    engineVolumeLiters: number | null;
    destinationCity: string;
  };
  catalogPrice: {
    amount: number | null;
    currency: Currency | string;
    sourcePriceUsd: number | null;
  };
  budgetSummary: {
    budgetRub: number | null;
    totalRub: number | null;
    budgetStatus: BudgetStatus | string | null;
    budgetDeltaRub: number | null;
  };
  services: LeadDetailService[];
  breakdown: LeadCalculationRow[];
};

const countryLabels: Record<CalculationInput["country"], string> = {
  korea: "Корея",
  china: "Китай",
  europe: "Европа",
};

const leadColumns =
  "id, lead_number, created_at, status, customer_name, phone, telegram, country, brand, model, year, budget_rub, total_rub";
const leadDetailColumns =
  "id, lead_number, created_at, updated_at, status, customer_name, phone, telegram, comment, country, brand, model, year, engine_type, engine_volume_liters, car_price, currency, budget_rub, destination_city, calculation_input, calculation_breakdown, total_rub, budget_status";

const formatLeadDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const toLeadStatus = (status: string): LeadStatus =>
  status in leadStatusLabels ? (status as LeadStatus) : "new";

export const formatLeadDisplayNumber = (leadNumber: number | null) =>
  leadNumber === null ? "AIC-000000" : `AIC-${String(leadNumber).padStart(6, "0")}`;

const mapLeadRow = (row: LeadRow): DemoLead => ({
  id: row.id,
  leadNumber: toNumberOrNull(row.lead_number),
  displayNumber: formatLeadDisplayNumber(toNumberOrNull(row.lead_number)),
  date: formatLeadDate(row.created_at),
  client: row.customer_name,
  phone: row.phone,
  telegram: row.telegram ?? "Не указан",
  car: `${row.brand} ${row.model} ${row.year}`.trim(),
  country: countryLabels[row.country] ?? row.country,
  budget: Number(row.budget_rub),
  total: Number(row.total_rub),
  status: toLeadStatus(row.status),
});

const serviceLabels: Record<LeadDetailService["key"], string> = {
  includeCarrier: "Автовоз",
  includeInsurance: "Страховка",
  includeCertificates: "СБКТС/ЭПТС",
  includeBroker: "Брокер",
  includeDelivery: "Доставка до города",
};

const engineTypeLabels: Record<CalculationInput["engineType"], string> = {
  gasoline: "Бензин",
  diesel: "Дизель",
  hybrid: "Гибрид",
  electric: "Электро",
};

const toObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toNumberOrNull = (value: unknown) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const toStringOrNull = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

const toBudgetStatus = (value: unknown) =>
  value === "within_budget" || value === "over_budget" ? value : null;

const mapDetailFallback = (lead: DemoLead): AdminLeadDetail => ({
  ...lead,
  createdAt: lead.date,
  updatedAt: "—",
  customerComment: null,
  vehicle: {
    country: lead.country,
    brand: lead.car.split(" ")[0] ?? "—",
    model: lead.car.split(" ").slice(1, -1).join(" ") || "—",
    year: toNumberOrNull(lead.car.split(" ").at(-1)),
    engineType: "—",
    engineVolumeLiters: null,
    destinationCity: "—",
  },
  catalogPrice: {
    amount: null,
    currency: "—",
    sourcePriceUsd: null,
  },
  budgetSummary: {
    budgetRub: lead.budget,
    totalRub: lead.total,
    budgetStatus: lead.status,
    budgetDeltaRub: null,
  },
  services: Object.entries(serviceLabels).map(([key, label]) => ({
    key: key as LeadDetailService["key"],
    label,
    selected: false,
  })),
  breakdown: [],
});

export const getDemoLeadDetailById = (id: string) => {
  const lead = getDemoLeadById(id);

  return lead ? mapDetailFallback(lead) : null;
};

const mapLeadDetailRow = (row: LeadDetailRow): AdminLeadDetail => {
  const calculationInput = toObject(row.calculation_input);
  const calculationBreakdown = toObject(row.calculation_breakdown);
  const engineVolume =
    toNumberOrNull(row.engine_volume_liters) ??
    toNumberOrNull(calculationInput.engineVolumeLiters);
  const engineType =
    toStringOrNull(row.engine_type) ??
    toStringOrNull(calculationInput.engineType) ??
    "—";
  const budgetStatus =
    toBudgetStatus(row.budget_status) ?? toBudgetStatus(calculationBreakdown.budgetStatus);
  const services = Object.entries(serviceLabels).map(([key, label]) => ({
    key: key as LeadDetailService["key"],
    label,
    selected: calculationInput[key] === true,
  }));
  const breakdown: LeadCalculationRow[] = [
    ["Стоимость авто", calculationBreakdown.carPriceRub],
    ["Таможенные платежи", calculationBreakdown.customsFeeRub],
    ["Утилизационный сбор", calculationBreakdown.recycleFeeRub],
    ["Логистика", calculationBreakdown.logisticsRub],
    ["Комиссия компании", calculationBreakdown.companyFeeRub],
    ["Дополнительные расходы", calculationBreakdown.extraCostsRub],
  ].map(([label, value]) => ({
    label: String(label),
    valueRub: toNumberOrNull(value),
  }));

  return {
    ...mapLeadRow(row),
    createdAt: formatLeadDate(row.created_at),
    updatedAt: formatLeadDate(row.updated_at),
    customerComment: row.comment,
    vehicle: {
      country: countryLabels[row.country] ?? row.country,
      brand: row.brand || toStringOrNull(calculationInput.brand) || "—",
      model: row.model || toStringOrNull(calculationInput.model) || "—",
      year: toNumberOrNull(row.year),
      engineType:
        engineType in engineTypeLabels
          ? engineTypeLabels[engineType as CalculationInput["engineType"]]
          : engineType,
      engineVolumeLiters: engineVolume,
      destinationCity:
        row.destination_city || toStringOrNull(calculationInput.destinationCity) || "—",
    },
    catalogPrice: {
      amount: toNumberOrNull(row.car_price) ?? toNumberOrNull(calculationInput.carPrice),
      currency: row.currency || toStringOrNull(calculationInput.currency) || "—",
      sourcePriceUsd: toNumberOrNull(calculationInput.sourcePriceUsd),
    },
    budgetSummary: {
      budgetRub: toNumberOrNull(row.budget_rub),
      totalRub: toNumberOrNull(row.total_rub),
      budgetStatus,
      budgetDeltaRub: toNumberOrNull(calculationBreakdown.budgetDeltaRub),
    },
    services,
    breakdown,
  };
};

const mockReadDebug = ({
  serviceRoleClientAvailable,
  adminClientUsesServiceRoleEnv,
  adminClientKeyPrefix,
  adminReadFunction,
  supabaseErrorCode = null,
  supabaseErrorMessage = null,
}: Omit<
  LeadReadDebug,
  "getLeadsSource" | "supabaseRowsCount" | "supabaseErrorCode" | "supabaseErrorMessage"
> &
  Pick<Partial<LeadReadDebug>, "supabaseErrorCode" | "supabaseErrorMessage">) => ({
  serviceRoleClientAvailable,
  adminClientUsesServiceRoleEnv,
  adminClientKeyPrefix,
  adminReadFunction,
  getLeadsSource: "mock" as const,
  supabaseRowsCount: null,
  supabaseErrorCode,
  supabaseErrorMessage,
});

async function createAdminClient() {
  const {
    createSupabaseAdminClient,
    getSupabaseAdminClientDebug,
    isSupabaseAdminConfigured,
  } = await import(
    "@/lib/supabase-admin"
  );

  return {
    client: isSupabaseAdminConfigured() ? createSupabaseAdminClient() : null,
    debug: getSupabaseAdminClientDebug(),
  };
}

export async function getLeadsWithDebug(): Promise<LeadReadResult> {
  const { client: supabase, debug: adminDebug } = await createAdminClient();
  const adminReadFunction = "getLeadsWithDebug:serviceRoleSelect";

  if (!supabase) {
    return {
      leads: demoLeads,
      debug: mockReadDebug({
        serviceRoleClientAvailable: false,
        adminClientUsesServiceRoleEnv: adminDebug.adminClientUsesServiceRoleEnv,
        adminClientKeyPrefix: adminDebug.adminClientKeyPrefix,
        adminReadFunction,
      }),
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .select(leadColumns)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      leads: demoLeads,
      debug: mockReadDebug({
        serviceRoleClientAvailable: true,
        adminClientUsesServiceRoleEnv: adminDebug.adminClientUsesServiceRoleEnv,
        adminClientKeyPrefix: adminDebug.adminClientKeyPrefix,
        adminReadFunction,
        supabaseErrorCode: error.code ?? null,
        supabaseErrorMessage: error.message,
      }),
    };
  }

  return {
    leads: (data ?? []).map((lead) => mapLeadRow(lead as LeadRow)),
    debug: {
      serviceRoleClientAvailable: true,
      adminClientUsesServiceRoleEnv: adminDebug.adminClientUsesServiceRoleEnv,
      adminClientKeyPrefix: adminDebug.adminClientKeyPrefix,
      adminReadFunction,
      getLeadsSource: "supabase",
      supabaseRowsCount: data?.length ?? 0,
      supabaseErrorCode: null,
      supabaseErrorMessage: null,
    },
  };
}

export async function getLeads(): Promise<DemoLead[]> {
  const { leads } = await getLeadsWithDebug();

  return leads;
}

export async function listLeads(): Promise<DemoLead[]> {
  return getLeads();
}

export async function getLeadById(id: string): Promise<AdminLeadDetail | null> {
  const { client: supabase } = await createAdminClient();

  if (!supabase) {
    const demoLead = getDemoLeadById(id);

    return demoLead ? mapDetailFallback(demoLead) : null;
  }

  const { data, error } = await supabase
    .from("leads")
    .select(leadDetailColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    const demoLead = getDemoLeadById(id);

    return demoLead ? mapDetailFallback(demoLead) : null;
  }

  return data ? mapLeadDetailRow(data as LeadDetailRow) : null;
}

const cleanOptionalText = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export async function createLead(payload: CreateLeadInput): Promise<CreateLeadResult> {
  const calculationInput = payload.calculationInput;
  const calculationBreakdown = payload.calculationBreakdown;

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      mode: "demo",
      id: null,
    };
  }

  const supabase = createSupabaseClient();

  if (!supabase) {
    return {
      ok: true,
      mode: "demo",
      id: null,
    };
  }

  const { error } = await supabase.from("leads").insert({
    customer_name: payload.customerName.trim(),
    phone: payload.phone.trim(),
    telegram: cleanOptionalText(payload.telegram),
    comment: cleanOptionalText(payload.comment),
    country: calculationInput.country,
    brand: calculationInput.brand,
    model: calculationInput.model,
    year: calculationInput.year,
    engine_type: calculationInput.engineType,
    engine_volume_liters: calculationInput.engineVolumeLiters,
    car_price: calculationInput.carPrice,
    currency: calculationInput.currency,
    budget_rub: calculationInput.budgetRub,
    destination_city: calculationInput.destinationCity,
    calculation_input: calculationInput,
    calculation_breakdown: calculationBreakdown,
    total_rub: calculationBreakdown.totalRub,
    budget_status: calculationBreakdown.budgetStatus,
  });

  if (error) {
    return {
      ok: false,
      mode: "supabase",
      error: error.message,
    };
  }

  return {
    ok: true,
    mode: "supabase",
    id: null,
  };
}
