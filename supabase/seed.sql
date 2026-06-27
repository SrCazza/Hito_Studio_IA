-- ============================================================================
-- seed.sql — Marca semilla (Hito33)
-- Se ejecuta DESPUÉS de que exista al menos un profile (Juan, owner).
-- Idempotente: no duplica si ya existe una marca "Hito33" para ese owner.
-- ============================================================================

do $$
declare
  v_owner uuid;
begin
  -- Toma el primer owner registrado (en el MVP, Juan).
  select id into v_owner from public.profiles where role = 'owner' order by created_at limit 1;

  if v_owner is null then
    raise notice 'No hay ningún profile owner todavía. Regístrate primero y vuelve a correr el seed.';
    return;
  end if;

  if exists (select 1 from public.brands where owner_id = v_owner and name = 'Hito33') then
    raise notice 'La marca Hito33 ya existe para este owner. Seed omitido.';
    return;
  end if;

  insert into public.brands (
    owner_id, name, sector, objetivo, publico, tono,
    do_list, dont_list, brand_kit, ai_visibility_policy
  ) values (
    v_owner,
    'Hito33',
    'Tecnología / estudio creativo',
    'Posicionar Hito33 como estudio de contenido asistido por IA con criterio de diseñador.',
    'Marcas y emprendedores que buscan contenido de calidad sin perder control creativo.',
    'Cercano, claro, con criterio. Nada de jerga vacía ni promesas infladas.',
    '["Mostrar trabajo real", "Explicar el porqué de cada decisión", "Tono honesto"]'::jsonb,
    '["Claims inflados", "Stock genérico que huele a IA", "Promesas que no se pueden verificar"]'::jsonb,
    '{"colors": ["#0b0b0f", "#ededed"], "fonts": [], "logo_refs": []}'::jsonb,
    'baja'
  );

  raise notice 'Marca semilla Hito33 creada para owner %', v_owner;
end $$;
