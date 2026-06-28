import Link from "next/link";
import { IconArrow } from "@/components/landing/Icons";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-[420px] glow-brand" />
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-60" />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted"
            style={{ ["--d" as string]: "0ms" }}
          >
            <span className="flex gap-1">
              <Dot className="bg-green" />
              <Dot className="bg-amber" />
              <Dot className="bg-red" />
            </span>
            Humano-en-el-loop · tú apruebas con el semáforo
          </span>

          <h1
            className="animate-fade-up font-display mt-6 text-4xl leading-[1.05] tracking-tight sm:text-6xl"
            style={{ ["--d" as string]: "80ms" }}
          >
            El trabajo pesado, hecho.
            <br />
            <span className="text-gradient-brand">La última palabra, tuya.</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-6 max-w-xl text-balance text-base text-muted sm:text-lg"
            style={{ ["--d" as string]: "160ms" }}
          >
            Hito IA Studio es tu asistente de contenido: produce en volumen, lee tus datos y mejora
            el perfil de tu marca. Tú diriges y apruebas, pieza por pieza, antes de publicar.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ ["--d" as string]: "240ms" }}
          >
            <Link
              href="/login?mode=signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 sm:w-auto"
            >
              Registrarte
              <IconArrow className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-md border border-border-strong px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface sm:w-auto"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`h-2 w-2 rounded-full ${className}`} />;
}
