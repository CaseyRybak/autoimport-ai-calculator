"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogAdminActiveFilter } from "@/lib/vehicle-catalog-admin-filters";

type Props = {
  countries: string[];
  brands: Array<{ id: string; name: string; country: string }>;
  models: Array<{ id: string; name: string; brandId: string; country: string }>;
  countryLabels: Record<string, string>;
  activeOptions: Array<{ value: CatalogAdminActiveFilter; label: string }>;
  selected: {
    country: string;
    brand: string;
    model: string;
    active: CatalogAdminActiveFilter;
    search: string;
    pageSize: number;
  };
};

export function CatalogFilters({
  countries,
  brands,
  models,
  countryLabels,
  activeOptions,
  selected,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }

    router.push(`/admin/catalog?${next.toString()}`);
  };

  return (
    <section className="rounded-lg border bg-white p-4">
      <form
        className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[150px_180px_180px_150px_minmax(220px,1fr)_160px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);

          pushParams({
            search: String(formData.get("search") ?? "").trim() || null,
            page: null,
          });
        }}
      >
        <input type="hidden" name="pageSize" value={selected.pageSize} />
        <label className="space-y-1 text-sm font-medium text-slate-700">
          Страна
          <select
            className="form-field"
            name="country"
            value={selected.country}
            onChange={(event) =>
              pushParams({
                country: event.target.value || null,
                brand: null,
                model: null,
                page: null,
              })
            }
          >
            <option value="">Все страны</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {countryLabels[country] ?? country}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Марка
          <select
            className="form-field"
            name="brand"
            value={selected.brand}
            onChange={(event) =>
              pushParams({
                brand: event.target.value || null,
                model: null,
                page: null,
              })
            }
          >
            <option value="">Все марки</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Модель
          <select
            className="form-field"
            name="model"
            value={selected.model}
            onChange={(event) =>
              pushParams({
                model: event.target.value || null,
                page: null,
              })
            }
          >
            <option value="">Все модели</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Активность
          <select
            className="form-field"
            name="active"
            value={selected.active}
            onChange={(event) =>
              pushParams({
                active: event.target.value,
                page: null,
              })
            }
          >
            {activeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 lg:col-span-2 xl:col-span-1">
          Поиск
          <input
            className="form-field"
            name="search"
            placeholder="Марка или модель"
            defaultValue={selected.search}
          />
        </label>

        <div className="flex items-end lg:col-span-2 xl:col-span-1 xl:justify-end">
          <Button type="submit" className="w-full">
            <Search className="h-4 w-4" />
            Найти
          </Button>
        </div>

        <div className="flex items-end lg:col-span-2 xl:col-span-1 xl:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="w-full xl:w-auto"
            onClick={() => router.push("/admin/catalog")}
          >
            Сбросить
          </Button>
        </div>
      </form>
    </section>
  );
}
