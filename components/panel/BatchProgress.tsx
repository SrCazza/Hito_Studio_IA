"use client";

import { usePathname } from "next/navigation";

const STEPS = ["Plan", "Producción", "Revisión", "Paquete", "Resultados"];
const SEGMENT: Record<string, number> = { plan: 0, queue: 1, review: 2, package: 3, results: 4 };

/** Medidor de "por qué paso vas" en el flujo de una tanda. */
export function BatchProgress() {
  const pathname = usePathname();
  const seg = pathname.split("/").pop() ?? "";
  const current = SEGMENT[seg];
  if (current === undefined) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 pt-6">
      <ol className="flex items-center">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums transition ${
                    active
                      ? "border-brand-400 bg-brand text-white"
                      : done
                        ? "border-brand-400/40 bg-surface text-brand-400"
                        : "border-border bg-surface text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`hidden text-xs sm:block ${active || done ? "text-foreground" : "text-muted"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={`mx-2 h-px flex-1 ${done ? "bg-brand-400/40" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
