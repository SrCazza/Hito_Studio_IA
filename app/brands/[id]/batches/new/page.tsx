import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BatchForm } from "@/components/BatchForm";
import { createBatch } from "@/app/brands/[id]/batches/actions";

export const dynamic = "force-dynamic";

export default async function NewBatchPage({
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

  // RLS: solo devuelve la marca si es del dueño.
  const { data: brand } = await supabase
    .from("brands")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!brand) notFound();

  const boundCreate = createBatch.bind(null, id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href={`/brands/${id}`} className="text-sm text-muted hover:text-foreground">
        ← {brand.name}
      </Link>
      <h1 className="mb-1 mt-4 font-display text-3xl tracking-tight">Nueva tanda</h1>
      <p className="mb-8 text-sm text-muted">
        Escribe el brief y define el mix. El estratega propone un plan con costo estimado; tú lo
        apruebas antes de gastar.
      </p>
      <BatchForm action={boundCreate} brandId={id} />
    </main>
  );
}
