-- Eliminar políticas existentes que causan recursión
DROP POLICY IF EXISTS "Solo admins pueden ver moderadores" ON moderators;
DROP POLICY IF EXISTS "Solo admins pueden gestionar moderadores" ON moderators;

-- Crear nuevas políticas sin recursión
CREATE POLICY "Ver moderadores"
  ON moderators
  FOR SELECT
  USING (true);

CREATE POLICY "Gestionar moderadores"
  ON moderators
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM moderators m
      WHERE m.id = auth.uid() 
      AND m.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM moderators m
      WHERE m.id = auth.uid() 
      AND m.role = 'admin'
    )
  );

-- Asegurar que el admin principal tiene los permisos correctos
DO $$
BEGIN
  -- Actualizar o insertar el registro del admin
  INSERT INTO moderators (id, role)
  VALUES ('11111111-1111-1111-1111-111111111111', 'admin')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin';
END $$;
