import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { estimateBatchCostUsd, formatUsd } from "@/lib/cost";
import { MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { PlanActions } from "@/components/PlanActions";
import type { AssetType } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  type: AssetType;
  status: string;
  content: { concept?: string; copy?: string; rationale?: string } | null;
  platform_target: string | null;
};

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: batch } = await supabase
    .from("batches")
    .select("id, brand_id, title, brief, strategy, estimated_cost, budget_cap, status")
    .eq("id", id)
    .maybeSingle();
  if (!batch) notFound();

  const { data: assetsData } = await supabase
    .from("assets")
    .select("id, type, status, content, platform_target")
    .eq("batch_id", id)
    .order("created_at", { ascending: true });
  const assets = (assetsData ?? []) as AssetRow[];

  const estimatedCost = estimateBatchCostUsd(assets);
  const effectiveCap = batch.budget_cap ?? serverEnv().defaultBudgetCapUsd;
  const exceeds = estimatedCost > effectiveCap;
  const rationale = (batch.strategy as { rationale?: string } | null)?.rationale ?? "";
  const hasPlan = assets.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/brands/${batch.brand_id}`}
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        ← Marca
      </Link>

      <header className="mb-6 mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{batch.title}</h1>
          {batch.brief && <p className="mt-1 max-w-prose text-sm text-neutral-400">{batch.brief}</p>}
        </div>
        <span className="shrink-0 rounded-full border border-neutral-700 px-3 py-1 text-xs uppercase tracking-wide text-neutral-400">
          {batch.status}
        </span>
      </header>

      {rationale && (
        <p className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-300">
          {rationale}
        </p>
      )}

      {!hasPlan && (
        <div className="mb-6 rounded-lg border border-dashed border-neutral-700 px-6 py-10 text-center">
          <p className="text-neutral-400">Esta tanda aún no tiene plan.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Genera el plan para ver las piezas y el costo estimado.
          </p>
        </div>
      )}

      {hasPlan && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-300">
              {assets.length} pieza{assets.length === 1 ? "" : "s"}
            </h2>
            <div className="text-right text-sm">
              <span className="text-neutral-400">Costo estimado: </span>
              <span className={exceeds ? "font-semibold text-amber-400" : "font-semibold text-neutral-100"}>
                {formatUsd(estimatedCost)}
              </span>
              <span className="text-neutral-500"> / tope {formatUsd(effectiveCap)}</span>
            </div>
          </div>

          <ul className="mb-6 flex flex-col gap-2">
            {assets.map((a) => (
              <li key={a.id} className="rounded-lg border border-neutral-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {MIX_LABELS[a.type as MixType] ?? a.type}
                    {a.platform_target && (
                      <span className="ml-2 text-xs text-neutral-500">{a.platform_target}</span>
                    )}
                  </span>
                  <span className="text-xs text-neutral-500">{formatUsd(estimateBatchCostUsd([a]))}</span>
                </div>
                {a.content?.concept && (
                  <p className="mt-1 text-sm text-neutral-300">{a.content.concept}</p>
                )}
                {a.content?.copy && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-400">{a.content.copy}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <PlanActions
        batchId={batch.id}
        status={batch.status}
        hasPlan={hasPlan}
        exceeds={exceeds}
      />
    </main>
  );
}
