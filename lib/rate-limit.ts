/**
 * Rate limiting best-effort en memoria (por instancia serverless). Frena abuso y
 * disparos de costo en endpoints caros. NO es un límite distribuido: para eso se
 * conecta un KV (Upstash) más adelante. Ver docs/SEGURIDAD.md.
 */
import { NextResponse } from "next/server";

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Devuelve una respuesta 429 si el usuario excede el límite, o null si pasa. */
export function limitOr429(
  userId: string,
  name: string,
  limit: number,
  windowMs = 60_000
): NextResponse | null {
  const rl = rateLimit(`${name}:${userId}`, limit, windowMs);
  if (rl.ok) return null;
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo." },
    { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
  );
}
