import Link from "next/link";
import { BarChart3, Car, Database, Settings, Users } from "lucide-react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function AdminShell({ title, children }: Props) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r bg-white">
          <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
            <Car className="h-5 w-5 text-blue-600" />
            AutoImport Admin
          </div>
          <nav className="space-y-1 p-3 text-sm">
            <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
              <Users className="h-4 w-4" />
              Заявки
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
            <Link href="/admin/catalog" className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
              <Database className="h-4 w-4" />
              Каталог авто
            </Link>
            <span className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-400">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </span>
          </nav>
        </aside>
        <section className="min-w-0">
          <header className="flex h-16 items-center justify-between border-b bg-white px-5">
            <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
            <Link href="/" className="text-sm text-blue-600">
              На сайт
            </Link>
          </header>
          <div className="p-5">{children}</div>
        </section>
      </div>
    </main>
  );
}
