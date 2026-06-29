/**
 * POST /api/batches/[id]/analyze - el analista (Sonnet) resume el rendimiento de
 * la tanda y propone ajustes concretos al perfil/estrategia (M6). Persiste el
 * reporte en `batches.strategy.analysis`.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { analyzeBatch, type AssetMetrics } from "@/lib/analyst";
import { limitOr429 } from "@/lib/rate-limit";
import type { Brand } from "@/lib/types/database";

export const runtime = "nodejs";

type AssetRow = {
  id: string;
  type: string;
  content: { concept?: string; copy?: string; final_copy?: string } | null;
  platform_target: string | null;
};
type MetricRow = { asset_id: string | null; metric_type: string; value: number | null };

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Tanda inválida." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const limited = limitOr429(user.id, "analyze", 10);
  if (limited) return limited;

  const { data: batch } = await supabase
    .from("batches")
    .select("id, brand_id, strategy")
    .eq("id", id)
    .maybeSingle();
  if (!batch) return NextResponse.json({ error: "Tanda no encontrada." }, { status: 404 });

  const { data: brand } = await supabase
    .from("brands")
    .select("name, tono, objetivo, publico, do_list, dont_list")
    .eq("id", batch.brand_id)
    .maybeSingle();
  if (!brand) return NextResponse.json({ error: "Marca no encontrada." }, { status: 404 });

  const [{ data: assetsData }, { data: metricsData }] = await Promise.all([
    supabase.from("assets").select("id, type, content, platform_target").eq("batch_id", id),
    supabase.from("metrics").select("asset_id, metric_type, value").eq("batch_id", id),
  ]);
  const assets = (assetsData ?? []) as AssetRow[];
  const metrics = (metricsData ?? []) as MetricRow[];

  // Agrupa métricas por pieza.
  const byAsset = new Map<string, Record<string, number>>();
  for (const m of metrics) {
    if (!m.asset_id) continue;
    const rec = byAsset.get(m.asset_id) ?? {};
    rec[m.metric_type] = m.value ?? 0;
    byAsset.set(m.asset_id, rec);
  }

  const pieces: AssetMetrics[] = assets.map((a) => ({
    type: a.type,
    platform: a.platform_target || "general",
    caption: a.content?.final_copy || a.content?.copy || a.content?.concept || "",
    metrics: byAsset.get(a.id) ?? {},
  }));

  let analysis;
  try {
    analysis = await analyzeBatch(brand as Pick<Brand, "name" | "tono" | "objetivo" | "publico" | "do_list" | "dont_list">, pieces);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al analizar.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Persiste en strategy.analysis (merge, sin perder el rationale del plan).
  const strategy = { ...((batch.strategy as Record<string, unknown>) ?? {}), analysis: { ...analysis, generated_at: new Date().toISOString() } };
  const { error: updErr } = await supabase.from("batches").update({ strategy }).eq("id", id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, analysis });
}
