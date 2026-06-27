"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { batchBriefSchema, MIX_TYPES } from "@/lib/validation/batch";
import { generateAndPersistPlan } from "@/lib/batches";

export type ActionState = { error: string | null };

/** Lee el FormData de la tanda y valida en servidor. */
function parseBatchForm(formData: FormData) {
  const format_mix = Object.fromEntries(
    MIX_TYPES.map((t) => [t, Number(formData.get(`mix_${t}`) ?? 0)])
  );
  const budgetRaw = String(formData.get("budget_cap") ?? "").trim();
  const raw = {
    title: String(formData.get("title") ?? ""),
    brief: String(formData.get("brief") ?? ""),
    format_mix,
    budget_cap: budgetRaw === "" ? undefined : Number(budgetRaw),
  };
  return batchBriefSchema.safeParse(raw);
}

export async function createBatch(
  brandId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!z.string().uuid().safeParse(brandId).success) {
    return { error: "Marca inválida." };
  }
  const parsed = parseBatchForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v = parsed.data;
  // RLS (owns_brand) garantiza que la tanda solo se crea si la marca es del dueño.
  const { data: batch, error } = await supabase
    .from("batches")
    .insert({
      brand_id: brandId,
      title: v.title,
      brief: v.brief || null,
      format_mix: v.format_mix,
      budget_cap: v.budget_cap ?? null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Genera el plan de una vez. Si falla (p. ej. falta ANTHROPIC_API_KEY), la
  // tanda queda en `draft` y la pantalla de plan ofrece «Generar plan».
  await generateAndPersistPlan(batch.id);

  redirect(`/batches/${batch.id}/plan`);
}
