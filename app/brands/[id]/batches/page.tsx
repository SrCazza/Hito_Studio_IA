import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/cost";
import { Pagination, PAGE_SIZE, pageRange, parsePage } from "@/components/Pagination";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  draft: "text-neutral-400",
  planned: "text-sky-300",
  approved: "text-sky-300",
  producing: "text-sky-300",
  review: "text-amber-300",
  ready: "text-emerald-300",
  published: "text-emerald-400",
  archived: "text-neutral-500",
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
      <Link href={`/brands/${id}`} className="text-sm text-neutral-400 hover:text-neutral-200">
        ← {brand.name}
      </Link>

      <header className="mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tandas</h1>
          <p className="text-sm text-neutral-400">{count ?? 0} en total.</p>
        </div>
        <Link
          href={`/brands/${id}/batches/new`}
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Nueva tanda
        </Link>
      </header>

      {batches && batches.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-700 px-6 py-12 text-center">
          <p className="text-neutral-400">Todavía no hay tandas para esta marca.</p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {batches?.map((b) => (
          <li key={b.id}>
            <Link
              href={`/batches/${b.id}/plan`}
              className="flex items-center justify-between rounded-lg border border-neutral-800 px-4 py-3 transition hover:border-neutral-600 hover:bg-neutral-900"
            >
              <span className="min-w-0">
                <span className="font-medium">{b.title}</span>
                <span className="ml-2 text-xs text-neutral-500">
                  {new Date(b.created_at).toLocaleDateString("es-EC")}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-neutral-500">{formatUsd(b.estimated_cost)}</span>
                <span className={`text-xs uppercase tracking-wide ${STATUS_STYLE[b.status] ?? "text-neutral-400"}`}>
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
