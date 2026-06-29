"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { ActionState } from "@/app/brands/actions";
import { linesToList } from "@/lib/validation/brand";
import type { AiVisibility, Brand } from "@/lib/types/database";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/form";

type BrandAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const AI_OPTIONS: { value: AiVisibility; label: string }[] = [
  { value: "permitida", label: "Permitida" },
  { value: "baja", label: "Baja" },
  { value: "minima", label: "Mínima" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Guardando…" : label}
    </Button>
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
      className="text-xs text-brand-400 underline-offset-2 transition hover:underline disabled:opacity-50"
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
  const [state, formAction] = useActionState<ActionState, FormData>(action, { error: null });

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
      <input type="hidden" name="do_list" value={JSON.stringify(linesToList(fields.do_list))} />
      <input type="hidden" name="dont_list" value={JSON.stringify(linesToList(fields.dont_list))} />

      <div className="card flex flex-col gap-5 p-5 sm:p-6">
        <Field label="Nombre de la marca" required>
          <Input name="name" required value={fields.name} onChange={(e) => set("name", e.target.value)} />
        </Field>

        <Field label="Sector" hint="Ej. Tecnología, moda, gastronomía…">
          <Input name="sector" value={fields.sector} onChange={(e) => set("sector", e.target.value)} />
        </Field>

        <Field
          label="Objetivo"
          assist={<AssistButton field="objetivo" getContext={ctx} onSuggest={(t) => set("objetivo", t)} />}
        >
          <Textarea name="objetivo" rows={2} value={fields.objetivo} onChange={(e) => set("objetivo", e.target.value)} />
        </Field>

        <Field
          label="Público"
          assist={<AssistButton field="publico" getContext={ctx} onSuggest={(t) => set("publico", t)} />}
        >
          <Textarea name="publico" rows={2} value={fields.publico} onChange={(e) => set("publico", e.target.value)} />
        </Field>

        <Field
          label="Tono de voz"
          assist={<AssistButton field="tono" getContext={ctx} onSuggest={(t) => set("tono", t)} />}
        >
          <Textarea name="tono" rows={2} value={fields.tono} onChange={(e) => set("tono", e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Qué SÍ" hint="Una línea por ítem">
            <Textarea rows={4} value={fields.do_list} onChange={(e) => set("do_list", e.target.value)} />
          </Field>
          <Field label="Qué NO" hint="Una línea por ítem">
            <Textarea rows={4} value={fields.dont_list} onChange={(e) => set("dont_list", e.target.value)} />
          </Field>
        </div>

        <Field label="Política de IA visible" hint="Cuánta IA generativa se permite mostrar">
          <Select
            name="ai_visibility_policy"
            value={fields.ai_visibility_policy}
            onChange={(e) => set("ai_visibility_policy", e.target.value)}
          >
            {AI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {state.error && <p className="text-sm text-red">{state.error}</p>}
      {state.ok && !state.error && <p className="text-sm text-brand-400">✓ Cambios guardados.</p>}

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/brands" className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
