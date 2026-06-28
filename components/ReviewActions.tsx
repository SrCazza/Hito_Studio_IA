"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function post(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" } });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: res.ok, error: data.error };
  } catch {
    return { ok: false, error: "Error de red." };
  }
}

/** Toolbar de la tanda: evaluar semáforo y finalizar (marcar lista). */
export function ReviewToolbar({ batchId, canFinalize }: { batchId: string; canFinalize: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "eval" | "final">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "eval" | "final", url: string) {
    setBusy(kind);
    setError(null);
    const r = await post(url);
    setBusy(null);
    if (!r.ok) setError(r.error ?? "No se pudo completar.");
    else router.refresh();
  }

  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => run("eval", `/api/batches/${batchId}/evaluate`)}
          disabled={busy !== null}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition hover:border-neutral-500 disabled:opacity-50"
        >
          {busy === "eval" ? "Evaluando…" : "Evaluar semáforo"}
        </button>
        <button
          onClick={() => run("final", `/api/batches/${batchId}/finalize`)}
          disabled={busy !== null || !canFinalize}
          title={canFinalize ? "" : "Aprueba todas las piezas primero"}
          className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {busy === "final" ? "Cerrando…" : "Marcar tanda lista"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

/** Acciones por pieza: aprobar (aceptar) o regenerar. */
export function PieceActions({
  assetId,
  accepted,
}: {
  assetId: string;
  accepted: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "regen">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "approve" | "regen", url: string) {
    setBusy(kind);
    setError(null);
    const r = await post(url);
    setBusy(null);
    if (!r.ok) setError(r.error ?? "No se pudo completar.");
    else router.refresh();
  }

  return (
    <div className="mt-2 flex items-center gap-3">
      <button
        onClick={() => run("approve", `/api/assets/${assetId}/approve`)}
        disabled={busy !== null || accepted}
        className="rounded-md border border-emerald-800 px-2.5 py-1 text-xs text-emerald-300 transition hover:bg-emerald-950/40 disabled:opacity-50"
      >
        {accepted ? "✓ Aprobada" : busy === "approve" ? "Aprobando…" : "Aprobar"}
      </button>
      <button
        onClick={() => run("regen", `/api/assets/${assetId}/regenerate`)}
        disabled={busy !== null}
        className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 transition hover:border-neutral-500 disabled:opacity-50"
      >
        {busy === "regen" ? "Re-encolando…" : "Regenerar"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
