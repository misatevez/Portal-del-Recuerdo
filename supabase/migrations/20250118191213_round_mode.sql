/*
  # Add seed data for testing

  This migration adds test data including users, tributes, and interactions.
  All UUIDs follow the correct format (8-4-4-4-12 characters).
*/

-- Insertar usuarios de prueba
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@memorias.com'),
  ('22222222-2222-2222-2222-222222222222', 'juan@ejemplo.com'),
  ('33333333-3333-3333-3333-333333333333', 'maria@ejemplo.com'),
  ('44444444-4444-4444-4444-444444444444', 'carlos@ejemplo.com');

-- Insertar perfiles
INSERT INTO profiles (id, nombre) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin'),
  ('22222222-2222-2222-2222-222222222222', 'Juan Pérez'),
  ('33333333-3333-3333-3333-333333333333', 'María García'),
  ('44444444-4444-4444-4444-444444444444', 'Carlos López');

-- Insertar moderadores
INSERT INTO moderators (id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin');

-- Insertar homenajes
INSERT INTO tributes (
  id, created_by, nombre, fecha_nacimiento, fecha_fallecimiento, 
  ubicacion, biografia, imagen_principal
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Ana Martínez',
    '1940-03-15',
    '2023-11-20',
    'Madrid, España',
    'Ana fue una madre y abuela excepcional, dedicada a su familia y a ayudar a los demás. Su sonrisa iluminaba cada habitación y su amor por la cocina reunía a toda la familia los domingos.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'Roberto Sánchez',
    '1935-07-22',
    '2024-01-05',
    'Barcelona, España',
    'Roberto fue un respetado profesor de historia que inspiró a generaciones de estudiantes. Su pasión por la enseñanza y su dedicación a la educación dejaron una huella imborrable.',
    'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444',
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
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'Ana fue una persona maravillosa que siempre tenía una palabra amable para todos. La extrañaremos muchísimo.'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    'Sus domingos familiares eran legendarios. Nadie cocinaba una paella como ella.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'El profesor Sánchez fue quien me inspiró a estudiar historia. Su legado vivirá en todos sus estudiantes.'
  );

-- Insertar velas
INSERT INTO candles (tribute_id, user_id, mensaje) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'Siempre en nuestros corazones'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    'Descansa en paz'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Gracias por todo lo que nos enseñaste'
  );

-- Insertar fotos
INSERT INTO photos (tribute_id, url, descripcion) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80',
    'Ana en su 80 cumpleaños'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'https://images.unsplash.com/photo-1517677129300-07b130802f46?auto=format&fit=crop&q=80',
    'Celebrando la Navidad en familia'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80',
    'Roberto en su última clase'
  );

-- Insertar eventos de línea de tiempo
INSERT INTO timeline_events (
  tribute_id, fecha, titulo, descripcion, tipo, ubicacion
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '1940-03-15',
    'Nacimiento',
    'Ana nació en Madrid',
    'nacimiento',
    'Madrid, España'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '1965-06-20',
    'Matrimonio',
    'Se casó con Juan Pérez',
    'matrimonio',
    'Madrid, España'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
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
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'hermana'
  );

-- Insertar suscripciones
INSERT INTO subscriptions (
  user_id, plan_id, estado, fecha_inicio, fecha_fin
) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    (SELECT id FROM subscription_plans WHERE nombre = 'Premium'),
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
  );
