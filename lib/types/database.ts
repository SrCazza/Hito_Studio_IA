/**
 * Tipos del modelo de datos (BLUEPRINT §2).
 * Escritos a mano para el MVP. Cuando el schema se estabilice se pueden
 * regenerar con `supabase gen types typescript`.
 */

export type ProfileRole = "owner" | "admin" | "client";
export type AiVisibility = "permitida" | "baja" | "minima";
export type BatchStatus =
  | "draft"
  | "planned"
  | "approved"
  | "producing"
  | "review"
  | "ready"
  | "published"
  | "archived";
export type AssetType =
  | "post"
  | "carousel"
  | "infographic"
  | "motion"
  | "reel"
  | "avatar"
  | "voice";
export type AssetStatus = "pending" | "producing" | "ready" | "error";
export type SemaforoColor = "green" | "amber" | "red";
export type JobType = "copy" | "image" | "motion" | "video" | "voice" | "avatar";
export type JobStatus = "pending" | "processing" | "done" | "error";

export interface Profile {
  id: string;
  email: string;
  role: ProfileRole;
  created_at: string;
}

export interface Brand {
  id: string;
  owner_id: string;
  name: string;
  sector: string | null;
  objetivo: string | null;
  publico: string | null;
  tono: string | null;
  do_list: string[];
  dont_list: string[];
  brand_kit: Record<string, unknown>;
  ai_visibility_policy: AiVisibility;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  brand_id: string;
  title: string;
  brief: string | null;
  strategy: Record<string, unknown> | null;
  format_mix: Record<string, unknown> | null;
  status: BatchStatus;
  estimated_cost: number;
  budget_cap: number | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface Asset {
  id: string;
  batch_id: string;
  type: AssetType;
  status: AssetStatus;
  semaforo: SemaforoColor | null;
  semaforo_reasons: unknown[];
  content: Record<string, unknown>;
  prompt: Record<string, unknown>;
  media_url: string | null;
  cost: number;
  platform_target: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  asset_id: string;
  batch_id: string;
  type: JobType;
  status: JobStatus;
  idempotency_key: string;
  attempts: number;
  last_error: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface CostLog {
  id: string;
  brand_id: string;
  batch_id: string | null;
  provider: string;
  units: number;
  cost: number;
  created_at: string;
}

export interface Metric {
  id: string;
  asset_id: string | null;
  batch_id: string | null;
  platform: string | null;
  metric_type: string;
  value: number | null;
  captured_at: string;
}
