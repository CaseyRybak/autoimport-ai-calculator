import { AdminShell } from "@/components/admin/admin-shell";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

function SkeletonCard() {
  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr_170px]">
        <div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-6 w-16" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
          <SkeletonBlock className="mt-4 h-6 w-56" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-10" />
        </div>
      </div>
    </section>
  );
}

export default function CatalogLoading() {
  return (
    <AdminShell title="Каталог авто">
      <div className="max-w-[1800px] space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <SkeletonBlock className="h-12 w-full max-w-3xl" />
          <div className="flex gap-2 lg:flex-col">
            <SkeletonBlock className="h-10 w-36" />
            <SkeletonBlock className="h-10 w-36" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>

        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-16" />

        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </AdminShell>
  );
}
