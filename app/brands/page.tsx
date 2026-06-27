import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sin SELECT *; trae solo lo que la lista necesita. RLS filtra por owner.
  const { data: brands, error } = await supabase
    .from("brands")
    .select("id, name, sector, ai_visibility_policy, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marcas</h1>
          <p className="text-sm text-neutral-400">Elige el perfil de hoy.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/brands/new"
            className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Nueva marca
          </Link>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-neutral-400 hover:text-neutral-200">Salir</button>
          </form>
        </div>
      </header>

      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Error al cargar marcas: {error.message}
        </p>
      )}

      {brands && brands.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-700 px-6 py-12 text-center">
          <p className="text-neutral-400">Todavía no tienes marcas.</p>
          <Link href="/brands/new" className="mt-2 inline-block text-sm underline">
            Crear la primera
          </Link>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {brands?.map((b) => (
          <li key={b.id}>
            <Link
              href={`/brands/${b.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-800 px-4 py-3 transition hover:border-neutral-600 hover:bg-neutral-900"
            >
              <span>
                <span className="font-medium">{b.name}</span>
                {b.sector && <span className="ml-2 text-sm text-neutral-500">{b.sector}</span>}
              </span>
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                IA: {b.ai_visibility_policy}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
