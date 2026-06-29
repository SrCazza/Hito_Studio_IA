import { IconVolume, IconData, IconBrand, IconPackage } from "@/components/landing/Icons";

const blocks = [
  {
    n: "01",
    Icon: IconVolume,
    title: "Produce en volumen",
    desc: "Del brief a un plan de piezas listo: copys, formatos y mix por plataforma, en minutos.",
  },
  {
    n: "02",
    Icon: IconData,
    title: "Lee tus datos",
    desc: "Registra el rendimiento y el analista resume qué funcionó y qué medir después.",
  },
  {
    n: "03",
    Icon: IconBrand,
    title: "Mejora tu marca",
    desc: "Cada tanda retroalimenta tu perfil: tono, qué sí y qué no, con ajustes concretos.",
  },
  {
    n: "04",
    Icon: IconPackage,
    title: "Empaqueta por plataforma",
    desc: "Paquete listo para subir a mano: copy y media por red, con un clic para copiar.",
  },
];

/**
 * Bloques apilados que se expanden al hover (desktop), respetando la estructura.
 * CSS puro (flex), respeta prefers-reduced-motion vía la regla global. En móvil
 * se apilan verticalmente con el contenido visible.
 */
export function StackedBlocks() {
  return (
    <section id="que-hace" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-brand">Un asistente, no un piloto automático</p>
        <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
          Hace el trabajo pesado. Tú decides.
        </h2>
        <p className="mt-4 text-muted">
          Pasa el cursor por cada bloque para ver qué hace. La IA es asistiva sobre tu material
          real; el criterio sigue siendo tuyo.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-3 md:h-[340px] md:flex-row">
        {blocks.map(({ n, Icon, title, desc }) => (
          <article
            key={n}
            className="group relative flex-1 overflow-hidden rounded-2xl border border-border bg-[#0d0f0e] p-6 text-white transition-[flex] duration-500 ease-[var(--ease-out)] md:flex-[1] md:hover:flex-[2.6]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,rgba(52,211,153,0.18),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-400">
                  <Icon />
                </span>
                <span className="font-mono text-sm text-white/30">{n}</span>
              </div>

              <div className="mt-auto">
                <h3 className="font-display text-xl leading-tight">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60 opacity-100 transition-all duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  {desc}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
