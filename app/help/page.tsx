import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const steps = [
  { n: "1", t: "Crea o elige una marca", d: "Define tono, público, qué sí y qué no. El onboarding asistido te ayuda con cada campo." },
  { n: "2", t: "Nueva tanda con un brief", d: "Escribe qué quieres comunicar y el mix de formatos. El estratega propone un plan con costo estimado." },
  { n: "3", t: "Aprueba antes de gastar", d: "Ves el costo y das el visto bueno. Nada se produce ni se cobra sin tu aprobación." },
  { n: "4", t: "Producción", d: "El motor genera el copy y la imagen de cada pieza, con su prompt técnico (puedes inspeccionarlo y editarlo)." },
  { n: "5", t: "Revisión con semáforo", d: "Cada pieza recibe verde, amarillo o rojo. Apruebas o regeneras. Los rojos críticos son automáticos." },
  { n: "6", t: "Paquete por plataforma", d: "Copia el texto y descarga la media para subir a mano a Instagram, TikTok, Twitter/X o Facebook." },
  { n: "7", t: "Resultados", d: "Registra las métricas que ves y el analista resume qué funcionó y qué ajustar en tu marca." },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-tight">Ayuda</h1>
        <p className="mt-1 text-sm text-muted">Cómo funciona el flujo, de principio a fin.</p>
      </header>

      <ol className="flex flex-col gap-3">
        {steps.map((s) => (
          <li key={s.n} className="card flex gap-4 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-400/40 font-mono text-sm text-brand-400">
              {s.n}
            </span>
            <div>
              <p className="font-medium">{s.t}</p>
              <p className="mt-0.5 text-sm text-muted">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="card mt-6 p-5">
        <h2 className="text-sm font-medium">El semáforo</h2>
        <p className="mt-2 text-sm text-muted">
          Concentra tu ojo donde importa: automatizas lo verde, revisas lo amarillo y decides lo rojo.
          Cuatro categorías se marcan en rojo por reglas en código (caras IA, claims, cifras y contenido
          sensible), pase lo que pase la IA.
        </p>
      </div>

      <div className="mt-6">
        <Link href="/brands/new" className={buttonVariants({ variant: "primary" })}>
          Crear una marca
        </Link>
      </div>
    </main>
  );
}
