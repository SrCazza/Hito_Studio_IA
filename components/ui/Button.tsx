import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-600",
  secondary: "border border-border-strong bg-surface text-foreground hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2/60 hover:text-foreground",
  danger: "border border-red/40 text-red hover:bg-red/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

/**
 * Clases del botón. Úsalo en enlaces-botón:
 *   <Link className={buttonVariants({ variant: "primary" })}>…</Link>
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "press inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold transition",
    "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

function Spinner() {
  return (
    <svg className="spinner" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Para toggles: estado seleccionado (aria-pressed). */
  selected?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

/**
 * Botón con todos los estados: normal, hover, activo (press), focus-visible,
 * deshabilitado, cargando (spinner + bloqueado) y seleccionado (toggles).
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  selected,
  disabled,
  className,
  children,
  ref,
  ...props
}: Props) {
  return (
    <button
      ref={ref}
      {...props}
      disabled={disabled || loading}
      aria-pressed={selected}
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({ variant, size, className }),
        selected && "ring-2 ring-brand-400 ring-offset-2 ring-offset-background"
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
