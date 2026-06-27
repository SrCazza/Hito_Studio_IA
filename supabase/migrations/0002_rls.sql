-- ============================================================================
-- 0002_rls.sql — Row Level Security
-- Regla base: una fila es visible/editable solo si su marca pertenece a auth.uid().
-- La service_role_key (n8n) salta RLS. (CLAUDE.md guardrail #5)
-- ============================================================================

alter table profiles  enable row level security;
alter table brands    enable row level security;
alter table batches   enable row level security;
alter table assets    enable row level security;
alter table jobs      enable row level security;
alter table cost_log  enable row level security;
alter table metrics   enable row level security;
alter table audit_log enable row level security;

-- ── Helper: ¿la marca pertenece al usuario actual? ──────────────────────────
create or replace function owns_brand(b_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from brands
    where id = b_id and owner_id = auth.uid()
  );
$$;

-- ── Helper: ¿la tanda pertenece (vía marca) al usuario actual? ───────────────
create or replace function owns_batch(bt_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from batches b
    join brands br on br.id = b.brand_id
    where b.id = bt_id and br.owner_id = auth.uid()
  );
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
create policy "profiles_select_own"
  on profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── brands ──────────────────────────────────────────────────────────────────
create policy "brands_select_own"
  on brands for select
  using (owner_id = auth.uid());

create policy "brands_insert_own"
  on brands for insert
  with check (owner_id = auth.uid());

create policy "brands_update_own"
  on brands for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "brands_delete_own"
  on brands for delete
  using (owner_id = auth.uid());

-- ── batches ─────────────────────────────────────────────────────────────────
create policy "batches_select_own"
  on batches for select
  using (owns_brand(brand_id));

create policy "batches_insert_own"
  on batches for insert
  with check (owns_brand(brand_id));

create policy "batches_update_own"
  on batches for update
  using (owns_brand(brand_id))
  with check (owns_brand(brand_id));

create policy "batches_delete_own"
  on batches for delete
  using (owns_brand(brand_id));

-- ── assets ──────────────────────────────────────────────────────────────────
create policy "assets_select_own"
  on assets for select
  using (owns_batch(batch_id));

create policy "assets_insert_own"
  on assets for insert
  with check (owns_batch(batch_id));

create policy "assets_update_own"
  on assets for update
  using (owns_batch(batch_id))
  with check (owns_batch(batch_id));

create policy "assets_delete_own"
  on assets for delete
  using (owns_batch(batch_id));

-- ── jobs ────────────────────────────────────────────────────────────────────
-- Escritura: solo service-role (n8n), que salta RLS — no hay policy de write
-- para usuarios normales. Lectura: el dueño ve el estado de sus jobs.
create policy "jobs_select_own"
  on jobs for select
  using (owns_batch(batch_id));

-- ── cost_log ────────────────────────────────────────────────────────────────
-- Escritura por service-role (n8n). El dueño solo lee su gasto.
create policy "cost_log_select_own"
  on cost_log for select
  using (owns_brand(brand_id));

-- ── metrics ─────────────────────────────────────────────────────────────────
-- Escritura por service-role (workflow de métricas). Lectura del dueño.
create policy "metrics_select_own"
  on metrics for select
  using (owns_batch(batch_id));

-- ── audit_log ───────────────────────────────────────────────────────────────
-- El usuario lee solo lo que él mismo generó; escritura por servidor.
create policy "audit_log_select_own"
  on audit_log for select
  using (actor = auth.uid());
