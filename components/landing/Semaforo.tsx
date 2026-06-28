import { IconShield } from "@/components/landing/Icons";

const lights = [
  {
    color: "var(--green)",
    name: "Verde",
    text: "text-green",
    desc: "Pasa casi solo. Encaja con tu marca y suena honesto. Lo automatizas y sigues.",
  },
  {
    color: "var(--amber)",
    name: "Amarillo",
    text: "text-amber",
    desc: "Échale ojo. Algo que revisar antes de publicar; tú decides en segundos.",
  },
  {
    color: "var(--red)",
    name: "Rojo",
    text: "text-red",
    desc: "Para. Tú decides o regeneras. Aquí entra tu criterio de diseñador.",
  },
];

const autoReds = ["Caras humanas IA", "Claims de producto", "Cifras y datos", "Contenido sensible"];

export function Semaforo() {
  return (
    <section className="relative border-y border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium text-brand-400">El semáforo</p>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
              Concentra tu ojo donde importa.
            </h2>
            <p className="mt-4 text-muted">
              Cada pieza se evalúa en servidor y recibe un color con sus razones. Automatizas lo
              verde, revisas lo amarillo y decides lo rojo. Menos tiempo mirando todo, más tiempo en
              lo que de verdad necesita tu criterio.
            </p>

            <div className="card mt-8 p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <IconShield className="text-brand-400" />
                Rojos automáticos, siempre
              </div>
              <p className="mt-2 text-sm text-muted">
                Cuatro categorías se marcan en rojo por reglas en código —no a criterio del modelo—
                pase lo que pase la IA:
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {autoReds.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {lights.map((l) => (
              <div key={l.name} className="card flex flex-col p-5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: l.color, boxShadow: `0 0 16px ${l.color}` }}
                />
                <h3 className={`mt-4 text-lg font-semibold ${l.text}`}>{l.name}</h3>
                <p className="mt-1.5 text-sm text-muted">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
