/*
  # Sistema de Suscripciones y Planes Premium

  1. Nuevas Tablas
    - `subscription_plans`: Define los planes disponibles
      - `id` (uuid, primary key)
      - `nombre` (text): nombre del plan
      - `descripcion` (text): descripción del plan
      - `precio` (numeric): precio mensual
      - `caracteristicas` (jsonb): lista de características incluidas
      - `activo` (boolean): si el plan está disponible
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `subscriptions`: Suscripciones activas de usuarios
      - `id` (uuid, primary key)
      - `user_id` (uuid, referencia a profiles)
      - `plan_id` (uuid, referencia a subscription_plans)
      - `estado` (text): estado de la suscripción
      - `fecha_inicio` (timestamp)
      - `fecha_fin` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas para lectura pública de planes
    - Políticas para gestión de suscripciones
*/

-- Tabla de Planes de Suscripción
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text NOT NULL,
  precio numeric NOT NULL CHECK (precio >= 0),
  caracteristicas jsonb NOT NULL DEFAULT '[]'::jsonb,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de Suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  estado text NOT NULL CHECK (estado IN ('active', 'cancelled', 'expired')),
  fecha_inicio timestamptz NOT NULL DEFAULT now(),
  fecha_fin timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id) -- Un usuario solo puede tener una suscripción activa
);

-- Habilitar RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans
CREATE POLICY "Planes visibles para todos"
  ON subscription_plans
  FOR SELECT
  USING (true);

-- Políticas para subscriptions
CREATE POLICY "Usuarios pueden ver su propia suscripción"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su suscripción"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su suscripción"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar planes iniciales
INSERT INTO subscription_plans (nombre, descripcion, precio, caracteristicas) VALUES
  ('Básico', 'Plan básico con características esenciales', 0, '[
    "Crear 1 homenaje",
    "Galería básica (10 fotos)",
    "Comentarios ilimitados",
    "Velas ilimitadas"
  ]'::jsonb),
  ('Premium', 'Plan premium con características avanzadas', 9.99, '[
    "Homenajes ilimitados",
    "Galería extendida (100 fotos)",
    "Música de fondo personalizada",
    "Temas personalizados",
    "Libro de visitas mejorado",
    "Sin publicidad",
    "Soporte prioritario"
  ]'::jsonb),
  ('Familiar', 'Plan ideal para familias', 19.99, '[
    "Todo lo incluido en Premium",
    "Homenajes ilimitados",
    "Galería ilimitada",
    "Árbol genealógico",
    "Historias familiares",
    "Colaboradores múltiples",
    "Backup automático",
    "Soporte 24/7"
  ]'::jsonb);
