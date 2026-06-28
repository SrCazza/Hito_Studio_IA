import { Stepper, type Step } from "@/components/ui/Stepper";

const steps: Step[] = [
  { label: "Brief", desc: "Cuentas qué quieres y el mix." },
  { label: "Plan", desc: "El estratega propone las piezas." },
  { label: "Aprobar", desc: "Ves el costo y das el visto bueno." },
  { label: "Producir", desc: "El motor genera copy + media." },
  { label: "Revisar", desc: "Semáforo por pieza." },
  { label: "Paquete", desc: "Listo para subir por plataforma." },
  { label: "Resultados", desc: "Métricas y ajustes del analista." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-brand-400">Cómo funciona</p>
        <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
          Siete pasos, siempre claros.
        </h2>
        <p className="mt-4 text-muted">
          Sabes en todo momento por qué paso va tu tanda. Nada se produce —ni se cobra— sin tu
          aprobación.
        </p>
      </div>

      <div className="card mt-12 p-6 sm:p-8">
        <Stepper steps={steps} />
      </div>
    </section>
  );
}
