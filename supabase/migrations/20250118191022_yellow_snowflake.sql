/*
  # Add seed data for testing

  This migration adds test data including:
  1. Users and profiles
  2. Sample tributes
  3. Comments and interactions
  4. Photos and timeline events
  5. Family relationships
  6. Test subscriptions
*/

-- Insertar usuarios de prueba
INSERT INTO auth.users (id, email) VALUES
  ('d8c19c3b-3e4f-4a5a-9f3a-d9c4d8c19c3b', 'admin@memorias.com'),
  ('e9d2a04c-4f5g-4b0g-4b4c-e2e9d2a04c4f', 'juan@ejemplo.com'),
  ('f0e3b15d-5g6h-4c1h-5c3f-f3f0e3b15d5g', 'maria@ejemplo.com'),
  ('g1f4c26e-6h7i-4d2i-6d4g-g4g1f4c26e6h', 'carlos@ejemplo.com');

-- Insertar perfiles
INSERT INTO profiles (id, nombre) VALUES
  ('d8c19c3b-3e4f-4a5a-9f3a-d9c4d8c19c3b', 'Admin'),
  ('e9d2a04c-4f5g-4b0g-4b4c-e2e9d2a04c4f', 'Juan Pérez'),
  ('f0e3b15d-5g6h-4c1h-5c3f-f3f0e3b15d5g', 'María García'),
  ('g1f4c26e-6h7i-4d2i-6d4g-g4g1f4c26e6h', 'Carlos López');

-- Insertar moderadores
INSERT INTO moderators (id, role) VALUES
  ('d8c19c3b-3e4f-4a5a-9f3a-d9c4d8c19c3b', 'admin');

-- Insertar homenajes
INSERT INTO tributes (
  id, created_by, nombre, fecha_nacimiento, fecha_fallecimiento, 
  ubicacion, biografia, imagen_principal
) VALUES
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'e9d2a04c-4f5g-4b0g-4b4c-e2e9d2a04c4f',
    'Ana Martínez',
    '1940-03-15',
    '2023-11-20',
    'Madrid, España',
    'Ana fue una madre y abuela excepcional, dedicada a su familia y a ayudar a los demás. Su sonrisa iluminaba cada habitación y su amor por la cocina reunía a toda la familia los domingos.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80'
  ),
  (
    'i3h6e48g-8j9k-4f4k-8f6i-i6i3h6e48g8j',
    'f0e3b15d-5g6h-4c1h-5c3f-f3f0e3b15d5g',
    'Roberto Sánchez',
    '1935-07-22',
    '2024-01-05',
    'Barcelona, España',
    'Roberto fue un respetado profesor de historia que inspiró a generaciones de estudiantes. Su pasión por la enseñanza y su dedicación a la educación dejaron una huella imborrable.',
    'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80'
  ),
  (
    'j4i7f59h-9k0l-4g5l-9g7j-j7j4i7f59h9k',
    'g1f4c26e-6h7i-4d2i-6d4g-g4g1f4c26e6h',
    'Carmen Rodríguez',
    '1950-12-03',
    '2023-09-18',
    'Valencia, España',
    'Carmen dedicó su vida al arte y la música. Como pianista profesional, compartió su amor por la música clásica con todos los que la conocieron.',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80'
  );

-- Insertar comentarios
INSERT INTO comments (tribute_id, user_id, contenido) VALUES
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'f0e3b15d-5g6h-4c1h-5c3f-f3f0e3b15d5g',
    'Ana fue una persona maravillosa que siempre tenía una palabra amable para todos. La extrañaremos muchísimo.'
  ),
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'g1f4c26e-6h7i-4d2i-6d4g-g4g1f4c26e6h',
    'Sus domingos familiares eran legendarios. Nadie cocinaba una paella como ella.'
  ),
  (
    'i3h6e48g-8j9k-4f4k-8f6i-i6i3h6e48g8j',
    'e9d2a04c-4f5g-4b0g-4b4c-e2e9d2a04c4f',
    'El profesor Sánchez fue quien me inspiró a estudiar historia. Su legado vivirá en todos sus estudiantes.'
  );

-- Insertar velas
INSERT INTO candles (tribute_id, user_id, mensaje) VALUES
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'f0e3b15d-5g6h-4c1h-5c3f-f3f0e3b15d5g',
    'Siempre en nuestros corazones'
  ),
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'g1f4c26e-6h7i-4d2i-6d4g-g4g1f4c26e6h',
    'Descansa en paz'
  ),
  (
    'i3h6e48g-8j9k-4f4k-8f6i-i6i3h6e48g8j',
    'e9d2a04c-4f5g-4b0g-4b4c-e2e9d2a04c4f',
    'Gracias por todo lo que nos enseñaste'
  );

-- Insertar fotos
INSERT INTO photos (tribute_id, url, descripcion) VALUES
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80',
    'Ana en su 80 cumpleaños'
  ),
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'https://images.unsplash.com/photo-1517677129300-07b130802f46?auto=format&fit=crop&q=80',
    'Celebrando la Navidad en familia'
  ),
  (
    'i3h6e48g-8j9k-4f4k-8f6i-i6i3h6e48g8j',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80',
    'Roberto en su última clase'
  );

-- Insertar eventos de línea de tiempo
INSERT INTO timeline_events (
  tribute_id, fecha, titulo, descripcion, tipo, ubicacion
) VALUES
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    '1940-03-15',
    'Nacimiento',
    'Ana nació en Madrid',
    'nacimiento',
    'Madrid, España'
  ),
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    '1965-06-20',
    'Matrimonio',
    'Se casó con Juan Pérez',
    'matrimonio',
    'Madrid, España'
  ),
  (
    'i3h6e48g-8j9k-4f4k-8f6i-i6i3h6e48g8j',
    '1960-09-01',
    'Inicio como profesor',
    'Comenzó su carrera como profesor de historia',
    'trabajo',
    'Barcelona, España'
  );

-- Insertar relaciones familiares
INSERT INTO family_relationships (
  tribute_id_from, tribute_id_to, tipo
) VALUES
  (
    'h2g5d37f-7i8j-4e3j-7e5h-h5h2g5d37f7i',
    'i3h6e48g-8j9k-4f4k-8f6i-i6i3h6e48g8j',
    'hermana'
  );

-- Insertar suscripciones
INSERT INTO subscriptions (
  user_id, plan_id, estado, fecha_inicio, fecha_fin
) VALUES
  (
    'e9d2a04c-4f5g-4b0g-4b4c-e2e9d2a04c4f',
    (SELECT id FROM subscription_plans WHERE nombre = 'Premium'),
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
  );
