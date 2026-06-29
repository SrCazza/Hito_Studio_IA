/**
 * POST /api/assets/[id]/prompt - actualiza el `image_prompt` de una pieza.
 * El prompt de imagen es uno de los grandes diferenciadores de calidad, así que
 * el usuario puede inspeccionarlo y editarlo ANTES de producir. Solo se permite
 * mientras la pieza no esté produciéndose ni lista.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const bodySchema = z.object({ image_prompt: z.string().max(4000) });

export async function POST(
  request: NextRequest,
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

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  // RLS confirma propiedad; leemos para fusionar el jsonb content.
  const { data: asset } = await supabase
    .from("assets")
    .select("id, status, content")
    .eq("id", id)
    .maybeSingle<{ id: string; status: string; content: Record<string, unknown> | null }>();
  if (!asset) return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });

  if (asset.status === "producing" || asset.status === "ready") {
    return NextResponse.json(
      { error: "No se puede editar el prompt mientras la pieza se produce o ya está lista." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("assets")
    .update({ content: { ...(asset.content ?? {}), image_prompt: parsed.data.image_prompt.trim() } })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
