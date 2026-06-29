/**
 * Analista (BLUEPRINT §3.2 / M6). Cruza las métricas de una tanda publicada con
 * el perfil de la marca y resume qué funcionó y qué ajustar — concreto, para
 * retroalimentar perfil/estrategia. Usa Sonnet (juicio) con salida estructurada.
 */
import "server-only";
import { z } from "zod";
import { completeJson, MODELS } from "@/lib/llm";
import type { Brand } from "@/lib/types/database";

export const analysisSchema = z.object({
  summary: z.string().max(1500).default(""),
  highlights: z.array(z.string().max(400)).max(8).default([]),
  adjustments: z.array(z.string().max(400)).max(8).default([]),
});

export type Analysis = z.infer<typeof analysisSchema>;

export type AssetMetrics = {
  type: string;
  platform: string;
  caption: string;
  metrics: Record<string, number>;
};

function describeBrand(brand: Pick<Brand, "name" | "tono" | "objetivo" | "publico" | "do_list" | "dont_list">): string {
  return [
    `Marca: ${brand.name}`,
    `Objetivo: ${brand.objetivo || "(no indicado)"}`,
    `Público: ${brand.publico || "(no indicado)"}`,
    `Tono: ${brand.tono || "(no indicado)"}`,
    `Qué SÍ: ${(brand.do_list ?? []).join("; ") || "(ninguno)"}`,
    `Qué NO: ${(brand.dont_list ?? []).join("; ") || "(ninguno)"}`,
  ].join("\n");
}

function describePieces(pieces: AssetMetrics[]): string {
  return pieces
    .map((p, i) => {
      const m = Object.entries(p.metrics)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ");
      return `${i + 1}. [${p.type}/${p.platform}] métricas: ${m || "(sin datos)"} | copy: ${p.caption.slice(0, 120)}`;
    })
    .join("\n");
}

/**
 * Genera el reporte del analista. `pieces` lleva las métricas por pieza.
 * Devuelve resumen + lo que funcionó + ajustes concretos a perfil/estrategia.
 */
export async function analyzeBatch(
  brand: Pick<Brand, "name" | "tono" | "objetivo" | "publico" | "do_list" | "dont_list">,
  pieces: AssetMetrics[]
): Promise<Analysis> {
  const hasData = pieces.some((p) => Object.keys(p.metrics).length > 0);

  const raw = await completeJson({
    model: MODELS.sonnet,
    system:
      "Eres analista de contenido de redes. Cruzas las métricas de una tanda con el perfil de la marca " +
      "y resumes qué funcionó y qué ajustar. Eres concreto y honesto: nada de generalidades. " +
      "`adjustments` deben ser cambios accionables al perfil (tono, qué SÍ / qué NO, público) o a la " +
      "estrategia de la próxima tanda. Si faltan datos, dilo y propón qué medir. Responde en español. " +
      "No uses el guion largo como separador; usa coma, punto o dos puntos.",
    prompt:
      `${describeBrand(brand)}\n\n` +
      `Piezas de la tanda y su rendimiento:\n${describePieces(pieces)}\n\n` +
      (hasData
        ? "Analiza el rendimiento y propón ajustes concretos."
        : "Aún no hay métricas cargadas; explica qué medir y propón hipótesis a validar."),
    toolName: "reporte_analista",
    toolDescription: "Resumen del rendimiento + qué funcionó + ajustes concretos.",
    schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Resumen ejecutivo (2-4 frases)." },
        highlights: { type: "array", items: { type: "string" }, description: "Qué funcionó / hallazgos." },
        adjustments: {
          type: "array",
          items: { type: "string" },
          description: "Ajustes concretos al perfil de marca o a la estrategia de la próxima tanda.",
        },
      },
      required: ["summary", "highlights", "adjustments"],
    },
    maxTokens: 1200,
  });

  return analysisSchema.parse(raw);
}
