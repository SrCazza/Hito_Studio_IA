"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { IconHeart, IconComment, IconBookmark, IconShare } from "@/components/landing/Icons";
import { PLATFORMS, type PlatformValue } from "@/lib/platforms";

type Device = "mobile" | "web";

const DOMAIN: Record<PlatformValue, string> = {
  Instagram: "instagram.com",
  TikTok: "tiktok.com",
  Twitter: "x.com",
  Facebook: "facebook.com",
};

const SAMPLE = {
  handle: "hito33",
  caption:
    "Las mismas manos de siempre, ahora con más alcance. Te mostramos el proceso real, sin humo, de cómo armamos una tanda de contenido.",
  likes: "1.248",
  line: "Mismas manos.\nMás alcance.",
};

/** Mockup de la "media" generada (CSS/SVG, sin imagen real). */
function PostArt({ platform }: { platform: PlatformValue }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-[#0e2a1f]">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(52,211,153,0.35),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <Logo size={26} badge={false} className="absolute right-4 top-4 text-white/70" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-400">
          POST · {platform.toUpperCase()}
        </p>
        <p className="font-display mt-2 whitespace-pre-line text-2xl leading-tight text-white">
          {SAMPLE.line}
        </p>
      </div>
    </div>
  );
}

function PostCard({ platform }: { platform: PlatformValue }) {
  const label = PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
  return (
    <div className="overflow-hidden bg-[#101012] text-[13px]">
      {/* header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand p-px">
          <span className="grid h-full w-full place-items-center rounded-full bg-[#101012]">
            <Logo size={16} badge={false} className="text-white" />
          </span>
        </span>
        <div className="leading-tight">
          <p className="font-semibold text-white">{SAMPLE.handle}</p>
          <p className="text-[11px] text-white/45">Publicación · Hace 2 h</p>
        </div>
        <span className="ml-auto text-white/40">···</span>
      </div>

      <PostArt platform={platform} />

      {/* actions */}
      <div className="flex items-center gap-4 px-3.5 pt-3 text-white/80">
        <IconHeart className="text-red" />
        <IconComment />
        <IconShare />
        <IconBookmark className="ml-auto" />
      </div>
      <div className="px-3.5 pb-3.5 pt-2 text-white">
        <p className="text-[13px] font-semibold">{SAMPLE.likes} me gusta</p>
        <p className="mt-1 text-[13px] leading-snug text-white/85">
          <span className="font-semibold">{SAMPLE.handle}</span>{" "}
          <span className="text-white/70">{SAMPLE.caption}</span>
        </p>
        <p className="mt-1.5 text-[11px] uppercase tracking-wide text-white/35">{label}</p>
      </div>
    </div>
  );
}

export function FeedPreview() {
  const [platform, setPlatform] = useState<PlatformValue>("Instagram");
  const [device, setDevice] = useState<Device>("mobile");

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-brand">Antes de publicar</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Ve cómo queda en el feed.
          </h2>
          <p className="mt-4 text-muted">
            Previsualiza cada pieza tal como se verá en la plataforma, en el móvil y en la web, para
            ajustar antes de bajar el paquete. Lo que apruebas es lo que se publica.
          </p>

          {/* controles */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Segmented
              options={PLATFORMS.map((p) => ({ v: p.value, label: p.label }))}
              value={platform}
              onChange={(v) => setPlatform(v as PlatformValue)}
            />
            <Segmented
              options={[
                { v: "mobile", label: "Móvil" },
                { v: "web", label: "Web" },
              ]}
              value={device}
              onChange={(v) => setDevice(v as Device)}
            />
          </div>
        </div>

        {/* mockup */}
        <div className="flex justify-center">
          {device === "mobile" ? (
            <div className="w-[300px] rounded-[2.2rem] border border-border-strong bg-black p-2.5 shadow-2xl">
              <div className="relative overflow-hidden rounded-[1.7rem]">
                <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />
                <PostCard platform={platform} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-border-strong bg-[#0c0c0e] shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green/70" />
                <span className="ml-3 truncate rounded bg-white/5 px-2 py-0.5 text-[11px] text-white/40">
                  {DOMAIN[platform]}/{SAMPLE.handle}
                </span>
              </div>
              <div className="mx-auto max-w-[360px] p-4">
                <div className="overflow-hidden rounded-lg border border-white/8">
                  <PostCard platform={platform} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-border bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={`press rounded-md px-3 py-1.5 text-sm transition ${
            value === o.v ? "bg-brand text-white" : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
