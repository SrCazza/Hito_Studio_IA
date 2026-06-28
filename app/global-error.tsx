"use client";

/**
 * Error boundary global (M7): captura errores en el layout raíz. Debe renderizar
 * su propio <html>/<body> porque reemplaza el layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Error de la aplicación</h1>
          <p className="text-sm text-neutral-400">
            Ocurrió un error inesperado. Reintenta la operación.
          </p>
          <button
            onClick={reset}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm transition hover:border-neutral-500"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
