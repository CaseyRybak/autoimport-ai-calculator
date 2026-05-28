import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import { MessageCircle, Phone, Sparkles } from "lucide-react";
import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import {
  getDemoLeadDetailById,
  getLeadById,
  leadStatusClasses,
  leadStatusLabels,
} from "@/lib/leads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

const empty = "—";

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const formatRub = (value: number | null) => (value === null ? empty : rub.format(value));

const currencyLabels: Record<string, string> = {
  usd: "USD",
  rub: "RUB",
  eur: "EUR",
  cny: "CNY",
};

const formatCatalogPrice = (amount: number | null, currency: string) => {
  if (amount === null) {
    return empty;
  }

  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(amount)} ${
    currencyLabels[currency] ?? currency.toUpperCase()
  }`;
};

const getBreakdownValue = (
  rows: Array<{ label: string; valueRub: number | null }>,
  label: string,
) => rows.find((row) => row.label === label)?.valueRub ?? null;

const formatEngineVolume = (value: number | null) => {
  if (value === null) {
    return empty;
  }

  return value === 0 ? "Электро" : `${value.toFixed(1)} л`;
};

const formatBudgetStatus = (value: string | null) => {
  if (value === "within_budget") {
    return "Проходит по бюджету";
  }

  if (value === "over_budget") {
    return "Выше бюджета";
  }

  return empty;
};

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-950">{value || empty}</p>
    </div>
  );
}

export default async function LeadDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const isPasswordConfigured = isAdminPasswordConfigured();
  const hasAccess = isPasswordConfigured ? await hasAdminAccess() : false;

  if (isPasswordConfigured && !hasAccess) {
    return (
      <AdminPasswordGate
        hasError={query?.error === "1"}
        returnTo={`/admin/leads/${encodeURIComponent(id)}`}
      />
    );
  }

  const lead = isPasswordConfigured ? await getLeadById(id) : getDemoLeadDetailById(id);

  if (!lead) {
    notFound();
  }

  const sourcePriceUsd =
    lead.catalogPrice.sourcePriceUsd ??
    (lead.catalogPrice.currency === "usd" ? lead.catalogPrice.amount : null);
  const selectedCurrencyPrice =
    lead.catalogPrice.currency === "usd" ? null : lead.catalogPrice.amount;
  const carPriceRub = getBreakdownValue(lead.breakdown, "Стоимость авто");

  return (
    <AdminShell title={`Заявка ${lead.displayNumber}`}>
      <div className="mb-4">
        <Link href="/admin" className="text-sm text-blue-600">
          ← Назад к заявкам
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Клиент</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DetailItem label="Имя" value={lead.client} />
              <div>
                <p className="text-sm text-slate-500">Телефон</p>
                <p className="flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {lead.phone || empty}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Telegram</p>
                <p className="flex items-center gap-2 font-medium">
                  <MessageCircle className="h-4 w-4 text-slate-400" />
                  {lead.telegram || empty}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Автомобиль</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailItem label="Страна покупки" value={lead.vehicle.country} />
              <DetailItem label="Марка" value={lead.vehicle.brand} />
              <DetailItem label="Модель" value={lead.vehicle.model} />
              <DetailItem label="Год выпуска" value={lead.vehicle.year ?? empty} />
              <DetailItem label="Тип двигателя" value={lead.vehicle.engineType} />
              <DetailItem
                label="Объем двигателя"
                value={formatEngineVolume(lead.vehicle.engineVolumeLiters)}
              />
              <DetailItem label="Город доставки" value={lead.vehicle.destinationCity} />
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Цена авто из каталога</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DetailItem
                label="Цена авто в USD"
                value={formatCatalogPrice(sourcePriceUsd, "usd")}
              />
              {selectedCurrencyPrice !== null ? (
                <DetailItem
                  label="Цена в валюте клиента"
                  value={formatCatalogPrice(selectedCurrencyPrice, lead.catalogPrice.currency)}
                />
              ) : null}
              <DetailItem label="Цена в рублях" value={formatRub(carPriceRub)} />
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Бюджет и итоговый расчет</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailItem label="Бюджет клиента" value={formatRub(lead.budgetSummary.budgetRub)} />
              <DetailItem label="Итоговая стоимость" value={formatRub(lead.budgetSummary.totalRub)} />
              <DetailItem
                label="Статус бюджета"
                value={formatBudgetStatus(lead.budgetSummary.budgetStatus)}
              />
              <DetailItem
                label="Разница с бюджетом"
                value={formatRub(lead.budgetSummary.budgetDeltaRub)}
              />
            </div>
            {lead.breakdown.some((row) => row.valueRub !== null) ? (
              <div className="mt-5 space-y-3 border-t pt-4">
                {lead.breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-medium text-slate-950">{formatRub(row.valueRub)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Дополнительные услуги</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {lead.services.filter((service) => service.selected).length > 0 ? (
                lead.services
                  .filter((service) => service.selected)
                  .map((service) => (
                    <span
                      key={service.key}
                      className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700"
                    >
                      {service.label}
                    </span>
                  ))
              ) : (
                <p className="text-sm text-slate-600">Не указаны</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Комментарий клиента</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
              {lead.customerComment || empty}
            </p>
          </section>

          <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-semibold text-blue-950">Резюме заявки</h2>
                <p className="mt-1 text-sm text-blue-900">
                  {lead.client || "Клиент"} интересуется авто {lead.vehicle.brand}{" "}
                  {lead.vehicle.model} {lead.vehicle.year ?? ""} из направления{" "}
                  {lead.vehicle.country}. Бюджет клиента:{" "}
                  {formatRub(lead.budgetSummary.budgetRub)}, итоговый расчет:{" "}
                  {formatRub(lead.budgetSummary.totalRub)}.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">Статус</h2>
            <span className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${leadStatusClasses[lead.status]}`}>
              {leadStatusLabels[lead.status]}
            </span>
            <select className="form-field mt-4" defaultValue={lead.status}>
              <option value="new">Новая</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершена</option>
              <option value="rejected">Отклонена</option>
            </select>
          </section>
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">Комментарий менеджера</h2>
            <textarea className="form-field mt-3 min-h-32" placeholder="Внутренний комментарий" />
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
