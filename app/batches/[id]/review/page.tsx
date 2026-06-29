import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { ReviewToolbar, PieceActions } from "@/components/ReviewActions";
import { PromptInspector } from "@/components/PromptInspector";
import type { AssetType, SemaforoColor } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type Reason = { category?: string; detail?: string };

type AssetRow = {
  id: string;
  type: AssetType;
  status: string;
  semaforo: SemaforoColor | null;
  semaforo_reasons: Reason[] | null;
  content: { concept?: string; copy?: string; final_copy?: string; image_prompt?: string; accepted?: boolean } | null;
  platform_target: string | null;
};

const SEMAFORO_STYLE: Record<SemaforoColor, { dot: string; text: string; label: string }> = {
  green: { dot: "bg-green", text: "text-green", label: "Verde" },
  amber: { dot: "bg-amber", text: "text-amber", label: "Amarillo" },
  red: { dot: "bg-red", text: "text-red", label: "Rojo" },
};

function SemaforoBadge({ color }: { color: SemaforoColor | null }) {
  if (!color) return <span className="text-xs uppercase tracking-wide text-muted/70">sin evaluar</span>;
  const s = SEMAFORO_STYLE[color];
  return (
    <span className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wide ${s.text}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} style={{ boxShadow: "0 0 10px currentColor" }} />
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
    .order("created_at", { ascending: true })
    .limit(100);
  const assets = (assetsData ?? []) as AssetRow[];

  const evaluated = assets.filter((a) => a.semaforo !== null).length;
  const accepted = assets.filter((a) => a.content?.accepted === true).length;
  const canFinalize = assets.length > 0 && accepted === assets.length;
  const editable = batch.status !== "published";

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href={`/batches/${id}/queue`} className="text-sm text-muted transition hover:text-foreground">
          ← Cola
        </Link>
        <Link href={`/batches/${id}/package`} className="text-sm text-muted transition hover:text-foreground">
          Paquete →
        </Link>
      </div>

      <header className="mb-6 mt-4">
        <h1 className="font-display text-3xl tracking-tight">Revisión: {batch.title}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {evaluated}/{assets.length} evaluadas · {accepted}/{assets.length} aprobadas · estado {batch.status}
        </p>
      </header>

      <ReviewToolbar batchId={batch.id} canFinalize={canFinalize} />

      <ul className="flex flex-col gap-2">
        {assets.map((a) => {
          // Texto a mostrar (escapado por React al renderizar como {texto}, anti-XSS).
          const text = a.content?.final_copy || a.content?.copy || a.content?.concept || "";
          const reasons = (a.semaforo_reasons ?? []).filter((r) => r.detail);
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
                <SemaforoBadge color={a.semaforo} />
              </div>

              {text && <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/85">{text}</p>}

              {reasons.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {reasons.map((r, i) => (
                    <li key={i} className="text-xs text-muted">
                      • {r.detail}
                    </li>
                  ))}
                </ul>
              )}

              <PromptInspector
                assetId={a.id}
                prompt={a.content?.image_prompt ?? ""}
                editable={editable && a.status !== "ready"}
              />
              <PieceActions assetId={a.id} accepted={a.content?.accepted === true} />
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
