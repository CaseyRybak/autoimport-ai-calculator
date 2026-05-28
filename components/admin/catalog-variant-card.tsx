"use client";

import { useActionState, useEffect, useState } from "react";
import {
  toggleCatalogVariantActiveAction,
  updateCatalogVariantAction,
  type CatalogVariantActionState,
} from "@/app/admin/catalog/actions";
import { Button } from "@/components/ui/button";
import type { CatalogAdminItem } from "@/lib/vehicle-catalog-admin";
import { cn } from "@/lib/utils";

const engineLabels: Record<string, string> = {
  gasoline: "Бензин",
  diesel: "Дизель",
  hybrid: "Гибрид",
  electric: "Электро",
};

const countryLabels: Record<string, string> = {
  korea: "Корея",
  china: "Китай",
  europe: "Европа",
};

const numberFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

const initialActionState: CatalogVariantActionState = {
  ok: null,
  message: null,
  variantId: null,
  isActive: null,
  sourcePriceUsd: null,
  sourceName: null,
  sourceUrl: null,
  lastCheckedAt: null,
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU").format(new Date(value));
};

const toDateInputValue = (value: string | null) => (value ? value.slice(0, 10) : "");

export function CatalogVariantCard({
  item,
  isManagementEnabled,
}: {
  item: CatalogAdminItem;
  isManagementEnabled: boolean;
}) {
  const [currentIsActive, setCurrentIsActive] = useState(item.isActive);
  const [sourcePriceUsd, setSourcePriceUsd] = useState(String(item.sourcePriceUsd));
  const [sourceName, setSourceName] = useState(item.sourceName ?? "");
  const [currentSourceUrl, setCurrentSourceUrl] = useState(item.sourceUrl);
  const [sourceUrl, setSourceUrl] = useState(item.sourceUrl ?? "");
  const [lastCheckedAt, setLastCheckedAt] = useState(toDateInputValue(item.lastCheckedAt));
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [updateState, updateAction, updatePending] = useActionState(
    updateCatalogVariantAction,
    initialActionState,
  );
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleCatalogVariantActiveAction,
    initialActionState,
  );

  useEffect(() => {
    if (!updateState.message || updateState.variantId !== item.id) {
      return;
    }

    if (updateState.isActive !== null) {
      setCurrentIsActive(updateState.isActive);
    }

    if (updateState.ok) {
      if (updateState.sourcePriceUsd !== null) {
        setSourcePriceUsd(String(updateState.sourcePriceUsd));
      }

      setSourceName(updateState.sourceName ?? "");
      setCurrentSourceUrl(updateState.sourceUrl);
      setSourceUrl(updateState.sourceUrl ?? "");
      setLastCheckedAt(toDateInputValue(updateState.lastCheckedAt));
    }

    setNotice({
      ok: updateState.ok === true,
      message: updateState.message,
    });
  }, [item.id, updateState]);

  useEffect(() => {
    if (!toggleState.message || toggleState.variantId !== item.id) {
      return;
    }

    if (toggleState.isActive !== null) {
      setCurrentIsActive(toggleState.isActive);
    }

    setNotice({
      ok: toggleState.ok === true,
      message: toggleState.message,
    });
  }, [item.id, toggleState]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 5000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4",
        currentIsActive ? "" : "border-slate-200 bg-slate-50",
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr_170px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium",
                currentIsActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600",
              )}
            >
              {currentIsActive ? "active" : "inactive"}
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
              {countryLabels[item.country] ?? item.country}
            </span>
            <span className="text-xs text-slate-500">
              source: {countryLabels[item.sourceMarket] ?? item.sourceMarket}
            </span>
          </div>

          <h2 className="mt-3 truncate text-lg font-semibold text-slate-950">
            {item.brand} {item.model}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-slate-500">Year</dt>
              <dd className="font-medium text-slate-950">{item.year}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Engine</dt>
              <dd className="font-medium text-slate-950">
                {engineLabels[item.engineType] ?? item.engineType}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Volume</dt>
              <dd className="font-medium text-slate-950">
                {item.engineVolumeLiters === 0
                  ? "Электро"
                  : `${numberFormat.format(item.engineVolumeLiters)} л`}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Checked</dt>
              <dd className="font-medium text-slate-950">{formatDate(item.lastCheckedAt)}</dd>
            </div>
          </dl>
        </div>

        <form
          id={`catalog-update-${item.id}`}
          action={updateAction}
          className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          <input type="hidden" name="id" value={item.id} />

          <label className="space-y-1 text-sm font-medium text-slate-700">
            source_price_usd
            <input
              className="form-field"
              min="1"
              name="sourcePriceUsd"
              step="1"
              type="number"
              value={sourcePriceUsd}
              onChange={(event) => setSourcePriceUsd(event.target.value)}
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            source_name
            <input
              className="form-field"
              name="sourceName"
              placeholder="Источник"
              value={sourceName}
              onChange={(event) => setSourceName(event.target.value)}
            />
          </label>

          <label className="min-w-0 space-y-1 text-sm font-medium text-slate-700">
            source_url
            <input
              className="form-field"
              name="sourceUrl"
              placeholder="aaa.com или https://aaa.com"
              inputMode="url"
              type="text"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
            />
            {currentSourceUrl ? (
              <a
                className="block max-w-full truncate text-xs font-normal text-blue-600"
                href={currentSourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Открыть источник
              </a>
            ) : null}
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            last_checked_at
            <input
              className="form-field"
              name="lastCheckedAt"
              type="date"
              value={lastCheckedAt}
              onChange={(event) => setLastCheckedAt(event.target.value)}
            />
          </label>

          {notice ? (
            <div
              className={cn(
                "md:col-span-2 xl:col-span-3 rounded-md px-3 py-2 text-sm font-medium",
                notice.ok
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-800",
              )}
            >
              {notice.message}
            </div>
          ) : null}
        </form>

        <div className="flex flex-col items-stretch gap-2 xl:items-end">
          <Button
            form={`catalog-update-${item.id}`}
            type="submit"
            disabled={!isManagementEnabled || updatePending}
            className="w-full xl:w-[150px]"
          >
            {updatePending ? "Сохраняем..." : "Сохранить"}
          </Button>
          <form action={toggleAction} className="w-full xl:w-[150px]">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="isActive" value={currentIsActive ? "false" : "true"} />
            <Button
              type="submit"
              variant="outline"
              disabled={!isManagementEnabled || togglePending}
              className="w-full"
            >
              {togglePending
                ? currentIsActive
                  ? "Отключаем..."
                  : "Активируем..."
                : currentIsActive
                  ? "Деактивировать"
                  : "Активировать"}
            </Button>
          </form>
        </div>
      </div>
    </article>
  );
}
