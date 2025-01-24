/*
  # Sistema de Álbumes de Fotos

  1. Nuevas Tablas
    - `photos`
      - `id` (uuid, primary key)
      - `tribute_id` (uuid, foreign key)
      - `url` (text)
      - `descripcion` (text)
      - `fecha` (date)
      - `orden` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `albums`
      - `id` (uuid, primary key)
      - `tribute_id` (uuid, foreign key)
      - `nombre` (text)
      - `descripcion` (text)
      - `portada` (text)
      - `orden` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas para creadores de homenajes
*/

-- Tabla de Fotos
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  descripcion text,
  fecha date,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de Álbumes
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  portada text,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Añadir album_id a photos
ALTER TABLE photos ADD COLUMN IF NOT EXISTS album_id uuid REFERENCES albums(id) ON DELETE SET NULL;

-- Habilitar RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Políticas para photos
CREATE POLICY "Fotos visibles para todos"
  ON photos
  FOR SELECT
  USING (true);

CREATE POLICY "Creadores pueden gestionar fotos"
  ON photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = photos.tribute_id
      AND tributes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = photos.tribute_id
      AND tributes.created_by = auth.uid()
    )
  );

-- Políticas para albums
CREATE POLICY "Álbumes visibles para todos"
  ON albums
  FOR SELECT
  USING (true);

CREATE POLICY "Creadores pueden gestionar álbumes"
  ON albums
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = albums.tribute_id
      AND tributes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = albums.tribute_id
      AND tributes.created_by = auth.uid()
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
