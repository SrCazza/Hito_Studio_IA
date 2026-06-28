"use client";

import { useId, useState } from "react";

/** Input de contraseña con botón ojo para ver/ocultar (accesible). */
export function PasswordInput({
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={
          className ??
          "w-full rounded-md border border-border-strong bg-surface px-3 py-2 pr-10 text-sm outline-none transition focus:border-brand-400"
        }
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted transition hover:text-foreground"
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

function Eye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
      <path d="M6.6 6.6C3.6 8.3 2 11 2 11s3.5 7 10 7a9.3 9.3 0 0 0 5.4-1.6" />
      <path d="m2 2 20 20" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
