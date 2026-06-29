"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonVariant } from "@/components/ui/Button";

/**
 * Confirmación para acciones destructivas. Renderiza su propio botón disparador;
 * al confirmar ejecuta `onConfirm`. Accesible: scrim, Escape, foco en confirmar.
 */
export function ConfirmDialog({
  triggerLabel,
  triggerVariant = "danger",
  title,
  description,
  confirmLabel = "Eliminar",
  onConfirm,
}: {
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, busy]);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button type="button" variant={triggerVariant} size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <button
              aria-label="Cerrar"
              tabIndex={-1}
              onClick={() => !busy && setOpen(false)}
              className="animate-fade-up absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
              style={{ animationDuration: "150ms" }}
            />
            <div
              className="card animate-fade-up relative z-10 w-full max-w-sm p-6 shadow-2xl"
              style={{ animationDuration: "180ms" }}
            >
              <h2 id="confirm-title" className="text-lg font-semibold">
                {title}
              </h2>
              <p className="mt-2 text-sm text-muted">{description}</p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)} disabled={busy}>
                  Cancelar
                </Button>
                <Button ref={confirmRef} type="button" variant="danger" size="md" loading={busy} onClick={confirm}>
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
