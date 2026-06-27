import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
          Studio de Contenido IA
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Panel interno
        </h1>
        <p className="mt-3 max-w-prose text-neutral-400">
          Studio de contenido agéntico con humano-en-el-loop. La IA produce en
          volumen; tú apruebas con el semáforo antes de publicar.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/brands"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
        >
          Entrar al panel
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium transition hover:bg-neutral-900"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
