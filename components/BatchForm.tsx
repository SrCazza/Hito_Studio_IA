"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionState } from "@/app/brands/[id]/batches/actions";
import { MIX_TYPES, MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { ASSET_COST_USD, formatUsd } from "@/lib/cost";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/form";

type BatchAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Generando plan…" : "Crear tanda y generar plan"}
    </Button>
  );
}

export function BatchForm({ action, brandId }: { action: BatchAction; brandId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, { error: null });
  const [mix, setMix] = useState<Record<MixType, number>>(
    () => Object.fromEntries(MIX_TYPES.map((t) => [t, 0])) as Record<MixType, number>
  );

  const total = MIX_TYPES.reduce((s, t) => s + mix[t], 0);
  const estimated = MIX_TYPES.reduce((s, t) => s + mix[t] * ASSET_COST_USD[t], 0);

  function setCount(t: MixType, value: number) {
    setMix((m) => ({ ...m, [t]: Math.max(0, Math.min(20, value || 0)) }));
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="card flex flex-col gap-5 p-5 sm:p-6">
        <Field label="Título de la tanda" required>
          <Input name="title" required placeholder="Ej. Lanzamiento junio" />
        </Field>

        <Field label="Brief" hint="Qué quieres comunicar: contexto, mensaje, campaña, fechas">
          <Textarea
            name="brief"
            rows={4}
            placeholder="El estratega lo cruza con el perfil de la marca."
          />
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm text-muted">Mix de formatos</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MIX_TYPES.map((t) => (
              <label
                key={t}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5"
              >
                <span className="text-sm">
                  {MIX_LABELS[t]}
                  <span className="ml-2 font-mono text-xs text-muted">{formatUsd(ASSET_COST_USD[t])}/u</span>
                </span>
                <input
                  type="number"
                  name={`mix_${t}`}
                  min={0}
                  max={20}
                  value={mix[t]}
                  onChange={(e) => setCount(t, parseInt(e.target.value, 10))}
                  className="w-16 rounded-md border border-border-strong bg-surface-2 px-2 py-1 text-right text-base tabular-nums outline-none transition focus:border-brand-400 sm:text-sm"
                />
              </label>
            ))}
          </div>
          <p className="text-sm text-muted">
            {total} pieza{total === 1 ? "" : "s"} · costo estimado{" "}
            <span className="font-mono font-medium text-foreground">{formatUsd(estimated)}</span>
          </p>
        </fieldset>

        <Field label="Tope de presupuesto (USD)" hint="Opcional. Si lo dejas vacío, se usa el tope por defecto.">
          <Input type="number" name="budget_cap" min={0} step="0.01" placeholder="25.00" />
        </Field>
      </div>

      {state.error && <p className="text-sm text-red">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link href={`/brands/${brandId}`} className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
