import { AdminPasswordGate } from "@/components/admin/admin-password-gate";
import { AdminShell } from "@/components/admin/admin-shell";
import { CatalogImportForm } from "@/components/admin/catalog-import-form";
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
      <CatalogImportForm />
    </AdminShell>
  );
}
