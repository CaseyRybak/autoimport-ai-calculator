import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { CatalogImportForm } from "@/components/admin/catalog-import-form";
import { InfoAlert } from "@/components/ui/info-alert";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: Promise<{
    error?: string;
    returnTo?: string;
  }>;
};

export default async function CatalogImportPage({ searchParams }: Props) {
  const params = await searchParams;
  const isPasswordConfigured = isAdminPasswordConfigured();
  const hasAccess = isPasswordConfigured ? await hasAdminAccess() : false;

  if (isPasswordConfigured && !hasAccess) {
    return (
      <AdminPasswordGate
        hasError={params?.error === "1"}
        returnTo={
          params?.returnTo?.startsWith("/admin")
            ? params.returnTo
            : "/admin/catalog/import"
        }
      />
    );
  }

  return (
    <AdminShell title="Импорт каталога">
      {!isPasswordConfigured ? (
        <InfoAlert className="mb-5">
          `ADMIN_DEMO_PASSWORD` не задан, поэтому CSV import отключен. Настройте
          admin-пароль и server-side `SUPABASE_SERVICE_ROLE_KEY`, затем откройте страницу
          снова.
        </InfoAlert>
      ) : null}

      <CatalogImportForm />
    </AdminShell>
  );
}
