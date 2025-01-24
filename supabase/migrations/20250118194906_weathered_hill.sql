/*
  # Corregir permisos de administrador

  1. Actualizar usuario admin existente
  2. Asegurar permisos y roles correctos
  3. Configurar metadatos adicionales
*/

DO $$
DECLARE
  admin_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Actualizar el usuario admin existente
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
      'nombre', 'Administrador del Sistema',
      'role', 'admin'
    ),
    is_super_admin = true,
    role = 'supabase_admin'
  WHERE email = 'admin@portaldelrecuerdo.com';

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

  -- Otorgar permisos adicionales si es necesario
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
END $$;
