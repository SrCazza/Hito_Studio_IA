import { Wordmark } from "@/components/brand/Wordmark";
import { SidebarNav } from "@/components/panel/SidebarNav";

/** Shell del panel: sidebar (desktop) + topbar + contenido. Oscuro. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface/40 md:flex">
        <div className="px-5 py-5">
          <Wordmark size={28} />
        </div>
        <div className="mt-2 flex-1">
          <p className="px-6 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted/70">
            Espacio
          </p>
          <SidebarNav />
        </div>
        <form action="/auth/signout" method="post" className="border-t border-border p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2/60 hover:text-foreground">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Salir
          </button>
        </form>
      </aside>

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        {/* Topbar (móvil) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
          <Wordmark size={26} />
          <form action="/auth/signout" method="post">
            <button className="rounded-md px-2 py-1 text-sm text-muted hover:text-foreground">Salir</button>
          </form>
        </header>
        {children}
      </div>
    </div>
  );
}
