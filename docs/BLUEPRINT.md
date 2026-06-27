# BLUEPRINT — Studio de Contenido IA

> Especificación técnica de construcción. Pensada para que Claude Code la ejecute.
> Decisiones de arquitectura ya cerradas; aquí se detallan para implementar.
> Lee primero `CLAUDE.md` (contexto + guardrails). El orden de construcción está en `BUILD_PLAN.md`.

---

## 1. Arquitectura (la espina)

```
TÚ → Vercel (panel) → Supabase (datos + cola) → n8n (motor/scheduler) → APIs (texto/imagen/video/voz)
                          ↑__________________ resultados + métricas ___________________|
```

- **Vercel** solo escribe y lee filas (instantáneo): perfiles, briefs, aprobaciones, estados.
- **Supabase** es la base **y la cola**: la tabla `jobs` es la cola de trabajo.
- **n8n** recoge los jobs pendientes, llama a las APIs, **espera** los minutos del video, descarga el asset a Storage y marca el job listo. Por eso el límite de tiempo de las funciones serverless de Vercel no estorba: **el trabajo largo vive en n8n.**
- La media pesada se descarga a **Supabase Storage**; en la DB solo van referencias.

---

## 2. Modelo de datos (Supabase / Postgres)

RLS activado en todas las tablas con datos de marca. Regla base: una fila es visible/editable solo si su marca pertenece a `auth.uid()`. La `service_role_key` (usada por n8n) salta RLS para el worker.

### `profiles`
Extiende `auth.users`. `id (uuid, fk auth.users)`, `email`, `role (enum: owner|admin|client)`, `created_at`.
*(MVP: solo Juan como owner. `role` queda listo para cuando entren clientes.)*

### `brands`
- `id (uuid pk)`, `owner_id (fk profiles)`
- `name`, `sector`
- `objetivo (text)`, `publico (text)`, `tono (text)`
- `do_list (jsonb)`, `dont_list (jsonb)` — qué sí / qué no
- `brand_kit (jsonb)` — colores, tipografías, referencias de logo en Storage
- `ai_visibility_policy (enum: permitida | baja | minima)` — política de IA visible por marca
- `created_at`, `updated_at`
- **RLS:** `owner_id = auth.uid()`

### `batches` (tandas)
- `id (uuid pk)`, `brand_id (fk brands)`
- `title`, `brief (text)`
- `strategy (jsonb)` — enfoque, público, formatos propuestos (lo que deriva el estratega)
- `format_mix (jsonb)` — el mix de formatos se decide **por tanda** (no cuotas fijas mensuales)
- `status (enum: draft | planned | approved | producing | review | ready | published | archived)`
- `estimated_cost (numeric)`, `budget_cap (numeric)`
- `created_at`, `approved_at`, `approved_by (fk profiles)`
- **RLS:** vía `brand_id → brands.owner_id`
- **Invariante:** producción solo arranca si `status = 'approved'`.

### `assets` (piezas)
- `id (uuid pk)`, `batch_id (fk batches)`
- `type (enum: post | carousel | infographic | motion | reel | avatar | voice)`
- `status (enum: pending | producing | ready | error)`
- `semaforo (enum: green | amber | red | null)`, `semaforo_reasons (jsonb)`
- `content (jsonb)` — copy, hashtags, cta, plataforma
- `prompt (jsonb)` — prompts/params usados (trazabilidad)
- `media_url (text)` — referencia en Storage (no binario)
- `cost (numeric)`, `platform_target (text)`
- `created_at`, `updated_at`
- **RLS:** vía `batch_id → brand`

### `jobs` (la cola)
- `id (uuid pk)`, `asset_id (fk assets)`, `batch_id (fk batches)`
- `type (enum: copy | image | motion | video | voice | avatar)`
- `status (enum: pending | processing | done | error)`
- `idempotency_key (text UNIQUE)` — **clave anti-doble-cobro**
- `attempts (int default 0)`, `last_error (text)`
- `payload (jsonb)`, `result (jsonb)`
- `created_at`, `started_at`, `finished_at`
- **Índices:** `(status, created_at)` para que n8n recoja pendientes; `idempotency_key` único.
- **RLS:** service-role (la maneja n8n); lectura del dueño para mostrar estado.

### `cost_log`
- `id`, `brand_id`, `batch_id`, `provider (text)`, `units (numeric)`, `cost (numeric)`, `created_at`
- Alimenta la visibilidad de gasto y los topes por marca/tanda.

### `metrics` (resultados)
- `id`, `asset_id (fk)`, `batch_id`, `platform`, `metric_type`, `value (numeric)`, `captured_at`
- La trae el workflow de métricas; el analista (LLM) la resume.

### `audit_log` (opcional, recomendado al abrir a clientes)
- `id`, `actor (fk profiles)`, `action`, `target`, `meta (jsonb)`, `created_at`

### Storage buckets
- `brand-kit` — logos, tipografías (por marca, RLS).
- `uploads` — fotos reales que subes para image-to-image (valida tipo/tamaño/que sea imagen).
- `assets` — media generada y descargada.

---

## 3. El motor (n8n) — workflows

### 3.1 Producer (el corazón)
Disparo: webhook desde Vercel al aprobar una tanda **o** polling de `jobs WHERE status='pending'`.
Por cada job:
1. **Dedupe** por `idempotency_key`: si ya está `done`, no rehacer (no volver a pagar).
2. Marcar `processing`, `started_at`, `attempts++`.
3. Llamar a la API correcta según `type`:
   - `copy` → LLM (Haiku para volumen / Sonnet para piezas sensibles)
   - `image` → fal.ai (image-to-image sobre foto real cuando aplique)
   - `motion` → composición con material real (costo ≈ $0)
   - `video`/`avatar`/`voice` → solo cuando la tanda lo pida (excepción)
   con **timeout + reintentos con backoff**.
4. **Descargar** la media a Storage; escribir `media_url`, `content`, `prompt`, `cost` en `assets`; registrar en `cost_log`.
5. Disparar el **evaluador de semáforo** (ver §5) y guardar color + razones.
6. Marcar job `done` (o `error` + `last_error` y dejar el asset en `error` con mensaje legible).

### 3.2 Metrics collector (loop de mejora)
Programado (p. ej. diario). Trae métricas de las plataformas → `metrics`; dispara al **analista (Sonnet)** para resumir qué cambiar; el resumen retroalimenta el perfil/estrategia.

### 3.3 Publisher (más adelante)
Tras aprobación humana, publica vía APIs sociales. **Humano-en-el-loop se mantiene** (decisión estratégica). Opcional Postiz/n8n cuando se quiera.

---

## 4. Panel (Next.js en Vercel) — rutas y pantallas

| Ruta | Pantalla | Notas |
| --- | --- | --- |
| `/login` | Auth | Supabase Auth. |
| `/brands` | Marcas | Elige el perfil de hoy. |
| `/brands/[id]` | Perfil de marca | Formulario editable; si no sabes responder un campo, el LLM te guía (onboarding asistido). |
| `/brands/[id]/batches/new` | Nueva tanda | Brief + **defines el mix aquí**; el estratega cruza con el perfil y propone. |
| `/batches/[id]/plan` | Plan + semáforo | Desglose en piezas + costo estimado. **Gate de aprobación: tú apruebas antes de gastar.** |
| `/batches/[id]/queue` | Cola | Piezas generándose (estado en vivo). |
| `/batches/[id]/review` | Revisión | Semáforo por pieza: aprobar / regenerar. Aquí entra tu mano de diseñador. |
| `/batches/[id]/package` | Listo para publicar | Paquete por plataforma (copiar/descargar). |
| `/batches/[id]/results` | Resultados | Reporte del analista. |

**Rutas de servidor (`/api`):**
- `POST /api/strategy` — genera el plan (LLM) a partir de brief + perfil.
- `POST /api/batches/[id]/approve` — cambia `status='approved'`, **encola jobs** (rechaza si el costo estimado supera `budget_cap` sin override).
- `POST /api/assets/[id]/regenerate` — re-encola una pieza (nuevo `idempotency_key`).
- `POST /api/webhooks/n8n` — callback de n8n (autenticado con `N8N_WEBHOOK_SECRET`).
- `GET /api/cost` — gasto por marca/tanda.

---

## 5. Semáforo (tu foso y tu defensa legal)

Evaluador en **servidor** que puntúa cada pieza combinando: ¿coincide con el brand kit? · ¿el claim es verificable o infla? · ¿huele a IA? · ¿le habla al público del perfil?

- **Verde:** pasa casi solo. **Amarillo:** échale ojo. **Rojo:** tú decides / regenera.
- El LLM (Sonnet) **asiste** la puntuación, pero los **rojos automáticos son reglas deterministas en código**, no a criterio del LLM:
  - caras humanas generadas por IA
  - claims de producto
  - cifras y datos
  - contenido sensible
- Concentras tu ojo en lo rojo; automatizas lo verde. Documenta la regla de rojo automático (sirve de defensa legal sobre claims — ver `BUILD_PLAN.md` Fase legal).

---

## 6. Capas de generación

| Capa | Default | Notas |
| --- | --- | --- |
| Texto | LLM (Haiku volumen / Sonnet juicio) | Copy, hashtags, CTA, descripción por plataforma. |
| Imagen | fal.ai | Tu caballo de batalla. **Image-to-image sobre fotos reales.** Modelos para texto-en-imagen, foto/hero y borradores — configurables. |
| Video | Motion con material real (≈$0) | Generativo solo hero (excepción). |
| Avatar | Excepcional | Pago por uso. Para Vetia: caras reales. |
| Voz/música | Raro | ElevenLabs si un video lo pide; música con licencia o generativa. |

**Regla de intercambio (para estimar costo):** 1 reel generativo ≈ 15–50 imágenes ≈ motion casi infinito.

---

## 7. Variables de entorno (`.env.example`)

```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # solo servidor / n8n

# Modelos
ANTHROPIC_API_KEY=
FAL_API_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=                   # opcional (A/B)

# n8n
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=               # secreto compartido Vercel <-> n8n

# App
APP_BASE_URL=

# Sociales (más adelante)
# META_APP_ID= / META_APP_SECRET= / TIKTOK_... 
```

Topes de costo por marca/mes: configurables (en DB o config). Pauta pagada va en rubro aparte, fuera de esta app.

---

## 8. Seguridad y cumplimiento (resumen — detalle en el checklist)

- RLS + filtrado por `brand_id` en cada query.
- Rate limiting en funciones que cuestan dinero.
- Validación de archivos subidos (tipo/tamaño/que sea imagen).
- Etiquetado de contenido IA por plataforma (conecta con `ai_visibility_policy`). **Reglas cambian seguido → verificar al implementar.**
- DPAs con sub-procesadores (mandas datos a varios terceros fuera del país) y privacidad LOPDP **antes de abrir a clientes**.

---

*Precios de APIs e infra cambian; verifica al implementar. No es asesoría legal ni financiera; lo legal se valida con un profesional ecuatoriano.*
