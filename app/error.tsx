"use client";

import { useEffect } from "react";

/**
 * Error boundary de segmento (M7). Muestra un estado de error legible y permite
 * reintentar. El detalle técnico va a los logs, no a la pantalla.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ui-error]", error.digest, error.message);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Algo salió mal</h1>
      <p className="text-sm text-neutral-400">
        Ocurrió un error inesperado. Puedes reintentar; si persiste, revisa los logs.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
      >
        Reintentar
      </button>
    </main>
  );
}
