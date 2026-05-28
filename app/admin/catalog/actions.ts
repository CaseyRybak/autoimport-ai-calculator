"use server";

import { revalidatePath } from "next/cache";
import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import {
  setCatalogVariantActive,
  updateCatalogVariant,
} from "@/lib/vehicle-catalog-admin";
import { normalizeSourceUrl } from "@/lib/source-url";

export type CatalogVariantActionState = {
  ok: boolean | null;
  message: string | null;
  variantId: string | null;
  isActive: boolean | null;
  sourcePriceUsd: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
};

const actionFailure = (
  message: string,
  variantId: string | null = null,
): CatalogVariantActionState => ({
  ok: false,
  message,
  variantId,
  isActive: null,
  sourcePriceUsd: null,
  sourceName: null,
  sourceUrl: null,
  lastCheckedAt: null,
});

async function requireCatalogManagementAccess() {
  if (!isAdminPasswordConfigured()) {
    return "Управление каталогом недоступно: не настроен доступ администратора.";
  }

  if (!(await hasAdminAccess())) {
    return "Перед управлением каталогом необходимо войти в админку.";
  }

  return null;
}

export async function updateCatalogVariantAction(
  _state: CatalogVariantActionState,
  formData: FormData,
): Promise<CatalogVariantActionState> {
  const accessError = await requireCatalogManagementAccess();

  if (accessError) {
    return actionFailure(accessError);
  }

  const id = formData.get("id");
  const sourcePriceUsd = Number(formData.get("sourcePriceUsd"));
  const sourceName = formData.get("sourceName");
  const sourceUrl = formData.get("sourceUrl");
  const lastCheckedAt = formData.get("lastCheckedAt");

  if (typeof id !== "string" || !id) {
    return actionFailure("Не найден идентификатор варианта.");
  }

  if (!Number.isFinite(sourcePriceUsd) || sourcePriceUsd <= 0) {
    return actionFailure("source_price_usd должен быть больше 0.", id);
  }

  const normalizedSourceUrl = normalizeSourceUrl(
    typeof sourceUrl === "string" ? sourceUrl : null,
  );

  if (!normalizedSourceUrl.ok) {
    return actionFailure(normalizedSourceUrl.error, id);
  }

  const parsedLastCheckedAt =
    typeof lastCheckedAt === "string" && lastCheckedAt ? new Date(lastCheckedAt) : null;

  if (parsedLastCheckedAt && Number.isNaN(parsedLastCheckedAt.getTime())) {
    return actionFailure("last_checked_at должен быть корректной датой.", id);
  }

  const result = await updateCatalogVariant({
    id,
    sourcePriceUsd,
    sourceName: typeof sourceName === "string" ? sourceName : null,
    sourceUrl: normalizedSourceUrl.value,
    lastCheckedAt: parsedLastCheckedAt ? parsedLastCheckedAt.toISOString() : null,
  });

  if (result.ok) {
    revalidatePath("/");
  }

  return {
    ok: result.ok,
    message: result.ok ? "Вариант каталога обновлен" : (result.error ?? "Каталог не обновлен."),
    variantId: id,
    isActive: null,
    sourcePriceUsd: result.ok ? sourcePriceUsd : null,
    sourceName: result.ok && typeof sourceName === "string" ? sourceName.trim() || null : null,
    sourceUrl: result.ok ? normalizedSourceUrl.value : null,
    lastCheckedAt: result.ok && parsedLastCheckedAt ? parsedLastCheckedAt.toISOString() : null,
  };
}

export async function toggleCatalogVariantActiveAction(
  _state: CatalogVariantActionState,
  formData: FormData,
): Promise<CatalogVariantActionState> {
  const accessError = await requireCatalogManagementAccess();

  if (accessError) {
    return actionFailure(accessError);
  }

  const id = formData.get("id");
  const isActive = formData.get("isActive") === "true";

  if (typeof id !== "string" || !id) {
    return actionFailure("Не найден идентификатор варианта.");
  }

  const result = await setCatalogVariantActive(id, isActive);

  if (result.ok) {
    revalidatePath("/");
  }

  return {
    ok: result.ok,
    message: result.ok
      ? isActive
        ? "Вариант активирован"
        : "Вариант деактивирован"
      : (result.error ?? "Статус каталога не обновлен."),
    variantId: id,
    isActive: result.ok ? isActive : null,
    sourcePriceUsd: null,
    sourceName: null,
    sourceUrl: null,
    lastCheckedAt: null,
  };
}
