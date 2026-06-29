/**
 * Cliente de Supabase para el navegador (Client Components).
 * Usa la anon key (pública); la seguridad real la da RLS.
 *
 * "Mantener sesión": el flag en localStorage decide si las cookies de auth son
 * persistentes (max-age largo) o de sesión (se borran al cerrar el navegador).
 * Por defecto se recuerda la sesión.
 */
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

const REMEMBER_KEY = "hito_remember";
const PERSIST_MAX_AGE = 60 * 60 * 24 * 400; // ~400 días

/** Llamar ANTES de iniciar sesión para fijar la preferencia. */
export function setRememberPreference(remember: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  }
}

function remembers(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(REMEMBER_KEY) !== "0";
}

type CookieOpts = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date | string | number;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

function serialize(name: string, value: string, o: CookieOpts, persist: boolean): string {
  let s = `${name}=${value}`;
  if (persist) {
    s += `; Max-Age=${o.maxAge ?? PERSIST_MAX_AGE}`;
  } // si no persiste, sin Max-Age/Expires -> cookie de sesión
  s += `; Path=${o.path ?? "/"}`;
  if (o.domain) s += `; Domain=${o.domain}`;
  if (o.sameSite) s += `; SameSite=${o.sameSite === true ? "Strict" : o.sameSite}`;
  if (o.secure) s += "; Secure";
  return s;
}

export function createClient() {
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        return document.cookie
          ? document.cookie.split("; ").map((c) => {
              const i = c.indexOf("=");
              return { name: c.slice(0, i), value: c.slice(i + 1) };
            })
          : [];
      },
      setAll(cookies) {
        if (typeof document === "undefined") return;
        const persist = remembers();
        for (const { name, value, options } of cookies) {
          document.cookie = serialize(name, value, (options ?? {}) as CookieOpts, persist);
        }
      },
    },
  });
}
