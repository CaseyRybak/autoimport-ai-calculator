import { CheckCircle2, CircleAlert, FileCheck2, ReceiptText, Ship } from "lucide-react";
import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { InfoAlert } from "@/components/ui/info-alert";

type Props = {
  input: CalculationInput;
  result: CalculationBreakdown;
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

export function CalculationResult({ input, result }: Props) {
  const isWithinBudget = result.budgetStatus === "within_budget";
  const rows = [
    ["Стоимость авто в рублях", result.carPriceRub],
    ["Таможенные платежи", result.customsFeeRub],
    ["Утилизационный сбор", result.recycleFeeRub],
    ["Логистика", result.logisticsRub],
    ["Комиссия компании", result.companyFeeRub],
    ["Дополнительные расходы", result.extraCostsRub],
  ];

  return (
    <section className="case-panel flex h-full w-full flex-col overflow-hidden shadow-xl shadow-slate-900/10">
      <div className="border-b border-cyan-950 bg-cyan-950 p-5 text-white md:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="case-label text-cyan-100/70">Расчет стоимости</p>
          <ReceiptText className="h-5 w-5 text-teal-300" />
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {input.brand} {input.model} {input.year}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-cyan-50/80">
              <Ship className="h-4 w-4 text-teal-300" />
              {countryLabel[input.country]} {"->"} {input.destinationCity}
            </p>
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              isWithinBudget ? "bg-teal-500/15 text-teal-100" : "bg-white/10 text-cyan-100"
            }`}
          >
            {isWithinBudget ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <CircleAlert className="h-4 w-4" />
            )}
            {isWithinBudget ? "В бюджете" : "Выше бюджета"}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-6 p-5 md:p-6">
        <div>
          <p className="case-label">Итого под ключ</p>
          <p className="tabular mt-2 text-4xl font-black tracking-tight text-cyan-800">
            {rub.format(result.totalRub)}
          </p>
          <p className={`mt-2 text-sm ${isWithinBudget ? "text-teal-700" : "text-slate-500"}`}>
            {isWithinBudget ? "Запас бюджета" : "Превышение бюджета"}:{" "}
            {rub.format(Math.abs(result.budgetDeltaRub))}
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-300 pt-5">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-dashed border-slate-300 pb-2 text-sm"
            >
              <span className="text-slate-600">{label}</span>
              <span className="tabular font-medium text-slate-950">{rub.format(Number(value))}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="font-semibold text-slate-950">Итого</span>
            <span className="tabular text-lg font-bold text-cyan-800">
              {rub.format(result.totalRub)}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-teal-200 bg-teal-50/80 p-4">
          <div className="flex gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
            <div className="text-sm text-teal-950">
              <p className="font-semibold">Объяснение расчета</p>
              <p className="mt-1">
                Основная стоимость складывается из цены авто, таможенных платежей,
                логистики, комиссии и выбранных услуг.
              </p>
            </div>
          </div>
        </div>

        <InfoAlert>
          Расчет предварительный. Финальная стоимость уточняется менеджером по актуальным ставкам.
        </InfoAlert>
      </div>
    </section>
  );
}
