-- ============================================================================
-- 0003_storage.sql — Buckets de Storage (BLUEPRINT §2)
-- Convención de ruta: el primer segmento de la carpeta es el brand_id, para
-- poder aislar por marca en las policies. Ej: "<brand_id>/logo.png".
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('brand-kit', 'brand-kit', false),
  ('uploads',   'uploads',   false),
  ('assets',    'assets',    false)
on conflict (id) do nothing;

-- Helper: el primer segmento de la ruta es un brand_id que pertenece al user.
create or replace function storage_owns_brand_folder(object_name text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from brands
    where owner_id = auth.uid()
      and id::text = split_part(object_name, '/', 1)
  );
$$;

-- ── Policies por bucket (lectura/escritura del dueño de la marca) ────────────
create policy "brand_kit_rw_own"
  on storage.objects for all
  using (bucket_id = 'brand-kit' and storage_owns_brand_folder(name))
  with check (bucket_id = 'brand-kit' and storage_owns_brand_folder(name));

create policy "uploads_rw_own"
  on storage.objects for all
  using (bucket_id = 'uploads' and storage_owns_brand_folder(name))
  with check (bucket_id = 'uploads' and storage_owns_brand_folder(name));

create policy "assets_rw_own"
  on storage.objects for all
  using (bucket_id = 'assets' and storage_owns_brand_folder(name))
  with check (bucket_id = 'assets' and storage_owns_brand_folder(name));
