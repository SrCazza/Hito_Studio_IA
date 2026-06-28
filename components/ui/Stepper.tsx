/**
 * Medidor de pasos (M-Visual). Presentacional y reutilizable:
 * - Landing: muestra el recorrido completo.
 * - Panel (futuro): pasar `current` para resaltar en qué paso va la tanda.
 * Horizontal en desktop, vertical en móvil.
 */
export type Step = { label: string; desc?: string };

export function Stepper({ steps, current }: { steps: Step[]; current?: number }) {
  return (
    <ol className="flex flex-col gap-0 md:flex-row md:gap-0">
      {steps.map((step, i) => {
        const done = current !== undefined && i < current;
        const active = current !== undefined && i === current;
        const reached = current === undefined || i <= current;
        return (
          <li key={step.label} className="relative flex flex-1 gap-3 md:flex-col md:gap-0">
            {/* Conector */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-border md:left-auto md:top-[15px] md:h-px md:w-full md:translate-x-[16px]"
              />
            )}
            <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-0">
              <span
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition ${
                  active
                    ? "border-brand-400 bg-brand text-white"
                    : reached
                      ? "border-brand-400/40 bg-surface text-brand-400"
                      : "border-border bg-surface text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
            </div>
            <div className="pb-6 md:pb-0 md:pt-3 md:pr-4">
              <p className={`text-sm font-medium ${reached ? "text-foreground" : "text-muted"}`}>
                {step.label}
              </p>
              {step.desc && <p className="mt-0.5 text-xs text-muted">{step.desc}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
