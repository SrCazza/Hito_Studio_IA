import Link from "next/link";

/** Tamaño de página estándar de los listados (M7: 20–50). */
export const PAGE_SIZE = 20;

/** Rango [from, to] para `.range()` de Supabase a partir del número de página. */
export function pageRange(page: number, size = PAGE_SIZE): [number, number] {
  const from = (page - 1) * size;
  return [from, from + size - 1];
}

/** Normaliza el parámetro `page` (mínimo 1). */
export function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Controles prev/next. `hasMore` lo calcula el caller con el count total. */
export function Pagination({
  basePath,
  page,
  hasMore,
}: {
  basePath: string;
  page: number;
  hasMore: boolean;
}) {
  if (page <= 1 && !hasMore) return null;
  const linkCls =
    "rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-neutral-500";
  const disabledCls = "rounded-md border border-neutral-900 px-3 py-1.5 text-sm text-neutral-700";
  return (
    <nav className="mt-6 flex items-center justify-between">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className={linkCls}>
          ← Anterior
        </Link>
      ) : (
        <span className={disabledCls}>← Anterior</span>
      )}
      <span className="text-xs text-neutral-500">Página {page}</span>
      {hasMore ? (
        <Link href={`${basePath}?page=${page + 1}`} className={linkCls}>
          Siguiente →
        </Link>
      ) : (
        <span className={disabledCls}>Siguiente →</span>
      )}
    </nav>
  );
}
