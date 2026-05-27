"use client";

import { Calculator, CheckSquare, RotateCcw } from "lucide-react";
import type { CalculationInput } from "@/lib/calculate";
import {
  convertUsdPrice,
  findCatalogVariant,
  getAvailableEngineTypes,
  getAvailableEngineVolumes,
  getAvailableYears,
  getBrandsByCountry,
  getCatalogCountries,
  getModelsByBrand,
  type VehicleCatalogData,
} from "@/lib/vehicle-catalog";
import { Button } from "@/components/ui/button";

type Props = {
  catalog: VehicleCatalogData;
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
  ["rub", "RUB"],
  ["eur", "EUR"],
  ["cny", "CNY"],
] as const;

const engineTypes = [
  ["gasoline", "Бензин"],
  ["diesel", "Дизель"],
  ["hybrid", "Гибрид"],
  ["electric", "Электро"],
] as const;

const countryLabels = Object.fromEntries(countries) as Record<CalculationInput["country"], string>;
const currencyLabels = Object.fromEntries(currencies) as Record<CalculationInput["currency"], string>;
const engineTypeLabels = Object.fromEntries(engineTypes) as Record<
  CalculationInput["engineType"],
  string
>;

const formatMoney = (value: number, currency: CalculationInput["currency"]) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value) + ` ${currencyLabels[currency]}`;

const formatEngineVolume = (value: number) => (value === 0 ? "Электро" : `${value.toFixed(1)} л`);

export function CalculatorForm({ catalog, value, onChange, onSubmit }: Props) {
  const update = <K extends keyof CalculationInput>(
    key: K,
    nextValue: CalculationInput[K],
  ) => onChange({ ...value, [key]: nextValue });
  const catalogCountries = getCatalogCountries(catalog);
  const availableCountries: CalculationInput["country"][] =
    catalogCountries.length > 0 ? catalogCountries : ["korea"];
  const brands = getBrandsByCountry(catalog, value.country);
  const selectedBrand = brands.find((brand) => brand.name === value.brand) ?? brands[0] ?? null;
  const models = selectedBrand ? getModelsByBrand(catalog, selectedBrand.id) : [];
  const selectedModel = models.find((model) => model.name === value.model) ?? models[0] ?? null;
  const years = selectedModel ? getAvailableYears(catalog, selectedModel.id) : [];
  const selectedYear = years.includes(value.year) ? value.year : years[0];
  const availableEngineTypes =
    selectedModel && selectedYear
      ? getAvailableEngineTypes(catalog, selectedModel.id, selectedYear)
      : [];
  const selectedEngineType = availableEngineTypes.includes(value.engineType)
    ? value.engineType
    : availableEngineTypes[0];
  const volumes =
    selectedModel && selectedYear && selectedEngineType
      ? getAvailableEngineVolumes(catalog, selectedModel.id, selectedYear, selectedEngineType)
      : [];
  const selectedVolume = volumes.includes(value.engineVolumeLiters)
    ? value.engineVolumeLiters
    : volumes[0];
  const selectedVariant =
    selectedModel && selectedYear && selectedEngineType && selectedVolume !== undefined
      ? findCatalogVariant(
          catalog,
          selectedModel.id,
          selectedYear,
          selectedEngineType,
          selectedVolume,
        )
      : undefined;
  const hasCatalogOptions = Boolean(selectedVariant);

  const updateFromCatalogSelection = ({
    country = value.country,
    brandId,
    modelId,
    year,
    engineType,
    engineVolumeLiters,
    currency = value.currency,
  }: {
    country?: CalculationInput["country"];
    brandId?: string;
    modelId?: string;
    year?: number;
    engineType?: CalculationInput["engineType"];
    engineVolumeLiters?: number;
    currency?: CalculationInput["currency"];
  }) => {
    const effectiveBrandId = brandId ?? selectedBrand?.id;
    const nextBrand = getBrandsByCountry(catalog, country).find((brand) => brand.id === effectiveBrandId) ??
      getBrandsByCountry(catalog, country)[0] ??
      null;
    const effectiveModelId = modelId ?? selectedModel?.id;
    const nextModel = nextBrand
      ? getModelsByBrand(catalog, nextBrand.id).find((model) => model.id === effectiveModelId) ??
        getModelsByBrand(catalog, nextBrand.id)[0] ??
        null
      : null;
    const nextYears = nextModel ? getAvailableYears(catalog, nextModel.id) : [];
    const nextYear = year && nextYears.includes(year) ? year : nextYears[0];
    const nextEngineTypes =
      nextModel && nextYear ? getAvailableEngineTypes(catalog, nextModel.id, nextYear) : [];
    const nextEngineType =
      engineType && nextEngineTypes.includes(engineType) ? engineType : nextEngineTypes[0];
    const nextVolumes =
      nextModel && nextYear && nextEngineType
        ? getAvailableEngineVolumes(catalog, nextModel.id, nextYear, nextEngineType)
        : [];
    const nextVolume =
      engineVolumeLiters !== undefined && nextVolumes.includes(engineVolumeLiters)
        ? engineVolumeLiters
        : nextVolumes[0];
    const nextVariant =
      nextModel && nextYear && nextEngineType && nextVolume !== undefined
        ? findCatalogVariant(catalog, nextModel.id, nextYear, nextEngineType, nextVolume)
        : undefined;

    onChange({
      ...value,
      country,
      brand: nextBrand?.name ?? "",
      model: nextModel?.name ?? "",
      year: nextVariant?.year ?? nextYear ?? value.year,
      engineType: nextVariant?.engineType ?? nextEngineType ?? value.engineType,
      engineVolumeLiters: nextVariant?.engineVolumeLiters ?? nextVolume ?? value.engineVolumeLiters,
      carPrice: nextVariant ? convertUsdPrice(nextVariant.sourcePriceUsd, currency) : value.carPrice,
      currency,
      catalogVariantId: nextVariant?.id,
      sourcePriceUsd: nextVariant?.sourcePriceUsd,
    });
  };

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
              onChange={(event) =>
                updateFromCatalogSelection({
                  country: event.target.value as CalculationInput["country"],
                })
              }
            >
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {countryLabels[country]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Марка
            <select
              className="form-field"
              value={selectedBrand?.id ?? ""}
              onChange={(event) => updateFromCatalogSelection({ brandId: event.target.value })}
              disabled={brands.length === 0}
              required
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Модель
            <select
              className="form-field"
              value={selectedModel?.id ?? ""}
              onChange={(event) => updateFromCatalogSelection({ modelId: event.target.value })}
              disabled={models.length === 0}
              required
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Год выпуска
            <select
              className="form-field"
              value={selectedYear ?? ""}
              onChange={(event) => updateFromCatalogSelection({ year: Number(event.target.value) })}
              disabled={years.length === 0}
              required
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Тип двигателя
            <select
              className="form-field"
              value={selectedEngineType ?? ""}
              onChange={(event) =>
                updateFromCatalogSelection({
                  engineType: event.target.value as CalculationInput["engineType"],
                })
              }
              disabled={availableEngineTypes.length === 0}
            >
              {availableEngineTypes.map((engineType) => (
                <option key={engineType} value={engineType}>
                  {engineTypeLabels[engineType]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Объем двигателя, л
            <select
              className="form-field"
              value={selectedVolume ?? ""}
              onChange={(event) =>
                updateFromCatalogSelection({ engineVolumeLiters: Number(event.target.value) })
              }
              disabled={volumes.length === 0}
            >
              {volumes.map((volume) => (
                <option key={volume} value={volume}>
                  {formatEngineVolume(volume)}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 text-sm font-medium text-slate-700">
            Цена авто по каталогу
            <div className="min-h-[40px] rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-950">
              {selectedVariant ? (
                <span className="font-semibold">{formatMoney(value.carPrice, value.currency)}</span>
              ) : (
                <span className="text-slate-500">Нет доступного варианта</span>
              )}
            </div>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Валюта
            <select
              className="form-field"
              value={value.currency}
              onChange={(event) =>
                updateFromCatalogSelection({
                  currency: event.target.value as CalculationInput["currency"],
                })
              }
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

        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Каталог авто</p>
          <p className="mt-1">
            {catalog.source === "supabase"
              ? "Список авто загружен из Supabase Vehicle Catalog."
              : "Supabase catalog недоступен, поэтому показан локальный demo fallback."}
          </p>
          {catalog.error ? <p className="mt-1">Причина fallback: {catalog.error}</p> : null}
          <p className="mt-1">
            Demo catalog prices are placeholders. Реальные коммерческие цены требуют
            источника, даты проверки и проверки менеджером.
          </p>
          {!hasCatalogOptions ? (
            <p className="mt-2 font-medium">Для выбранной комбинации нет активного варианта.</p>
          ) : null}
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
