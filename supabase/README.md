# Supabase — migraciones, RLS y seed

Modelo de datos de `BLUEPRINT.md §2`. Todo con **RLS activado** (aislamiento por marca).

## Orden de aplicación

1. `migrations/0001_schema.sql` — enums, tablas, índices, triggers.
2. `migrations/0002_rls.sql` — Row Level Security + helpers (`owns_brand`, `owns_batch`).
3. `migrations/0003_storage.sql` — buckets `brand-kit`, `uploads`, `assets` + policies.
4. `seed.sql` — marca semilla **Hito33** (requiere que ya exista un `profile` owner).

## Cómo aplicarlas

### Opción A — Dashboard (rápido para empezar)
SQL Editor → pega cada archivo en orden → Run. Luego **regístrate** en el panel
(`/login`) para crear tu usuario; el trigger `on_auth_user_created` crea tu
`profile` owner. Después corre `seed.sql`.

### Opción B — CLI de Supabase
```bash
npx supabase link --project-ref <TU_PROJECT_REF>
npx supabase db push          # aplica migrations/
# tras registrarte en el panel:
npx supabase db execute --file supabase/seed.sql
```

## Probar RLS (criterio de aceptación M1)
Con la **anon key** y sin sesión, un `select * from brands` debe devolver **0 filas**.
Con sesión, solo las marcas cuyo `owner_id = auth.uid()`.

## Storage
Convención de ruta: el **primer segmento** de la carpeta es el `brand_id`
(`<brand_id>/archivo.png`). Las policies aíslan por marca con esa convención.
