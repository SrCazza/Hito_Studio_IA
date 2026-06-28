import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { ReviewToolbar, PieceActions } from "@/components/ReviewActions";
import type { AssetType, SemaforoColor } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type Reason = { category?: string; detail?: string };

type AssetRow = {
  id: string;
  type: AssetType;
  status: string;
  semaforo: SemaforoColor | null;
  semaforo_reasons: Reason[] | null;
  content: { concept?: string; copy?: string; final_copy?: string; accepted?: boolean } | null;
  platform_target: string | null;
};

const SEMAFORO_STYLE: Record<SemaforoColor, { dot: string; label: string }> = {
  green: { dot: "bg-emerald-500", label: "Verde" },
  amber: { dot: "bg-amber-500", label: "Amarillo" },
  red: { dot: "bg-red-500", label: "Rojo" },
};

function SemaforoBadge({ color }: { color: SemaforoColor | null }) {
  if (!color) {
    return <span className="text-xs uppercase tracking-wide text-neutral-500">sin evaluar</span>;
  }
  const s = SEMAFORO_STYLE[color];
  return (
    <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-neutral-300">
      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: batch } = await supabase
    .from("batches")
    .select("id, title, status")
    .eq("id", id)
    .maybeSingle();
  if (!batch) notFound();

  const { data: assetsData } = await supabase
    .from("assets")
    .select("id, type, status, semaforo, semaforo_reasons, content, platform_target")
    .eq("batch_id", id)
    .order("created_at", { ascending: true });
  const assets = (assetsData ?? []) as AssetRow[];

  const evaluated = assets.filter((a) => a.semaforo !== null).length;
  const accepted = assets.filter((a) => a.content?.accepted === true).length;
  const canFinalize = assets.length > 0 && accepted === assets.length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href={`/batches/${id}/queue`} className="text-sm text-neutral-400 hover:text-neutral-200">
        ← Cola
      </Link>

      <header className="mb-6 mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Revisión — {batch.title}</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {evaluated}/{assets.length} evaluadas · {accepted}/{assets.length} aprobadas · estado{" "}
          {batch.status}
        </p>
      </header>

      <ReviewToolbar batchId={batch.id} canFinalize={canFinalize} />

      <ul className="flex flex-col gap-2">
        {assets.map((a) => {
          // Texto a mostrar (escapado por React al renderizar como {texto} — anti-XSS).
          const text = a.content?.final_copy || a.content?.copy || a.content?.concept || "";
          const reasons = (a.semaforo_reasons ?? []).filter((r) => r.detail);
          return (
            <li key={a.id} className="rounded-lg border border-neutral-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {MIX_LABELS[a.type as MixType] ?? a.type}
                  {a.platform_target && (
                    <span className="ml-2 text-xs text-neutral-500">{a.platform_target}</span>
                  )}
                </span>
                <SemaforoBadge color={a.semaforo} />
              </div>

              {text && <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-300">{text}</p>}

              {reasons.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {reasons.map((r, i) => (
                    <li key={i} className="text-xs text-neutral-400">
                      • {r.detail}
                    </li>
                  ))}
                </ul>
              )}

              <PieceActions assetId={a.id} accepted={a.content?.accepted === true} />
            </li>
          );
        })}
      </ul>

      {assets.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-700 px-6 py-10 text-center text-neutral-400">
          Esta tanda no tiene piezas.
        </p>
      )}
    </main>
  );
}
