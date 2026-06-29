# Studio de Contenido IA

Studio de contenido agéntico con **humano en el loop** para llevar redes sociales de varias marcas. La IA produce en volumen; el humano aprueba con un sistema **semáforo** (verde/amarillo/rojo) antes de publicar.

> Contexto y guardrails: [`docs/CLAUDE.md`](docs/CLAUDE.md) · Especificación: [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md) · Orden de construcción: [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md)

## Stack

- **Frontend / panel:** Next.js 16 (App Router) + TypeScript estricto + Tailwind v4 → Vercel.
- **Datos + cola + auth + storage:** Supabase (Postgres, Auth, Storage, RLS).
- **Orquestación / worker:** n8n (genera imagen/video; la espera larga vive aquí).
- **Modelos:** Claude Sonnet (juicio) / Haiku (volumen); imagen vía fal.ai; voz vía ElevenLabs.

## Estado de construcción

| Milestone | Estado |
| --- | --- |
| **M0** Fundaciones (scaffold, env, estructura) | ✅ |
| **M1** Datos y auth (schema + RLS, login, CRUD de marca) | ✅ |
| M2 Brief → plan → aprobar | ⏳ |
| M3+ Motor, semáforo, paquete… | ⏳ |

## Puesta en marcha (local)

```bash
npm install
cp .env.example .env.local   # rellena Supabase + claves (ver .env.example)
```

1. **Supabase:** crea el proyecto y aplica las migraciones de [`supabase/`](supabase/README.md) en orden (schema → RLS → storage). Copia `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` a `.env.local`.
2. Arranca el panel:
   ```bash
   npm run dev
   ```
3. Entra a `/login`, **regístrate** (crea tu `profile` owner vía trigger) y luego corre `supabase/seed.sql` para la marca semilla **Hito33**.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Levanta el panel en local. |
| `npm run build` | Build de producción. |
| `npm run typecheck` | `tsc --noEmit` (TS estricto). |
| `npm run lint` | ESLint. |

## Estructura

```
/app          rutas Next.js (App Router): login, brands, api
/lib          supabase clients, llm, env, validación (zod), tipos
/components   UI (formularios, panel)
/supabase     migraciones SQL, RLS, seed
/n8n          workflows exportados (M3+)
/docs         CLAUDE.md, BLUEPRINT.md, BUILD_PLAN.md
```

## Guardrails (no negociables)

Nada se produce sin aprobación · idempotencia anti-doble-cobro · timeouts+reintentos+`cost_log` en toda API de pago · tope de presupuesto por tanda · aislamiento por marca (RLS) · secretos solo en servidor/n8n · media a Storage (solo refs en DB) · rojo automático determinista en el semáforo. Detalle en [`docs/CLAUDE.md`](docs/CLAUDE.md).
