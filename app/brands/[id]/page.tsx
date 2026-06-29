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
      <Link href="/brands" className="text-sm text-muted hover:text-foreground">
        ← Marcas
      </Link>
      <div className="mb-8 mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{(brand as Brand).name}</h1>
          <p className="mt-1 text-sm text-muted">Perfil de marca, editable.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/brands/${id}/batches`}
            className="rounded-md border border-border-strong px-3 py-1.5 text-sm text-foreground hover:border-border-strong"
          >
            Ver tandas
          </Link>
          <Link
            href={`/brands/${id}/batches/new`}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Nueva tanda
          </Link>
          <form action={boundDelete}>
            <button className="rounded-md border border-red/40 px-3 py-1.5 text-sm text-red hover:bg-red/10">
              Eliminar
            </button>
          </form>
        </div>
      </div>

      <BrandForm action={boundUpdate} brand={brand as Brand} submitLabel="Guardar cambios" />

      <p className="mt-6 text-sm text-brand-400" />
    </main>
  );
}
