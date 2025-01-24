/*
  # Sistema de Temas Personalizados

  1. Nueva Tabla
    - `themes`
      - `id` (uuid, primary key)
      - `nombre` (text)
      - `descripcion` (text)
      - `es_premium` (boolean)
      - `configuracion` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Habilitar RLS
    - Políticas para usuarios
*/

-- Tabla de Temas
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  es_premium boolean NOT NULL DEFAULT false,
  configuracion jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Políticas para themes
CREATE POLICY "Temas visibles para todos"
  ON themes
  FOR SELECT
  USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar temas predefinidos
INSERT INTO themes (nombre, descripcion, es_premium, configuracion) VALUES
  ('Clásico', 'Tema predeterminado con un diseño elegante y sobrio', false, '{
    "colors": {
      "primary": "#4F46E5",
      "secondary": "#6B7280",
      "background": "#F9FAFB",
      "text": "#111827",
      "accent": "#E5E7EB"
    },
    "fonts": {
      "heading": "serif",
      "body": "sans-serif"
    },
    "styles": {
      "borderRadius": "0.5rem",
      "shadowSize": "sm"
    }
  }'::jsonb),
  
  ('Minimalista', 'Diseño limpio y moderno con espacios amplios', true, '{
    "colors": {
      "primary": "#000000",
      "secondary": "#4B5563",
      "background": "#FFFFFF",
      "text": "#1F2937",
      "accent": "#F3F4F6"
    },
    "fonts": {
      "heading": "sans-serif",
      "body": "sans-serif"
    },
    "styles": {
      "borderRadius": "0.25rem",
      "shadowSize": "none"
    }
  }'::jsonb),
  
  ('Vintage', 'Estilo retro con tonos cálidos y detalles clásicos', true, '{
    "colors": {
      "primary": "#9F7A49",
      "secondary": "#8B7355",
      "background": "#FAF6F1",
      "text": "#292524",
      "accent": "#E7E5E4"
    },
    "fonts": {
      "heading": "serif",
      "body": "serif"
    },
    "styles": {
      "borderRadius": "0.75rem",
      "shadowSize": "lg"
    }
  }'::jsonb),
  
  ('Nocturno', 'Tema oscuro con acentos suaves y elegantes', true, '{
    "colors": {
      "primary": "#818CF8",
      "secondary": "#9CA3AF",
      "background": "#1F2937",
      "text": "#F9FAFB",
      "accent": "#374151"
    },
    "fonts": {
      "heading": "sans-serif",
      "body": "sans-serif"
    },
    "styles": {
      "borderRadius": "0.5rem",
      "shadowSize": "xl"
    }
  }'::jsonb);
