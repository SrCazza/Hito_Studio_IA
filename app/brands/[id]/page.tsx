import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandForm } from "@/components/BrandForm";
import { updateBrand, deleteBrand } from "@/app/brands/actions";
import type { Brand } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS garantiza que solo devuelve la marca si es del dueño.
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!brand) notFound();

  const boundUpdate = updateBrand.bind(null, id);
  const boundDelete = deleteBrand.bind(null, id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/brands" className="text-sm text-neutral-400 hover:text-neutral-200">
        ← Marcas
      </Link>
      <div className="mb-8 mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{(brand as Brand).name}</h1>
          <p className="text-sm text-neutral-400">Perfil de marca — editable.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/brands/${id}/batches/new`}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
          >
            Nueva tanda
          </Link>
          <form action={boundDelete}>
            <button className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950/40">
              Eliminar
            </button>
          </form>
        </div>
      </div>

      <BrandForm action={boundUpdate} brand={brand as Brand} submitLabel="Guardar cambios" />

      <p className="mt-6 text-sm text-emerald-400" />
    </main>
  );
}
