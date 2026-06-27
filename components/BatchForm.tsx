"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionState } from "@/app/brands/[id]/batches/actions";
import { MIX_TYPES, MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { ASSET_COST_USD, formatUsd } from "@/lib/cost";

type BatchAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Generando plan…" : "Crear tanda y generar plan"}
    </button>
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
      <Field label="Título de la tanda" required>
        <input name="title" required className={inputCls} placeholder="Ej. Lanzamiento junio" />
      </Field>

      <Field label="Brief (qué quieres comunicar)">
        <textarea
          name="brief"
          rows={4}
          className={inputCls}
          placeholder="Contexto, mensaje, campaña, fechas… El estratega lo cruza con el perfil de la marca."
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm text-neutral-400">Mix de formatos</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MIX_TYPES.map((t) => (
            <label
              key={t}
              className="flex items-center justify-between rounded-md border border-neutral-800 px-3 py-2"
            >
              <span className="text-sm">
                {MIX_LABELS[t]}
                <span className="ml-2 text-xs text-neutral-500">{formatUsd(ASSET_COST_USD[t])}/u</span>
              </span>
              <input
                type="number"
                name={`mix_${t}`}
                min={0}
                max={20}
                value={mix[t]}
                onChange={(e) => setCount(t, parseInt(e.target.value, 10))}
                className="w-16 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-right text-sm outline-none focus:border-neutral-500"
              />
            </label>
          ))}
        </div>
        <p className="text-sm text-neutral-400">
          {total} pieza{total === 1 ? "" : "s"} · costo estimado{" "}
          <span className="font-medium text-neutral-200">{formatUsd(estimated)}</span>
        </p>
      </fieldset>

      <Field label="Tope de presupuesto (USD, opcional)">
        <input
          type="number"
          name="budget_cap"
          min={0}
          step="0.01"
          className={inputCls}
          placeholder="Si lo dejas vacío, se usa el tope por defecto del entorno."
        />
      </Field>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link href={`/brands/${brandId}`} className="text-sm text-neutral-400 hover:text-neutral-200">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-500";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-neutral-400">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </span>
      {children}
    </label>
  );
}
