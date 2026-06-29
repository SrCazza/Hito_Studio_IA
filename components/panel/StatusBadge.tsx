/** Pill de estado consistente para tandas, piezas y jobs. */
const STYLE: Record<string, string> = {
  draft: "border-border text-muted",
  pending: "border-border text-muted",
  planned: "border-sky-500/30 text-sky-300",
  approved: "border-sky-500/30 text-sky-300",
  producing: "border-sky-500/30 text-sky-300",
  processing: "border-sky-500/30 text-sky-300",
  review: "border-amber/30 text-amber",
  ready: "border-brand-400/40 text-brand-400",
  done: "border-brand-400/40 text-brand-400",
  published: "border-brand-400/40 text-brand-400",
  error: "border-red/40 text-red",
  archived: "border-border text-muted/70",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide ${
        STYLE[status] ?? "border-border text-muted"
      }`}
    >
      {status}
    </span>
  );
}
