/*
  # Crear tabla de perfiles de usuario

  1. Nueva Tabla
    - `profiles`
      - `id` (uuid, clave primaria, referencia a auth.users)
      - `nombre` (texto, nombre completo del usuario)
      - `created_at` (timestamp con zona horaria)
      - `updated_at` (timestamp con zona horaria)

  2. Seguridad
    - Habilitar RLS en la tabla `profiles`
    - Añadir políticas para:
      - Lectura: usuarios autenticados pueden leer sus propios perfiles
      - Actualización: usuarios pueden actualizar sus propios perfiles
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para leer el propio perfil
CREATE POLICY "Los usuarios pueden leer su propio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para actualizar el propio perfil
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
