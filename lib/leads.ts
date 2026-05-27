import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export type LeadStatus = "new" | "in_progress" | "completed" | "rejected";

export type DemoLead = {
  id: string;
  date: string;
  client: string;
  phone: string;
  telegram: string;
  car: string;
  country: string;
  budget: number;
  total: number;
  status: LeadStatus;
};

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

export const demoLeads: DemoLead[] = [
  {
    id: "1",
    date: "26.05.2026",
    client: "Иван Петров",
    phone: "+7 (999) 123-45-67",
    telegram: "@ivan_petrov",
    car: "Toyota Camry 2022",
    country: "Корея",
    budget: 3_000_000,
    total: 2_978_000,
    status: "new",
  },
  {
    id: "2",
    date: "25.05.2026",
    client: "Мария Сидорова",
    phone: "+7 (999) 222-10-10",
    telegram: "@maria_auto",
    car: "BMW X5 2021",
    country: "Европа",
    budget: 5_500_000,
    total: 5_720_000,
    status: "in_progress",
  },
  {
    id: "3",
    date: "24.05.2026",
    client: "Алексей Смирнов",
    phone: "+7 (999) 333-11-22",
    telegram: "@smirnov",
    car: "Haval H9 2023",
    country: "Китай",
    budget: 3_500_000,
    total: 3_310_000,
    status: "completed",
  },
];

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  rejected: "Отклонена",
};

export const leadStatusClasses: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export async function listLeads(): Promise<DemoLead[]> {
  return demoLeads;
}

export async function getLeadById(id: string): Promise<DemoLead | null> {
  return demoLeads.find((lead) => lead.id === id) ?? null;
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
