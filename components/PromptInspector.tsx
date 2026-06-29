"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Inspecciona y edita el prompt de imagen (image_prompt) de una pieza.
 * Colapsable; el detalle del prompt es uno de los diferenciadores de calidad.
 */
export function PromptInspector({
  assetId,
  prompt,
  editable = true,
}: {
  assetId: string;
  prompt: string;
  editable?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(prompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/assets/${assetId}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_prompt: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? "No se pudo guardar.");
      else {
        setEditing(false);
        router.refresh();
      }
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 border-t border-border pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-foreground"
        aria-expanded={open}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        Prompt de imagen
        {!prompt && <span className="text-muted/60">(vacío)</span>}
      </button>

      {open && (
        <div className="mt-2">
          {!editing ? (
            <>
              <p className="whitespace-pre-wrap rounded-md border border-border bg-surface-2/50 p-3 font-mono text-[11px] leading-relaxed text-muted">
                {prompt || "Sin prompt todavía."}
              </p>
              {editable && (
                <button
                  onClick={() => {
                    setValue(prompt);
                    setEditing(true);
                  }}
                  className="mt-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted transition hover:border-border-strong hover:text-foreground"
                >
                  Editar prompt
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 font-mono text-[11px] leading-relaxed outline-none focus:border-brand-400"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={save}
                  disabled={busy}
                  className="rounded-md bg-brand px-3 py-1 text-xs font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {busy ? "Guardando…" : "Guardar"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md px-2.5 py-1 text-xs text-muted hover:text-foreground"
                >
                  Cancelar
                </button>
                {error && <span className="text-xs text-red">{error}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
