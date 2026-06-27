/**
 * Esquemas de validación de marca (Zod). Se usan en cliente Y servidor.
 */
import { z } from "zod";

export const aiVisibilitySchema = z.enum(["permitida", "baja", "minima"]);

export const brandFormSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120),
  sector: z.string().trim().max(160).optional().or(z.literal("")),
  objetivo: z.string().trim().max(2000).optional().or(z.literal("")),
  publico: z.string().trim().max(2000).optional().or(z.literal("")),
  tono: z.string().trim().max(2000).optional().or(z.literal("")),
  // Listas: en el form llegan como texto (una línea por ítem); se normalizan.
  do_list: z.array(z.string().trim().min(1)).max(50).default([]),
  dont_list: z.array(z.string().trim().min(1)).max(50).default([]),
  ai_visibility_policy: aiVisibilitySchema.default("baja"),
});

export type BrandFormInput = z.input<typeof brandFormSchema>;
export type BrandFormValues = z.output<typeof brandFormSchema>;

/** Convierte un textarea (una línea por ítem) en un array limpio. */
export function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}
