"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, Car, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { calculateImportCost, type CalculationInput } from "@/lib/calculate";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { CalculationResult } from "@/components/result/calculation-result";
import { LeadForm } from "@/components/lead-form/lead-form";
import { AdminPreview } from "@/components/admin/admin-preview";

const initialInput: CalculationInput = {
  country: "korea",
  brand: "Toyota",
  model: "Camry",
  year: 2022,
  engineType: "gasoline",
  engineVolumeLiters: 2.5,
  carPrice: 25000,
  currency: "usd",
  budgetRub: 3_000_000,
  destinationCity: "Москва",
  includeCarrier: true,
  includeInsurance: true,
  includeCertificates: true,
  includeBroker: false,
  includeDelivery: false,
};

export function CalculatorExperience() {
  const [input, setInput] = useState<CalculationInput>(initialInput);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => calculateImportCost(input), [input]);

  const scrollToResult = () => {
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openLeadForm = () => {
    setShowLeadForm(true);
    window.setTimeout(() => {
      leadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <main>
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="section-shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-950">
            <Car className="h-6 w-6 text-blue-600" />
            AutoImport AI
          </div>
          <nav className="hidden items-center gap-5 text-sm text-slate-600 md:flex">
            <a href="#calculator" className="hover:text-blue-600">
              Калькулятор
            </a>
            <a href="#admin-preview" className="hover:text-blue-600">
              Админка
            </a>
            <a href="#lead-form" className="hover:text-blue-600">
              Заявка
            </a>
          </nav>
        </div>
      </header>

      <section className="border-b bg-white">
        <div className="section-shell grid gap-8 py-10 lg:grid-cols-[1fr_420px] lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border bg-slate-50 px-3 py-1 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Портфолио-MVP: готово к Supabase и OpenAI
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Калькулятор импорта авто под ключ
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Первая версия сервиса для оценки бюджета, сбора заявок и демонстрации
              рабочего процесса менеджера. Формулы намеренно демонстрационные.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })}>
                Рассчитать стоимость
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={openLeadForm}>
                Оставить заявку
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">Демо-результат</p>
              <SlidersHorizontal className="h-5 w-5 text-blue-300" />
            </div>
            <p className="mt-6 text-4xl font-bold">{result.totalRub.toLocaleString("ru-RU")} ₽</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-slate-300">Логистика</p>
                <p className="mt-1 font-semibold">{result.logisticsRub.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-slate-300">Комиссия</p>
                <p className="mt-1 font-semibold">{result.companyFeeRub.toLocaleString("ru-RU")} ₽</p>
              </div>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-400">
              Визуальная структура перенесена из Figma-референса, код реализован как компоненты Next.js.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <CalculatorForm value={input} onChange={setInput} onSubmit={scrollToResult} />
        <div ref={resultRef}>
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

      <section id="admin-preview" className="border-t bg-white py-8">
        <div className="section-shell">
          <AdminPreview />
        </div>
      </section>
    </main>
  );
}
