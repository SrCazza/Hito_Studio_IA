import Link from "next/link";

/** 404 global (M7). */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">No encontrado</h1>
      <p className="text-sm text-neutral-400">La página o el recurso no existe o no es tuyo.</p>
      <Link href="/brands" className="text-sm underline underline-offset-4 hover:text-neutral-200">
        Volver a Marcas
      </Link>
    </main>
  );
}
