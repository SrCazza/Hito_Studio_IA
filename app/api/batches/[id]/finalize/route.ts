/**
 * POST /api/batches/[id]/finalize - cierra la revisión: marca la tanda `ready`.
 * Solo si TODAS las piezas fueron aceptadas por el humano (mano-en-el-loop).
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
    return NextResponse.json({ error: "Tanda inválida." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: batch } = await supabase
    .from("batches")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!batch) return NextResponse.json({ error: "Tanda no encontrada." }, { status: 404 });

  const { data: assets } = await supabase
    .from("assets")
    .select("id, content")
    .eq("batch_id", id);
  const rows = (assets ?? []) as { id: string; content: { accepted?: boolean } | null }[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "La tanda no tiene piezas." }, { status: 409 });
  }
  const pending = rows.filter((a) => a.content?.accepted !== true).length;
  if (pending > 0) {
    return NextResponse.json(
      { error: `Faltan ${pending} pieza(s) por aprobar.`, pending },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("batches")
    .update({ status: "ready" })
    .eq("id", id)
    .in("status", ["review", "approved", "producing"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: "ready" });
}
