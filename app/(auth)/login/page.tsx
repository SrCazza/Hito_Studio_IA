"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/brand/Wordmark";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Mode = "signin" | "signup";

export default function LoginPage() {
  return (
    <div className="theme-light min-h-screen bg-background">
      <Suspense fallback={<main className="min-h-screen" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/brands";

  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.replace(redirectTo);
        router.refresh();
      } else {
        setInfo("Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
        setMode("signin");
        setLoading(false);
      }
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-7 px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 glow-brand" />

      <Wordmark />

      <div>
        <h1 className="font-display text-3xl tracking-tight">
          {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {mode === "signin"
            ? "Entra a tu panel de Hito IA Studio."
            : "Crea tu cuenta para empezar."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Correo</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand-400"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Contraseña</span>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>

        {error && <p className="text-sm text-red">{error}</p>}
        {info && <p className="text-sm text-brand-400">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "…" : mode === "signin" ? "Entrar" : "Registrarme"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setError(null);
          setInfo(null);
        }}
        className="text-sm text-muted underline-offset-4 transition hover:text-foreground hover:underline"
      >
        {mode === "signin" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </main>
  );
}
