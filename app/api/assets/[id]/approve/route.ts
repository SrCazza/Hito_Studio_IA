/**
 * POST /api/assets/[id]/approve - el humano acepta una pieza en la revisión.
 * Marca `content.accepted = true` (la mano de diseñador del semáforo).
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  // RLS confirma propiedad; leemos para fusionar el jsonb `content`.
  const { data: asset } = await supabase
    .from("assets")
    .select("id, content")
    .eq("id", id)
    .maybeSingle<{ id: string; content: Record<string, unknown> | null }>();
  if (!asset) return NextResponse.json({ error: "Pieza no encontrada." }, { status: 404 });

  const { error } = await supabase
    .from("assets")
    .update({ content: { ...(asset.content ?? {}), accepted: true } })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
