import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordChange } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-tight">Ajustes</h1>
        <p className="mt-1 text-sm text-muted">Tu cuenta y preferencias.</p>
      </header>

      <section className="card mb-4 p-5">
        <h2 className="text-sm font-medium">Cuenta</h2>
        <dl className="mt-3 flex items-center justify-between text-sm">
          <dt className="text-muted">Correo</dt>
          <dd className="font-medium">{user.email}</dd>
        </dl>
      </section>

      <section className="card mb-4 p-5">
        <h2 className="mb-4 text-sm font-medium">Cambiar contraseña</h2>
        <PasswordChange />
      </section>

      <section className="card flex items-center justify-between p-5">
        <div>
          <h2 className="text-sm font-medium">Cerrar sesión</h2>
          <p className="mt-1 text-xs text-muted">Salir en este dispositivo.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-lg border border-border-strong px-4 py-2 text-sm transition hover:bg-surface-2">
            Salir
          </button>
        </form>
      </section>
    </main>
  );
}
