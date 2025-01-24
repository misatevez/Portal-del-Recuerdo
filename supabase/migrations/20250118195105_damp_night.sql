-- Eliminar todas las políticas existentes de moderadores
DROP POLICY IF EXISTS "Ver moderadores" ON moderators;
DROP POLICY IF EXISTS "Gestionar moderadores" ON moderators;

-- Crear políticas simplificadas y sin recursión
CREATE POLICY "Cualquiera puede ver moderadores"
  ON moderators
  FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden modificar moderadores"
  ON moderators
  FOR ALL
  USING (role = 'admin')
  WITH CHECK (role = 'admin');

-- Asegurar que el admin tiene los permisos correctos
DO $$
BEGIN
  -- Actualizar o insertar el admin principal
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    is_super_admin
  )
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@portaldelrecuerdo.com',
    jsonb_build_object(
      'nombre', 'Administrador',
      'role', 'admin'
    ),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    raw_user_meta_data = jsonb_build_object(
      'nombre', 'Administrador',
      'role', 'admin'
    ),
    role = 'authenticated',
    is_super_admin = true;

  -- Asegurar perfil del admin
  INSERT INTO profiles (id, nombre)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Administrador'
  )
  ON CONFLICT (id) DO UPDATE
  SET nombre = 'Administrador';

  -- Asegurar rol de moderador
  INSERT INTO moderators (id, role)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin';
END $$;
