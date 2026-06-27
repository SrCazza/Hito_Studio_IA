/**
 * Estimación de costo por tipo de pieza (USD).
 *
 * Estos números son ESTIMADOS para mostrar el gate de presupuesto antes de
 * gastar (CLAUDE.md guardrail #4). El costo REAL se registra en `cost_log`
 * cuando n8n produce (M3). Basado en la regla de intercambio del BLUEPRINT §6:
 * 1 reel generativo ≈ 15-50 imágenes ≈ motion (≈$0).
 *
 * ⚠️ Los precios de las APIs cambian seguido — verifica/ajusta al implementar.
 */
import type { AssetType } from "@/lib/types/database";

/** Costo estimado por pieza, en USD. Configurable. */
export const ASSET_COST_USD: Record<AssetType, number> = {
  post: 0.05, // copy (Haiku) + 1 imagen (fal.ai)
  carousel: 0.18, // copy + varias imágenes
  infographic: 0.1, // copy + imagen con texto
  motion: 0.02, // composición con material real (≈$0)
  reel: 1.5, // video generativo (excepción cara)
  avatar: 2.0, // pago por uso
  voice: 0.3, // ElevenLabs
};

/** Suma el costo estimado de una lista de piezas según su tipo. */
export function estimateBatchCostUsd(pieces: { type: AssetType }[]): number {
  const total = pieces.reduce((sum, p) => sum + (ASSET_COST_USD[p.type] ?? 0), 0);
  // Redondea a 4 decimales (coincide con numeric(12,4) de la DB).
  return Math.round(total * 10000) / 10000;
}

/** Formatea un monto USD para la UI. */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
