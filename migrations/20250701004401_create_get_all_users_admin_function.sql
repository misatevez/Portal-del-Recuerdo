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
  requesting_user_role text;
begin
  -- Primero, verificar si el usuario que hace la solicitud es un administrador
  select p.role into requesting_user_role from public.profiles p where p.id = auth.uid();

  if requesting_user_role is null or requesting_user_role <> 'admin' then
    raise exception 'Acción no permitida. Se requiere rol de administrador.';
  end if;

  -- Si es admin, devolver todos los perfiles de usuario
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
