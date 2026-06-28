/**
 * Helpers de la cola de jobs. Compartidos por approve (encolar) y regenerate
 * (re-encolar una pieza).
 */
import type { AssetType, JobType } from "@/lib/types/database";

/** Mapea el tipo de pieza al tipo de job de producción de media. */
export const ASSET_TO_JOB: Record<AssetType, JobType> = {
  post: "image",
  carousel: "image",
  infographic: "image",
  motion: "motion",
  reel: "video",
  avatar: "avatar",
  voice: "voice",
};

/**
 * Clave de idempotencia de un job (anti-doble-cobro, guardrail #2).
 * `version` cambia al regenerar para que sea una generación nueva y deliberada
 * (no un reintento del mismo job).
 */
export function idempotencyKey(assetId: string, jobType: JobType, version = 1): string {
  return `${assetId}:${jobType}:v${version}`;
}
