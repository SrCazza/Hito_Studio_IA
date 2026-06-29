"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { METRIC_TYPES, METRIC_LABELS, type MetricType } from "@/lib/validation/metrics";

/** Botón que dispara el reporte del analista (Sonnet). */
export function AnalyzeButton({ batchId, hasAnalysis }: { batchId: string; hasAnalysis: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/batches/${batchId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? "No se pudo analizar.");
      else router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        disabled={busy}
        className="w-fit rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Analizando…" : hasAnalysis ? "Volver a analizar" : "Analizar tanda"}
      </button>
      {error && <p className="text-sm text-red">{error}</p>}
    </div>
  );
}

/** Formulario de métricas de UNA pieza (el humano registra lo que ve). */
export function MetricsForm({
  batchId,
  assetId,
  platform,
  current,
}: {
  batchId: string;
  assetId: string;
  platform: string;
  current: Partial<Record<MetricType, number>>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(METRIC_TYPES.map((t) => [t, current[t] != null ? String(current[t]) : ""]))
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    const metrics: Record<string, number> = {};
    for (const t of METRIC_TYPES) {
      const v = values[t]?.trim();
      if (v !== "" && v != null && !Number.isNaN(Number(v))) metrics[t] = Number(v);
    }
    try {
      const res = await fetch(`/api/batches/${batchId}/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: assetId, platform, metrics }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setMsg(data.error ?? "No se pudo guardar.");
      else {
        setMsg("Guardado");
        router.refresh();
      }
    } catch {
      setMsg("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METRIC_TYPES.map((t) => (
          <label key={t} className="flex flex-col gap-1 text-xs text-muted">
            {METRIC_LABELS[t]}
            <input
              type="number"
              min={0}
              value={values[t] ?? ""}
              onChange={(e) => setValues((s) => ({ ...s, [t]: e.target.value }))}
              className="rounded-md border border-border-strong bg-surface px-2 py-1 text-right text-sm text-foreground outline-none focus:border-brand-400"
            />
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-md border border-border-strong px-3 py-1 text-xs text-foreground/85 transition hover:border-border-strong disabled:opacity-50"
        >
          {busy ? "Guardando…" : "Guardar métricas"}
        </button>
        {msg && <span className="text-xs text-muted">{msg}</span>}
      </div>
    </div>
  );
}
