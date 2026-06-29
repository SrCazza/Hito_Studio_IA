"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/brand/Wordmark";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PLATFORMS } from "@/lib/platforms";

type Mode = "signin" | "signup";

export default function LoginPage() {
  return (
    <div className="theme-light relative min-h-screen overflow-hidden bg-background">
      <LoginBackground />
      <Suspense fallback={<main className="min-h-screen" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

// Posiciones de los iconos de redes flotando de fondo.
const BG_ICONS = [
  "left-[8%] top-[14%]",
  "left-[18%] top-[68%]",
  "right-[10%] top-[20%]",
  "right-[20%] top-[72%]",
  "left-[40%] top-[10%]",
  "right-[38%] bottom-[10%]",
  "left-[12%] top-[40%]",
  "right-[12%] top-[46%]",
];

function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(80% 60% at 50% 40%, #000 30%, transparent 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-72 glow-brand" />
      {BG_ICONS.map((pos, i) => {
        const Icon = PLATFORMS[i % PLATFORMS.length]!.Icon;
        return (
          <span key={i} className={`absolute text-muted/25 ${pos}`}>
            <span
              className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface/70 shadow-sm"
              style={{ ["--fd" as string]: `${i * 450}ms` }}
            >
              <Icon size={22} />
            </span>
          </span>
        );
      })}
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
    <main className="relative z-10 mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-7 px-6">
      <Wordmark />

      <div className="card flex flex-col gap-6 bg-surface/85 p-6 shadow-xl backdrop-blur-sm sm:p-7">
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
      </div>
    </main>
  );
}
