/**
 * Cliente de Supabase para el navegador (Client Components).
 * Usa la anon key (pública) — la seguridad real la da RLS.
 */
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
