import {
  leadStatusLabels,
  leadStatuses,
  type DemoLead,
  type LeadStatus,
} from "@/lib/lead-demo";

export type AdminLeadStatusFilter = LeadStatus | "all";
export type AdminLeadSort = "newest" | "oldest" | "budget_desc" | "total_desc";
export type AdminLeadPageSize = 10 | 50 | 100;

export type AdminLeadFilters = {
  status: AdminLeadStatusFilter;
  search: string;
  sort: AdminLeadSort;
  page: number;
  pageSize: AdminLeadPageSize;
};

export type AdminLeadPagination = {
  items: DemoLead[];
  totalCount: number;
  page: number;
  pageSize: AdminLeadPageSize;
  totalPages: number;
};

export const adminLeadSortLabels: Record<AdminLeadSort, string> = {
  newest: "новые сверху",
  oldest: "старые сверху",
  budget_desc: "по бюджету",
  total_desc: "по итоговой стоимости",
};

export const adminLeadStatusOptions: Array<{
  value: AdminLeadStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Все" },
  ...leadStatuses.map((status) => ({
    value: status,
    label: leadStatusLabels[status],
  })),
];

export const adminLeadSortOptions: Array<{
  value: AdminLeadSort;
  label: string;
}> = [
  { value: "newest", label: "Новые сверху" },
  { value: "oldest", label: "Старые сверху" },
  { value: "budget_desc", label: "По бюджету" },
  { value: "total_desc", label: "По итоговой стоимости" },
];

export const adminLeadPageSizeOptions = [10, 50, 100] as const;

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const parseLeadDate = (value: string) => {
  const [day, month, year] = value.split(".").map(Number);

  if (!day || !month || !year) {
    return 0;
  }

  return new Date(year, month - 1, day).getTime();
};

const compareNewest = (a: DemoLead, b: DemoLead) => {
  const byDate = parseLeadDate(b.date) - parseLeadDate(a.date);

  if (byDate !== 0) {
    return byDate;
  }

  return (b.leadNumber ?? 0) - (a.leadNumber ?? 0);
};

const matchesSearch = (lead: DemoLead, search: string) => {
  if (!search) {
    return true;
  }

  const fields = [
    lead.displayNumber,
    lead.client,
    lead.phone,
    lead.telegram,
    lead.car,
  ];

  return fields.some((field) => field.toLowerCase().includes(search));
};

export const normalizeAdminLeadFilters = (params?: {
  status?: string;
  search?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
}): AdminLeadFilters => ({
  status: leadStatuses.includes(params?.status as LeadStatus)
    ? (params?.status as LeadStatus)
    : "all",
  search: params?.search?.trim() ?? "",
  sort:
    params?.sort === "oldest" ||
    params?.sort === "budget_desc" ||
    params?.sort === "total_desc"
      ? params.sort
      : "newest",
  page: Math.max(1, Math.floor(Number(params?.page) || 1)),
  pageSize: adminLeadPageSizeOptions.includes(Number(params?.pageSize) as AdminLeadPageSize)
    ? (Number(params?.pageSize) as AdminLeadPageSize)
    : 10,
});

export const filterAndSortAdminLeads = (leads: DemoLead[], filters: AdminLeadFilters) => {
  const search = normalizeSearch(filters.search);

  return [...leads]
    .filter((lead) => filters.status === "all" || lead.status === filters.status)
    .filter((lead) => matchesSearch(lead, search))
    .sort((a, b) => {
      if (filters.sort === "oldest") {
        return -compareNewest(a, b);
      }

      if (filters.sort === "budget_desc") {
        return b.budget - a.budget || compareNewest(a, b);
      }

      if (filters.sort === "total_desc") {
        return b.total - a.total || compareNewest(a, b);
      }

      return compareNewest(a, b);
    });
};

export const getAdminLeadAppliedFilterText = (filters: AdminLeadFilters) => {
  const labels = [
    filters.status !== "all" ? leadStatusLabels[filters.status] : null,
    filters.search || null,
    filters.sort !== "newest" || filters.status !== "all" || filters.search
      ? adminLeadSortLabels[filters.sort]
      : null,
  ].filter((value): value is string => Boolean(value));

  return labels.length > 0 ? `Фильтры: ${labels.join(" · ")}` : "Фильтры не применены";
};

export const paginateAdminLeads = (
  leads: DemoLead[],
  page: number,
  pageSize: AdminLeadPageSize,
): AdminLeadPagination => {
  const totalCount = leads.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (normalizedPage - 1) * pageSize;

  return {
    items: leads.slice(startIndex, startIndex + pageSize),
    totalCount,
    page: normalizedPage,
    pageSize,
    totalPages,
  };
};

export const getAdminLeadPaginationPages = (currentPage: number, totalPages: number) => {
  const maxButtons = 9;

  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const halfWindow = Math.floor(maxButtons / 2);
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - maxButtons + 1));

  return Array.from({ length: maxButtons }, (_, index) => start + index);
};
