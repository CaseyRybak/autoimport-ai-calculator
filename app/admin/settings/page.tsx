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
                {currency} {"->"} RUB
                <input className="form-field" type="number" defaultValue={value} />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Платежи</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Таможенные платежи, %
              <input className="form-field" type="number" defaultValue={settings.customsDutyRate * 100} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Утилизационный сбор, ₽
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

        <Button disabled title="Изменение настроек ограничено правами доступа">
          <Save className="h-4 w-4" />
          Сохранить настройки
        </Button>
      </div>
    </AdminShell>
  );
}
