/**
 * Cliente LLM (Claude). Centraliza los IDs de modelo para poder intercambiarlos.
 * - SONNET → juicio (estrategia, voz, semáforo).
 * - HAIKU  → volumen (captions, JSON, onboarding asistido).
 *
 * NOTA: los nombres/versiones de modelos cambian seguido. Verifica al implementar
 * y ajusta vía variables de entorno si hace falta. (CLAUDE.md §Stack)
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "@/lib/env";

export const MODELS = {
  // Juicio: estrategia, semáforo, análisis.
  sonnet: process.env.ANTHROPIC_MODEL_SONNET ?? "claude-sonnet-4-6",
  // Volumen: copy, JSON, sugerencias de onboarding.
  haiku: process.env.ANTHROPIC_MODEL_HAIKU ?? "claude-haiku-4-5-20251001",
} as const;

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  const { anthropicApiKey } = serverEnv();
  if (!anthropicApiKey) {
    throw new Error("Falta ANTHROPIC_API_KEY. Configúrala para usar el LLM.");
  }
  if (!client) {
    client = new Anthropic({ apiKey: anthropicApiKey });
  }
  return client;
}

/** Helper simple: prompt → texto. Con timeout y manejo de error arriba. */
export async function completeText(opts: {
  model: string;
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getAnthropic();
  const msg = await anthropic.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 400,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
