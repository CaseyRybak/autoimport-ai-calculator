import { Car } from "lucide-react";
import { submitAdminPassword } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";

type Props = {
  hasError?: boolean;
  returnTo?: string;
};

export function AdminPasswordGate({ hasError = false, returnTo = "/admin" }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <section className="w-full max-w-sm rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-slate-950">
          <Car className="h-5 w-5 text-blue-600" />
          AutoImport Admin
        </div>

        <InfoAlert className="mt-4">
          Доступ к реальным заявкам закрыт demo-паролем. Проверка выполняется на сервере.
        </InfoAlert>

        <form action={submitAdminPassword} className="mt-5 space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <label className="block text-sm font-medium text-slate-700" htmlFor="admin-password">
            Пароль
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="form-field"
            required
          />
          {hasError ? (
            <p className="text-sm text-red-700">Неверный пароль.</p>
          ) : null}
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
      </section>
    </main>
  );
}
