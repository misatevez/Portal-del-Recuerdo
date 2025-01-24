/*
  # Sistema de Reportes y Moderación

  1. Nuevas Tablas
    - `reports`: Almacena reportes de contenido inapropiado
      - `id` (uuid, primary key)
      - `reporter_id` (uuid, referencia a profiles)
      - `content_type` (text): tipo de contenido reportado (tribute, comment, user)
      - `content_id` (uuid): ID del contenido reportado
      - `reason` (text): razón del reporte
      - `status` (text): estado del reporte (pending, reviewed, resolved, dismissed)
      - `notes` (text): notas del moderador
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `resolved_by` (uuid, referencia a profiles): moderador que resolvió el reporte
      - `resolved_at` (timestamp): fecha de resolución

    - `moderators`: Tabla para gestionar moderadores
      - `id` (uuid, primary key, referencia a profiles)
      - `role` (text): rol del moderador (admin, moderator)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas específicas para moderadores
    - Políticas para usuarios normales (solo pueden crear reportes)
*/

-- Tabla de Reportes
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('tribute', 'comment', 'user')),
  content_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz
);

-- Tabla de Moderadores
CREATE TABLE IF NOT EXISTS moderators (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  role text NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- Políticas para reports
CREATE POLICY "Usuarios pueden crear reportes"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderadores pueden ver todos los reportes"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Moderadores pueden actualizar reportes"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE id = auth.uid()
    )
  );

-- Políticas para moderators
CREATE POLICY "Solo admins pueden ver moderadores"
  ON moderators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden gestionar moderadores"
  ON moderators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moderators_updated_at
  BEFORE UPDATE ON moderators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
