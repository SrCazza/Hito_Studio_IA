/**
 * POST /api/brands/assist — onboarding asistido por LLM.
 * Sugiere el contenido de un campo del perfil de marca a partir del contexto
 * que el usuario ya escribió. Requiere sesión.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { completeText, MODELS } from "@/lib/llm";

export const runtime = "nodejs";

const FIELD_LABELS: Record<string, string> = {
  objetivo: "el objetivo de comunicación de la marca",
  publico: "el público objetivo de la marca",
  tono: "el tono de voz de la marca",
};

const bodySchema = z.object({
  field: z.enum(["objetivo", "publico", "tono"]),
  context: z.object({
    name: z.string().max(120).optional(),
    sector: z.string().max(200).optional(),
    objetivo: z.string().max(2000).optional(),
    publico: z.string().max(2000).optional(),
    tono: z.string().max(2000).optional(),
  }),
});

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

  const { field, context } = parsed.data;
  const target = FIELD_LABELS[field];

  try {
    const suggestion = await completeText({
      model: MODELS.haiku,
      maxTokens: 220,
      system:
        "Eres un estratega de marca. Ayudas a un diseñador a completar el perfil de su marca. " +
        "Responde SOLO con el texto sugerido para el campo pedido, en español, conciso (1-3 frases), " +
        "sin comillas, sin encabezados, sin explicaciones. Honesto, sin claims inflados.",
      prompt:
        `Marca: ${context.name || "(sin nombre)"}\n` +
        `Sector: ${context.sector || "(no indicado)"}\n` +
        `Objetivo actual: ${context.objetivo || "(vacío)"}\n` +
        `Público actual: ${context.publico || "(vacío)"}\n` +
        `Tono actual: ${context.tono || "(vacío)"}\n\n` +
        `Sugiere ${target}.`,
    });
    return NextResponse.json({ suggestion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar la sugerencia.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
