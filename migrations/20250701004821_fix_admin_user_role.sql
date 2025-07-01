-- Corregir el rol del usuario administrador principal
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Encontrar el ID del usuario a partir de su email
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@portaldelrecuerdo.com';

  -- Si se encuentra el usuario, actualizar su rol en la tabla de perfiles
  IF admin_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = admin_user_id;

    RAISE NOTICE 'Rol del usuario admin@portaldelrecuerdo.com actualizado a admin.';
  ELSE
    RAISE NOTICE 'No se encontró el usuario admin@portaldelrecuerdo.com.';
  END IF;
END $$;
