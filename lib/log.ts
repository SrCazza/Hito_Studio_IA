/**
 * Logging de errores centralizado (M7). Hoy escribe a la consola del servidor
 * (visible en los logs de Vercel). Está listo para reenviar a Sentry: cuando
 * `SENTRY_DSN` exista, se engancha aquí el `captureException` — un solo punto.
 *
 * Regla: stack traces solo en logs; al usuario se le muestra un mensaje legible
 * (ver app/error.tsx). (CLAUDE.md §Convenciones)
 */
export function logError(scope: string, error: unknown, meta?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(
    JSON.stringify({ level: "error", scope, message, meta, ts: new Date().toISOString() })
  );
  if (stack) {
    console.error(stack);
  }
  // TODO(Sentry): if (process.env.SENTRY_DSN) Sentry.captureException(error, { tags: { scope }, extra: meta });
}
