import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function Footer() {
  return (
    <footer className="border-t border-border">
      {/* CTA final */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 glow-brand" />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Tu próxima tanda, sin las horas.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Empieza gratis. La IA hace el volumen; tú pones el criterio.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login?mode=signup"
              className="press w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 sm:w-auto"
            >
              Empieza gratis
            </Link>
            <Link
              href="/login"
              className="press w-full rounded-full border border-border-strong bg-surface px-6 py-3 text-sm font-semibold transition hover:bg-surface-2 sm:w-auto"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Wordmark size={26} />
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Hito IA Studio · Humano en el loop.
          </p>
        </div>
      </div>
    </footer>
  );
}
