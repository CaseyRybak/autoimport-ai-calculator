import { CheckCircle2, CircleAlert, Sparkles } from "lucide-react";
import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { Button } from "@/components/ui/button";

type Props = {
  input: CalculationInput;
  result: CalculationBreakdown;
  onLeadClick: () => void;
};

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const countryLabel: Record<CalculationInput["country"], string> = {
  korea: "Корея",
  china: "Китай",
  europe: "Европа",
};

export function CalculationResult({ input, result, onLeadClick }: Props) {
  const isWithinBudget = result.budgetStatus === "within_budget";
  const rows = [
    ["Стоимость авто в рублях", result.carPriceRub],
    ["Демо-пошлина", result.customsFeeRub],
    ["Демо-утилизационный сбор", result.recycleFeeRub],
    ["Логистика", result.logisticsRub],
    ["Комиссия компании", result.companyFeeRub],
    ["Дополнительные расходы", result.extraCostsRub],
  ];

  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <div className="rounded-t-lg bg-slate-950 p-5 text-white md:p-6">
        <p className="text-sm text-blue-200">Результат расчета</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {input.brand} {input.model} {input.year}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {countryLabel[input.country]} to {input.destinationCity}
            </p>
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              isWithinBudget ? "bg-emerald-500/15 text-emerald-100" : "bg-red-500/15 text-red-100"
            }`}
          >
            {isWithinBudget ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
            {isWithinBudget ? "В бюджете" : "Выше бюджета"}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <div>
          <p className="text-sm text-slate-500">Итого под ключ</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-blue-600">
            {rub.format(result.totalRub)}
          </p>
          <p className={`mt-2 text-sm ${isWithinBudget ? "text-emerald-700" : "text-red-700"}`}>
            {isWithinBudget ? "Запас бюджета" : "Превышение бюджета"}:{" "}
            {rub.format(Math.abs(result.budgetDeltaRub))}
          </p>
        </div>

        <div className="space-y-3 border-t pt-5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-medium text-slate-950">{rub.format(Number(value))}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 border-t pt-3">
            <span className="font-semibold text-slate-950">Итого</span>
            <span className="text-lg font-bold text-blue-600">{rub.format(result.totalRub)}</span>
          </div>
        </div>

        <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="text-sm text-blue-950">
              <p className="font-semibold">AI-ready explanation</p>
              <p className="mt-1">
                Основная стоимость складывается из цены авто, демо-таможенных платежей,
                логистики, комиссии и выбранных услуг. Реальная интеграция OpenAI будет
                добавлена после подключения API.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-slate-50 p-4">
          <h3 className="font-semibold text-slate-950">Хотите точный расчет?</h3>
          <p className="mt-1 text-sm text-slate-600">
            Это портфолио-демо с приблизительными коэффициентами. Для реального проекта
            нужны актуальные ставки и ручная проверка менеджером.
          </p>
          <Button className="mt-4" onClick={onLeadClick}>
            Оставить заявку
          </Button>
        </div>
      </div>
    </section>
  );
}
