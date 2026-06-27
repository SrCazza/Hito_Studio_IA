/**
 * Cliente ADMIN (service_role) — SALTA RLS.
 * SOLO en rutas de servidor / tareas de confianza (encolar jobs, callbacks de
 * n8n). NUNCA se importa desde un Client Component. (CLAUDE.md guardrail #6)
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

export function createAdminClient() {
  const { supabaseServiceRoleKey } = serverEnv();
  return createClient(publicEnv.supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
