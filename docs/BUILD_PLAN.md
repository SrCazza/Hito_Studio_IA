# BUILD PLAN — Studio de Contenido IA

> Orden de construcción **MVP-first**: primero la espina completa con UNA marca y publicación manual, luego se expande.
> Cada milestone cierra con sus **criterios de aceptación** en verde antes de pasar al siguiente.
> Se enlaza con `Checklist_Studio_Contenido_IA.md` (las Fases). Lee `CLAUDE.md` y `BLUEPRINT.md` primero.

---

## Mapa de milestones

| # | Milestone | Entrega | Checklist |
| --- | --- | --- | --- |
| M0 | Fundaciones | Repo, entornos, secretos, **billing alerts** | Fase 0 |
| M1 | Datos y auth | Schema + RLS, login, CRUD de marca | Fase 1 |
| M2 | Brief → plan → aprobar | Estrategia LLM + gate de aprobación | Fase 2–3 (core) |
| M3 | Motor de producción | Cola + n8n producer (1 imagen + copy) | Fase 2 |
| M4 | Revisión semáforo | Panel de revisión + rojo automático | Fase 3 |
| M5 | Paquete + publicar manual | Paquete por plataforma, mano humana | Fase 4 (parcial) |
| M6 | Datos → ajuste | Métricas + reporte del analista | Fase 7 (loop) |
| M7 | Robustez y escala | N+1, paginación, pooling, monitoreo | Fase 6–7 |
| M8 | Expansión | Video/voz/avatar, multi-marca pulido, auto-publish | Fase 2/4 (+) |
| M9 | Abrir a clientes | RBAC, LOPDP, T&C, DPAs, disclosure IA | Fase 5 |

**M0–M5 = MVP** (la espina completa, una marca, publicación manual). M6+ = expansión.

---

## M0 — Fundaciones *(Fase 0)*

**Hacer:** repo con Next.js (App Router) + TS + Tailwind. Proyecto Supabase. n8n operativo. Entornos dev/prod separados. `.env.example`. Secretos en Vercel + credenciales de n8n. Dominio + HTTPS.

**🔴 Lo primero de todo:** **billing alerts y techos de costo** en Anthropic, fal.ai, ElevenLabs, Supabase y Vercel. Un loop mal hecho en n8n dispara la factura.

**Aceptación:**
- [ ] `npm run dev` levanta el panel vacío en local y en preview de Vercel.
- [ ] Alertas de costo configuradas y probadas (notificación llega) en las 5 plataformas.
- [ ] Ningún secreto en el repo; `.env.example` documenta todas las claves.
- [ ] dev y prod separados; nunca se prueban tandas reales en prod.

---

## M1 — Datos y auth *(Fase 1)*

**Hacer:** migraciones de `profiles`, `brands`, `batches`, `assets`, `jobs`, `cost_log`, `metrics`. **RLS** en todas. Supabase Auth (solo Juan, role `owner`). CRUD del perfil de marca con onboarding asistido por LLM. Seed de una marca (Hito33). Índices (`brand_id`, `jobs(status, created_at)`, fechas). Backups de Supabase + **prueba de restaurar**.

**Aceptación:**
- [ ] Login funciona; sesión persiste; token de reset expira.
- [ ] RLS probado: una query sin el `owner_id` correcto **no** devuelve filas.
- [ ] Puedo crear/editar/borrar una marca y se guarda en Supabase.
- [ ] Backup restaurado con éxito en un entorno de prueba.

---

## M2 — Brief → plan → aprobar *(Fase 2–3 core)*

**Hacer:** `/batches/new` (brief + mix). `POST /api/strategy` genera el plan (LLM cruza brief + perfil). `/batches/[id]/plan` muestra piezas + **costo estimado** + `budget_cap`. `POST /api/batches/[id]/approve` mueve a `approved` y **encola jobs** — rechaza si el costo supera el tope sin override. Validación de input (Zod) cliente **y** servidor.

**Aceptación:**
- [ ] Un brief produce un plan coherente con el perfil de la marca.
- [ ] El costo estimado se muestra **antes** de aprobar.
- [ ] **Imposible encolar producción sin `status='approved'`** (probado en código, no solo UI).
- [ ] Aprobar con costo > tope exige override explícito.

---

## M3 — Motor de producción *(Fase 2)*

**Hacer:** workflow **Producer** en n8n: recoge `jobs` pendientes, dedupe por `idempotency_key`, llama a **copy (LLM) + 1 ruta de imagen (fal.ai)** con timeout + reintentos/backoff, descarga a Storage, escribe `assets` + `cost_log`, marca `done`/`error`. Validación de archivos subidos (image-to-image). Logging del worker + errores legibles en el panel. `/batches/[id]/queue` con estado en vivo.

**Aceptación:**
- [ ] Una tanda aprobada genera piezas reales (copy + imagen) que aparecen en la cola.
- [ ] **Reintentar un job NO duplica el asset ni el cobro** (idempotencia probada).
- [ ] Una API caída marca la pieza como `error` con mensaje legible, sin congelar la tanda.
- [ ] Cada generación queda registrada en `cost_log`.

---

## M4 — Revisión semáforo *(Fase 3)*

**Hacer:** `/batches/[id]/review`. Evaluador de semáforo en servidor (LLM asiste; **rojos automáticos deterministas** en: caras IA, claims, cifras, sensible). Aprobar / regenerar por pieza (`/api/assets/[id]/regenerate` con nuevo `idempotency_key`). Sanitización/escape de la salida renderizada. Test del flujo crítico: brief → plan → aprobar → producir → revisar.

**Aceptación:**
- [ ] Cada pieza muestra color + razones.
- [ ] Las 4 categorías de rojo automático **siempre** salen rojas, pase lo que pase el LLM.
- [ ] Regenerar una pieza no duplica ni la previa ni el cobro.
- [ ] Captions/copy renderizados están escapados (sin XSS).

---

## M5 — Paquete + publicar manual *(Fase 4 parcial)* → cierra el MVP

**Hacer:** `/batches/[id]/package` arma el paquete por plataforma (copy + media, copiar/descargar). **Publicación manual** — se mantiene la mano humana antes de publicar (principio del sistema). Marcar tanda `published`.

**Aceptación:**
- [ ] Desde una tanda aprobada y revisada, obtengo un paquete por plataforma listo para subir a mano.
- [ ] El flujo completo corre de punta a punta con la marca seed, sin tocar prod por error.
- [ ] 🎉 **MVP funcional:** una marca, espina completa, humano en el loop.

---

## M6 — Datos → ajuste *(Fase 7, el loop)*

**Hacer:** workflow **Metrics collector** (programado) → `metrics`. Analista (Sonnet) resume qué cambiar → `/batches/[id]/results`. El resumen retroalimenta perfil/estrategia.

**Aceptación:**
- [ ] Tras "publicar", el panel muestra métricas y un reporte legible del analista.
- [ ] El reporte propone ajustes concretos al perfil/estrategia.

---

## M7 — Robustez y escala *(Fase 6–7)*

**Hacer:** quitar N+1 (joins), paginación (20–50) en cola/assets/resultados, **connection pooling (Supavisor)**, traer solo lo necesario. Monitoreo (Sentry) + **alertas de los workflows de n8n y del gasto de APIs**. Rollback + staging. `npm audit`/Dependabot. CORS restringido.

**Aceptación:**
- [ ] Listados paginados; ninguna vista hace una query por elemento.
- [ ] Vercel serverless usa el pooler (sin agotar conexiones).
- [ ] Alerta llega si un workflow de n8n falla o si el gasto sube de un umbral.
- [ ] Un deploy roto se revierte rápido.

---

## M8 — Expansión

**Hacer:** rutas de **video / voz / avatar** (excepción, pago por uso). Multi-marca pulido (Vetia clínicas con caras reales / IA mínima; Vetia animales IA baja). Opción de **auto-publish** vía Publisher (Postiz/n8n) **manteniendo la opción de mano humana**.

**Aceptación:**
- [ ] Una tanda puede incluir un reel/voz/avatar sin romper el control de costo.
- [ ] Cada marca aplica su `ai_visibility_policy`.
- [ ] Auto-publish es opt-in; el humano sigue pudiendo intervenir.

---

## M9 — Abrir a clientes *(Fase 5 — endurecimiento legal y multi-tenant)*

**Hacer:** RBAC (`role`), revisión de aislamiento por tenant, `audit_log`. **Legal:** privacidad LOPDP, T&C (incluida propiedad del contenido generado), DPAs con sub-procesadores, etiquetado de IA por plataforma, consentimiento de datos. Todo **validado por profesional ecuatoriano**.

**Aceptación:**
- [ ] Un cliente solo ve sus propias marcas/tandas (probado).
- [ ] Privacidad, T&C y DPAs revisados por abogado de datos EC.
- [ ] Etiquetado de IA conforme a la política vigente de cada plataforma.

---

## Fuera de alcance (y cuándo vuelve)

- **Pago / suscripción / SRI / PCI** → solo si cobras por el motor (entonces vuelven + subscription compliance + contador).
- **UGC/DMCA, etiquetas de tienda, anti-bot/CAPTCHA** → solo con registro público de clientes / contenido de terceros.
- **SEO del panel** → es interno; el SEO aplica al **contenido** que produces, no al panel.

---

*Precios de APIs e infra cambian; verifica al implementar. Valida lo legal/contable con un profesional ecuatoriano antes de abrir a clientes. No es asesoría legal ni financiera.*
