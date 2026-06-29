"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/PasswordInput";

/** Cambiar contraseña de la cuenta (Supabase Auth). */
export function PasswordChange() {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pwd.length < 8) return setMsg({ ok: false, text: "Mínimo 8 caracteres." });
    if (pwd !== confirm) return setMsg({ ok: false, text: "Las contraseñas no coinciden." });
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) setMsg({ ok: false, text: error.message });
    else {
      setMsg({ ok: true, text: "Contraseña actualizada." });
      setPwd("");
      setConfirm("");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Nueva contraseña">
        <PasswordInput value={pwd} onChange={setPwd} autoComplete="new-password" minLength={8} />
      </Field>
      <Field label="Repite la contraseña">
        <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" minLength={8} />
      </Field>
      {msg && <p className={`text-sm ${msg.ok ? "text-brand-400" : "text-red"}`}>{msg.text}</p>}
      <div>
        <Button type="submit" loading={busy}>
          {busy ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}
