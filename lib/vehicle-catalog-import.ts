import type { Country } from "@/lib/calculate";

export const vehicleCatalogImportColumns = [
  "country",
  "brand",
  "model",
  "year",
  "engine_type",
  "engine_volume_liters",
  "source_market",
  "source_price_usd",
  "display_currency",
  "source_name",
  "source_url",
  "last_checked_at",
  "is_active",
] as const;

export type VehicleCatalogImportColumn = (typeof vehicleCatalogImportColumns)[number];
export type VehicleCatalogImportCurrency = "USD" | "RUB" | "EUR" | "CNY";

export type VehicleCatalogImportRow = {
  rowNumber: number;
  country: Country;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  year: number;
  engineType: string;
  engineVolumeLiters: number;
  sourceMarket: Country;
  sourcePriceUsd: number;
  displayCurrency: VehicleCatalogImportCurrency;
  sourceName: string | null;
  sourceUrl: string | null;
  lastCheckedAt: string | null;
  isActive: boolean;
};

export type VehicleCatalogImportPreviewRow = {
  rowNumber: number;
  country: string;
  brand: string;
  model: string;
  year: string;
  engineType: string;
  engineVolumeLiters: string;
  sourceMarket: string;
  sourcePriceUsd: string;
  displayCurrency: string;
  sourceName: string;
  sourceUrl: string;
  lastCheckedAt: string;
  isActive: string;
  errors: string[];
};

export type VehicleCatalogImportPreview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  skippedRows: number;
  errors: string[];
  rows: VehicleCatalogImportPreviewRow[];
  validCatalogRows: VehicleCatalogImportRow[];
};

type CsvRecord = Record<VehicleCatalogImportColumn, string>;

const countries = new Set(["korea", "europe", "china"]);
const currencies = new Set(["USD", "RUB", "EUR", "CNY"]);

const trimCell = (value: string | undefined) => value?.trim() ?? "";

export function slugifyCatalogValue(value: string) {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(cell);
      cell = "";
      continue;
    }

    cell += char;
  }

  cells.push(cell);

  return cells;
}

function parseCsv(text: string) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      header: [] as string[],
      records: [] as Array<{ rowNumber: number; values: string[] }>,
    };
  }

  return {
    header: parseCsvLine(lines[0]).map((value) => value.trim()),
    records: lines.slice(1).map((line, index) => ({
      rowNumber: index + 2,
      values: parseCsvLine(line),
    })),
  };
}

function getBoolean(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }

  return null;
}

function getValidDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function toRecord(header: string[], values: string[]) {
  return vehicleCatalogImportColumns.reduce((record, column) => {
    const index = header.indexOf(column);
    record[column] = index >= 0 ? trimCell(values[index]) : "";

    return record;
  }, {} as CsvRecord);
}

function validateRecord(rowNumber: number, record: CsvRecord): {
  previewRow: VehicleCatalogImportPreviewRow;
  validRow: VehicleCatalogImportRow | null;
} {
  const errors: string[] = [];
  const country = record.country.toLowerCase();
  const sourceMarket = (record.source_market || country).toLowerCase();
  const year = Number(record.year);
  const engineVolumeLiters = Number(record.engine_volume_liters);
  const sourcePriceUsd = Number(record.source_price_usd);
  const displayCurrency = (record.display_currency || "USD").toUpperCase();
  const isActive = getBoolean(record.is_active);
  const lastCheckedAt = getValidDate(record.last_checked_at);
  const brandSlug = slugifyCatalogValue(record.brand);
  const modelSlug = slugifyCatalogValue(record.model);

  if (!countries.has(country)) {
    errors.push("country must be one of korea/europe/china");
  }

  if (!record.brand) {
    errors.push("brand is required");
  } else if (!brandSlug) {
    errors.push("brand cannot produce a slug");
  }

  if (!record.model) {
    errors.push("model is required");
  } else if (!modelSlug) {
    errors.push("model cannot produce a slug");
  }

  if (!Number.isInteger(year) || year < 1990 || year > 2030) {
    errors.push("year must be an integer from 1990 to 2030");
  }

  if (!record.engine_type) {
    errors.push("engine_type is required");
  }

  if (!Number.isFinite(engineVolumeLiters) || engineVolumeLiters < 0) {
    errors.push("engine_volume_liters must be numeric and >= 0");
  }

  if (!Number.isFinite(sourcePriceUsd) || sourcePriceUsd <= 0) {
    errors.push("source_price_usd must be numeric and > 0");
  }

  if (!currencies.has(displayCurrency)) {
    errors.push("display_currency must be one of USD/RUB/EUR/CNY");
  }

  if (!countries.has(sourceMarket)) {
    errors.push("source_market must be one of korea/europe/china");
  }

  if (isActive === null) {
    errors.push("is_active must be true/false when present");
  }

  if (lastCheckedAt === undefined) {
    errors.push("last_checked_at must be a valid date when present");
  }

  const previewRow: VehicleCatalogImportPreviewRow = {
    rowNumber,
    country: record.country,
    brand: record.brand,
    model: record.model,
    year: record.year,
    engineType: record.engine_type,
    engineVolumeLiters: record.engine_volume_liters,
    sourceMarket: record.source_market || country,
    sourcePriceUsd: record.source_price_usd,
    displayCurrency,
    sourceName: record.source_name,
    sourceUrl: record.source_url,
    lastCheckedAt: record.last_checked_at,
    isActive: record.is_active || "true",
    errors,
  };

  if (errors.length > 0) {
    return {
      previewRow,
      validRow: null,
    };
  }

  return {
    previewRow,
    validRow: {
      rowNumber,
      country: country as Country,
      brand: record.brand,
      brandSlug,
      model: record.model,
      modelSlug,
      year,
      engineType: record.engine_type,
      engineVolumeLiters,
      sourceMarket: sourceMarket as Country,
      sourcePriceUsd,
      displayCurrency: displayCurrency as VehicleCatalogImportCurrency,
      sourceName: record.source_name || null,
      sourceUrl: record.source_url || null,
      lastCheckedAt: lastCheckedAt ?? null,
      isActive: isActive ?? true,
    },
  };
}

export function parseVehicleCatalogCsv(text: string): VehicleCatalogImportPreview {
  const { header, records } = parseCsv(text);
  const errors: string[] = [];

  if (header.length === 0) {
    errors.push("CSV is empty");
  }

  const missingColumns = vehicleCatalogImportColumns.filter((column) => !header.includes(column));

  if (missingColumns.length > 0) {
    errors.push(`Missing columns: ${missingColumns.join(", ")}`);
  }

  const rows = records.map(({ rowNumber, values }) => {
    const { previewRow, validRow } = validateRecord(rowNumber, toRecord(header, values));

    return {
      previewRow,
      validRow,
    };
  });
  const validCatalogRows = rows
    .map((row) => row.validRow)
    .filter((row): row is VehicleCatalogImportRow => row !== null);
  const rowErrors = rows.flatMap((row) =>
    row.previewRow.errors.map((error) => `Row ${row.previewRow.rowNumber}: ${error}`),
  );

  return {
    totalRows: records.length,
    validRows: validCatalogRows.length,
    invalidRows: records.length - validCatalogRows.length,
    skippedRows: records.length - validCatalogRows.length,
    errors: [...errors, ...rowErrors],
    rows: rows.map((row) => row.previewRow),
    validCatalogRows,
  };
}
