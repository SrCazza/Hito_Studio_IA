/**
 * POST /api/strategy - (re)genera el plan de una tanda (BLUEPRINT §4).
 * Body: { batch_id }. Requiere sesión; la propiedad la garantiza RLS.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateAndPersistPlan } from "@/lib/batches";

export const runtime = "nodejs";

const bodySchema = z.object({ batch_id: z.string().uuid() });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const result = await generateAndPersistPlan(parsed.data.batch_id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ plan: result.plan, estimated_cost: result.estimatedCost });
}
