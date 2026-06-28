/**
 * Validación de métricas (Zod). Entrada manual (el humano registra lo que ve en
 * la plataforma) o, en el futuro, el colector de n8n. Cliente Y servidor.
 */
import { z } from "zod";

/** Tipos de métrica que registramos por pieza. */
export const METRIC_TYPES = [
  "impressions",
  "reach",
  "likes",
  "comments",
  "shares",
  "saves",
  "clicks",
] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

export const METRIC_LABELS: Record<MetricType, string> = {
  impressions: "Impresiones",
  reach: "Alcance",
  likes: "Me gusta",
  comments: "Comentarios",
  shares: "Compartidos",
  saves: "Guardados",
  clicks: "Clics",
};

const metricValue = z.coerce.number().int().min(0).max(1_000_000_000).optional();

export const metricsEntrySchema = z.object({
  asset_id: z.string().uuid(),
  platform: z.string().trim().max(60).optional().or(z.literal("")),
  metrics: z.object({
    impressions: metricValue,
    reach: metricValue,
    likes: metricValue,
    comments: metricValue,
    shares: metricValue,
    saves: metricValue,
    clicks: metricValue,
  }),
});

export type MetricsEntry = z.infer<typeof metricsEntrySchema>;
