import Link from "next/link";
import { BarChart3, Eye, Settings, Users } from "lucide-react";
import { mockLeads, statusClasses, statusLabels } from "@/components/admin/mock-data";
import { Button } from "@/components/ui/button";

export function AdminPreview() {
  const avgBudget = Math.round(
    mockLeads.reduce((sum, lead) => sum + lead.budget, 0) / mockLeads.length,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Демо-админка</p>
          <h2 className="text-2xl font-semibold text-slate-950">Заявки и настройки расчета</h2>
          <p className="mt-1 text-sm text-slate-600">
            Заготовка рабочего места менеджера: список заявок, карточка заявки, настройки.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">Открыть админку</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <Users className="h-5 w-5 text-blue-600" />
          <p className="mt-3 text-2xl font-semibold">{mockLeads.length}</p>
          <p className="text-sm text-slate-500">Демо-заявки</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <p className="mt-3 text-2xl font-semibold">{(avgBudget / 1_000_000).toFixed(1)}М ₽</p>
          <p className="text-sm text-slate-500">Средний бюджет</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <Settings className="h-5 w-5 text-slate-600" />
          <p className="mt-3 text-2xl font-semibold">Demo</p>
          <p className="text-sm text-slate-500">Формулы и курсы</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Клиент</th>
                <th className="px-4 py-3">Авто</th>
                <th className="px-4 py-3">Бюджет</th>
                <th className="px-4 py-3">Итого</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 text-slate-600">{lead.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-950">{lead.client}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.car}</td>
                  <td className="px-4 py-3">{(lead.budget / 1_000_000).toFixed(1)}М ₽</td>
                  <td className="px-4 py-3">{(lead.total / 1_000_000).toFixed(1)}М ₽</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusClasses[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="inline-flex items-center gap-1 text-blue-600">
                      <Eye className="h-4 w-4" />
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
