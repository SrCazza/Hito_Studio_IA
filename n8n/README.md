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
