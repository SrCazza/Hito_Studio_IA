"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/inicio",
    label: "Inicio",
    match: ["/inicio"],
    icon: "M3 9 12 3l9 6v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9Z",
  },
  {
    href: "/brands",
    label: "Marcas",
    match: ["/brands", "/batches"],
    icon: "M3 7h18M3 12h18M3 17h18",
  },
  {
    href: "/stats",
    label: "Estadísticas",
    match: ["/stats"],
    icon: "M4 19V5M9 19v-6M14 19V9M19 19v-9M3 19h18",
  },
  {
    href: "/settings",
    label: "Ajustes",
    match: ["/settings"],
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1A2 2 0 1 1 7.5 4.6l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1V9a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6Z",
  },
  {
    href: "/help",
    label: "Ayuda",
    match: ["/help"],
    icon: "M12 17h.01M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z",
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((it) => {
        const active = it.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface-2/60 hover:text-foreground"
            }`}
          >
            <span className={active ? "text-brand-400" : ""}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={it.icon} />
              </svg>
            </span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
