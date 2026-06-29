"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { brandFormSchema } from "@/lib/validation/brand";

export type ActionState = { error: string | null; ok?: boolean };

/** Parsea el FormData y valida en servidor (no confiar en el cliente). */
function parseBrandForm(formData: FormData) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    sector: String(formData.get("sector") ?? ""),
    objetivo: String(formData.get("objetivo") ?? ""),
    publico: String(formData.get("publico") ?? ""),
    tono: String(formData.get("tono") ?? ""),
    do_list: JSON.parse(String(formData.get("do_list") ?? "[]")) as unknown,
    dont_list: JSON.parse(String(formData.get("dont_list") ?? "[]")) as unknown,
    ai_visibility_policy: String(formData.get("ai_visibility_policy") ?? "baja"),
  };
  return brandFormSchema.safeParse(raw);
}

export async function createBrand(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v = parsed.data;
  const { error } = await supabase.from("brands").insert({
    owner_id: user.id, // RLS exige owner_id = auth.uid()
    name: v.name,
    sector: v.sector || null,
    objetivo: v.objetivo || null,
    publico: v.publico || null,
    tono: v.tono || null,
    do_list: v.do_list,
    dont_list: v.dont_list,
    ai_visibility_policy: v.ai_visibility_policy,
  });

  if (error) return { error: error.message };

  revalidatePath("/brands");
  redirect("/brands");
}

export async function updateBrand(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!z.string().uuid().safeParse(id).success) {
    return { error: "Marca inválida." };
  }
  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v = parsed.data;
  // RLS garantiza que solo el dueño puede actualizar esta fila.
  const { error } = await supabase
    .from("brands")
    .update({
      name: v.name,
      sector: v.sector || null,
      objetivo: v.objetivo || null,
      publico: v.publico || null,
      tono: v.tono || null,
      do_list: v.do_list,
      dont_list: v.dont_list,
      ai_visibility_policy: v.ai_visibility_policy,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/brands");
  revalidatePath(`/brands/${id}`);
  return { error: null, ok: true };
}

export async function deleteBrand(id: string): Promise<void> {
  if (!z.string().uuid().safeParse(id).success) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/brands");
  redirect("/brands");
}
