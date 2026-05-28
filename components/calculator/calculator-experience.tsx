"use client";

import { useMemo, useRef, useState } from "react";
import { Car, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { calculateImportCost, type CalculationInput } from "@/lib/calculate";
import {
  convertUsdPrice,
  getBrandsByCountry,
  getModelsByBrand,
  getVehicleCatalogFallback,
  type VehicleCatalogData,
} from "@/lib/vehicle-catalog";
import { InfoAlert } from "@/components/ui/info-alert";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { CalculationResult } from "@/components/result/calculation-result";
import { LeadForm } from "@/components/lead-form/lead-form";

const createInitialInput = (catalog: VehicleCatalogData): CalculationInput => {
  const country = catalog.brands[0]?.country ?? "korea";
  const brand = getBrandsByCountry(catalog, country)[0];
  const model = brand ? getModelsByBrand(catalog, brand.id)[0] : null;
  const variant = model
    ? catalog.variants
        .filter((item) => item.modelId === model.id)
        .sort((a, b) => b.year - a.year)[0]
    : null;

  return {
    country,
    brand: brand?.name ?? "",
    model: model?.name ?? "",
    year: variant?.year ?? 2022,
    engineType: variant?.engineType ?? "gasoline",
    engineVolumeLiters: variant?.engineVolumeLiters ?? 2,
    carPrice: variant ? convertUsdPrice(variant.sourcePriceUsd, "usd") : 25_000,
    currency: "usd",
    catalogVariantId: variant?.id,
    sourcePriceUsd: variant?.sourcePriceUsd,
    budgetRub: 3_000_000,
    destinationCity: "Москва",
    includeCarrier: true,
    includeInsurance: true,
    includeCertificates: true,
    includeBroker: false,
    includeDelivery: false,
  };
};

type Props = {
  catalog: VehicleCatalogData;
};

export function CalculatorExperience({ catalog }: Props) {
  const safeCatalog = catalog.brands.length > 0 ? catalog : getVehicleCatalogFallback(catalog.error);
  const [input, setInput] = useState<CalculationInput>(() => createInitialInput(safeCatalog));
  const [showLeadForm, setShowLeadForm] = useState(false);
  const leadRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => calculateImportCost(input), [input]);

  const openLeadForm = () => {
    setShowLeadForm(true);
    window.setTimeout(() => {
      leadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <main>
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="section-shell flex h-12 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-950">
            <Car className="h-5 w-5 text-blue-600" />
            AutoImport AI
          </div>
          <nav className="hidden items-center gap-5 text-sm text-slate-600 md:flex">
            <a href="/admin" className="hover:text-blue-600">
              Админка
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b bg-white">
        <div className="section-shell grid gap-5 py-5 lg:grid-cols-[1fr_320px] lg:py-6">
          <div className="flex flex-col justify-center">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-md border bg-slate-50 px-3 py-1 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Портфолио-MVP: готово к Supabase и OpenAI
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Калькулятор импорта авто под ключ
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Первая версия сервиса для оценки бюджета, сбора заявок и демонстрации
              рабочего процесса менеджера. Формулы намеренно демонстрационные.
            </p>
          </div>

          <div className="rounded-lg border bg-slate-950 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">Демо-результат</p>
              <SlidersHorizontal className="h-4 w-4 text-blue-300" />
            </div>
            <p className="mt-3 text-2xl font-bold">{result.totalRub.toLocaleString("ru-RU")} ₽</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-white/10 p-2">
                <p className="text-slate-300">Логистика</p>
                <p className="mt-1 font-semibold">{result.logisticsRub.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div className="rounded-md bg-white/10 p-2">
                <p className="text-slate-300">Комиссия</p>
                <p className="mt-1 font-semibold">{result.companyFeeRub.toLocaleString("ru-RU")} ₽</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Визуальная структура перенесена из Figma-референса, код реализован как компоненты Next.js.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <CalculatorForm
          catalog={safeCatalog}
          value={input}
          onChange={setInput}
          onSubmit={openLeadForm}
        />
        <div>
          <CalculationResult input={input} result={result} onLeadClick={openLeadForm} />
        </div>
      </section>

      <section ref={leadRef} className="section-shell pb-8">
        {showLeadForm ? (
          <div className="space-y-4">
            <InfoAlert>
              Демо-режим: данные пока не сохраняются в базу. Форма показывает будущий сценарий
              отправки заявки в Supabase.
            </InfoAlert>
            <LeadForm input={input} result={result} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
