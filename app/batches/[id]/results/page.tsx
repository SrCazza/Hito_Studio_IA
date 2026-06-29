import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { METRIC_TYPES, METRIC_LABELS, type MetricType } from "@/lib/validation/metrics";
import { AnalyzeButton, MetricsForm } from "@/components/ResultsView";
import type { AssetType } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  type: AssetType;
  content: { concept?: string; copy?: string; final_copy?: string } | null;
  platform_target: string | null;
};
type MetricRow = { asset_id: string | null; metric_type: string; value: number | null };
type Analysis = { summary?: string; highlights?: string[]; adjustments?: string[]; generated_at?: string };

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: batch } = await supabase
    .from("batches")
    .select("id, title, status, strategy")
    .eq("id", id)
    .maybeSingle();
  if (!batch) notFound();

  const [{ data: assetsData }, { data: metricsData }] = await Promise.all([
    supabase
      .from("assets")
      .select("id, type, content, platform_target")
      .eq("batch_id", id)
      .order("created_at", { ascending: true })
      .limit(100),
    supabase.from("metrics").select("asset_id, metric_type, value").eq("batch_id", id).limit(1000),
  ]);
  const assets = (assetsData ?? []) as AssetRow[];

  const byAsset = new Map<string, Partial<Record<MetricType, number>>>();
  for (const m of (metricsData ?? []) as MetricRow[]) {
    if (!m.asset_id) continue;
    const rec = byAsset.get(m.asset_id) ?? {};
    rec[m.metric_type as MetricType] = m.value ?? 0;
    byAsset.set(m.asset_id, rec);
  }

  const analysis = (batch.strategy as { analysis?: Analysis } | null)?.analysis;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href={`/batches/${id}/package`} className="text-sm text-muted hover:text-foreground">
        ← Paquete
      </Link>

      <header className="mb-6 mt-4">
        <h1 className="font-display text-3xl tracking-tight">Resultados: {batch.title}</h1>
        <p className="mt-1.5 text-sm text-muted">
          Registra las métricas que ves en cada plataforma y deja que el analista proponga ajustes.
        </p>
      </header>

      {/* Reporte del analista */}
      <section className="mb-8 rounded-lg border border-border bg-surface/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Reporte del analista</h2>
          <AnalyzeButton batchId={batch.id} hasAnalysis={!!analysis} />
        </div>
        {!analysis ? (
          <p className="text-sm text-muted">
            Aún sin análisis. Carga métricas y pulsa «Analizar tanda».
          </p>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            {analysis.summary && <p className="text-foreground/85">{analysis.summary}</p>}
            {analysis.highlights && analysis.highlights.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Qué funcionó</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {analysis.highlights.map((h, i) => (
                    <li key={i} className="text-foreground/85">• {h}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.adjustments && analysis.adjustments.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Ajustes propuestos</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {analysis.adjustments.map((a, i) => (
                    <li key={i} className="text-brand-400">→ {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Métricas por pieza */}
      <h2 className="mb-3 text-sm font-medium text-foreground/85">Métricas por pieza</h2>
      <ul className="flex flex-col gap-2">
        {assets.map((a) => {
          const current = byAsset.get(a.id) ?? {};
          const filled = METRIC_TYPES.filter((t) => current[t] != null);
          const caption = a.content?.final_copy || a.content?.copy || a.content?.concept || "";
          return (
            <li key={a.id} className="rounded-lg border border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {MIX_LABELS[a.type as MixType] ?? a.type}
                  {a.platform_target && (
                    <span className="ml-2 text-xs text-muted">{a.platform_target}</span>
                  )}
                </span>
                {filled.length > 0 && (
                  <span className="text-xs text-muted">
                    {filled.map((t) => `${METRIC_LABELS[t]}: ${current[t]}`).join(" · ")}
                  </span>
                )}
              </div>
              {caption && <p className="mt-1 text-sm text-muted">{caption}</p>}
              <MetricsForm
                batchId={batch.id}
                assetId={a.id}
                platform={a.platform_target || "general"}
                current={current}
              />
            </li>
          );
        })}
      </ul>

      {assets.length === 0 && (
        <p className="rounded-lg border border-dashed border-border-strong px-6 py-10 text-center text-muted">
          Esta tanda no tiene piezas.
        </p>
      )}
    </main>
  );
}
