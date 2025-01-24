-- Asegurar que el admin tiene los permisos correctos
DO $$
BEGIN
  -- Actualizar el usuario admin
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
      'nombre', 'Administrador',
      'role', 'admin'
    ),
    is_super_admin = true
  WHERE email = 'admin@portaldelrecuerdo.com';

  -- Asegurar que existe el registro de moderador
  INSERT INTO moderators (id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'admin@portaldelrecuerdo.com'
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin';
END $$;
