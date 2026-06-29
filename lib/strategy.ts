/**
 * Estratega (LLM). Cruza el perfil de marca + el brief + el mix de formatos y
 * propone un plan de piezas. Usa Sonnet (juicio). El resultado del LLM se PARSEA
 * y VALIDA con Zod antes de persistir (no confiar en texto libre del modelo).
 *
 * El número de piezas por tipo lo decide el usuario (mix), NO el LLM: aquí se
 * fuerza que el plan coincida exactamente con el mix pedido, para que el costo
 * estimado sea íntegro (CLAUDE.md guardrail #4).
 *
 * Cada pieza incluye un `image_prompt` técnico (inglés, prompt-engineering) que
 * usará el motor de imagen (FAL). El usuario puede inspeccionarlo/editarlo.
 */
import "server-only";
import { z } from "zod";
import { completeJson, MODELS } from "@/lib/llm";
import { expandMix, MIX_LABELS, type FormatMix, type MixType } from "@/lib/validation/batch";
import { PLATFORM_VALUES, normalizePlatform } from "@/lib/platforms";
import type { AssetType, Brand } from "@/lib/types/database";

export const planPieceSchema = z.object({
  type: z.string(),
  platform_target: z.string().max(60).optional().default(""),
  concept: z.string().max(600).default(""),
  copy: z.string().max(2000).optional().default(""),
  image_prompt: z.string().max(1500).optional().default(""),
  rationale: z.string().max(600).optional().default(""),
});

export const planSchema = z.object({
  rationale: z.string().max(2000).default(""),
  pieces: z.array(planPieceSchema).default([]),
});

export type PlanPiece = {
  type: AssetType;
  platform_target: string;
  concept: string;
  copy: string;
  image_prompt: string;
  rationale: string;
};

export type Plan = {
  rationale: string;
  pieces: PlanPiece[];
};

const SYSTEM = [
  "Eres un estratega de contenido para redes sociales y un experto en prompt-engineering de imagen,",
  "que trabaja para un diseñador. Cruzas el perfil de la marca con un brief y propones piezas concretas.",
  "Principios: honesto (sin claims inflados ni cifras inventadas), fiel al tono y a las listas SI/NO de la marca,",
  "asistivo sobre material real antes que generativo desde cero.",
  "No uses el guion largo como separador en ningún texto; usa coma, punto o dos puntos.",
  "Devuelves EXACTAMENTE una pieza por cada slot que se te da, en el MISMO orden y con el MISMO type.",
  "`concept` describe la idea visual/editorial; `copy` es el caption sugerido en español (conciso, < 280 caracteres);",
  "`platform_target` es UNA de estas plataformas: Instagram, TikTok, Twitter, Facebook (nada más).",
  "`image_prompt` es un prompt TÉCNICO en INGLÉS para un modelo de imagen, escrito por un experto:",
  "describe sujeto, encuadre y composición, medio/estilo (editorial photography, 3D render, flat vector illustration,",
  "clean infographic layout) según el tipo de pieza, iluminación, lente/cámara cuando sea foto, paleta de color",
  "(usa los colores de la marca si se dan), mood y aspect ratio, con tags de calidad y detalle (high detail,",
  "sharp focus, professional). Si la política de IA visible es 'baja' o 'minima', NO generes rostros humanos",
  "realistas: usa manos, objetos, entornos, texturas o estilizado. Mantén el prompt fiel a la marca.",
].join(" ");

/** Esquema (tool-use) que el modelo debe rellenar, garantiza JSON válido. */
const PLAN_TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    rationale: { type: "string", description: "Enfoque general del plan (2-3 frases)." },
    pieces: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", description: "Tipo de pieza del slot (no lo cambies)." },
          platform_target: {
            type: "string",
            enum: PLATFORM_VALUES,
            description: "Plataforma destino, solo una de las permitidas.",
          },
          concept: { type: "string", description: "Idea visual/editorial concreta." },
          copy: { type: "string", description: "Caption en español, conciso (< 280 caracteres)." },
          image_prompt: {
            type: "string",
            description: "Prompt técnico en inglés para el modelo de imagen (experto, detallado).",
          },
          rationale: { type: "string", description: "Por qué encaja con la marca." },
        },
        required: ["type", "concept", "copy", "platform_target", "image_prompt"],
      },
    },
  },
  required: ["rationale", "pieces"],
};

function brandColors(brand: Brand): string {
  const kit = brand.brand_kit as { colors?: unknown } | null;
  const colors = Array.isArray(kit?.colors) ? (kit?.colors as unknown[]).filter((c) => typeof c === "string") : [];
  return colors.length ? (colors as string[]).join(", ") : "(no indicados)";
}

function describeBrand(brand: Brand): string {
  const list = (xs: string[]) => (xs.length ? xs.map((x) => `  - ${x}`).join("\n") : "  (ninguno)");
  return [
    `Marca: ${brand.name}`,
    `Sector: ${brand.sector || "(no indicado)"}`,
    `Objetivo: ${brand.objetivo || "(no indicado)"}`,
    `Público: ${brand.publico || "(no indicado)"}`,
    `Tono de voz: ${brand.tono || "(no indicado)"}`,
    `Política de IA visible: ${brand.ai_visibility_policy}`,
    `Colores de marca: ${brandColors(brand)}`,
    `Qué SI:\n${list(brand.do_list ?? [])}`,
    `Qué NO:\n${list(brand.dont_list ?? [])}`,
  ].join("\n");
}

/**
 * Genera el plan. `slots` es la lista expandida de tipos pedidos (orden estable).
 * El resultado siempre tiene `pieces.length === slots.length` y los tipos
 * coinciden con el mix (se fuerza server-side).
 */
export async function generateStrategy(
  brand: Brand,
  brief: string,
  mix: FormatMix
): Promise<Plan> {
  const slots = expandMix(mix);
  if (slots.length === 0) {
    return { rationale: "", pieces: [] };
  }

  const slotsList = slots
    .map((t, i) => `  ${i + 1}. type="${t}" (${MIX_LABELS[t as MixType] ?? t})`)
    .join("\n");

  const prompt = [
    describeBrand(brand),
    "",
    `Brief de la tanda:\n${brief?.trim() || "(sin brief; usa el perfil de la marca)"}`,
    "",
    `Slots a planear (${slots.length}), en este orden exacto:`,
    slotsList,
    "",
    "Devuelve el JSON con una pieza por slot, mismo orden y mismo type.",
  ].join("\n");

  const raw = await completeJson({
    model: MODELS.sonnet,
    system: SYSTEM,
    prompt,
    toolName: "proponer_plan",
    toolDescription: "Propone el plan de piezas para la tanda, una por slot.",
    schema: PLAN_TOOL_SCHEMA,
    maxTokens: Math.min(8000, 1200 + slots.length * 500),
  });

  const parsed = planSchema.parse(raw);

  // Reconciliación: el mix manda. Una pieza por slot, type forzado al del slot.
  const pieces: PlanPiece[] = slots.map((type, i) => {
    const p = parsed.pieces[i];
    return {
      type,
      platform_target: normalizePlatform(p?.platform_target),
      concept: p?.concept?.trim() || "",
      copy: p?.copy?.trim() || "",
      image_prompt: p?.image_prompt?.trim() || "",
      rationale: p?.rationale?.trim() || "",
    };
  });

  return { rationale: parsed.rationale?.trim() || "", pieces };
}
