"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";

type Props = {
  input: CalculationInput;
  result: CalculationBreakdown;
};

export function LeadForm({ input, result }: Props) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section className="rounded-lg border bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-3 text-xl font-semibold text-slate-950">Заявка принята в демо-режиме</h2>
        <p className="mt-2 text-sm text-slate-600">
          Данные пока не сохраняются в базу. В следующей версии форма будет отправлять
          заявку в Supabase.
        </p>
      </section>
    );
  }

  return (
    <section id="lead-form" className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">Оставить заявку</h2>
        <p className="text-sm text-slate-500">Менеджер проверит расчет и свяжется с клиентом</p>
      </div>

      <InfoAlert className="mb-5">
        Демо-режим: данные пока не сохраняются в базу.
      </InfoAlert>

      <div className="mb-5 rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
        <p className="font-semibold">
          {input.brand} {input.model} {input.year}
        </p>
        <p className="mt-1">
          Расчетная стоимость: {result.totalRub.toLocaleString("ru-RU")} ₽
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Имя
          <input className="form-field" placeholder="Иван Иванов" required />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Телефон
          <input className="form-field" type="tel" placeholder="+7 (999) 123-45-67" required />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Telegram
          <input className="form-field" placeholder="@username" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Комментарий
          <textarea className="form-field min-h-28" placeholder="Пожелания по срокам, комплектации или оплате" />
        </label>
        <Button type="submit" className="w-full" size="lg">
          <Send className="h-4 w-4" />
          Отправить заявку
        </Button>
      </form>
    </section>
  );
}
