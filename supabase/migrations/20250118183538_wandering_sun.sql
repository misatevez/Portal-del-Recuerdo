/*
  # Árbol genealógico y línea de tiempo

  1. Nuevas Tablas
    - `family_relationships`
      - `id` (uuid, primary key)
      - `tribute_id_from` (uuid, referencia al homenaje origen)
      - `tribute_id_to` (uuid, referencia al homenaje destino)
      - `tipo` (text, tipo de relación)
      - `metadata` (jsonb, datos adicionales)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `timeline_events`
      - `id` (uuid, primary key)
      - `tribute_id` (uuid, referencia al homenaje)
      - `fecha` (date, fecha del evento)
      - `titulo` (text, título del evento)
      - `descripcion` (text, descripción del evento)
      - `tipo` (text, tipo de evento)
      - `ubicacion` (text, ubicación del evento)
      - `imagenes` (jsonb, array de URLs de imágenes)
      - `metadata` (jsonb, datos adicionales)
      - `orden` (integer, orden en la línea de tiempo)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing relationships and events
*/

-- Tabla de Relaciones Familiares
CREATE TABLE IF NOT EXISTS family_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id_from uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  tribute_id_to uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN (
    'padre', 'madre', 'hijo', 'hija',
    'hermano', 'hermana', 'abuelo', 'abuela',
    'nieto', 'nieta', 'tio', 'tia',
    'sobrino', 'sobrina', 'primo', 'prima',
    'conyuge'
  )),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_relationship CHECK (tribute_id_from != tribute_id_to)
);

-- Tabla de Eventos de la Línea de Tiempo
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid REFERENCES tributes(id) ON DELETE CASCADE NOT NULL,
  fecha date NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  tipo text NOT NULL CHECK (tipo IN (
    'nacimiento', 'fallecimiento', 'matrimonio',
    'graduacion', 'trabajo', 'viaje',
    'logro', 'otro'
  )),
  ubicacion text,
  imagenes jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Políticas para family_relationships
CREATE POLICY "Relaciones visibles para todos"
  ON family_relationships
  FOR SELECT
  USING (true);

CREATE POLICY "Creadores pueden gestionar relaciones"
  ON family_relationships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE (tributes.id = family_relationships.tribute_id_from
        OR tributes.id = family_relationships.tribute_id_to)
      AND tributes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE (tributes.id = family_relationships.tribute_id_from
        OR tributes.id = family_relationships.tribute_id_to)
      AND tributes.created_by = auth.uid()
    )
  );

-- Políticas para timeline_events
CREATE POLICY "Eventos visibles para todos"
  ON timeline_events
  FOR SELECT
  USING (true);

CREATE POLICY "Creadores pueden gestionar eventos"
  ON timeline_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = timeline_events.tribute_id
      AND tributes.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tributes
      WHERE tributes.id = timeline_events.tribute_id
      AND tributes.created_by = auth.uid()
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_family_relationships_updated_at
  BEFORE UPDATE ON family_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_family_relationships_from ON family_relationships(tribute_id_from);
CREATE INDEX idx_family_relationships_to ON family_relationships(tribute_id_to);
CREATE INDEX idx_timeline_events_tribute ON timeline_events(tribute_id);
CREATE INDEX idx_timeline_events_fecha ON timeline_events(fecha);
