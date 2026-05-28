export type CatalogAdminActiveFilter = "all" | "active" | "inactive";

export type CatalogAdminFilters = {
  country?: string;
  brand?: string;
  model?: string;
  active?: CatalogAdminActiveFilter;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type CatalogAdminFilterableItem = {
  country: string;
  brandId: string;
  brand: string;
  model: string;
  isActive: boolean;
};

const normalizeActiveFilter = (active: CatalogAdminFilters["active"]): CatalogAdminActiveFilter =>
  active === "active" || active === "inactive" ? active : "all";

const normalizeText = (value: string | null | undefined) => value?.trim().toLowerCase() ?? "";

export function filterCatalogAdminItems<T extends CatalogAdminFilterableItem>(
  items: T[],
  filters: CatalogAdminFilters,
) {
  const activeFilter = normalizeActiveFilter(filters.active);
  const country = normalizeText(filters.country);
  const brand = normalizeText(filters.brand);
  const model = normalizeText(filters.model);
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

    if (model && !item.model.toLowerCase().includes(model)) {
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
