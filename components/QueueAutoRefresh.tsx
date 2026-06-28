"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refresca la página de cola mientras haya piezas en curso, para reflejar el
 * progreso del worker (n8n) sin recargar a mano. Se detiene cuando todo terminó.
 */
export function QueueAutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(id);
  }, [active, router]);
  return null;
}
