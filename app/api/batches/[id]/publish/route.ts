/**
 * POST /api/batches/[id]/publish — marca la tanda como `published`.
 *
 * La publicación es MANUAL: el humano sube el paquete a cada plataforma a mano
 * (principio del sistema — mano-en-el-loop). Esto solo registra que ya se hizo.
 * Solo se permite desde una tanda revisada (`review`/`ready`).
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

  if (!["review", "ready"].includes(batch.status)) {
    return NextResponse.json(
      { error: `No se puede publicar una tanda en estado «${batch.status}».` },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("batches")
    .update({ status: "published" })
    .eq("id", id)
    .in("status", ["review", "ready"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: "published" });
}
