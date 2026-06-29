/**
 * POST /api/assets/[id]/regenerate - re-encola una pieza con un NUEVO
 * idempotency_key (BLUEPRINT §4). Una regeneración es una generación nueva y
 * deliberada: reutiliza la MISMA fila `asset` (no duplica la previa) y crea un
 * job nuevo con clave versionada (no recobra la generación anterior).
 *
 * RLS no deja a un usuario normal escribir en `jobs`: ownership se verifica con
 * el cliente de sesión y el job se inserta con el cliente admin.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ASSET_TO_JOB, idempotencyKey } from "@/lib/jobs";
import type { AssetType } from "@/lib/types/database";

export const runtime = "nodejs";

type AssetRow = {
  id: string;
  type: AssetType;
  content: Record<string, unknown> | null;
  platform_target: string | null;
  batch_id: string;
  batches: { brand_id: string; status: string } | null;
};

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Pieza inválida." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  // RLS confirma propiedad (vía batch → brand). Traemos el batch embebido.
  const { data: asset } = await supabase
    .from("assets")
    .select("id, type, content, platform_target, batch_id, batches(brand_id, status)")
    .eq("id", id)
    .maybeSingle<AssetRow>();
  if (!asset || !asset.batches) {
    return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });
  }

  // Solo se regenera tras aprobar la tanda (nunca en draft/planned).
  if (!["approved", "producing", "review", "ready"].includes(asset.batches.status)) {
    return NextResponse.json(
      { error: `No se puede regenerar en estado «${asset.batches.status}».` },
      { status: 409 }
    );
  }

  const jobType = ASSET_TO_JOB[asset.type];
  const admin = createAdminClient();

  // Versión siguiente = (jobs existentes de esta pieza) + 1 → clave única.
  const { count } = await admin
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("asset_id", id);
  const version = (count ?? 0) + 1;

  const { error: jobErr } = await admin.from("jobs").insert({
    asset_id: asset.id,
    batch_id: asset.batch_id,
    type: jobType,
    status: "pending",
    idempotency_key: idempotencyKey(asset.id, jobType, version),
    payload: {
      brand_id: asset.batches.brand_id,
      asset_type: asset.type,
      platform_target: asset.platform_target,
      content: asset.content ?? {},
    },
  });
  if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 });

  // Reinicia la pieza: vuelve a pending, limpia media/semáforo/copy final/aceptación.
  const baseContent = { ...(asset.content ?? {}) };
  delete (baseContent as Record<string, unknown>).final_copy;
  delete (baseContent as Record<string, unknown>).accepted;

  const { error: assetErr } = await supabase
    .from("assets")
    .update({
      status: "pending",
      media_url: null,
      semaforo: null,
      semaforo_reasons: [],
      content: baseContent,
    })
    .eq("id", id);
  if (assetErr) return NextResponse.json({ error: assetErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, version });
}
