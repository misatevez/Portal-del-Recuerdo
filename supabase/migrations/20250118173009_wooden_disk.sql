/*
  # Tablas principales del sistema de homenajes

  1. Nuevas Tablas
    - `tributes`: Almacena los homenajes
      - `id` (uuid, primary key)
      - `created_by` (uuid, referencia a profiles)
      - `nombre` (text)
      - `fecha_nacimiento` (date)
      - `fecha_fallecimiento` (date)
      - `ubicacion` (text)
      - `biografia` (text)
      - `imagen_principal` (text, URL)
      - `tema` (text)
      - `es_premium` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `comments`: Almacena los comentarios en el libro de visitas
      - `id` (uuid, primary key)
      - `tribute_id` (uuid, referencia a tributes)
      - `user_id` (uuid, referencia a profiles)
      - `contenido` (text)
      - `created_at` (timestamptz)

    - `candles`: Almacena las velas digitales encendidas
      - `id` (uuid, primary key)
      - `tribute_id` (uuid, referencia a tributes)
      - `user_id` (uuid, referencia a profiles)
      - `mensaje` (text)
      - `created_at` (timestamptz)

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para lectura y escritura
*/

-- Tabla de Homenajes
CREATE TABLE tributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles(id) NOT NULL,
  nombre text NOT NULL,
  fecha_nacimiento date NOT NULL,
  fecha_fallecimiento date NOT NULL,
  ubicacion text,
  biografia text,
  imagen_principal text,
  tema text DEFAULT 'claro',
  es_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tributes ENABLE ROW LEVEL SECURITY;

-- Políticas para tributes
CREATE POLICY "Homenajes visibles para todos"
  ON tributes
  FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden crear homenajes"
  ON tributes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Los usuarios pueden actualizar sus propios homenajes"
  ON tributes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Tabla de Comentarios
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  contenido text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Políticas para comments
CREATE POLICY "Comentarios visibles para todos"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden comentar"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tabla de Velas Digitales
CREATE TABLE candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  mensaje text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE candles ENABLE ROW LEVEL SECURITY;

-- Políticas para candles
CREATE POLICY "Velas visibles para todos"
  ON candles
  FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden encender velas"
  ON candles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger para actualizar updated_at en tributes
CREATE TRIGGER update_tributes_updated_at
  BEFORE UPDATE ON tributes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
