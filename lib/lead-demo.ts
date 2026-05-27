export type LeadStatus = "new" | "in_progress" | "completed" | "rejected";

export type DemoLead = {
  id: string;
  leadNumber: number | null;
  displayNumber: string;
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

export const demoLeads: DemoLead[] = [
  {
    id: "1",
    leadNumber: 1,
    displayNumber: "AIC-000001",
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
    leadNumber: 2,
    displayNumber: "AIC-000002",
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
    leadNumber: 3,
    displayNumber: "AIC-000003",
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

export const getDemoLeadById = (id: string) => demoLeads.find((lead) => lead.id === id) ?? null;
