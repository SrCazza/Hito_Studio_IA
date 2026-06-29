import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { estimateBatchCostUsd, formatUsd } from "@/lib/cost";
import { MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { PlanActions } from "@/components/PlanActions";
import { PromptInspector } from "@/components/PromptInspector";
import { StatusBadge } from "@/components/panel/StatusBadge";
import type { AssetType } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  type: AssetType;
  status: string;
  content: { concept?: string; copy?: string; image_prompt?: string; rationale?: string } | null;
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
    .order("created_at", { ascending: true })
    .limit(100);
  const assets = (assetsData ?? []) as AssetRow[];

  const estimatedCost = estimateBatchCostUsd(assets);
  const effectiveCap = batch.budget_cap ?? serverEnv().defaultBudgetCapUsd;
  const exceeds = estimatedCost > effectiveCap;
  const rationale = (batch.strategy as { rationale?: string } | null)?.rationale ?? "";
  const hasPlan = assets.length > 0;
  const editable = batch.status !== "producing" && batch.status !== "published";

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link href={`/brands/${batch.brand_id}`} className="text-sm text-muted transition hover:text-foreground">
        ← Marca
      </Link>

      <header className="mb-6 mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{batch.title}</h1>
          {batch.brief && <p className="mt-1.5 max-w-prose text-sm text-muted">{batch.brief}</p>}
        </div>
        <StatusBadge status={batch.status} />
      </header>

      {rationale && (
        <p className="card mb-6 bg-surface/40 px-4 py-3 text-sm text-foreground/85">{rationale}</p>
      )}

      {!hasPlan && (
        <div className="mb-6 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-muted">Esta tanda aún no tiene plan.</p>
          <p className="mt-1 text-sm text-muted/70">
            Genera el plan para ver las piezas, los prompts y el costo estimado.
          </p>
        </div>
      )}

      {hasPlan && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              {assets.length} pieza{assets.length === 1 ? "" : "s"}
            </h2>
            <div className="text-right text-sm">
              <span className="text-muted">Costo estimado: </span>
              <span className={exceeds ? "font-semibold text-amber" : "font-semibold text-foreground"}>
                {formatUsd(estimatedCost)}
              </span>
              <span className="text-muted"> / tope {formatUsd(effectiveCap)}</span>
            </div>
          </div>

          <ul className="mb-6 flex flex-col gap-2">
            {assets.map((a) => (
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
                  <span className="font-mono text-xs text-muted">{formatUsd(estimateBatchCostUsd([a]))}</span>
                </div>
                {a.content?.concept && <p className="mt-1.5 text-sm text-foreground/90">{a.content.concept}</p>}
                {a.content?.copy && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{a.content.copy}</p>
                )}
                <PromptInspector
                  assetId={a.id}
                  prompt={a.content?.image_prompt ?? ""}
                  editable={editable && a.status !== "ready"}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <PlanActions batchId={batch.id} status={batch.status} hasPlan={hasPlan} exceeds={exceeds} />
    </main>
  );
}
