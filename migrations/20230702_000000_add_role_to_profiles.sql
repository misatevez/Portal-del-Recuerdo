ALTER TABLE public.profiles
ADD COLUMN role TEXT DEFAULT 'user' NOT NULL;

-- Asegurarse de que los usuarios existentes tengan un rol
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;
