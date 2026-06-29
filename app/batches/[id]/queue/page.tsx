import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { QueueAutoRefresh } from "@/components/QueueAutoRefresh";
import { StatusBadge } from "@/components/panel/StatusBadge";
import type { AssetType } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  type: AssetType;
  status: string;
  content: { concept?: string; final_copy?: string; copy?: string } | null;
  media_url: string | null;
  platform_target: string | null;
};

type JobRow = {
  asset_id: string;
  status: string;
  attempts: number;
  last_error: string | null;
};

export default async function QueuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: batch } = await supabase
    .from("batches")
    .select("id, brand_id, title, status")
    .eq("id", id)
    .maybeSingle();
  if (!batch) notFound();

  const [{ data: assetsData }, { data: jobsData }] = await Promise.all([
    supabase
      .from("assets")
      .select("id, type, status, content, media_url, platform_target")
      .eq("batch_id", id)
      .order("created_at", { ascending: true })
      .limit(100),
    supabase
      .from("jobs")
      .select("asset_id, status, attempts, last_error")
      .eq("batch_id", id)
      .limit(500),
  ]);

  const assets = (assetsData ?? []) as AssetRow[];
  const jobByAsset = new Map<string, JobRow>();
  for (const j of (jobsData ?? []) as JobRow[]) jobByAsset.set(j.asset_id, j);

  const inFlight = (jobsData ?? []).some((j) => j.status === "pending" || j.status === "processing");
  const done = assets.filter((a) => a.status === "ready").length;
  const errored = assets.filter((a) => a.status === "error").length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <QueueAutoRefresh active={inFlight} />
      <div className="flex items-center justify-between">
        <Link href={`/batches/${id}/plan`} className="text-sm text-muted transition hover:text-foreground">
          ← Plan
        </Link>
        <Link href={`/batches/${id}/review`} className="text-sm text-muted transition hover:text-foreground">
          Revisión →
        </Link>
      </div>

      <header className="mb-6 mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Cola: {batch.title}</h1>
          <p className="mt-1.5 text-sm text-muted">
            {done} lista{done === 1 ? "" : "s"} · {errored} con error · {assets.length} total
            {inFlight && <span className="ml-2 text-sky-300">• actualizando en vivo…</span>}
          </p>
        </div>
        <StatusBadge status={batch.status} />
      </header>

      <ul className="flex flex-col gap-2">
        {assets.map((a) => {
          const job = jobByAsset.get(a.id);
          return (
            <li key={a.id} className="card px-4 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {MIX_LABELS[a.type as MixType] ?? a.type}
                  {a.platform_target && (
                    <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                      {a.platform_target}
                    </span>
                  )}
                </span>
                <StatusBadge status={a.status} />
              </div>

              {a.content?.concept && <p className="mt-1.5 text-sm text-muted">{a.content.concept}</p>}
              {a.status === "ready" && a.content?.final_copy && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">{a.content.final_copy}</p>
              )}
              {a.status === "error" && job?.last_error && (
                <p className="mt-1.5 text-sm text-red">
                  Error: {job.last_error}
                  {job.attempts > 0 && <span className="ml-1 text-muted">(intentos: {job.attempts})</span>}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {assets.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted">
          Esta tanda no tiene piezas.
        </p>
      )}
    </main>
  );
}
