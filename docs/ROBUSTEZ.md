# Robustez y escala (M7)

Cómo el proyecto cumple los criterios de `BUILD_PLAN.md → M7`. Parte es código
(ya hecho), parte es provisión en las plataformas (lo hace el usuario).

## 1. Listados paginados, sin N+1 ✅ (código)

- **Paginación (20/página)** en los listados que crecen: `/brands` y
  `/brands/[id]/batches`. Helper en `components/Pagination.tsx` (`pageRange`,
  `parsePage`, `Pagination`), con `.range()` + `count: 'exact'` de Supabase.
- **Sin N+1:** ninguna vista hace una query por elemento. Cada pantalla trae
  los assets y sus relacionados (jobs, metrics) en **queries separadas y
  acotadas** y los cruza en memoria con un `Map` (ver `queue`, `review`,
  `results`). Los listados por tanda llevan `.limit()` defensivo (assets ≤100,
  jobs ≤500, metrics ≤1000); el mix ya acota las piezas a ≤50 por tanda.
- Sin `SELECT *`: cada query pide solo las columnas que usa.

## 2. Pooling de conexiones (Supavisor) ✅ (por diseño)

- La app usa **PostgREST sobre HTTP** vía `@supabase/supabase-js` / `@supabase/ssr`
  — **no abre conexiones Postgres directas** desde las funciones serverless de
  Vercel, así que **no puede agotar el pool**. Es el modo recomendado para
  serverless.
- La única conexión directa a Postgres es para **migraciones / CLI**: usar el
  **pooler de Supavisor** (`SUPABASE_DB_URL`, modo *transaction*, puerto `6543`)
  — ya documentado en `.env.example`. Nunca la conexión directa (5432) desde
  entornos efímeros.

## 3. Monitoreo + alertas ⏳ (código listo · falta provisionar)

- **Errores legibles + logging:** `app/error.tsx`, `app/global-error.tsx`,
  `app/not-found.tsx` (estados de error de UI) y `lib/log.ts` (logging
  estructurado a los logs de Vercel). Stack traces solo en logs, nunca en
  pantalla.
- **Sentry (pendiente de DSN):** `lib/log.ts` tiene el punto único de enganche
  (`TODO(Sentry)`). Para activarlo: `npm i @sentry/nextjs`, `npx @sentry/wizard`,
  y poner `SENTRY_DSN` en Vercel. El logging ya pasa por un solo lugar.
- **Alertas de n8n (pendiente):** en n8n, definir un **Error Workflow** global
  (Settings → Error Workflow) que notifique (email/Slack) cuando falle el
  workflow `ai_studio_hito33`. El worker ya marca el job/asset en `error` con
  `last_error` legible; el panel lo muestra en la cola.
- **Alertas de gasto (pendiente):** además de los billing alerts de cada
  proveedor (M0), `cost_log` permite un check de umbral por marca/mes (consulta
  programada en n8n → notificación). Recargar fal.ai dispara este flujo real.

## 4. Rollback + staging ⏳ (provisión en Vercel)

- **Preview deployments:** cada rama/PR genera un entorno aislado en Vercel
  (staging) — nunca se prueban tandas reales en producción.
- **Rollback instantáneo:** Vercel → Deployments → *Promote/Rollback* a un
  build previo. Un deploy roto se revierte en segundos.
- Mantener **dev/prod separados** (variables de entorno por entorno en Vercel).

## 5. Seguridad de cabeceras / CORS ✅ (código)

- `next.config.ts` añade headers a todas las rutas: `X-Frame-Options: DENY`
  (anti-clickjacking — es un panel interno), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy` (cámara/mic/geo deshabilitados),
  `poweredByHeader: false`.
- **CORS:** las rutas `/api` son same-origin (las llama el propio panel). Next no
  añade `Access-Control-Allow-Origin` permisivo por defecto, así que no se
  exponen a otros orígenes.

## 6. Dependencias ✅ (código)

- `.github/dependabot.yml`: PRs semanales de actualizaciones (npm + GitHub
  Actions), agrupando minor/patch.
- `npm audit`: **0 vulnerabilidades** (se forzó `postcss ^8.5.15` vía
  `overrides` para la copia anidada que empaqueta Next).
