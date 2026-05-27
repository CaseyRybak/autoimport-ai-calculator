"use client";

import { useActionState } from "react";
import { Upload, Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import {
  confirmVehicleCatalogImport,
  previewVehicleCatalogCsv,
  type VehicleCatalogImportActionState,
} from "@/app/admin/catalog/import/actions";
import { vehicleCatalogImportColumns } from "@/lib/vehicle-catalog-import";

const initialVehicleCatalogImportState: VehicleCatalogImportActionState = {
  message: null,
  preview: null,
  importResult: null,
};

export function CatalogImportForm() {
  const [previewState, previewAction, previewPending] = useActionState(
    previewVehicleCatalogCsv,
    initialVehicleCatalogImportState,
  );
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmVehicleCatalogImport,
    initialVehicleCatalogImportState,
  );
  const preview = previewState.preview;
  const importResult = confirmState.importResult;
  const canConfirm = Boolean(preview && preview.errors.length === 0 && preview.validRows > 0);

  return (
    <div className="max-w-6xl space-y-5">
      <InfoAlert>
        Excel нужно экспортировать в CSV. Supabase остается source of truth; SQL-файлы
        нужны для migrations/seed, а не для ежедневного управления каталогом.
      </InfoAlert>

      <section className="rounded-lg border bg-white p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">CSV import</h2>
            <p className="mt-1 text-sm text-slate-600">
              Preview только валидирует файл. Запись в Supabase выполняется после confirm.
            </p>
          </div>
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">
            CSV/demo prices must have real `source_url` before being treated as market prices.
          </p>
        </div>

        <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Expected columns</p>
          <code className="mt-2 block overflow-x-auto whitespace-nowrap text-xs text-slate-600">
            {vehicleCatalogImportColumns.join(",")}
          </code>
          <p className="mt-2 text-xs text-slate-500">
            Template: `data/vehicle-catalog-template.csv`
          </p>
        </div>

        <form action={previewAction} className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            type="file"
            name="catalogCsv"
            accept=".csv,text/csv"
            className="form-field md:max-w-md"
          />
          <Button type="submit" disabled={previewPending}>
            <Upload className="h-4 w-4" />
            {previewPending ? "Проверяем..." : "Upload и preview"}
          </Button>
        </form>
      </section>

      {previewState.message ? (
        <section className="rounded-lg border bg-white p-4 text-sm text-slate-700">
          {previewState.message}
        </section>
      ) : null}

      {preview ? (
        <section className="space-y-5 rounded-lg border bg-white p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Preview</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <Metric label="Total rows" value={preview.totalRows} />
              <Metric label="Valid rows" value={preview.validRows} />
              <Metric label="Invalid rows" value={preview.invalidRows} />
              <Metric label="Skipped rows" value={preview.skippedRows} />
            </div>
          </div>

          {preview.errors.length > 0 ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Blocking validation errors
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {preview.errors.slice(0, 30).map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
              {preview.errors.length > 30 ? (
                <p className="mt-2">Showing first 30 errors.</p>
              ) : null}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Brand</th>
                    <th className="px-3 py-2">Model</th>
                    <th className="px-3 py-2">Year</th>
                    <th className="px-3 py-2">Engine</th>
                    <th className="px-3 py-2">Volume</th>
                    <th className="px-3 py-2">Market</th>
                    <th className="px-3 py-2">Price USD</th>
                    <th className="px-3 py-2">Currency</th>
                    <th className="px-3 py-2">Active</th>
                    <th className="px-3 py-2">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.rows.slice(0, 20).map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="px-3 py-2">{row.rowNumber}</td>
                      <td className="px-3 py-2">{row.country}</td>
                      <td className="px-3 py-2">{row.brand}</td>
                      <td className="px-3 py-2">{row.model}</td>
                      <td className="px-3 py-2">{row.year}</td>
                      <td className="px-3 py-2">{row.engineType}</td>
                      <td className="px-3 py-2">{row.engineVolumeLiters}</td>
                      <td className="px-3 py-2">{row.sourceMarket}</td>
                      <td className="px-3 py-2">{row.sourcePriceUsd}</td>
                      <td className="px-3 py-2">{row.displayCurrency}</td>
                      <td className="px-3 py-2">{row.isActive}</td>
                      <td className="px-3 py-2 text-red-700">{row.errors.join("; ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form action={confirmAction}>
            <input
              type="hidden"
              name="validRows"
              value={JSON.stringify(preview.validCatalogRows)}
            />
            <Button type="submit" disabled={!canConfirm || confirmPending}>
              <Database className="h-4 w-4" />
              {confirmPending ? "Импортируем..." : "Confirm import"}
            </Button>
          </form>
        </section>
      ) : null}

      {confirmState.message ? (
        <section className="rounded-lg border bg-white p-4 text-sm text-slate-700">
          {confirmState.message}
        </section>
      ) : null}

      {importResult ? (
        <section className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">
            {importResult.ok ? "Import complete" : "Import failed"}
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <Metric label="Total rows" value={importResult.totalRows} />
            <Metric label="Valid rows" value={importResult.validRows} />
            <Metric label="Skipped rows" value={importResult.skippedRows} />
            <Metric label="Brands inserted/updated" value={importResult.brandsUpserted} />
            <Metric label="Models inserted/updated" value={importResult.modelsUpserted} />
            <Metric label="Variants inserted/updated" value={importResult.variantsUpserted} />
          </div>
          {importResult.errors.length > 0 ? (
            <ul className="mt-3 list-disc pl-5 text-sm text-red-700">
              {importResult.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-slate-50 p-3">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
