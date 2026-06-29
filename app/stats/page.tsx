import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/cost";
import { METRIC_LABELS, type MetricType } from "@/lib/validation/metrics";

export const dynamic = "force-dynamic";

function Bar({ label, value, max, render }: { label: string; value: number; max: number; render: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{render}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-brand-400/80" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: costRows }, { count: assetsCount }, { data: batchesData }, { data: metricsData }] =
    await Promise.all([
      supabase.from("cost_log").select("cost, provider, created_at").limit(5000),
      supabase.from("assets").select("id", { count: "exact", head: true }),
      supabase.from("batches").select("status").limit(2000),
      supabase.from("metrics").select("metric_type, value").limit(5000),
    ]);

  const costs = (costRows ?? []) as { cost: number; provider: string; created_at: string }[];
  const totalSpend = costs.reduce((s, r) => s + Number(r.cost ?? 0), 0);

  // Gasto por proveedor.
  const byProvider = new Map<string, number>();
  for (const r of costs) byProvider.set(r.provider, (byProvider.get(r.provider) ?? 0) + Number(r.cost ?? 0));
  const providers = [...byProvider.entries()].sort((a, b) => b[1] - a[1]);
  const maxProvider = Math.max(0, ...providers.map(([, v]) => v));

  // Gasto por mes (últimos 6).
  const months: { key: string; label: string; total: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    months.push({ key, label: d.toLocaleDateString("es-EC", { month: "short" }), total: 0 });
  }
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));
  for (const r of costs) {
    const d = new Date(r.created_at);
    const idx = monthIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx !== undefined) months[idx]!.total += Number(r.cost ?? 0);
  }
  const maxMonth = Math.max(0, ...months.map((m) => m.total));

  // Conteo de tandas por estado.
  const statusCount = new Map<string, number>();
  for (const b of (batchesData ?? []) as { status: string }[]) statusCount.set(b.status, (statusCount.get(b.status) ?? 0) + 1);
  const totalBatches = (batchesData ?? []).length;

  // Métricas agregadas.
  const metricTotals = new Map<string, number>();
  for (const m of (metricsData ?? []) as { metric_type: string; value: number | null }[]) {
    metricTotals.set(m.metric_type, (metricTotals.get(m.metric_type) ?? 0) + Number(m.value ?? 0));
  }

  const kpis = [
    { label: "Gasto total", value: formatUsd(totalSpend) },
    { label: "Piezas", value: String(assetsCount ?? 0) },
    { label: "Tandas", value: String(totalBatches) },
    { label: "Publicadas", value: String(statusCount.get("published") ?? 0) },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-tight">Estadísticas</h1>
        <p className="mt-1 text-sm text-muted">Gasto, producción y rendimiento, agregados.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <p className="font-mono text-2xl tracking-tight tabular-nums">{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-sm font-medium">Gasto por proveedor</h2>
          <div className="mt-4 flex flex-col gap-3">
            {providers.length === 0 && <p className="text-sm text-muted">Sin gasto registrado todavía.</p>}
            {providers.map(([name, v]) => (
              <Bar key={name} label={name} value={v} max={maxProvider} render={formatUsd(v)} />
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-medium">Gasto por mes</h2>
          <div className="mt-4 flex flex-col gap-3">
            {months.map((m) => (
              <Bar key={m.key} label={m.label} value={m.total} max={maxMonth} render={formatUsd(m.total)} />
            ))}
          </div>
        </section>
      </div>

      <section className="card mt-4 p-5">
        <h2 className="text-sm font-medium">Métricas acumuladas</h2>
        {metricTotals.size === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Aún no registras métricas. Cárgalas en Resultados de cada tanda publicada.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...metricTotals.entries()].map(([type, total]) => (
              <div key={type} className="rounded-lg border border-border px-3 py-2.5">
                <p className="font-mono text-lg tabular-nums">{total.toLocaleString("es-EC")}</p>
                <p className="text-xs text-muted">{METRIC_LABELS[type as MetricType] ?? type}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
