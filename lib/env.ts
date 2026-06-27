/**
 * Acceso validado a variables de entorno.
 * - Las `NEXT_PUBLIC_*` pueden leerse en cliente.
 * - El resto (service role, secretos) SOLO en servidor: `serverEnv()` lanza si
 *   se invoca en el browser. (CLAUDE.md guardrail #6)
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu .env.local (ver .env.example).`);
  }
  return value;
}

// Getters lazy: validan al USARSE (runtime), no al importar el módulo.
// Así `next build` no falla por falta de envs en tiempo de compilación.
export const publicEnv = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseAnonKey() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
};

export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() no debe usarse en el cliente.");
  }
  return {
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? "",
    n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET ?? "",
    appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
    defaultBudgetCapUsd: Number(process.env.DEFAULT_BUDGET_CAP_USD ?? "25"),
  };
}
