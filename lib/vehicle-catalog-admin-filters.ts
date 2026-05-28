export type CatalogAdminActiveFilter = "all" | "active" | "inactive";

export type CatalogAdminFilters = {
  country?: string;
  brand?: string;
  active?: CatalogAdminActiveFilter;
  search?: string;
};

export type CatalogAdminFilterableItem = {
  country: string;
  brandId: string;
  brand: string;
  model: string;
  isActive: boolean;
};

const normalizeActiveFilter = (active: CatalogAdminFilters["active"]): CatalogAdminActiveFilter =>
  active === "inactive" || active === "all" ? active : "active";

const normalizeText = (value: string | null | undefined) => value?.trim().toLowerCase() ?? "";

export function filterCatalogAdminItems<T extends CatalogAdminFilterableItem>(
  items: T[],
  filters: CatalogAdminFilters,
) {
  const activeFilter = normalizeActiveFilter(filters.active);
  const country = normalizeText(filters.country);
  const brand = normalizeText(filters.brand);
  const search = normalizeText(filters.search);

  return items.filter((item) => {
    if (activeFilter === "active" && !item.isActive) {
      return false;
    }

    if (activeFilter === "inactive" && item.isActive) {
      return false;
    }

    if (country && item.country.toLowerCase() !== country) {
      return false;
    }

    if (brand && item.brandId.toLowerCase() !== brand) {
      return false;
    }

    if (search) {
      const searchable = `${item.brand} ${item.model}`.toLowerCase();

      if (!searchable.includes(search)) {
        return false;
      }
    }

    return true;
  });
}
