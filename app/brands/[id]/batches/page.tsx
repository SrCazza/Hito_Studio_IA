import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/cost";
import { Pagination, PAGE_SIZE, pageRange, parsePage } from "@/components/Pagination";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  draft: "text-muted",
  planned: "text-sky-300",
  approved: "text-sky-300",
  producing: "text-sky-300",
  review: "text-amber-300",
  ready: "text-brand-400",
  published: "text-brand-400",
  archived: "text-muted",
};

export default async function BrandBatchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!brand) notFound();

  const page = parsePage((await searchParams).page);
  const [from, to] = pageRange(page);

  // Paginado (M7); una sola query, sin N+1. RLS filtra por dueño de la marca.
  const { data: batches, count } = await supabase
    .from("batches")
    .select("id, title, status, estimated_cost, created_at", { count: "exact" })
    .eq("brand_id", id)
    .order("created_at", { ascending: false })
    .range(from, to);
  const hasMore = (count ?? 0) > page * PAGE_SIZE;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href={`/brands/${id}`} className="text-sm text-muted hover:text-foreground">
        ← {brand.name}
      </Link>

      <header className="mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Tandas</h1>
          <p className="mt-1 text-sm text-muted">{count ?? 0} en total.</p>
        </div>
        <Link
          href={`/brands/${id}/batches/new`}
          className="press rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Nueva tanda
        </Link>
      </header>

      {batches && batches.length === 0 && (
        <div className="rounded-lg border border-dashed border-border-strong px-6 py-12 text-center">
          <p className="text-muted">Todavía no hay tandas para esta marca.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {batches?.map((b) => (
          <li key={b.id}>
            <Link
              href={`/batches/${b.id}/plan`}
              className="card flex items-center justify-between px-4 py-3.5 transition hover:border-border-strong hover:bg-surface-2/50"
            >
              <span className="min-w-0">
                <span className="font-medium">{b.title}</span>
                <span className="ml-2 text-xs text-muted">
                  {new Date(b.created_at).toLocaleDateString("es-EC")}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted">{formatUsd(b.estimated_cost)}</span>
                <span className={`text-xs uppercase tracking-wide ${STATUS_STYLE[b.status] ?? "text-muted"}`}>
                  {b.status}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination basePath={`/brands/${id}/batches`} page={page} hasMore={hasMore} />
    </main>
  );
}
