import Link from "next/link";
import { IconArrow } from "@/components/landing/Icons";
import { PanelMockup } from "@/components/landing/PanelMockup";
import { PLATFORMS } from "@/lib/platforms";

// Posiciones de los logos flotantes (estilo Buffer), solo desktop.
const floats = [
  "left-[7%] top-[20%]",
  "left-[15%] top-[56%]",
  "right-[9%] top-[18%]",
  "right-[16%] top-[52%]",
];

const stats = [
  { n: "7", label: "pasos claros, de brief a publicar" },
  { n: "4", label: "categorías de rojo automático" },
  { n: "$0", label: "se gasta sin tu aprobación" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* grid sutil de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(70% 55% at 50% 25%, #000 40%, transparent 100%)",
        }}
      />
      {/* logos de plataformas flotando */}
      {PLATFORMS.map(({ value, Icon }, i) => (
        <span
          key={value}
          className={`pointer-events-none absolute hidden text-muted/40 lg:block ${floats[i]}`}
        >
          <span
            className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm"
            style={{ ["--fd" as string]: `${i * 600}ms` }}
          >
            <Icon size={22} />
          </span>
        </span>
      ))}

      <div className="relative mx-auto max-w-5xl px-6 pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted shadow-sm">
            <span className="flex gap-1">
              <i className="h-1.5 w-1.5 rounded-full bg-green" />
              <i className="h-1.5 w-1.5 rounded-full bg-amber" />
              <i className="h-1.5 w-1.5 rounded-full bg-red" />
            </span>
            Humano en el loop · tú apruebas con el semáforo
          </span>

          <h1
            className="animate-fade-up mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl"
            style={{ ["--d" as string]: "70ms" }}
          >
            El trabajo pesado, hecho.
            <br />
            <span className="text-brand">La última palabra, tuya.</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-6 max-w-xl text-pretty text-lg text-muted"
            style={{ ["--d" as string]: "150ms" }}
          >
            Hito IA Studio produce tu contenido en volumen, lee tus datos y mejora tu marca. Tú
            diriges y apruebas, pieza por pieza, antes de publicar.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ ["--d" as string]: "230ms" }}
          >
            <Link
              href="/login?mode=signup"
              className="press group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 sm:w-auto"
            >
              Empieza gratis
              <IconArrow className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="press inline-flex w-full items-center justify-center rounded-full border border-border-strong bg-surface px-6 py-3.5 text-sm font-semibold transition hover:bg-surface-2 sm:w-auto"
            >
              Iniciar sesión
            </Link>
          </div>
          <p
            className="animate-fade-up mt-4 text-xs text-muted"
            style={{ ["--d" as string]: "300ms" }}
          >
            Sin tarjeta · una marca o varias · publicación con tu visto bueno
          </p>
        </div>

        {/* mockup del panel real */}
        <div
          className="animate-fade-up relative mx-auto mt-16 max-w-3xl"
          style={{ ["--d" as string]: "380ms" }}
        >
          <PanelMockup />
        </div>

        {/* stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card hover-lift p-5 text-center">
              <p className="font-display text-4xl tracking-tight text-foreground">{s.n}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
