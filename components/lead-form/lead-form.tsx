"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { submitLeadAction, type SubmitLeadState } from "@/app/actions";
import type { CalculationBreakdown, CalculationInput } from "@/lib/calculate";
import { Button } from "@/components/ui/button";

type Props = {
  input: CalculationInput;
  result: CalculationBreakdown;
};

export function LeadForm({ input, result }: Props) {
  const [submitState, setSubmitState] = useState<SubmitLeadState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (submitState?.ok) {
    return (
      <section className="rounded-lg border bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-3 text-xl font-semibold text-slate-950">Заявка принята</h2>
        <p className="mt-2 text-sm text-slate-600">
          Менеджер проверит расчет и свяжется с вами.
        </p>
      </section>
    );
  }

  return (
    <section id="lead-form" className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">Оставить заявку</h2>
        <p className="text-sm text-slate-500">Менеджер проверит расчет и свяжется с вами.</p>
      </div>

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
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setSubmitState(null);

          const formData = new FormData(event.currentTarget);
          const response = await submitLeadAction({
            customerName: String(formData.get("customerName") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            telegram: String(formData.get("telegram") ?? ""),
            comment: String(formData.get("comment") ?? ""),
            calculationInput: input,
            calculationBreakdown: result,
          });

          setSubmitState(response);
          setIsSubmitting(false);
        }}
      >
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Имя
          <input
            className="form-field"
            name="customerName"
            placeholder="Иван Иванов"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Телефон
          <input
            className="form-field"
            name="phone"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Telegram
          <input className="form-field" name="telegram" placeholder="@username" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Комментарий
          <textarea
            className="form-field min-h-28"
            name="comment"
            placeholder="Пожелания по срокам, комплектации или оплате"
          />
        </label>
        {submitState && !submitState.ok ? (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Не удалось сохранить заявку: {submitState.error}</p>
          </div>
        ) : null}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSubmitting ? "Отправляем..." : "Отправить заявку"}
        </Button>
      </form>
    </section>
  );
}
