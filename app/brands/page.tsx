import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Pagination, PAGE_SIZE, pageRange, parsePage } from "@/components/Pagination";

export const dynamic = "force-dynamic";

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const page = parsePage((await searchParams).page);
  const [from, to] = pageRange(page);

  // Sin SELECT *; trae solo lo que la lista necesita + count para paginar.
  // RLS filtra por owner. Paginado (M7): nunca trae más de PAGE_SIZE filas.
  const { data: brands, error, count } = await supabase
    .from("brands")
    .select("id, name, sector, ai_visibility_policy, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  const hasMore = (count ?? 0) > page * PAGE_SIZE;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Marcas</h1>
          <p className="mt-1 text-sm text-muted">Elige el perfil de hoy.</p>
        </div>
        <Link
          href="/brands/new"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Nueva marca
        </Link>
      </header>

      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Error al cargar marcas: {error.message}
        </p>
      )}

      {brands && brands.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-700 px-6 py-12 text-center">
          <p className="text-neutral-400">Todavía no tienes marcas.</p>
          <Link href="/brands/new" className="mt-2 inline-block text-sm underline">
            Crear la primera
          </Link>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {brands?.map((b) => (
          <li key={b.id}>
            <Link
              href={`/brands/${b.id}`}
              className="card flex items-center gap-4 px-4 py-3.5 transition hover:border-border-strong hover:bg-surface-2/50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/15 text-sm font-semibold text-brand-400">
                {b.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{b.name}</span>
                {b.sector && <span className="block truncate text-sm text-muted">{b.sector}</span>}
              </span>
              <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted">
                IA: {b.ai_visibility_policy}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination basePath="/brands" page={page} hasMore={hasMore} />
    </main>
  );
}
