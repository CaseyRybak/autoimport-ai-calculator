"use client";

import { Calculator, CheckSquare, RotateCcw } from "lucide-react";
import type { CalculationInput } from "@/lib/calculate";
import { Button } from "@/components/ui/button";

type Props = {
  value: CalculationInput;
  onChange: (value: CalculationInput) => void;
  onSubmit: () => void;
};

const countries = [
  ["korea", "Корея"],
  ["china", "Китай"],
  ["europe", "Европа"],
] as const;

const currencies = [
  ["usd", "USD"],
  ["eur", "EUR"],
  ["cny", "CNY"],
  ["krw", "KRW"],
] as const;

const engineTypes = [
  ["gasoline", "Бензин"],
  ["diesel", "Дизель"],
  ["hybrid", "Гибрид"],
  ["electric", "Электро"],
] as const;

export function CalculatorForm({ value, onChange, onSubmit }: Props) {
  const update = <K extends keyof CalculationInput>(
    key: K,
    nextValue: CalculationInput[K],
  ) => onChange({ ...value, [key]: nextValue });

  return (
    <section id="calculator" className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-blue-50 p-2 text-blue-600">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Калькулятор стоимости</h2>
            <p className="text-sm text-slate-500">Демо-оценка импорта под ключ</p>
          </div>
        </div>
        <CheckSquare className="hidden h-5 w-5 text-emerald-600 sm:block" />
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Страна покупки
            <select
              className="form-field"
              value={value.country}
              onChange={(event) => update("country", event.target.value as CalculationInput["country"])}
            >
              {countries.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Марка
            <input
              className="form-field"
              value={value.brand}
              onChange={(event) => update("brand", event.target.value)}
              placeholder="Toyota"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Модель
            <input
              className="form-field"
              value={value.model}
              onChange={(event) => update("model", event.target.value)}
              placeholder="Camry"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Год выпуска
            <input
              className="form-field"
              type="number"
              min={1990}
              max={2026}
              value={value.year}
              onChange={(event) => update("year", Number(event.target.value))}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Тип двигателя
            <select
              className="form-field"
              value={value.engineType}
              onChange={(event) =>
                update("engineType", event.target.value as CalculationInput["engineType"])
              }
            >
              {engineTypes.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Объем двигателя, л
            <input
              className="form-field"
              type="number"
              min={0}
              max={8}
              step={0.1}
              value={value.engineVolumeLiters}
              onChange={(event) => update("engineVolumeLiters", Number(event.target.value))}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Цена авто за рубежом
            <input
              className="form-field"
              type="number"
              min={1}
              value={value.carPrice}
              onChange={(event) => update("carPrice", Number(event.target.value))}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Валюта
            <select
              className="form-field"
              value={value.currency}
              onChange={(event) => update("currency", event.target.value as CalculationInput["currency"])}
            >
              {currencies.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Бюджет клиента, ₽
            <input
              className="form-field"
              type="number"
              min={1}
              value={value.budgetRub}
              onChange={(event) => update("budgetRub", Number(event.target.value))}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Город доставки
            <input
              className="form-field"
              value={value.destinationCity}
              onChange={(event) => update("destinationCity", event.target.value)}
              placeholder="Москва"
              required
            />
          </label>
        </div>

        <div className="rounded-md border bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-900">Дополнительные услуги</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["includeCarrier", "Автовоз"],
              ["includeInsurance", "Страховка"],
              ["includeCertificates", "СБКТС/ЭПТС"],
              ["includeBroker", "Брокер"],
              ["includeDelivery", "Доставка до города"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={Boolean(value[key as keyof CalculationInput])}
                  onChange={(event) =>
                    update(key as keyof CalculationInput, event.target.checked as never)
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" className="flex-1">
            Рассчитать
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="h-4 w-4" />
            Сбросить
          </Button>
        </div>
      </form>
    </section>
  );
}
