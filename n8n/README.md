# n8n — workflows del motor

Workflows exportados (JSON) que orquestan la producción. Se construyen a partir de **M3**.

| Workflow | Milestone | Función |
| --- | --- | --- |
| `producer` | M3 | Recoge `jobs` pendientes, dedupe por `idempotency_key`, llama a las APIs (copy/imagen) con timeout+backoff, descarga media a Storage, escribe `assets` + `cost_log`, dispara el semáforo, marca `done`/`error`. |
| `metrics-collector` | M6 | Programado: trae métricas de plataformas → `metrics`; dispara al analista (Sonnet). |
| `publisher` | M8 | Publica tras aprobación humana (opt-in). |

## Contrato con el panel

- n8n usa la **`service_role_key`** (salta RLS) — solo en credenciales de n8n, nunca en el cliente.
- El callback a Vercel (`POST /api/webhooks/n8n`) se autentica con `N8N_WEBHOOK_SECRET`.
- **Idempotencia:** antes de llamar a una API de pago, verificar que el job no esté ya `done`. Un reintento de n8n NO debe cobrar dos veces. (guardrail #2)

> Los `.json` exportados se versionan aquí cuando se construya M3.

---

## `ai_studio_hito33.json` — Producer (M3, construido)

**Flujo:** Schedule (cada minuto) → Get pending job → **Claim job** (PATCH `status=processing` con filtro `status=eq.pending` = claim atómico, evita doble proceso) → **Generate copy** (Anthropic/Haiku) → **Generate image** (fal.ai) → Download → Upload a Storage (`assets/<brand_id>/<asset_id>.png`) → Update asset (`ready`) → Insert cost_log → Mark job done.

**Rama de error:** `Generate copy` y `Generate image` usan `onError: continueErrorOutput` → **Mark job error** (`last_error` legible) → **Mark asset error**. Una API caída marca la pieza `error` sin congelar la tanda (aceptación M3 #3, comprobado en vivo con fal sin créditos → `403 Exhausted balance`).

**Idempotencia:** claim por `status=eq.pending` + `idempotency_key` único evitan doble cobro en reintentos. (guardrail #2)

### Credenciales (tipo `httpCustomAuth`, viven en n8n — NO en el repo)
- **AI Studio - Supabase (service_role)** — headers `apikey` + `Authorization: Bearer`.
- **AI Studio - Anthropic** — `x-api-key` + `anthropic-version`.
- **AI Studio - fal.ai** — `Authorization: Key <fal_key>`.

El JSON referencia las credenciales por **ID**, sin valores secretos.

### Notas operativas
- Creado en el proyecto **Personal**; muévelo a la carpeta **HITO33** desde la UI (el API público no asigna carpeta).
- Queda **inactivo** por defecto. Actívalo cuando fal.ai tenga créditos.
- Disparo por **polling** (cada minuto). Alternativa futura: webhook desde `approve` (`N8N_WEBHOOK_URL`).
