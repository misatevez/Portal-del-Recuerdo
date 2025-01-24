/*
  # Sistema de Música de Fondo

  1. Nueva Tabla
    - `background_music`
      - `id` (uuid, primary key)
      - `tribute_id` (uuid, foreign key)
      - `url` (text)
      - `nombre` (text)
      - `artista` (text)
      - `activa` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Políticas para creadores de homenajes
*/

-- Tabla de Música de Fondo
CREATE TABLE IF NOT EXISTS background_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  nombre text NOT NULL,
  artista text,
  activa boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE background_music ENABLE ROW LEVEL SECURITY;

-- Políticas para background_music
CREATE POLICY "Música visible para todos"
  ON background_music
  FOR SELECT
  USING (true);

CREATE POLICY "Creadores pueden gestionar música"
  ON background_music
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = background_music.tribute_id
      AND tributes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = background_music.tribute_id
      AND tributes.created_by = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_background_music_updated_at
  BEFORE UPDATE ON background_music
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
