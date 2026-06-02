"use client";

import { useMemo, useRef, useState } from "react";
import {
  Calculator,
  Car,
  CarFront,
  ClipboardCheck,
  Headphones,
  MapPinned,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import { calculateImportCost, type CalculationInput } from "@/lib/calculate";
import {
  convertUsdPrice,
  getBrandsByCountry,
  getModelsByBrand,
  getVehicleCatalogFallback,
  type VehicleCatalogData,
} from "@/lib/vehicle-catalog";
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
  const calculatorRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => calculateImportCost(input), [input]);

  const openLeadForm = () => {
    setShowLeadForm(true);
    window.setTimeout(() => {
      leadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const scrollToCalculator = () => {
    calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const serviceItems = [
    {
      icon: CarFront,
      title: "Каталог авто",
      text: "Актуальные модели и цены",
    },
    {
      icon: ShieldCheck,
      title: "Прозрачный расчет",
      text: "Все расходы без скрытых платежей",
    },
    {
      icon: MapPinned,
      title: "Подбор маршрута",
      text: "Оптимальные пути и сроки доставки",
    },
    {
      icon: Headphones,
      title: "Поддержка менеджера",
      text: "Сопровождение на всех этапах сделки",
    },
  ];

  const workflowSteps = [
    ["01", "Выбор авто", "Подберите авто в каталоге и укажите параметры"],
    ["02", "Расчет", "Мы рассчитаем маршрут и итоговую стоимость"],
    ["03", "Заявка", "Оставьте заявку и получите консультацию менеджера"],
    ["04", "Сопровождение", "Полное сопровождение до выдачи автомобиля"],
  ];

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="wide-shell flex h-14 items-center justify-between">
          <div className="flex items-center gap-3 font-semibold text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-900 text-white">
              <Car className="h-4 w-4" />
            </span>
            <span>
              <span className="block leading-4">AutoImport</span>
              <span className="hidden text-xs font-normal text-slate-500 sm:block">
                Импорт авто без лишних рисков
              </span>
            </span>
          </div>
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
            <a href="/admin" className="hover:text-cyan-800">
              Админка
            </a>
          </nav>
        </div>
      </header>

      <section
        className="relative overflow-hidden bg-cyan-950 text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(3, 22, 35, 0.94) 0%, rgba(5, 38, 54, 0.86) 34%, rgba(5, 38, 54, 0.52) 62%, rgba(3, 22, 35, 0.78) 100%), url('/images/autoimport-hero-neutral-cars.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(20,184,166,0.18),transparent_26rem)]" />
        <div className="wide-shell relative pb-28 pt-10 lg:pb-28 lg:pt-14">
          <div className="max-w-4xl">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Импорт автомобилей из Кореи, Китая и Европы
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-cyan-50/90 md:text-lg">
              Проверьте маршрут, бюджет и предварительную стоимость поставки под ключ.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToCalculator}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-md border border-teal-300/60 bg-teal-500 px-7 text-sm font-semibold text-white shadow-lg shadow-teal-950/30 transition hover:bg-teal-400"
              >
                <Calculator className="h-5 w-5" />
                Рассчитать стоимость
              </button>
              <button
                type="button"
                onClick={openLeadForm}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-md border border-white/80 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <PencilLine className="h-5 w-5" />
                Оставить заявку
              </button>
            </div>

            <div className="mt-8 grid max-w-4xl gap-x-7 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {serviceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-3"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-cyan-50 backdrop-blur">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block whitespace-nowrap text-sm font-semibold">
                        {item.title}
                      </span>
                      <span className="block text-xs leading-5 text-cyan-50/72">{item.text}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={calculatorRef}
        className="wide-shell -mt-20 grid items-stretch gap-5 pb-5 lg:grid-cols-[minmax(0,1fr)_440px]"
      >
        <div className="relative flex">
          <CalculatorForm
            catalog={safeCatalog}
            value={input}
            onChange={setInput}
            onSubmit={openLeadForm}
          />
        </div>
        <div className="relative flex">
          <CalculationResult input={input} result={result} />
        </div>
      </section>

      <section className="wide-shell pb-8">
        <div className="case-panel grid gap-4 p-5 md:grid-cols-[120px_repeat(4,minmax(0,1fr))] md:items-center md:p-6">
          <p className="case-label text-cyan-800">Как мы работаем</p>
          {workflowSteps.map(([number, title, text], index) => (
            <div key={number} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-900 text-white">
                {index === 0 ? (
                  <Car className="h-5 w-5" />
                ) : index === 1 ? (
                  <Calculator className="h-5 w-5" />
                ) : index === 2 ? (
                  <ClipboardCheck className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </span>
              <span>
                <span className="tabular text-lg font-semibold text-slate-400">{number}</span>
                <span className="ml-3 font-semibold text-slate-950">{title}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section ref={leadRef} className="wide-shell pb-8">
        {showLeadForm ? (
          <div>
            <LeadForm input={input} result={result} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
