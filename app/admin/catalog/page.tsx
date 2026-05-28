import Link from "next/link";
import { Database, Download, FileUp, TriangleAlert } from "lucide-react";
import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
import { CatalogFilters } from "@/components/admin/catalog-filters";
import { CatalogVariantCard } from "@/components/admin/catalog-variant-card";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import {
  listCatalogAdminItems,
  type CatalogAdminActiveFilter,
  type CatalogAdminListResult,
} from "@/lib/vehicle-catalog-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: Promise<{
    country?: string;
    brand?: string;
    model?: string;
    active?: CatalogAdminActiveFilter;
    search?: string;
    page?: string;
    pageSize?: string;
    error?: string;
    returnTo?: string;
  }>;
};

const activeOptions: Array<{ value: CatalogAdminActiveFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "inactive", label: "Неактивные" },
];

const countryLabels: Record<string, string> = {
  korea: "Корея",
  china: "Китай",
  europe: "Европа",
};

const pageSizeOptions = [10, 50, 100] as const;

function getCatalogExportHref(
  params: Awaited<Props["searchParams"]>,
  active: CatalogAdminActiveFilter,
) {
  const searchParams = new URLSearchParams();

  for (const key of ["country", "brand", "model", "search"] as const) {
    const value = params?.[key];

    if (value) {
      searchParams.set(key, value);
    }
  }

  searchParams.set("active", active);

  return `/admin/catalog/export?${searchParams.toString()}`;
}

function getCatalogPageHref(
  params: Awaited<Props["searchParams"]>,
  active: CatalogAdminActiveFilter,
  page: number,
  pageSize: number,
) {
  const searchParams = new URLSearchParams();

  for (const key of ["country", "brand", "model", "search"] as const) {
    const value = params?.[key];

    if (value) {
      searchParams.set(key, value);
    }
  }

  searchParams.set("active", active);
  searchParams.set("page", String(page));
  searchParams.set("pageSize", String(pageSize));

  return `/admin/catalog?${searchParams.toString()}`;
}

function getPaginationPages(currentPage: number, totalPages: number) {
  const maxButtons = 9;

  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const halfWindow = Math.floor(maxButtons / 2);
  const start = Math.max(1, Math.min(currentPage - halfWindow, totalPages - maxButtons + 1));

  return Array.from({ length: maxButtons }, (_, index) => start + index);
}

function getAppliedFilterLabels({
  country,
  brand,
  model,
  active,
  search,
  catalog,
}: {
  country: string;
  brand: string;
  model: string;
  active: CatalogAdminActiveFilter;
  search: string;
  catalog: CatalogAdminListResult;
}) {
  const labels = [
    country ? countryLabels[country] ?? country : null,
    brand ? catalog.brands.find((item) => item.id === brand)?.name ?? null : null,
    model ? catalog.models.find((item) => item.id === model)?.name ?? null : null,
    active === "active" ? "Активные" : active === "inactive" ? "Неактивные" : null,
    search ? `Поиск: ${search}` : null,
  ].filter((item): item is string => Boolean(item));

  return labels.length > 0 ? `Фильтры: ${labels.join(" · ")}` : "Фильтры не применены";
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default async function CatalogAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const isPasswordConfigured = isAdminPasswordConfigured();
  const hasAccess = isPasswordConfigured ? await hasAdminAccess() : false;

  if (isPasswordConfigured && !hasAccess) {
    return (
      <AdminPasswordGate
        hasError={params?.error === "1"}
        returnTo={params?.returnTo?.startsWith("/admin") ? params.returnTo : "/admin/catalog"}
      />
    );
  }

  const active =
    params?.active === "active" || params?.active === "inactive" ? params.active : "all";
  const requestedPage = Number(params?.page);
  const requestedPageSize = Number(params?.pageSize);
  const catalog: CatalogAdminListResult = isPasswordConfigured
    ? await listCatalogAdminItems({
        country: params?.country,
        brand: params?.brand,
        model: params?.model,
        active,
        search: params?.search,
        page: requestedPage,
        pageSize: requestedPageSize,
      })
    : {
        source: "unconfigured",
        error: "Управление каталогом недоступно: не настроен доступ администратора.",
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        summary: {
          totalVariants: 0,
          activeVariants: 0,
          inactiveVariants: 0,
        },
        countries: [],
        brands: [],
        models: [],
      };
  const exportHref = getCatalogExportHref(params, active);
  const totalItems = catalog.totalCount;
  const currentPage = catalog.page;
  const pageSize = catalog.pageSize;
  const totalPages = catalog.totalPages;
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalItems);
  const paginationPages = getPaginationPages(currentPage, totalPages);
  const selectedCountry = params?.country ?? "";
  const selectedBrand = catalog.brands.some((item) => item.id === params?.brand)
    ? (params?.brand ?? "")
    : "";
  const selectedModel = catalog.models.some((item) => item.id === params?.model)
    ? (params?.model ?? "")
    : "";
  const selectedSearch = params?.search ?? "";
  const appliedFiltersLabel = getAppliedFilterLabels({
    country: selectedCountry,
    brand: selectedBrand,
    model: selectedModel,
    active,
    search: selectedSearch,
    catalog,
  });

  return (
    <AdminShell title="Каталог авто">
      <div className="max-w-[1800px] space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <InfoAlert>
              Для рабочих цен каталога указывайте источник и дату проверки:
              `source_name`, `source_url` и `last_checked_at`.
            </InfoAlert>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/catalog/import">
                <FileUp className="h-4 w-4" />
                Импорт CSV
              </Link>
            </Button>
            {isPasswordConfigured ? (
              <Button asChild variant="outline">
                <Link href={exportHref}>
                  <Download className="h-4 w-4" />
                  Экспорт CSV
                </Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled>
                <Download className="h-4 w-4" />
                Экспорт CSV
              </Button>
            )}
          </div>
        </div>

        {params?.error || catalog.error ? (
          <section className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-950">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{params?.error ?? catalog.error}</div>
          </section>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Всего вариантов" value={catalog.summary.totalVariants} />
          <Metric label="Активные варианты" value={catalog.summary.activeVariants} />
          <Metric label="Неактивные варианты" value={catalog.summary.inactiveVariants} />
        </div>

        <CatalogFilters
          countries={catalog.countries}
          brands={catalog.brands}
          models={catalog.models}
          countryLabels={countryLabels}
          activeOptions={activeOptions}
          selected={{
            country: selectedCountry,
            brand: selectedBrand,
            model: selectedModel,
            active,
            search: selectedSearch,
            pageSize,
          }}
        />

        <section className="rounded-lg border bg-white p-4">
          <p className="text-sm font-medium text-slate-950">Показано {catalog.items.length} из {totalItems} авто</p>
          <p className="mt-1 text-sm text-slate-600">{appliedFiltersLabel}</p>
        </section>

        {catalog.items.length === 0 ? (
          <section className="rounded-lg border bg-white p-8 text-center">
            <Database className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-3 text-lg font-semibold text-slate-950">Каталог не найден</h2>
            <p className="mt-1 text-sm text-slate-600">
              Измените фильтры или загрузите каталог через импорт CSV.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/admin/catalog/import">Импорт CSV</Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="space-y-3">
              {catalog.items.map((item) => (
                <CatalogVariantCard
                  key={item.id}
                  item={item}
                  isManagementEnabled={isPasswordConfigured}
                />
              ))}
            </section>

            <section className="flex flex-col gap-4 rounded-lg border bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
              <p className="text-sm text-slate-600">
                Показано {pageStart}-{pageEnd} из {totalItems}. Страница {currentPage} из{" "}
                {totalPages}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600">На странице</span>
                  {pageSizeOptions.map((option) => (
                    <Button
                      key={option}
                      asChild
                      size="sm"
                      variant={option === pageSize ? "default" : "outline"}
                    >
                      <Link href={getCatalogPageHref(params, active, 1, option)}>{option}</Link>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentPage <= 1 ? (
                    <Button type="button" variant="outline" disabled>
                      Назад
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={getCatalogPageHref(params, active, currentPage - 1, pageSize)}>
                        Назад
                      </Link>
                    </Button>
                  )}
                  {paginationPages.map((page) => (
                    <Button
                      key={page}
                      asChild
                      variant={page === currentPage ? "default" : "outline"}
                    >
                      <Link href={getCatalogPageHref(params, active, page, pageSize)}>
                        {page}
                      </Link>
                    </Button>
                  ))}
                  {currentPage >= totalPages ? (
                    <Button type="button" variant="outline" disabled>
                      Вперед
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={getCatalogPageHref(params, active, currentPage + 1, pageSize)}>
                        Вперед
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
