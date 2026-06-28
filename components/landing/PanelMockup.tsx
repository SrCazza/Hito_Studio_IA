import { Logo } from "@/components/brand/Logo";

/**
 * Mockup fiel del panel (siempre OSCURO, para contrastar sobre la landing clara).
 * Muestra la pantalla de revisión con el semáforo y chips flotantes.
 */
const pieces = [
  { sem: "green", type: "Post", platform: "Instagram", copy: "Mismas manos. Más alcance." },
  { sem: "amber", type: "Carrusel", platform: "LinkedIn", copy: "Tres ideas para tu marca este mes." },
  { sem: "red", type: "Infografía", platform: "LinkedIn", copy: "Aumenta tus ventas 200% — revisar cifra." },
  { sem: "green", type: "Post", platform: "Instagram", copy: "Honesto sobre el proceso, sin humo." },
];
const dot: Record<string, string> = {
  green: "bg-emerald-400",
  amber: "bg-amber-400",
  red: "bg-red-400",
};

export function PanelMockup() {
  return (
    <div className="relative">
      {/* Chips flotantes */}
      <div className="absolute -left-4 -top-4 z-20 hidden rounded-xl border border-white/10 bg-[#16161c] px-3 py-2 shadow-xl sm:block">
        <p className="text-[10px] uppercase tracking-wide text-white/40">Costo estimado</p>
        <p className="font-mono text-sm text-white">$0.15 <span className="text-white/40">/ $25</span></p>
      </div>
      <div className="absolute -right-3 top-16 z-20 hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-[#16161c] px-3 py-1.5 shadow-xl sm:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400" />
        <span className="text-xs font-medium text-emerald-300">Verde · pasa</span>
      </div>

      {/* Ventana del navegador */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#0d0d11] shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="ml-3 truncate rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-white/40">
            app · revisión de tanda
          </span>
        </div>

        <div className="flex">
          {/* mini sidebar */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-5 border-r border-white/5 py-5 sm:flex">
            <Logo size={22} />
            {["bg-emerald-400", "bg-white/15", "bg-white/15", "bg-white/15"].map((c, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${c}`} />
            ))}
          </div>

          {/* contenido */}
          <div className="min-w-0 flex-1 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">Revisión — Lanzamiento junio</p>
                <p className="text-[11px] text-white/40">2 verdes · 1 amarillo · 1 rojo</p>
              </div>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white/50">
                review
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {pieces.map((p) => (
                <div
                  key={p.copy}
                  className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot[p.sem]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-white">
                      {p.type} <span className="text-white/35">· {p.platform}</span>
                    </p>
                    <p className="truncate text-[11px] text-white/45">{p.copy}</p>
                  </div>
                  <span className="hidden rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/55 sm:block">
                    Aprobar
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
