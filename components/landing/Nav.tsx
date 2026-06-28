import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Registrarte
          </Link>
        </nav>
      </div>
    </header>
  );
}
