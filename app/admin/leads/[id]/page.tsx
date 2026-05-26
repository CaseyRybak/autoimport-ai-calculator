import Link from "next/link";
import { MessageCircle, Phone, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { mockLeads, statusClasses, statusLabels } from "@/components/admin/mock-data";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const lead = mockLeads.find((item) => item.id === id) ?? mockLeads[0];

  return (
    <AdminShell title={`Заявка #${lead.id}`}>
      <div className="mb-4">
        <Link href="/admin" className="text-sm text-blue-600">
          ← Назад к заявкам
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Клиент</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Имя</p>
                <p className="font-medium">{lead.client}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Телефон</p>
                <p className="flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {lead.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Telegram</p>
                <p className="flex items-center gap-2 font-medium">
                  <MessageCircle className="h-4 w-4 text-slate-400" />
                  {lead.telegram}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Автомобиль и расчет</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Авто</p>
                <p className="font-medium">{lead.car}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Страна</p>
                <p className="font-medium">{lead.country}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Бюджет</p>
                <p className="font-medium">{lead.budget.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Расчет</p>
                <p className="font-medium">{lead.total.toLocaleString("ru-RU")} ₽</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <h2 className="font-semibold text-blue-950">AI-summary placeholder</h2>
                <p className="mt-1 text-sm text-blue-900">
                  Здесь будет краткое резюме заявки и черновик сообщения клиенту после
                  подключения OpenAI API.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">Статус</h2>
            <span className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${statusClasses[lead.status]}`}>
              {statusLabels[lead.status]}
            </span>
            <select className="form-field mt-4" defaultValue={lead.status}>
              <option value="new">Новая</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершена</option>
              <option value="rejected">Отклонена</option>
            </select>
          </section>
          <section className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">Комментарий менеджера</h2>
            <textarea className="form-field mt-3 min-h-32" placeholder="Внутренний комментарий" />
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
