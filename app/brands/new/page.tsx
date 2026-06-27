import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandForm } from "@/components/BrandForm";
import { createBrand } from "@/app/brands/actions";

export default async function NewBrandPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/brands" className="text-sm text-neutral-400 hover:text-neutral-200">
        ← Marcas
      </Link>
      <h1 className="mb-1 mt-4 text-2xl font-semibold tracking-tight">Nueva marca</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Completa el perfil. Si no sabes qué poner en un campo, usa «✨ Ayúdame».
      </p>
      <BrandForm action={createBrand} submitLabel="Crear marca" />
    </main>
  );
}
