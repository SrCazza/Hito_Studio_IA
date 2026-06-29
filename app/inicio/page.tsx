import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/cost";
import { buttonVariants } from "@/components/ui/Button";
import { StatusBadge } from "@/components/panel/StatusBadge";

export const dynamic = "force-dynamic";

type BatchRow = { id: string; title: string; status: string; created_at: string };

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ count: brandsCount }, { count: assetsCount }, { data: batchesData }, { data: costRows }] =
    await Promise.all([
      supabase.from("brands").select("id", { count: "exact", head: true }),
      supabase.from("assets").select("id", { count: "exact", head: true }),
      supabase
        .from("batches")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("cost_log").select("cost, created_at").gte("created_at", monthStart.toISOString()),
    ]);

  const batches = (batchesData ?? []) as BatchRow[];
  const active = batches.filter((b) => ["planned", "approved", "producing", "review"].includes(b.status)).length;
  const published = batches.filter((b) => b.status === "published").length;
  const monthSpend = (costRows ?? []).reduce((s, r) => s + Number((r as { cost: number }).cost ?? 0), 0);
  const recent = batches.slice(0, 5);

  const stats = [
    { label: "Marcas", value: String(brandsCount ?? 0) },
    { label: "Tandas activas", value: String(active) },
    { label: "Piezas creadas", value: String(assetsCount ?? 0) },
    { label: "Gasto del mes", value: formatUsd(monthSpend) },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Inicio</h1>
          <p className="mt-1 text-sm text-muted">Un vistazo a tu estudio.</p>
        </div>
        <Link href="/brands/new" className={buttonVariants({ variant: "primary" })}>
          Nueva marca
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="font-mono text-2xl tracking-tight tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Tandas recientes</h2>
          <span className="text-xs text-muted">{published} publicadas</span>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted">
            Aún no hay tandas. Crea una marca y luego una tanda.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((b) => (
              <li key={b.id}>
                <Link href={`/batches/${b.id}/plan`} className="card flex items-center justify-between px-4 py-3 transition hover:border-border-strong hover:bg-surface-2/50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{b.title}</span>
                    <span className="text-xs text-muted">{new Date(b.created_at).toLocaleDateString("es-EC")}</span>
                  </span>
                  <StatusBadge status={b.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
