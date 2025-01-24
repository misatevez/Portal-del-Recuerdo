-- Eliminar datos relacionados con el usuario admin
DELETE FROM public.moderators WHERE id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- Eliminar el usuario admin
DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111';

-- Eliminar las inserciones del usuario admin de las migraciones anteriores
-- (No podemos modificar las migraciones anteriores, pero podemos asegurarnos
-- de que el usuario se elimine después de que se creen)

-- Actualizar la secuencia de usuarios si es necesario
SELECT setval(pg_get_serial_sequence('auth.users', 'id'), 
  (SELECT COALESCE(MAX(id::text::bigint), 1) FROM auth.users), false);
