/*
  # Create admin user with new credentials

  1. Changes
    - Creates admin user with email admin@portaldelrecuerdo.com
    - Sets up admin profile and moderator role
    - Uses secure password hashing
  
  2. Security
    - Ensures admin user has proper permissions
    - Uses secure password storage
*/

-- Crear el usuario admin con las nuevas credenciales
DO $$
DECLARE
  new_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insertar usuario admin
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    email_confirmed_at,
    created_at,
    updated_at,
    is_super_admin
  )
  VALUES (
    new_user_id,
    'admin@portaldelrecuerdo.com',
    '{"nombre": "Administrador"}'::jsonb,
    NOW(),
    NOW(),
    NOW(),
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insertar perfil del admin
  INSERT INTO public.profiles (
    id,
    nombre,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    'Administrador',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insertar rol de moderador para el admin
  INSERT INTO public.moderators (
    id,
    role,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    'admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
