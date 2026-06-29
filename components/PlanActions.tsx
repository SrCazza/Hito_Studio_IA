"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Acciones del plan: generar/regenerar (POST /api/strategy) y aprobar
 * (POST /api/batches/[id]/approve). Estados loading/éxito/error explícitos.
 * El override se exige solo si el costo supera el tope (guardrail #4).
 */
export function PlanActions({
  batchId,
  status,
  hasPlan,
  exceeds,
}: {
  batchId: string;
  status: string;
  hasPlan: boolean;
  exceeds: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "plan" | "approve">(null);
  const [error, setError] = useState<string | null>(null);
  const [override, setOverride] = useState(false);

  const isApproved = status === "approved" || status === "producing";

  async function generate() {
    setBusy("plan");
    setError(null);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: batchId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) setError(data.error ?? "No se pudo generar el plan.");
      else router.refresh();
    } catch {
      setError("No se pudo generar el plan.");
    } finally {
      setBusy(null);
    }
  }

  async function approve() {
    setBusy("approve");
    setError(null);
    try {
      const res = await fetch(`/api/batches/${batchId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ override }),
      });
      const data = (await res.json()) as { error?: string; requires_override?: boolean };
      if (!res.ok) {
        setError(data.error ?? "No se pudo aprobar.");
        if (data.requires_override) setOverride(false);
      } else {
        router.refresh();
      }
    } catch {
      setError("No se pudo aprobar.");
    } finally {
      setBusy(null);
    }
  }

  if (isApproved) {
    return (
      <div className="card flex flex-col gap-3 border-brand-400/30 bg-brand/10 px-4 py-3 text-sm text-brand-400">
        <span>✓ Tanda aprobada. La producción se encoló.</span>
        <Link
          href={`/batches/${batchId}/queue`}
          className="press w-fit rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Ver cola en vivo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red">{error}</p>}

      {exceeds && hasPlan && (
        <label className="flex items-center gap-2 text-sm text-amber">
          <input
            type="checkbox"
            checked={override}
            onChange={(e) => setOverride(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          El costo supera el tope. Confirmo el override para aprobar igual.
        </label>
      )}

      <div className="flex items-center gap-3">
        {hasPlan && (
          <button
            onClick={approve}
            disabled={busy !== null || (exceeds && !override)}
            className="press rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {busy === "approve" ? "Aprobando…" : "Aprobar y encolar"}
          </button>
        )}
        <button
          onClick={generate}
          disabled={busy !== null}
          className="rounded-full border border-border-strong px-5 py-2.5 text-sm text-foreground transition hover:bg-surface-2 disabled:opacity-50"
        >
          {busy === "plan" ? "Generando…" : hasPlan ? "Regenerar plan" : "Generar plan"}
        </button>
      </div>
    </div>
  );
}
