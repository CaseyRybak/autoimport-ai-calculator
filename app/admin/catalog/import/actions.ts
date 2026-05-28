"use server";

import { hasAdminAccess, isAdminPasswordConfigured } from "@/lib/admin-access";
import { importVehicleCatalogRows } from "@/lib/vehicle-catalog-admin";
import {
  parseVehicleCatalogCsv,
  type VehicleCatalogImportPreview,
  type VehicleCatalogImportRow,
} from "@/lib/vehicle-catalog-import";

export type VehicleCatalogImportActionState = {
  message: string | null;
  preview: VehicleCatalogImportPreview | null;
  importResult: Awaited<ReturnType<typeof importVehicleCatalogRows>> | null;
};

async function requireAdminImportAccess() {
  if (!isAdminPasswordConfigured()) {
    return "Импорт каталога недоступен: не настроен доступ администратора.";
  }

  if (!(await hasAdminAccess())) {
    return "Перед импортом каталога необходимо войти в админку.";
  }

  return null;
}

type FormDataUpload = {
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function isFormDataUpload(
  value: FormDataEntryValue | null,
): value is FormDataEntryValue & FormDataUpload {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    typeof value.size === "number" &&
    value.size > 0 &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function"
  );
}

export async function previewVehicleCatalogCsv(
  _state: VehicleCatalogImportActionState,
  formData: FormData,
): Promise<VehicleCatalogImportActionState> {
  const accessError = await requireAdminImportAccess();

  if (accessError) {
    return {
      message: accessError,
      preview: null,
      importResult: null,
    };
  }

  const file = formData.get("catalogCsv");

  if (!isFormDataUpload(file)) {
    return {
      message: "Сначала загрузите CSV-файл.",
      preview: null,
      importResult: null,
    };
  }

  const text = new TextDecoder().decode(await file.arrayBuffer());
  const preview = parseVehicleCatalogCsv(text);

  return {
    message:
      preview.errors.length > 0
        ? "Проверка нашла ошибки. Исправьте CSV и загрузите файл снова."
        : "Файл прошел проверку. Проверьте первые строки перед подтверждением импорта.",
    preview,
    importResult: null,
  };
}

export async function confirmVehicleCatalogImport(
  _state: VehicleCatalogImportActionState,
  formData: FormData,
): Promise<VehicleCatalogImportActionState> {
  const accessError = await requireAdminImportAccess();

  if (accessError) {
    return {
      message: accessError,
      preview: null,
      importResult: null,
    };
  }

  const payload = formData.get("validRows");

  if (typeof payload !== "string" || !payload) {
    return {
      message: "Нет данных проверки. Загрузите и проверьте CSV перед подтверждением.",
      preview: null,
      importResult: null,
    };
  }

  let rows: VehicleCatalogImportRow[];

  try {
    const parsed = JSON.parse(payload);

    rows = Array.isArray(parsed) ? (parsed as VehicleCatalogImportRow[]) : [];
  } catch {
    return {
      message: "Данные проверки не удалось прочитать. Загрузите и проверьте CSV снова.",
      preview: null,
      importResult: null,
    };
  }

  const result = await importVehicleCatalogRows(rows);

  return {
    message: result.ok
      ? "Импорт каталога завершен."
      : "Импорт каталога не выполнен: часть строк не была записана.",
    preview: null,
    importResult: result,
  };
}
