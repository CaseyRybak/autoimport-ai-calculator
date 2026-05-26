import { Save } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DEMO_CALCULATION_SETTINGS } from "@/lib/calculate";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const settings = DEMO_CALCULATION_SETTINGS;

  return (
    <AdminShell title="Настройки калькулятора">
      <div className="max-w-4xl space-y-5">
        <section className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Курсы валют</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {Object.entries(settings.exchangeRates).map(([currency, value]) => (
              <label key={currency} className="space-y-2 text-sm font-medium uppercase text-slate-700">
                {currency} to RUB
                <input className="form-field" type="number" defaultValue={value} />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Демо-платежи</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Демо-пошлина, %
              <input className="form-field" type="number" defaultValue={settings.customsDutyRate * 100} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Демо-утилизационный сбор, ₽
              <input className="form-field" type="number" defaultValue={settings.recycleFeeRub} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Комиссия компании, %
              <input className="form-field" type="number" defaultValue={settings.companyFeeRate * 100} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Фиксированная комиссия, ₽
              <input className="form-field" type="number" defaultValue={settings.companyFixedFeeRub} />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          Реальные таможенные формулы не реализованы. Все значения на этой странице нужны
          только для демонстрации архитектуры MVP.
        </section>

        <Button>
          <Save className="h-4 w-4" />
          Сохранить настройки
        </Button>
      </div>
    </AdminShell>
  );
}
