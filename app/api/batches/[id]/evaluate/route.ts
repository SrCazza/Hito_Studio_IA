/**
 * POST /api/batches/[id]/evaluate - corre el semáforo sobre las piezas de la
 * tanda y persiste color + razones. El evaluador vive en servidor (BLUEPRINT §5):
 * los rojos automáticos son deterministas; el LLM solo asiste verde/amarillo.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { evaluateSemaforo } from "@/lib/semaforo";
import type { AssetType, Brand } from "@/lib/types/database";

export const runtime = "nodejs";

type AssetRow = {
  id: string;
  type: AssetType;
  content: { concept?: string; copy?: string; final_copy?: string } | null;
};

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

  // RLS confirma propiedad de la tanda.
  const { data: batch } = await supabase
    .from("batches")
    .select("id, brand_id")
    .eq("id", id)
    .maybeSingle();
  if (!batch) return NextResponse.json({ error: "Tanda no encontrada." }, { status: 404 });

  const { data: brand } = await supabase
    .from("brands")
    .select("name, tono, do_list, dont_list, ai_visibility_policy")
    .eq("id", batch.brand_id)
    .maybeSingle();
  if (!brand) return NextResponse.json({ error: "Marca no encontrada." }, { status: 404 });

  const { data: assetsData } = await supabase
    .from("assets")
    .select("id, type, content")
    .eq("batch_id", id)
    .order("created_at", { ascending: true });
  const assets = (assetsData ?? []) as AssetRow[];

  let red = 0;
  let amber = 0;
  let green = 0;

  for (const a of assets) {
    const text =
      a.content?.final_copy?.trim() ||
      a.content?.copy?.trim() ||
      a.content?.concept?.trim() ||
      "";
    const result = await evaluateSemaforo({
      text,
      assetType: a.type,
      brand: brand as Pick<Brand, "name" | "tono" | "do_list" | "dont_list" | "ai_visibility_policy">,
    });
    if (result.color === "red") red++;
    else if (result.color === "amber") amber++;
    else green++;

    await supabase
      .from("assets")
      .update({ semaforo: result.color, semaforo_reasons: result.reasons })
      .eq("id", a.id);
  }

  // Mueve la tanda a 'review' (solo si ya está aprobada/en producción).
  await supabase
    .from("batches")
    .update({ status: "review" })
    .eq("id", id)
    .in("status", ["approved", "producing", "ready"]);

  return NextResponse.json({ ok: true, evaluated: assets.length, red, amber, green });
}
