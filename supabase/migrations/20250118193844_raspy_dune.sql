-- Configurar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Asegurarse que la tabla profiles existe y tiene los campos correctos
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre text NOT NULL,
  email_preferences jsonb DEFAULT '{"velas":true,"comentarios":true,"sistema":true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Asegurarse que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON public.profiles;
  DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
END $$;

-- Crear nuevas políticas
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger para crear perfil automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'nombre')::text,
      'Usuario ' || substr(NEW.id::text, 1, 8)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear nuevo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insertar usuario admin si no existe
DO $$
BEGIN
  INSERT INTO auth.users (id, email, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@memorias.com',
    '{"nombre": "Admin"}'::jsonb,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Insertar registro de moderador para el admin
INSERT INTO public.moderators (id, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin')
ON CONFLICT (id) DO NOTHING;
