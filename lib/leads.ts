import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
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

const countryLabels: Record<CalculationInput["country"], string> = {
  korea: "Корея",
  china: "Китай",
  europe: "Европа",
};

const leadColumns =
  "id, created_at, status, customer_name, phone, telegram, country, brand, model, year, budget_rub, total_rub";

const formatLeadDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const toLeadStatus = (status: string): LeadStatus =>
  status in leadStatusLabels ? (status as LeadStatus) : "new";

const mapLeadRow = (row: LeadRow): DemoLead => ({
  id: row.id,
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

export async function getLeadById(id: string): Promise<DemoLead | null> {
  const { client: supabase } = await createAdminClient();

  if (!supabase) {
    return getDemoLeadById(id);
  }

  const { data, error } = await supabase
    .from("leads")
    .select(leadColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return getDemoLeadById(id);
  }

  return data ? mapLeadRow(data as LeadRow) : null;
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
