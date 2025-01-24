/*
  # Sistema de Notificaciones por Email

  1. Nueva Tabla
    - `email_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `tipo` (text)
      - `estado` (text)
      - `datos` (jsonb)
      - `created_at` (timestamptz)
      - `sent_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Políticas para usuarios y administradores
*/

-- Tabla de Notificaciones por Email
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('vela', 'comentario', 'sistema', 'suscripcion')),
  estado text NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'sent', 'failed')),
  datos jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- Habilitar RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para email_notifications
CREATE POLICY "Usuarios pueden ver sus notificaciones"
  ON email_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Función para crear notificación por email
CREATE OR REPLACE FUNCTION create_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_tribute_nombre text;
  v_tribute_id uuid;
BEGIN
  -- Determinar el usuario a notificar y los datos según el tipo de evento
  CASE TG_TABLE_NAME
    WHEN 'candles' THEN
      SELECT created_by, nombre, tributes.id INTO v_user_id, v_tribute_nombre, v_tribute_id
      FROM tributes WHERE id = NEW.tribute_id;
      
      IF NEW.user_id != v_user_id THEN
        INSERT INTO email_notifications (user_id, tipo, datos)
        VALUES (v_user_id, 'vela', jsonb_build_object(
          'tribute_id', v_tribute_id,
          'tribute_nombre', v_tribute_nombre,
          'mensaje', COALESCE(NEW.mensaje, 'Sin mensaje')
        ));
      END IF;

    WHEN 'comments' THEN
      SELECT created_by, nombre, tributes.id INTO v_user_id, v_tribute_nombre, v_tribute_id
      FROM tributes WHERE id = NEW.tribute_id;
      
      IF NEW.user_id != v_user_id THEN
        INSERT INTO email_notifications (user_id, tipo, datos)
        VALUES (v_user_id, 'comentario', jsonb_build_object(
          'tribute_id', v_tribute_id,
          'tribute_nombre', v_tribute_nombre,
          'contenido', NEW.contenido
        ));
      END IF;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para crear notificaciones por email
CREATE TRIGGER create_candle_email_notification
  AFTER INSERT ON candles
  FOR EACH ROW
  EXECUTE FUNCTION create_email_notification();

CREATE TRIGGER create_comment_email_notification
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_email_notification();
