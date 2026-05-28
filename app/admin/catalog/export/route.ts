import { NextRequest } from "next/server";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import {
  formatCatalogAdminItemsCsv,
  listCatalogAdminItems,
  type CatalogAdminActiveFilter,
} from "@/lib/vehicle-catalog-admin";

export const dynamic = "force-dynamic";

const getActiveFilter = (value: string | null): CatalogAdminActiveFilter =>
  value === "all" || value === "inactive" ? value : "active";

const getFilename = () => {
  const date = new Date().toISOString().slice(0, 10);

  return `vehicle-catalog-${date}.csv`;
};

export async function GET(request: NextRequest) {
  if (!isAdminPasswordConfigured() || !(await hasAdminAccess())) {
    return new Response("Admin access is required before exporting catalog rows.", {
      status: 403,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const params = request.nextUrl.searchParams;
  const catalog = await listCatalogAdminItems({
    country: params.get("country") ?? undefined,
    brand: params.get("brand") ?? undefined,
    active: getActiveFilter(params.get("active")),
    search: params.get("search") ?? undefined,
  });

  if (catalog.error) {
    return new Response(catalog.error, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(formatCatalogAdminItemsCsv(catalog.items), {
    headers: {
      "Content-Disposition": `attachment; filename="${getFilename()}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
