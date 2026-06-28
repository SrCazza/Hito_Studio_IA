import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

const links = [
  { href: "#que-hace", label: "Qué hace" },
  { href: "#semaforo", label: "Semáforo" },
  { href: "#como-funciona", label: "Cómo funciona" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-muted transition hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-surface-2 sm:block"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login?mode=signup"
            className="press rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Empieza gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
