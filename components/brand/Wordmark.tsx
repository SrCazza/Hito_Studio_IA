import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/** Logo + nombre. Enlaza al home por defecto. */
export function Wordmark({ href = "/", size = 30 }: { href?: string | null; size?: number }) {
  const inner = (
    <span className="flex items-center gap-2.5">
      <Logo size={size} />
      <span className="text-[0.95rem] font-semibold tracking-tight text-foreground">
        Hito <span className="text-brand-400">IA</span> Studio
      </span>
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} className="transition-opacity hover:opacity-90">
      {inner}
    </Link>
  );
}
