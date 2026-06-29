import { cn } from "@/lib/cn";

/** Clase base de los controles. 16px en móvil (evita zoom iOS), 14px desktop. */
function controlCls(error?: boolean, className?: string) {
  return cn(
    "w-full rounded-lg border bg-surface px-3 py-2.5 text-base outline-none transition",
    "placeholder:text-muted/60 focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
    error ? "border-red focus:border-red" : "border-border-strong",
    className
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean };
export function Input({ error, className, ...props }: InputProps) {
  return <input {...props} className={controlCls(error, className)} />;
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean };
export function Textarea({ error, className, ...props }: TextareaProps) {
  return <textarea {...props} className={controlCls(error, className)} />;
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean };
export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select {...props} className={cn(controlCls(error, className), "appearance-none pr-9")}>
      {children}
    </select>
  );
}

/** Campo con label, requerido, helper/assist a la derecha, y error debajo. */
export function Field({
  label,
  required,
  assist,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  assist?: React.ReactNode;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-sm text-muted">
        <span>
          {label}
          {required && <span className="text-red"> *</span>}
        </span>
        {assist}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-muted/70">{hint}</span>}
      {error && <span className="text-xs text-red">{error}</span>}
    </label>
  );
}
