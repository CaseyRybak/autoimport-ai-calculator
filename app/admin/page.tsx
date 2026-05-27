import Link from "next/link";
import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { InfoAlert } from "@/components/ui/info-alert";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import { demoLeads } from "@/lib/lead-demo";
import {
  getLeadsWithDebug,
  leadStatusClasses,
  leadStatusLabels,
  type LeadReadDebug,
} from "@/lib/leads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: Promise<{
    error?: string;
    returnTo?: string;
  }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const isPasswordConfigured = isAdminPasswordConfigured();
  const hasAccess = isPasswordConfigured ? await hasAdminAccess() : false;

  if (isPasswordConfigured && !hasAccess) {
    return (
      <AdminPasswordGate
        hasError={params?.error === "1"}
        returnTo={params?.returnTo?.startsWith("/admin") ? params.returnTo : "/admin"}
      />
    );
  }

  const readResult = isPasswordConfigured
    ? await getLeadsWithDebug()
    : {
        leads: demoLeads,
        debug: {
          serviceRoleClientAvailable: false,
          adminClientUsesServiceRoleEnv: false,
          adminClientKeyPrefix: null,
          adminReadFunction: "admin-page:demoFallbackNoPassword",
          getLeadsSource: "mock",
          supabaseRowsCount: null,
          supabaseErrorCode: null,
          supabaseErrorMessage: null,
        } satisfies LeadReadDebug,
      };
  const leads = readResult.leads;
  const avgBudget =
    leads.length > 0
      ? leads.reduce((sum, lead) => sum + lead.budget, 0) / leads.length
      : 0;

  return (
    <AdminShell title="Заявки">
      {!isPasswordConfigured ? (
        <InfoAlert className="mb-5">
          Demo mode: `ADMIN_DEMO_PASSWORD` не задан, поэтому админка показывает только
          демо-заявки и не читает реальные данные из Supabase.
        </InfoAlert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">Новые заявки</p>
          <p className="mt-2 text-3xl font-semibold">
            {leads.filter((lead) => lead.status === "new").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">В работе</p>
          <p className="mt-2 text-3xl font-semibold">
            {leads.filter((lead) => lead.status === "in_progress").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">Средний бюджет</p>
          <p className="mt-2 text-3xl font-semibold">{(avgBudget / 1_000_000).toFixed(1)}М ₽</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Клиент</th>
                <th className="px-4 py-3">Авто</th>
                <th className="px-4 py-3">Страна</th>
                <th className="px-4 py-3">Бюджет</th>
                <th className="px-4 py-3">Итого</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 text-slate-600">{lead.date}</td>
                  <td className="px-4 py-3 font-medium">{lead.client}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.car}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.country}</td>
                  <td className="px-4 py-3">{(lead.budget / 1_000_000).toFixed(1)}М ₽</td>
                  <td className="px-4 py-3">{(lead.total / 1_000_000).toFixed(1)}М ₽</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${leadStatusClasses[lead.status]}`}>
                      {leadStatusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="text-blue-600">
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
