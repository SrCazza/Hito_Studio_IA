import { Logo } from "@/components/brand/Logo";

type Sem = "green" | "amber" | "red";
const dot: Record<Sem, string> = { green: "bg-green", amber: "bg-amber", red: "bg-red" };

function Tag({ children, sem }: { children: React.ReactNode; sem: Sem }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs font-medium text-muted">{children}</span>
      <span className={`h-2 w-2 rounded-full ${dot[sem]}`} />
    </div>
  );
}

export function ExamplesGallery() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-brand-400">Lo que puedes generar</p>
        <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
          Piezas con criterio, no relleno.
        </h2>
        <p className="mt-4 text-muted">
          Posts, carruseles e infografías a partir de tu material y tu voz. Estos son ejemplos del
          tipo de salida —tú eliges, ajustas y apruebas.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Post editorial */}
        <article className="card hover-lift overflow-hidden">
          <div className="relative aspect-[4/5] bg-[#0e2a1f]">
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,rgba(52,211,153,0.3),transparent_55%)]" />
            <Logo size={22} badge={false} className="absolute right-4 top-4 text-white/60" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-brand-400">Post</p>
              <p className="font-display mt-2 text-2xl leading-tight text-white">
                Honesto sobre el proceso.
              </p>
            </div>
          </div>
          <Tag sem="green">Post · Instagram</Tag>
        </article>

        {/* Infografía */}
        <article className="card hover-lift overflow-hidden">
          <div className="relative aspect-[4/5] bg-surface-2 p-5">
            <p className="font-display text-lg text-foreground">Qué cambia / qué no</p>
            <div className="mt-5 space-y-3">
              {[
                ["Alcance", "78%"],
                ["Tiempo de producción", "32%"],
                ["Tu criterio", "100%"],
              ].map(([label, w]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[11px] text-muted">
                    <span>{label}</span>
                    <span className="tabular-nums">{w}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-brand-400/80" style={{ width: w }} />
                  </div>
                </div>
              ))}
            </div>
            <Logo size={18} badge={false} className="absolute bottom-4 right-4 text-white/30" />
          </div>
          <Tag sem="amber">Infografía · LinkedIn</Tag>
        </article>

        {/* Carrusel */}
        <article className="card hover-lift overflow-hidden">
          <div className="relative aspect-[4/5] bg-[#101012] p-5">
            <div className="relative h-full">
              {[2, 1, 0].map((i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 rounded-xl border border-white/10 bg-surface-2 p-4"
                  style={{ top: i * 14, left: i * 10, right: -i * 10, opacity: 1 - i * 0.18 }}
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-brand-400">
                    Slide {3 - i}
                  </p>
                  <p className="font-display mt-2 text-lg leading-tight text-white">
                    Tres ideas para tu marca
                  </p>
                </div>
              ))}
            </div>
            <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              <i className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <i className="h-1.5 w-1.5 rounded-full bg-white/25" />
              <i className="h-1.5 w-1.5 rounded-full bg-white/25" />
            </span>
          </div>
          <Tag sem="green">Carrusel · Instagram</Tag>
        </article>
      </div>
    </section>
  );
}
