-- ============================================================================
-- 0001_schema.sql — Studio de Contenido IA
-- Modelo de datos (BLUEPRINT §2). RLS se activa en 0002_rls.sql.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────────
create type profile_role        as enum ('owner', 'admin', 'client');
create type ai_visibility        as enum ('permitida', 'baja', 'minima');
create type batch_status         as enum ('draft', 'planned', 'approved', 'producing', 'review', 'ready', 'published', 'archived');
create type asset_type           as enum ('post', 'carousel', 'infographic', 'motion', 'reel', 'avatar', 'voice');
create type asset_status         as enum ('pending', 'producing', 'ready', 'error');
create type semaforo_color       as enum ('green', 'amber', 'red');
create type job_type             as enum ('copy', 'image', 'motion', 'video', 'voice', 'avatar');
create type job_status           as enum ('pending', 'processing', 'done', 'error');

-- ── Trigger genérico para updated_at ────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
-- Extiende auth.users. MVP: solo Juan como owner.
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        profile_role not null default 'owner',
  created_at  timestamptz not null default now()
);

-- ── brands ──────────────────────────────────────────────────────────────────
create table brands (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references profiles (id) on delete cascade,
  name                  text not null,
  sector                text,
  objetivo              text,
  publico               text,
  tono                  text,
  do_list               jsonb not null default '[]'::jsonb,
  dont_list             jsonb not null default '[]'::jsonb,
  brand_kit             jsonb not null default '{}'::jsonb,
  ai_visibility_policy  ai_visibility not null default 'baja',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index brands_owner_id_idx on brands (owner_id);

create trigger brands_set_updated_at
  before update on brands
  for each row execute function set_updated_at();

-- ── batches (tandas) ────────────────────────────────────────────────────────
create table batches (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid not null references brands (id) on delete cascade,
  title           text not null,
  brief           text,
  strategy        jsonb,
  format_mix      jsonb,
  status          batch_status not null default 'draft',
  estimated_cost  numeric(12,4) not null default 0,
  budget_cap      numeric(12,4),
  created_at      timestamptz not null default now(),
  approved_at     timestamptz,
  approved_by     uuid references profiles (id)
);

create index batches_brand_id_idx on batches (brand_id);
create index batches_status_idx on batches (status);

-- ── assets (piezas) ─────────────────────────────────────────────────────────
create table assets (
  id               uuid primary key default gen_random_uuid(),
  batch_id         uuid not null references batches (id) on delete cascade,
  type             asset_type not null,
  status           asset_status not null default 'pending',
  semaforo         semaforo_color,
  semaforo_reasons jsonb not null default '[]'::jsonb,
  content          jsonb not null default '{}'::jsonb,
  prompt           jsonb not null default '{}'::jsonb,
  media_url        text,
  cost             numeric(12,4) not null default 0,
  platform_target  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index assets_batch_id_idx on assets (batch_id);
create index assets_status_idx on assets (status);

create trigger assets_set_updated_at
  before update on assets
  for each row execute function set_updated_at();

-- ── jobs (la cola) ──────────────────────────────────────────────────────────
-- La tabla jobs ES la cola de trabajo que recoge n8n.
create table jobs (
  id               uuid primary key default gen_random_uuid(),
  asset_id         uuid not null references assets (id) on delete cascade,
  batch_id         uuid not null references batches (id) on delete cascade,
  type             job_type not null,
  status           job_status not null default 'pending',
  idempotency_key  text not null unique,   -- clave anti-doble-cobro (guardrail #2)
  attempts         int not null default 0,
  last_error       text,
  payload          jsonb not null default '{}'::jsonb,
  result           jsonb,
  created_at       timestamptz not null default now(),
  started_at       timestamptz,
  finished_at      timestamptz
);

-- Índice para que n8n recoja pendientes en orden.
create index jobs_status_created_at_idx on jobs (status, created_at);
create index jobs_asset_id_idx on jobs (asset_id);
create index jobs_batch_id_idx on jobs (batch_id);

-- ── cost_log ────────────────────────────────────────────────────────────────
create table cost_log (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references brands (id) on delete cascade,
  batch_id    uuid references batches (id) on delete set null,
  provider    text not null,
  units       numeric(12,4) not null default 0,
  cost        numeric(12,4) not null default 0,
  created_at  timestamptz not null default now()
);

create index cost_log_brand_id_idx on cost_log (brand_id);
create index cost_log_batch_id_idx on cost_log (batch_id);

-- ── metrics ─────────────────────────────────────────────────────────────────
create table metrics (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid references assets (id) on delete cascade,
  batch_id     uuid references batches (id) on delete cascade,
  platform     text,
  metric_type  text not null,
  value        numeric(16,4),
  captured_at  timestamptz not null default now()
);

create index metrics_asset_id_idx on metrics (asset_id);
create index metrics_batch_id_idx on metrics (batch_id);

-- ── audit_log (recomendado al abrir a clientes) ─────────────────────────────
create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor       uuid references profiles (id) on delete set null,
  action      text not null,
  target      text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_actor_idx on audit_log (actor);

-- ── Auto-provisión de profile al registrarse en auth.users ──────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'owner')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
