import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIX_LABELS, type MixType } from "@/lib/validation/batch";
import { PackageView } from "@/components/PackageView";
import type { AssetType } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type AssetRow = {
  id: string;
  type: AssetType;
  content: { concept?: string; copy?: string; final_copy?: string } | null;
  media_url: string | null;
  platform_target: string | null;
};

export type PackagePiece = {
  id: string;
  typeLabel: string;
  caption: string;
  mediaUrl: string | null;
  mediaName: string | null;
};

export type PackagePlatform = { name: string; pieces: PackagePiece[] };

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: batch } = await supabase
    .from("batches")
    .select("id, title, status")
    .eq("id", id)
    .maybeSingle();
  if (!batch) notFound();

  const { data: assetsData } = await supabase
    .from("assets")
    .select("id, type, content, media_url, platform_target")
    .eq("batch_id", id)
    .order("created_at", { ascending: true })
    .limit(100);
  const assets = (assetsData ?? []) as AssetRow[];

  // Firma las URLs de Storage (bucket privado) para previsualizar/descargar.
  const pieces: (PackagePiece & { platform: string })[] = await Promise.all(
    assets.map(async (a) => {
      let mediaUrl: string | null = null;
      let mediaName: string | null = null;
      if (a.media_url) {
        const path = a.media_url.replace(/^assets\//, "");
        const { data } = await supabase.storage.from("assets").createSignedUrl(path, 3600);
        mediaUrl = data?.signedUrl ?? null;
        mediaName = path.split("/").pop() ?? "media.png";
      }
      return {
        id: a.id,
        typeLabel: MIX_LABELS[a.type as MixType] ?? a.type,
        caption: a.content?.final_copy?.trim() || a.content?.copy?.trim() || a.content?.concept?.trim() || "",
        mediaUrl,
        mediaName,
        platform: a.platform_target?.trim() || "Sin plataforma",
      };
    })
  );

  // Agrupa por plataforma.
  const byPlatform = new Map<string, PackagePiece[]>();
  for (const p of pieces) {
    const list = byPlatform.get(p.platform) ?? [];
    list.push(p);
    byPlatform.set(p.platform, list);
  }
  const platforms: PackagePlatform[] = [...byPlatform.entries()].map(([name, ps]) => ({
    name,
    pieces: ps,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href={`/batches/${id}/review`} className="text-sm text-muted transition hover:text-foreground">
          ← Revisión
        </Link>
        <Link href={`/batches/${id}/results`} className="text-sm text-muted transition hover:text-foreground">
          Resultados →
        </Link>
      </div>

      <header className="mb-6 mt-4">
        <h1 className="font-display text-3xl tracking-tight">Paquete: {batch.title}</h1>
        <p className="mt-1.5 text-sm text-muted">
          Copia el texto y descarga la media para subir a mano a cada plataforma. Estado {batch.status}.
        </p>
      </header>

      <PackageView batchId={batch.id} status={batch.status} platforms={platforms} />

      {assets.length === 0 && (
        <p className="rounded-lg border border-dashed border-border-strong px-6 py-10 text-center text-muted">
          Esta tanda no tiene piezas.
        </p>
      )}
    </main>
  );
}
