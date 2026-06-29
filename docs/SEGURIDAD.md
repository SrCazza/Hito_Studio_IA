# Seguridad

Resumen de la postura de seguridad y los pasos que faltan provisionar.

## Qué ya está cubierto (en código)

- **Auth:** Supabase Auth (contraseñas hasheadas del lado servidor, JWT, HTTPS). La app nunca maneja
  la contraseña en claro.
- **Sin inyección SQL:** no se arma SQL con input del usuario. Todo pasa por el cliente de Supabase
  (PostgREST, parametrizado) y **RLS** en todas las tablas con datos de marca. El login va contra el
  servicio de Auth, no contra la base directamente.
- **Validación:** Zod en cliente y servidor en cada entrada.
- **Aislamiento:** RLS por `owner_id` / `brand_id`; la `service_role_key` solo en servidor y n8n,
  nunca en el cliente ni en el repo.
- **Cabeceras:** `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`
  (ver `next.config.ts`). `/api` es same-origin.
- **Rate limiting (best-effort):** `lib/rate-limit.ts` limita por usuario los endpoints caros
  (`/api/strategy`, `/api/batches/[id]/analyze`, `/api/brands/assist`, `/api/batches/[id]/evaluate`)
  para frenar abuso y disparos de costo. Devuelve `429` con `Retry-After`.
- **Sesión:** "Mantener sesión iniciada" controla si la cookie de auth es persistente o de sesión.
- **XSS:** toda salida generada se renderiza escapada por React (sin `dangerouslySetInnerHTML`).
- **Borrados:** pasan por confirmación (`ConfirmDialog`).

## Qué falta provisionar (en el dashboard de Supabase / Vercel)

- **Confirmación de email:** activarla en Auth para evitar cuentas con correos falsos. El flujo de
  registro ya maneja el caso "revisa tu correo".
- **CAPTCHA (anti-bots):** activar Turnstile o hCaptcha en Supabase Auth para frenar registros masivos
  y ataques automatizados desde la misma IP.
- **Límites de Auth por IP:** Supabase ya aplica límites a signup/login por IP; ajustarlos en el
  dashboard según necesidad.
- **Rate limit distribuido:** el limitador en memoria es por instancia serverless (best-effort). Para
  límites robustos a escala, conectar un KV (p. ej. Upstash Redis) y migrar `lib/rate-limit.ts`.
- **Monitoreo:** Sentry DSN (ya hay punto de enganche en `lib/log.ts`) y alertas de gasto.

## Notas

- Nada de esto sustituye una auditoría profesional antes de abrir a clientes (ver `BUILD_PLAN.md` M9:
  RBAC, LOPDP, T&C, DPAs, validado por un profesional ecuatoriano).
