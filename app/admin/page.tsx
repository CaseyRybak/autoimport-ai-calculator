import Link from "next/link";
import { Search } from "lucide-react";
import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  adminLeadPageSizeOptions,
  adminLeadSortOptions,
  adminLeadStatusOptions,
  filterAndSortAdminLeads,
  getAdminLeadAppliedFilterText,
  getAdminLeadPaginationPages,
  normalizeAdminLeadFilters,
  paginateAdminLeads,
  type AdminLeadPageSize,
} from "@/lib/admin-lead-filters";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import { demoLeads } from "@/lib/lead-demo";
import {
  getLeadsWithDebug,
  leadStatusClasses,
  leadStatusLabels,
  type LeadReadDebug,
} from "@/lib/leads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: Promise<{
    error?: string;
    returnTo?: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function getAdminPageHref(
  filters: ReturnType<typeof normalizeAdminLeadFilters>,
  page: number,
  pageSize: AdminLeadPageSize,
) {
  const searchParams = new URLSearchParams();

  if (filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.sort !== "newest") {
    searchParams.set("sort", filters.sort);
  }

  searchParams.set("page", String(page));
  searchParams.set("pageSize", String(pageSize));

  return `/admin?${searchParams.toString()}`;
}

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const isPasswordConfigured = isAdminPasswordConfigured();
  const hasAccess = isPasswordConfigured ? await hasAdminAccess() : false;

  if (isPasswordConfigured && !hasAccess) {
    return (
      <AdminPasswordGate
        hasError={params?.error === "1"}
        returnTo={params?.returnTo?.startsWith("/admin") ? params.returnTo : "/admin"}
      />
    );
  }

  const readResult = isPasswordConfigured
    ? await getLeadsWithDebug()
    : {
        leads: demoLeads,
        debug: {
          serviceRoleClientAvailable: false,
          adminClientUsesServiceRoleEnv: false,
          adminClientKeyPrefix: null,
          adminReadFunction: "admin-page:demoFallbackNoPassword",
          getLeadsSource: "mock",
          supabaseRowsCount: null,
          supabaseErrorCode: null,
          supabaseErrorMessage: null,
        } satisfies LeadReadDebug,
      };
  const leads = readResult.leads;
  const filters = normalizeAdminLeadFilters(params);
  const filteredLeads = filterAndSortAdminLeads(leads, filters);
  const paginatedLeads = paginateAdminLeads(filteredLeads, filters.page, filters.pageSize);
  const paginationPages = getAdminLeadPaginationPages(
    paginatedLeads.page,
    paginatedLeads.totalPages,
  );
  const pageStart =
    paginatedLeads.totalCount === 0 ? 0 : (paginatedLeads.page - 1) * paginatedLeads.pageSize + 1;
  const pageEnd = Math.min(
    paginatedLeads.page * paginatedLeads.pageSize,
    paginatedLeads.totalCount,
  );
  const appliedFilterText = getAdminLeadAppliedFilterText(filters);
  const summary = {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    inProgress: leads.filter((lead) => lead.status === "in_progress").length,
    waitingClient: leads.filter((lead) => lead.status === "waiting_client").length,
    closed: leads.filter((lead) => lead.status === "closed").length,
    rejected: leads.filter((lead) => lead.status === "rejected").length,
  };

  return (
    <AdminShell title="Заявки">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Всего заявок" value={summary.total} />
        <Metric label="Новые" value={summary.new} />
        <Metric label="В работе" value={summary.inProgress} />
        <Metric label="Ждём клиента" value={summary.waitingClient} />
        <Metric label="Закрытые" value={summary.closed} />
        <Metric label="Отказы" value={summary.rejected} />
      </div>

      <form
        action="/admin"
        className="mt-5 grid gap-3 rounded-lg border bg-white p-4 lg:grid-cols-[180px_1fr_220px_auto]"
      >
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Статус</span>
          <select
            name="status"
            defaultValue={filters.status}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
          >
            {adminLeadStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Поиск</span>
          <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              name="search"
              defaultValue={filters.search}
              placeholder="AIC, клиент, телефон, Telegram, авто"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Сортировка</span>
          <select
            name="sort"
            defaultValue={filters.sort}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
          >
            {adminLeadSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            Применить
          </button>
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <Link
            href="/admin"
            className="inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Сбросить
          </Link>
        </div>
      </form>

      <p className="mt-3 text-sm text-slate-500">{appliedFilterText}</p>

      <div className="mt-5 overflow-hidden rounded-lg border bg-white">
        {paginatedLeads.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Номер</th>
                  <th className="px-4 py-3">Дата</th>
                  <th className="px-4 py-3">Клиент</th>
                  <th className="px-4 py-3">Авто</th>
                  <th className="px-4 py-3">Страна</th>
                  <th className="px-4 py-3">Бюджет</th>
                  <th className="px-4 py-3">Итого</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedLeads.items.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {lead.displayNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{lead.date}</td>
                    <td className="px-4 py-3 font-medium">{lead.client}</td>
                    <td className="px-4 py-3 text-slate-600">{lead.car}</td>
                    <td className="px-4 py-3 text-slate-600">{lead.country}</td>
                    <td className="px-4 py-3">{(lead.budget / 1_000_000).toFixed(1)}М ₽</td>
                    <td className="px-4 py-3">{(lead.total / 1_000_000).toFixed(1)}М ₽</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${leadStatusClasses[lead.status]}`}
                      >
                        {leadStatusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="text-blue-600">
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center text-sm text-slate-500">
            Заявки не найдены. Измените фильтры или поиск.
          </div>
        )}
      </div>

      {filteredLeads.length > 0 ? (
        <section className="mt-5 flex flex-col gap-4 rounded-lg border bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-sm text-slate-600">
            Показано {pageStart}-{pageEnd} из {paginatedLeads.totalCount}. Страница{" "}
            {paginatedLeads.page} из {paginatedLeads.totalPages}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">На странице</span>
              {adminLeadPageSizeOptions.map((option) => (
                <Link
                  key={option}
                  href={getAdminPageHref(filters, 1, option)}
                  className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium ${
                    option === paginatedLeads.pageSize
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {paginatedLeads.page <= 1 ? (
                <span className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
                  Назад
                </span>
              ) : (
                <Link
                  href={getAdminPageHref(
                    filters,
                    paginatedLeads.page - 1,
                    paginatedLeads.pageSize,
                  )}
                  className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Назад
                </Link>
              )}
              {paginationPages.map((page) => (
                <Link
                  key={page}
                  href={getAdminPageHref(filters, page, paginatedLeads.pageSize)}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium ${
                    page === paginatedLeads.page
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </Link>
              ))}
              {paginatedLeads.page >= paginatedLeads.totalPages ? (
                <span className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
                  Вперед
                </span>
              ) : (
                <Link
                  href={getAdminPageHref(
                    filters,
                    paginatedLeads.page + 1,
                    paginatedLeads.pageSize,
                  )}
                  className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Вперед
                </Link>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </AdminShell>
  );
}
