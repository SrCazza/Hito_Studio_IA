import { IconVolume, IconData, IconBrand, IconPackage } from "@/components/landing/Icons";

const items = [
  {
    Icon: IconVolume,
    title: "Produce en volumen",
    desc: "Del brief a un plan de piezas listo: copys, formatos y mix por plataforma, en minutos.",
  },
  {
    Icon: IconData,
    title: "Lee tus datos",
    desc: "Registra el rendimiento y el analista resume qué funcionó y qué medir después.",
  },
  {
    Icon: IconBrand,
    title: "Mejora tu marca",
    desc: "Cada tanda retroalimenta tu perfil: tono, qué sí y qué no, con ajustes concretos.",
  },
  {
    Icon: IconPackage,
    title: "Empaqueta por plataforma",
    desc: "Paquete listo para subir a mano: copy y media por red, con un clic para copiar.",
  },
];

export function ValueProps() {
  return (
    <section id="que-hace" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-brand">Un asistente, no un piloto automático</p>
        <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
          Hace el trabajo pesado. Tú decides.
        </h2>
        <p className="mt-4 text-muted">
          La IA es asistiva sobre tu material real, no generativa a ciegas. El foso es tu criterio
          de diseñador; la herramienta solo te ahorra las horas.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="card hover-lift group p-5 hover:border-border-strong"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-2 text-brand-400 transition-colors group-hover:border-brand-400/40">
              <Icon />
            </span>
            <h3 className="mt-4 text-base font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
