/**
 * POST /api/batches/[id]/metrics — registra métricas de una pieza (M6).
 * Entrada manual (el humano registra lo que ve en la plataforma); misma forma
 * que escribiría el colector de n8n. RLS no deja a usuarios escribir en
 * `metrics` (solo service-role), así que se verifica ownership con la sesión y
 * se escribe con el cliente admin.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { metricsEntrySchema, METRIC_TYPES } from "@/lib/validation/metrics";

export const runtime = "nodejs";

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
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const parsed = metricsEntrySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  // RLS confirma que la pieza es de una tanda del dueño.
  const { data: asset } = await supabase
    .from("assets")
    .select("id, platform_target")
    .eq("id", parsed.data.asset_id)
    .eq("batch_id", id)
    .maybeSingle();
  if (!asset) return NextResponse.json({ error: "Pieza no encontrada en la tanda." }, { status: 404 });

  const platform = parsed.data.platform?.trim() || asset.platform_target || "general";
  const rows = METRIC_TYPES.flatMap((type) => {
    const value = parsed.data.metrics[type];
    return value === undefined
      ? []
      : [{ asset_id: asset.id, batch_id: id, platform, metric_type: type, value }];
  });

  const admin = createAdminClient();
  // Reemplaza las métricas previas de esta pieza (registro idempotente).
  const { error: delErr } = await admin.from("metrics").delete().eq("asset_id", asset.id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  if (rows.length > 0) {
    const { error: insErr } = await admin.from("metrics").insert(rows);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: rows.length });
}
