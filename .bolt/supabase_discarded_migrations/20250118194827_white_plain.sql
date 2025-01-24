/*
  # Corregir usuario administrador y sus permisos

  1. Actualizar correo del administrador
  2. Asegurar permisos correctos
*/

DO $$
DECLARE
  admin_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Actualizar el correo del administrador
  UPDATE auth.users
  SET 
    email = 'admin@portaldelcuerdo.com',
    raw_user_meta_data = jsonb_set(
      raw_user_meta_data,
      '{nombre}',
      '"Administrador del Sistema"'
    ),
    is_super_admin = true,
    role = 'supabase_admin'
  WHERE id = admin_id;

  -- Asegurar que el perfil existe y está actualizado
  INSERT INTO public.profiles (id, nombre)
  VALUES (admin_id, 'Administrador del Sistema')
  ON CONFLICT (id) DO UPDATE
  SET nombre = 'Administrador del Sistema';

  -- Asegurar rol de administrador
  INSERT INTO public.moderators (id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin';

END $$;
