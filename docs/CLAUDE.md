# CLAUDE.md — Studio de Contenido IA

> Este archivo es el contexto persistente del repo. Léelo al inicio de cada sesión.
> Acompaña a `BLUEPRINT.md` (la especificación técnica) y `BUILD_PLAN.md` (el orden de construcción).

---

## Qué es

Un **studio de contenido agéntico con humano-en-el-loop** para llevar las redes sociales de varias marcas. El humano (Juan, diseñador) da la idea y dirige; la IA produce en volumen; el humano aprueba con un sistema **semáforo** (verde/amarillo/rojo) antes de publicar.

Es una **herramienta web interna** (hoy para marcas propias: Hito33, Vetia clínicas, Vetia animales; mañana adaptable a clientes). **No** es e-commerce, no cobra dentro de la app, no es app nativa, no es plataforma de contenido de terceros.

**El foso del producto es el criterio del diseñador, no "generar el post".** La IA es **asistiva sobre material real** (image-to-image sobre fotos reales, motion con fotos reales) **antes que generativa desde cero**. El video generativo es la excepción; el avatar, casi nunca.

---

## Stack

- **Frontend / panel:** Next.js (App Router) + TypeScript + Tailwind, desplegado en **Vercel**.
- **Datos + cola de jobs + auth + storage:** **Supabase** (Postgres, Auth, Storage, RLS). Free tier al inicio.
- **Orquestación / worker:** **n8n** (ya disponible). Hace la espera larga (generación de imagen/video) que no cabe en una función serverless.
- **Modelos (intercambiables vía n8n / config):** Claude Sonnet para juicio (estrategia, voz, semáforo); Claude Haiku para volumen (captions, JSON). Imagen vía fal.ai. Voz vía ElevenLabs. OpenAI opcional para A/B. **Verifica nombres/versiones de modelos al implementar — cambian seguido.**

---

## Guardrails (NO negociables)

Estos protegen el dinero, los datos y la marca. Si una tarea los rompe, para y avisa.

1. **Nada se produce sin aprobación.** Ningún job de producción se encola si `batch.status !== 'approved'`. Protégelo en código, no solo en la UI.
2. **Idempotencia obligatoria.** Todo job de generación lleva un `idempotency_key` único. Antes de llamar a una API que cuesta dinero, verifica que el job no se haya producido ya. **Un reintento de n8n no debe cobrar dos veces un reel.**
3. **Toda llamada a API de pago:** timeout + reintentos con backoff, y registro de costo en `cost_log`.
4. **Tope de presupuesto por tanda.** No encolar si el costo estimado supera el tope sin override explícito.
5. **Aislamiento por marca.** Filtra **siempre** por `brand_id` / `owner_id`, en RLS de Supabase **y** a nivel de app. Hoy son marcas propias; mañana un cliente no debe ver las tandas de otro.
6. **Secretos:** la `service_role_key` y las API keys solo en rutas de servidor y en n8n. **Nunca** en el cliente ni en el repo. Todo por variables de entorno.
7. **Media pesada:** se descarga a Supabase Storage; en la DB solo guardas referencias (URLs), no binarios.
8. **Rojo automático determinista.** El semáforo fuerza rojo (en código, no a criterio del LLM) en: caras humanas IA · claims de producto · cifras y datos · contenido sensible.

---

## Convenciones de código

- TypeScript estricto. Validación de input con Zod (o equivalente) en **cliente Y servidor**.
- Escapa/sanitiza toda salida generada que se renderice (captions, copy) — anti-XSS.
- Supabase: usa el cliente oficial (parametriza solo). Si hay SQL crudo, nada de concatenar input.
- Conexiones a Supabase desde Vercel serverless: **pooler (Supavisor)**, no conexión directa.
- Listados (cola, assets, métricas): paginados (20–50), sin `SELECT *`, sin N+1 (trae relacionados en un join).
- Estados de UI siempre explícitos: loading / éxito / error. Errores legibles en el panel, stack traces solo en logs.
- Commits pequeños y enfocados; cada milestone del `BUILD_PLAN.md` cierra con sus criterios de aceptación verdes.

---

## Estructura de carpetas sugerida

```
/app                 # rutas Next.js (App Router)
  /(auth)/login
  /brands            # selector + perfil editable
  /batches           # plan, cola, revisión, paquete, resultados
  /api               # rutas de servidor: strategy, approve, regenerate, webhooks n8n, cost
/lib                 # supabase client, llm client, semaforo evaluator, cost, validation (zod)
/components          # UI (panel, semáforo, formularios)
/supabase            # migraciones SQL, políticas RLS, seed
/n8n                 # workflows exportados (producer, metrics, publisher)
/docs                # BLUEPRINT.md, BUILD_PLAN.md, este archivo
.env.example
```

---

## Qué NO construir (cortado a propósito)

Pasarela de pago, PCI-DSS, facturación SRI, UGC/DMCA, etiquetas de tienda, SEO del panel, anti-bot/CAPTCHA. Ver `BUILD_PLAN.md` → "Fuera de alcance" para cuándo vuelven.

*No es asesoría legal ni financiera. Lo legal (LOPDP, T&C, DPAs, etiquetado de IA) se valida con un profesional ecuatoriano antes de abrir a clientes.*
