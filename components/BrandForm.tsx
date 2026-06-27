"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionState } from "@/app/brands/actions";
import { linesToList } from "@/lib/validation/brand";
import type { AiVisibility, Brand } from "@/lib/types/database";

type BrandAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const AI_OPTIONS: { value: AiVisibility; label: string }[] = [
  { value: "permitida", label: "Permitida" },
  { value: "baja", label: "Baja" },
  { value: "minima", label: "Mínima" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

/** Botón que pide al LLM una sugerencia para un campo (onboarding asistido). */
function AssistButton({
  field,
  getContext,
  onSuggest,
}: {
  field: string;
  getContext: () => Record<string, string>;
  onSuggest: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/brands/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context: getContext() }),
      });
      const data = (await res.json()) as { suggestion?: string; error?: string };
      if (data.suggestion) onSuggest(data.suggestion);
      else if (data.error) alert(data.error);
    } catch {
      alert("No se pudo obtener la sugerencia.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      className="text-xs text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline disabled:opacity-50"
    >
      {loading ? "Pensando…" : "✨ Ayúdame"}
    </button>
  );
}

export function BrandForm({
  action,
  brand,
  submitLabel,
}: {
  action: BrandAction;
  brand?: Brand;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {
    error: null,
  });

  const [fields, setFields] = useState({
    name: brand?.name ?? "",
    sector: brand?.sector ?? "",
    objetivo: brand?.objetivo ?? "",
    publico: brand?.publico ?? "",
    tono: brand?.tono ?? "",
    do_list: (brand?.do_list ?? []).join("\n"),
    dont_list: (brand?.dont_list ?? []).join("\n"),
    ai_visibility_policy: brand?.ai_visibility_policy ?? "baja",
  });

  function set<K extends keyof typeof fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  const ctx = () => ({
    name: fields.name,
    sector: fields.sector,
    objetivo: fields.objetivo,
    publico: fields.publico,
    tono: fields.tono,
  });

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {/* Listas serializadas como JSON para el server action */}
      <input type="hidden" name="do_list" value={JSON.stringify(linesToList(fields.do_list))} />
      <input type="hidden" name="dont_list" value={JSON.stringify(linesToList(fields.dont_list))} />

      <Field label="Nombre de la marca" required>
        <input
          name="name"
          required
          value={fields.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Sector">
        <input
          name="sector"
          value={fields.sector}
          onChange={(e) => set("sector", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field
        label="Objetivo"
        assist={<AssistButton field="objetivo" getContext={ctx} onSuggest={(t) => set("objetivo", t)} />}
      >
        <textarea
          name="objetivo"
          rows={2}
          value={fields.objetivo}
          onChange={(e) => set("objetivo", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field
        label="Público"
        assist={<AssistButton field="publico" getContext={ctx} onSuggest={(t) => set("publico", t)} />}
      >
        <textarea
          name="publico"
          rows={2}
          value={fields.publico}
          onChange={(e) => set("publico", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field
        label="Tono de voz"
        assist={<AssistButton field="tono" getContext={ctx} onSuggest={(t) => set("tono", t)} />}
      >
        <textarea
          name="tono"
          rows={2}
          value={fields.tono}
          onChange={(e) => set("tono", e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Qué SÍ (una línea por ítem)">
          <textarea
            rows={4}
            value={fields.do_list}
            onChange={(e) => set("do_list", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Qué NO (una línea por ítem)">
          <textarea
            rows={4}
            value={fields.dont_list}
            onChange={(e) => set("dont_list", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Política de IA visible">
        <select
          name="ai_visibility_policy"
          value={fields.ai_visibility_policy}
          onChange={(e) => set("ai_visibility_policy", e.target.value)}
          className={inputCls}
        >
          {AI_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/brands" className="text-sm text-neutral-400 hover:text-neutral-200">
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
  assist,
  children,
}: {
  label: string;
  required?: boolean;
  assist?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-sm text-neutral-400">
        <span>
          {label}
          {required && <span className="text-red-400"> *</span>}
        </span>
        {assist}
      </span>
      {children}
    </label>
  );
}
