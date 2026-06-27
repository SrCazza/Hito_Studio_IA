/**
 * Esquemas de validación de tanda (Zod). Se usan en cliente Y servidor.
 */
import { z } from "zod";
import type { AssetType } from "@/lib/types/database";

/**
 * Tipos de pieza que el usuario puede pedir en el mix del MVP.
 * (avatar/voice son excepciones de pago por uso — se habilitan más adelante.)
 */
export const MIX_TYPES = ["post", "carousel", "infographic", "motion", "reel"] as const;
export type MixType = (typeof MIX_TYPES)[number];

export const MIX_LABELS: Record<MixType, string> = {
  post: "Post",
  carousel: "Carrusel",
  infographic: "Infografía",
  motion: "Motion",
  reel: "Reel",
};

/** Tope por tipo para evitar tandas accidentalmente enormes (control de costo). */
const MAX_PER_TYPE = 20;

/** Mix de formatos: cuántas piezas de cada tipo. */
export const formatMixSchema = z.object(
  Object.fromEntries(
    MIX_TYPES.map((t) => [t, z.coerce.number().int().min(0).max(MAX_PER_TYPE).default(0)])
  ) as Record<MixType, z.ZodDefault<z.ZodNumber>>
);

export type FormatMix = z.infer<typeof formatMixSchema>;

export const batchBriefSchema = z
  .object({
    title: z.string().trim().min(2, "El título debe tener al menos 2 caracteres.").max(160),
    brief: z.string().trim().max(4000).optional().or(z.literal("")),
    format_mix: formatMixSchema,
    // Tope de presupuesto opcional; si se omite, se usa el default del entorno.
    budget_cap: z.coerce.number().min(0).max(100000).optional(),
  })
  .refine((v) => totalPieces(v.format_mix) >= 1, {
    message: "Pide al menos una pieza en el mix.",
    path: ["format_mix"],
  })
  .refine((v) => totalPieces(v.format_mix) <= 50, {
    message: "Máximo 50 piezas por tanda.",
    path: ["format_mix"],
  });

export type BatchBriefInput = z.input<typeof batchBriefSchema>;
export type BatchBriefValues = z.output<typeof batchBriefSchema>;

/** Suma total de piezas pedidas en el mix. */
export function totalPieces(mix: FormatMix): number {
  return MIX_TYPES.reduce((sum, t) => sum + (mix[t] ?? 0), 0);
}

/** Expande el mix en una lista plana de tipos de pieza a planear. */
export function expandMix(mix: FormatMix): AssetType[] {
  const out: AssetType[] = [];
  for (const t of MIX_TYPES) {
    for (let i = 0; i < (mix[t] ?? 0); i++) out.push(t);
  }
  return out;
}
