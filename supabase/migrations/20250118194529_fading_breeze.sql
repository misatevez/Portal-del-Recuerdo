/*
  # Add notifications table and related functionality

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tribute_id` (uuid, references tributes)
      - `tipo` (text)
      - `mensaje` (text)
      - `leida` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on notifications table
    - Add policies for user access
*/

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tribute_id uuid REFERENCES tributes(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('vela', 'comentario', 'sistema')),
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias notificaciones"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias notificaciones"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Función para crear notificaciones automáticamente
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_tribute_nombre text;
BEGIN
  -- Determinar el usuario a notificar y los datos según el tipo de evento
  CASE TG_TABLE_NAME
    WHEN 'candles' THEN
      SELECT created_by, nombre INTO v_user_id, v_tribute_nombre
      FROM tributes WHERE id = NEW.tribute_id;
      
      IF NEW.user_id != v_user_id THEN
        INSERT INTO notifications (user_id, tribute_id, tipo, mensaje)
        VALUES (
          v_user_id,
          NEW.tribute_id,
          'vela',
          'Alguien ha encendido una vela en el homenaje de ' || v_tribute_nombre
        );
      END IF;

    WHEN 'comments' THEN
      SELECT created_by, nombre INTO v_user_id, v_tribute_nombre
      FROM tributes WHERE id = NEW.tribute_id;
      
      IF NEW.user_id != v_user_id THEN
        INSERT INTO notifications (user_id, tribute_id, tipo, mensaje)
        VALUES (
          v_user_id,
          NEW.tribute_id,
          'comentario',
          'Alguien ha dejado un comentario en el homenaje de ' || v_tribute_nombre
        );
      END IF;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para crear notificaciones
DROP TRIGGER IF EXISTS create_candle_notification ON candles;
CREATE TRIGGER create_candle_notification
  AFTER INSERT ON candles
  FOR EACH ROW
  EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS create_comment_notification ON comments;
CREATE TRIGGER create_comment_notification
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_notification();
