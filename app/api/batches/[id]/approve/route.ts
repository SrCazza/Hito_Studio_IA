/**
 * POST /api/batches/[id]/approve - el gate de aprobación (BLUEPRINT §4).
 *
 * Guardrails (CLAUDE.md):
 *  #1 Nada se produce sin aprobación: esta es la ÚNICA ruta que inserta `jobs`,
 *     y solo si la tanda está en `planned` y pasa a `approved`.
 *  #4 Tope de presupuesto: rechaza si `estimated_cost > budget_cap` sin override.
 *  #2 Cada job lleva `idempotency_key` único (anti-doble-cobro, lo usa n8n en M3).
 *
 * RLS no permite a un usuario normal escribir en `jobs` (solo service-role), así
 * que la propiedad se verifica con el cliente de sesión y los `jobs` se insertan
 * con el cliente admin.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { estimateBatchCostUsd } from "@/lib/cost";
import { ASSET_TO_JOB, idempotencyKey } from "@/lib/jobs";
import type { AssetType } from "@/lib/types/database";

export const runtime = "nodejs";

const bodySchema = z.object({ override: z.boolean().optional().default(false) });

export async function POST(
  request: NextRequest,
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
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const override = parsed.success ? parsed.data.override : false;

  // RLS confirma propiedad.
  const { data: batch } = await supabase
    .from("batches")
    .select("id, brand_id, status, budget_cap")
    .eq("id", id)
    .maybeSingle();
  if (!batch) {
    return NextResponse.json({ error: "Tanda no encontrada." }, { status: 404 });
  }

  // Guardrail #1: solo se encola desde `planned`. Cualquier otro estado se rechaza.
  if (batch.status !== "planned") {
    return NextResponse.json(
      { error: `No se puede aprobar una tanda en estado «${batch.status}».` },
      { status: 409 }
    );
  }

  const { data: assets, error: assetsErr } = await supabase
    .from("assets")
    .select("id, type, content, platform_target")
    .eq("batch_id", id);
  if (assetsErr) {
    return NextResponse.json({ error: assetsErr.message }, { status: 500 });
  }
  if (!assets || assets.length === 0) {
    return NextResponse.json(
      { error: "La tanda no tiene piezas. Genera el plan primero." },
      { status: 409 }
    );
  }

  // Recalcula el costo desde las piezas reales (no confiar en el valor guardado).
  const estimatedCost = estimateBatchCostUsd(assets as { type: AssetType }[]);
  const budgetCap = batch.budget_cap ?? serverEnv().defaultBudgetCapUsd;

  // Guardrail #4: tope de presupuesto.
  if (estimatedCost > budgetCap && !override) {
    return NextResponse.json(
      {
        error: "El costo estimado supera el tope. Aprueba con override para continuar.",
        estimated_cost: estimatedCost,
        budget_cap: budgetCap,
        requires_override: true,
      },
      { status: 409 }
    );
  }

  // Encolar jobs con el cliente admin (RLS no permite write a usuarios normales).
  const admin = createAdminClient();
  const jobs = (assets as {
    id: string;
    type: AssetType;
    content: Record<string, unknown>;
    platform_target: string | null;
  }[]).map((a) => {
    const jobType = ASSET_TO_JOB[a.type];
    return {
      asset_id: a.id,
      batch_id: id,
      type: jobType,
      status: "pending" as const,
      idempotency_key: idempotencyKey(a.id, jobType, 1),
      payload: {
        brand_id: batch.brand_id,
        asset_type: a.type,
        platform_target: a.platform_target,
        content: a.content,
      },
    };
  });

  // ignoreDuplicates: si ya se encoló (reintento), no se duplica el cobro.
  const { error: jobsErr } = await admin
    .from("jobs")
    .upsert(jobs, { onConflict: "idempotency_key", ignoreDuplicates: true });
  if (jobsErr) {
    return NextResponse.json({ error: jobsErr.message }, { status: 500 });
  }

  // Mueve la tanda a approved (RLS permite al dueño). estimated_cost recalculado.
  const { error: updErr } = await supabase
    .from("batches")
    .update({
      status: "approved",
      estimated_cost: estimatedCost,
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq("id", id)
    .eq("status", "planned"); // candado optimista: evita doble aprobación concurrente
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    status: "approved",
    estimated_cost: estimatedCost,
    jobs_enqueued: jobs.length,
  });
}
