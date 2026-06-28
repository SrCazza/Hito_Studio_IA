"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PackagePlatform } from "@/app/batches/[id]/package/page";

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* clipboard puede fallar sin https/permiso — el texto sigue visible */
    }
  }
  return (
    <button
      onClick={copy}
      disabled={!text}
      className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 transition hover:border-neutral-500 disabled:opacity-50"
    >
      {done ? "✓ Copiado" : label}
    </button>
  );
}

function PublishButton({ batchId, status }: { batchId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "published") {
    return (
      <div className="rounded-lg border border-emerald-900 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
        ✓ Tanda marcada como publicada.
      </div>
    );
  }

  async function publish() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/batches/${batchId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? "No se pudo publicar.");
      else router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-neutral-500">
        La publicación es manual: sube el paquete a cada plataforma y luego marca la tanda como
        publicada.
      </p>
      <button
        onClick={publish}
        disabled={busy}
        className="w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Marcando…" : "Marcar como publicada"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function PackageView({
  batchId,
  status,
  platforms,
}: {
  batchId: string;
  status: string;
  platforms: PackagePlatform[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {platforms.map((platform) => {
        const allCaptions = platform.pieces
          .map((p) => p.caption)
          .filter(Boolean)
          .join("\n\n———\n\n");
        return (
          <section key={platform.name} className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
                {platform.name}
                <span className="ml-2 text-xs lowercase text-neutral-500">
                  {platform.pieces.length} pieza{platform.pieces.length === 1 ? "" : "s"}
                </span>
              </h2>
              <CopyButton text={allCaptions} label="Copiar todos" />
            </div>

            <ul className="flex flex-col gap-3">
              {platform.pieces.map((p) => (
                <li key={p.id} className="rounded-lg border border-neutral-800 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.typeLabel}</span>
                    <div className="flex items-center gap-2">
                      <CopyButton text={p.caption} />
                      {p.mediaUrl ? (
                        <a
                          href={p.mediaUrl}
                          download={p.mediaName ?? undefined}
                          className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 transition hover:border-neutral-500"
                        >
                          Descargar media
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-600">media pendiente</span>
                      )}
                    </div>
                  </div>
                  {p.caption && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">{p.caption}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {platforms.length > 0 && (
        <div className="border-t border-neutral-800 pt-6">
          <PublishButton batchId={batchId} status={status} />
        </div>
      )}
    </div>
  );
}
