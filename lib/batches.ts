/**
 * Núcleo de tandas (server). Generación + persistencia del plan, compartido por
 * el server action `createBatch` y la ruta `POST /api/strategy` (regenerar).
 *
 * `assets` = el plan (piezas en `pending`, sin media). Los `jobs` NO se crean
 * aquí: solo al aprobar (CLAUDE.md guardrail #1).
 */
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { generateStrategy, type Plan } from "@/lib/strategy";
import { estimateBatchCostUsd } from "@/lib/cost";
import { formatMixSchema } from "@/lib/validation/batch";
import type { Brand } from "@/lib/types/database";

export type GeneratePlanResult =
  | { ok: true; plan: Plan; estimatedCost: number }
  | { ok: false; error: string };

/**
 * (Re)genera el plan de una tanda y lo persiste:
 * - borra los assets previos de la tanda (regeneración limpia),
 * - inserta una fila `assets` (pending) por pieza,
 * - guarda `strategy` + `estimated_cost` y pone `status='planned'`.
 *
 * Usa el cliente con sesión del usuario: RLS confirma que la tanda es suya.
 */
export async function generateAndPersistPlan(batchId: string): Promise<GeneratePlanResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  // RLS: solo devuelve la tanda si es del dueño.
  const { data: batch } = await supabase
    .from("batches")
    .select("id, brand_id, brief, format_mix, status")
    .eq("id", batchId)
    .maybeSingle();
  if (!batch) return { ok: false, error: "Tanda no encontrada." };

  if (batch.status === "approved" || batch.status === "producing") {
    return { ok: false, error: "La tanda ya fue aprobada; no se puede regenerar el plan." };
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", batch.brand_id)
    .maybeSingle();
  if (!brand) return { ok: false, error: "Marca no encontrada." };

  const mixParsed = formatMixSchema.safeParse(batch.format_mix ?? {});
  if (!mixParsed.success) return { ok: false, error: "El mix de formatos es inválido." };

  let plan: Plan;
  try {
    plan = await generateStrategy(brand as Brand, batch.brief ?? "", mixParsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar el plan.";
    return { ok: false, error: message };
  }

  if (plan.pieces.length === 0) {
    return { ok: false, error: "El plan quedó vacío. Revisa el mix de formatos." };
  }

  const estimatedCost = estimateBatchCostUsd(plan.pieces);

  // Regeneración limpia: fuera los assets previos (RLS borra solo los de la tanda).
  const { error: delErr } = await supabase.from("assets").delete().eq("batch_id", batchId);
  if (delErr) return { ok: false, error: delErr.message };

  const rows = plan.pieces.map((p) => ({
    batch_id: batchId,
    type: p.type,
    status: "pending" as const,
    content: {
      concept: p.concept,
      copy: p.copy,
      image_prompt: p.image_prompt,
      rationale: p.rationale,
    },
    platform_target: p.platform_target || null,
  }));

  const { error: insErr } = await supabase.from("assets").insert(rows);
  if (insErr) return { ok: false, error: insErr.message };

  const { error: updErr } = await supabase
    .from("batches")
    .update({
      strategy: { rationale: plan.rationale, generated_at: new Date().toISOString() },
      estimated_cost: estimatedCost,
      status: "planned",
    })
    .eq("id", batchId);
  if (updErr) return { ok: false, error: updErr.message };

  return { ok: true, plan, estimatedCost };
}
