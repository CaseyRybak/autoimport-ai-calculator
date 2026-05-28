import Link from "next/link";
import { Database, Download, FileUp, Search, TriangleAlert } from "lucide-react";
import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
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
    active?: CatalogAdminActiveFilter;
    search?: string;
    error?: string;
    returnTo?: string;
  }>;
};

const activeOptions: Array<{ value: CatalogAdminActiveFilter; label: string }> = [
  { value: "active", label: "Активные" },
  { value: "all", label: "Все" },
  { value: "inactive", label: "Неактивные" },
];

const countryLabels: Record<string, string> = {
  korea: "Корея",
  china: "Китай",
  europe: "Европа",
};

function getCatalogExportHref(
  params: Awaited<Props["searchParams"]>,
  active: CatalogAdminActiveFilter,
) {
  const searchParams = new URLSearchParams();

  for (const key of ["country", "brand", "search"] as const) {
    const value = params?.[key];

    if (value) {
      searchParams.set(key, value);
    }
  }

  searchParams.set("active", active);

  return `/admin/catalog/export?${searchParams.toString()}`;
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
    params?.active === "all" || params?.active === "inactive" ? params.active : "active";
  const catalog: CatalogAdminListResult = isPasswordConfigured
    ? await listCatalogAdminItems({
        country: params?.country,
        brand: params?.brand,
        active,
        search: params?.search,
      })
    : {
        source: "unconfigured",
        error: "Управление каталогом недоступно: не настроен доступ администратора.",
        items: [],
        summary: {
          totalVariants: 0,
          activeVariants: 0,
          inactiveVariants: 0,
        },
        countries: [],
        brands: [],
      };
  const exportHref = getCatalogExportHref(params, active);

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

        <section className="rounded-lg border bg-white p-4">
          <form className="grid gap-3 lg:grid-cols-[180px_220px_180px_1fr_auto]" action="/admin/catalog">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              Страна
              <select className="form-field" name="country" defaultValue={params?.country ?? ""}>
                <option value="">Все страны</option>
                {catalog.countries.map((country) => (
                  <option key={country} value={country}>
                    {countryLabels[country] ?? country}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              Марка
              <select className="form-field" name="brand" defaultValue={params?.brand ?? ""}>
                <option value="">Все марки</option>
                {catalog.brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name} · {countryLabels[brand.country] ?? brand.country}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              Активность
              <select className="form-field" name="active" defaultValue={active}>
                {activeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              Поиск
              <input
                className="form-field"
                name="search"
                placeholder="Марка или модель"
                defaultValue={params?.search ?? ""}
              />
            </label>

            <div className="flex items-end gap-2">
              <Button type="submit">
                <Search className="h-4 w-4" />
                Найти
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href="/admin/catalog">Сбросить</Link>
              </Button>
            </div>
          </form>
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
          <section className="space-y-3">
            {catalog.items.map((item) => (
              <CatalogVariantCard
                key={item.id}
                item={item}
                isManagementEnabled={isPasswordConfigured}
              />
            ))}
          </section>
        )}
      </div>
    </AdminShell>
  );
}
