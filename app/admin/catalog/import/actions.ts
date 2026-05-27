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
    return "ADMIN_DEMO_PASSWORD is not configured. Catalog import is disabled.";
  }

  if (!(await hasAdminAccess())) {
    return "Admin access is required before importing catalog rows.";
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
      message: "Upload a CSV file first.",
      preview: null,
      importResult: null,
    };
  }

  const text = new TextDecoder().decode(await file.arrayBuffer());
  const preview = parseVehicleCatalogCsv(text);

  return {
    message:
      preview.errors.length > 0
        ? "Preview found blocking validation errors. Fix the CSV and upload again."
        : "Preview is valid. Review the first rows before confirming import.",
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
      message: "No preview payload found. Upload and validate a CSV before confirming.",
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
      message: "Preview payload could not be read. Upload and validate the CSV again.",
      preview: null,
      importResult: null,
    };
  }

  const result = await importVehicleCatalogRows(rows);

  return {
    message: result.ok
      ? "Catalog import completed. Supabase is now the source of truth for these rows."
      : "Catalog import failed before all rows could be written.",
    preview: null,
    importResult: result,
  };
}
