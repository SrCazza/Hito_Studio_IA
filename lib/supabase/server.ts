/**
 * Cliente de Supabase para Server Components / Server Actions / Route Handlers.
 * Lee la sesión de las cookies. Respeta RLS (anon key + sesión del usuario).
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un Server Component sin respuesta mutable: lo refresca
          // el middleware. Seguro de ignorar.
        }
      },
    },
  });
}
