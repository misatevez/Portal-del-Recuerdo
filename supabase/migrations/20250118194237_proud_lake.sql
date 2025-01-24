-- Eliminar datos relacionados con el usuario admin de forma segura
DO $$ 
BEGIN
  -- Eliminar registro de moderador
  DELETE FROM public.moderators 
  WHERE id = '11111111-1111-1111-1111-111111111111';

  -- Eliminar perfil
  DELETE FROM public.profiles 
  WHERE id = '11111111-1111-1111-1111-111111111111';

  -- Eliminar usuario de auth
  DELETE FROM auth.users 
  WHERE id = '11111111-1111-1111-1111-111111111111';
END $$;

-- Actualizar las secuencias de forma segura
DO $$
DECLARE
  seq_name text;
BEGIN
  FOR seq_name IN (SELECT sequence_name 
                   FROM information_schema.sequences 
                   WHERE sequence_schema = 'auth')
  LOOP
    EXECUTE format('SELECT setval(%L, (SELECT COALESCE(MAX(id::text::bigint), 1) FROM auth.users), false)', seq_name);
  END LOOP;
END $$;
