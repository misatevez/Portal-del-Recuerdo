create or replace function public.get_all_users_admin()
returns table (
  id uuid,
  email text,
  full_name text,
  credits integer,
  is_banned boolean,
  privacidad text,
  role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  requesting_user_id uuid;
  requesting_user_role text;
begin
  -- Obtener el UID del usuario directamente desde el token de autenticación (JWT)
  -- Este método es más robusto que auth.uid() en funciones SECURITY DEFINER.
  requesting_user_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid;

  -- Si por alguna razón no se puede obtener el UID, lanzar un error claro.
  if requesting_user_id is null then
    raise exception 'No se pudo extraer el ID de usuario (sub) del token JWT.';
  end if;

  -- Verificar el rol del usuario que hace la solicitud
  select p.role into requesting_user_role from public.profiles p where p.id = requesting_user_id;

  if requesting_user_role <> 'admin' then
    raise exception 'Acción no permitida. Se requiere rol de administrador.';
  end if;

  -- Si la verificación es exitosa, devolver todos los perfiles de usuario
  return query
    select
      p.id,
      u.email,
      p.full_name,
      p.credits,
      p.is_banned,
      p.privacidad::text,
      p.role::text
    from public.profiles p
    join auth.users u on p.id = u.id;
end;
$$;
