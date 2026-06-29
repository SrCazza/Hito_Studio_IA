/**
 * Fuente única de las plataformas que el sistema soporta para exportar lotes.
 * Solo estas 4: Instagram, TikTok, Twitter/X, Facebook.
 * La usan: estrategia (enum de platform_target), feed preview, mockups,
 * empaquetado y el fondo del login.
 */
import {
  Instagram as InstagramIcon,
  TikTok as TikTokIcon,
  XCom as XComIcon,
  Facebook as FacebookIcon,
} from "@/components/landing/Platforms";

export const PLATFORMS = [
  { value: "Instagram", label: "Instagram", Icon: InstagramIcon },
  { value: "TikTok", label: "TikTok", Icon: TikTokIcon },
  { value: "Twitter", label: "Twitter/X", Icon: XComIcon },
  { value: "Facebook", label: "Facebook", Icon: FacebookIcon },
] as const;

export type PlatformValue = (typeof PLATFORMS)[number]["value"];

export const PLATFORM_VALUES = PLATFORMS.map((p) => p.value) as PlatformValue[];

/** Normaliza un valor libre del LLM a una de las 4 plataformas (default Instagram). */
export function normalizePlatform(raw: string | null | undefined): PlatformValue {
  const t = (raw ?? "").trim().toLowerCase();
  if (t.includes("tiktok") || t.includes("tik tok")) return "TikTok";
  if (t.includes("face")) return "Facebook";
  if (t.includes("twitter") || t === "x" || t.includes("x.com")) return "Twitter";
  return "Instagram";
}
