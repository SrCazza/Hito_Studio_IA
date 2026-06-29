/**
 * Evaluador de semáforo (BLUEPRINT §5). Puntúa cada pieza:
 *  - 🟢 verde: pasa casi solo · 🟡 amarillo: échale ojo · 🔴 rojo: tú decides.
 *
 * REGLA CLAVE (guardrail #8): los **rojos automáticos son deterministas en
 * código**, no a criterio del LLM. Si una pieza cae en una de las 4 categorías
 * de rojo automático, es ROJA pase lo que pase el LLM. El LLM solo ASISTE para
 * decidir verde/amarillo cuando NO hay rojo automático.
 *
 * Las 4 categorías de rojo automático: caras humanas IA · claims de producto ·
 * cifras y datos · contenido sensible.
 */
import "server-only";
import { z } from "zod";
import { completeJson, MODELS } from "@/lib/llm";
import type { AiVisibility, AssetType, Brand, SemaforoColor } from "@/lib/types/database";

export type RedCategory = "caras_ia" | "claims" | "cifras" | "sensible";

export type SemaforoReason = { category: RedCategory | "llm"; detail: string };

export type SemaforoResult = {
  color: SemaforoColor;
  reasons: SemaforoReason[];
};

// ── Diccionarios deterministas (en minúsculas; se normaliza el texto) ─────────

const CLAIM_TERMS = [
  "el mejor", "la mejor", "los mejores", "las mejores", "número uno", "numero uno",
  "líder", "lider", "garantizado", "garantizada", "garantía total", "garantia total",
  "cura", "curar", "elimina", "milagro", "milagroso", "científicamente probado",
  "cientificamente probado", "comprobado", "resultados garantizados", "sin esfuerzo",
  "el único", "el unico", "insuperable", "revolucionario", "100% efectivo", "infalible",
];

const SENSITIVE_TERMS = [
  "salud", "médico", "medico", "medicina", "enfermedad", "tratamiento", "diagnóstico",
  "diagnostico", "política", "politica", "elecciones", "religión", "religion", "sexual",
  "menores", "violencia", "arma", "droga", "alcohol", "apuestas", "inversión", "inversion",
  "rentabilidad", "crédito", "credito", "préstamo", "prestamo", "abogado", "legal",
];

// Mención de personas/caras → si la imagen es generativa, es una cara IA.
const FACE_TERMS = [
  "rostro", "rostros", "cara humana", "retrato", "persona", "personas", "gente",
  "modelo", "hombre", "mujer", "niño", "niña", "nino", "nina", "selfie", "sonriendo",
];

// Tipos cuya imagen es generativa por defecto en el MVP (text-to-image).
const GENERATIVE_TYPES: AssetType[] = ["post", "carousel", "infographic", "reel", "avatar"];

function normalize(text: string): string {
  return (text || "").toLowerCase();
}

/** ¿El texto contiene cifras/datos que deben verificarse? (%, dinero, ranking, multiplicador) */
function hasFigures(text: string): boolean {
  return (
    /\d+\s?%/.test(text) || // porcentajes
    /(\$|€|usd|eur)\s?\d/i.test(text) || // dinero
    /\d+\s?(usd|eur|dólares|dolares|euros)/i.test(text) ||
    /#\s?\d+/.test(text) || // ranking #1
    /\b\d+\s?x\b/i.test(text) || // multiplicador 3x
    /\b(\d{2,})\s?(clientes|ventas|seguidores|usuarios|años|anos|millones|mil)\b/i.test(text)
  );
}

/**
 * Rojos automáticos deterministas. Devuelve las razones de cada categoría que
 * aplique. Si el array no está vacío → la pieza es ROJA, sí o sí.
 */
export function autoRedReasons(
  rawText: string,
  assetType: AssetType,
  aiVisibility: AiVisibility
): SemaforoReason[] {
  const text = normalize(rawText);
  const reasons: SemaforoReason[] = [];

  // 1) Cifras y datos.
  if (hasFigures(text)) {
    reasons.push({ category: "cifras", detail: "Contiene cifras/datos que deben verificarse antes de publicar." });
  }

  // 2) Claims de producto.
  const claim = CLAIM_TERMS.find((t) => text.includes(t));
  if (claim) {
    reasons.push({ category: "claims", detail: `Posible claim no verificable: «${claim}».` });
  }

  // 3) Caras humanas generadas por IA: avatar siempre; tipos generativos si el
  //    concepto menciona personas y la política de IA no es 'permitida'.
  if (assetType === "avatar") {
    reasons.push({ category: "caras_ia", detail: "Avatar: cara humana generada por IA, requiere revisión." });
  } else if (GENERATIVE_TYPES.includes(assetType) && aiVisibility !== "permitida") {
    const face = FACE_TERMS.find((t) => text.includes(t));
    if (face) {
      reasons.push({
        category: "caras_ia",
        detail: `Posible cara humana generada por IA («${face}») con política de IA «${aiVisibility}».`,
      });
    }
  }

  // 4) Contenido sensible.
  const sensitive = SENSITIVE_TERMS.find((t) => text.includes(t));
  if (sensitive) {
    reasons.push({ category: "sensible", detail: `Tema sensible: «${sensitive}», requiere criterio humano.` });
  }

  return reasons;
}

const llmSchema = z.object({
  color: z.enum(["green", "amber"]),
  reason: z.string().max(400).default(""),
});

/**
 * Evalúa una pieza. Primero los rojos automáticos (deterministas). Si hay
 * alguno → rojo. Si no, el LLM (Sonnet) asiste para decidir verde/amarillo.
 */
export async function evaluateSemaforo(args: {
  text: string;
  assetType: AssetType;
  brand: Pick<Brand, "name" | "tono" | "do_list" | "dont_list" | "ai_visibility_policy">;
}): Promise<SemaforoResult> {
  const { text, assetType, brand } = args;

  // Rojos automáticos: mandan sobre el LLM.
  const autoReds = autoRedReasons(text, assetType, brand.ai_visibility_policy);
  if (autoReds.length > 0) {
    return { color: "red", reasons: autoReds };
  }

  // Sin rojo automático → el LLM asiste (verde/amarillo).
  try {
    const raw = await completeJson({
      model: MODELS.sonnet,
      system:
        "Eres revisor de marca. Evalúas si una pieza de contenido encaja con la marca y suena honesta. " +
        "Devuelves color 'green' (pasa casi solo) o 'amber' (échale ojo) y una razón breve. " +
        "Nunca devuelves 'red' (los rojos los decide el sistema, no tú). " +
        "No uses el guion largo como separador; usa coma o punto.",
      prompt:
        `Marca: ${brand.name}\n` +
        `Tono: ${brand.tono || "(no indicado)"}\n` +
        `Qué SÍ: ${(brand.do_list ?? []).join("; ") || "(ninguno)"}\n` +
        `Qué NO: ${(brand.dont_list ?? []).join("; ") || "(ninguno)"}\n\n` +
        `Pieza (${assetType}):\n${text || "(sin texto)"}`,
      toolName: "evaluar_pieza",
      toolDescription: "Evalúa la pieza y devuelve color (green/amber) + razón.",
      schema: {
        type: "object",
        properties: {
          color: { type: "string", enum: ["green", "amber"] },
          reason: { type: "string", description: "Razón breve de la evaluación." },
        },
        required: ["color", "reason"],
      },
      maxTokens: 300,
    });
    const parsed = llmSchema.parse(raw);
    return {
      color: parsed.color,
      reasons: parsed.reason ? [{ category: "llm", detail: parsed.reason }] : [],
    };
  } catch {
    // Si el LLM falla, no bloqueamos: amarillo para que el humano revise.
    return {
      color: "amber",
      reasons: [{ category: "llm", detail: "No se pudo evaluar automáticamente; revisar a mano." }],
    };
  }
}
