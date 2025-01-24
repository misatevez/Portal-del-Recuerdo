-- Insertar usuarios de prueba
INSERT INTO auth.users (id, email) VALUES
  ('d0d8c19c-3b3e-4f5a-9f3a-d9c4d8c19c3b', 'admin@memorias.com'),
  ('e1e9d2a0-4c4f-5g6b-0g4b-e2e9d2a04c4f', 'juan@ejemplo.com'),
  ('f2f0e3b1-5d5g-6h7c-1h5c-f3f0e3b15d5g', 'maria@ejemplo.com'),
  ('g3g1f4c2-6e6h-7i8d-2i6d-g4g1f4c26e6h', 'carlos@ejemplo.com');

-- Insertar perfiles
INSERT INTO profiles (id, nombre) VALUES
  ('d0d8c19c-3b3e-4f5a-9f3a-d9c4d8c19c3b', 'Admin'),
  ('e1e9d2a0-4c4f-5g6b-0g4b-e2e9d2a04c4f', 'Juan Pérez'),
  ('f2f0e3b1-5d5g-6h7c-1h5c-f3f0e3b15d5g', 'María García'),
  ('g3g1f4c2-6e6h-7i8d-2i6d-g4g1f4c26e6h', 'Carlos López');

-- Insertar moderadores
INSERT INTO moderators (id, role) VALUES
  ('d0d8c19c-3b3e-4f5a-9f3a-d9c4d8c19c3b', 'admin');

-- Insertar homenajes
INSERT INTO tributes (
  id, created_by, nombre, fecha_nacimiento, fecha_fallecimiento, 
  ubicacion, biografia, imagen_principal
) VALUES
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'e1e9d2a0-4c4f-5g6b-0g4b-e2e9d2a04c4f',
    'Ana Martínez',
    '1940-03-15',
    '2023-11-20',
    'Madrid, España',
    'Ana fue una madre y abuela excepcional, dedicada a su familia y a ayudar a los demás. Su sonrisa iluminaba cada habitación y su amor por la cocina reunía a toda la familia los domingos.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80'
  ),
  (
    'i5i3h6e4-8g8j-9k0f-4k8f-i6i3h6e48g8j',
    'f2f0e3b1-5d5g-6h7c-1h5c-f3f0e3b15d5g',
    'Roberto Sánchez',
    '1935-07-22',
    '2024-01-05',
    'Barcelona, España',
    'Roberto fue un respetado profesor de historia que inspiró a generaciones de estudiantes. Su pasión por la enseñanza y su dedicación a la educación dejaron una huella imborrable.',
    'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80'
  ),
  (
    'j6j4i7f5-9h9k-0l1g-5l9g-j7j4i7f59h9k',
    'g3g1f4c2-6e6h-7i8d-2i6d-g4g1f4c26e6h',
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
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'f2f0e3b1-5d5g-6h7c-1h5c-f3f0e3b15d5g',
    'Ana fue una persona maravillosa que siempre tenía una palabra amable para todos. La extrañaremos muchísimo.'
  ),
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'g3g1f4c2-6e6h-7i8d-2i6d-g4g1f4c26e6h',
    'Sus domingos familiares eran legendarios. Nadie cocinaba una paella como ella.'
  ),
  (
    'i5i3h6e4-8g8j-9k0f-4k8f-i6i3h6e48g8j',
    'e1e9d2a0-4c4f-5g6b-0g4b-e2e9d2a04c4f',
    'El profesor Sánchez fue quien me inspiró a estudiar historia. Su legado vivirá en todos sus estudiantes.'
  );

-- Insertar velas
INSERT INTO candles (tribute_id, user_id, mensaje) VALUES
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'f2f0e3b1-5d5g-6h7c-1h5c-f3f0e3b15d5g',
    'Siempre en nuestros corazones'
  ),
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'g3g1f4c2-6e6h-7i8d-2i6d-g4g1f4c26e6h',
    'Descansa en paz'
  ),
  (
    'i5i3h6e4-8g8j-9k0f-4k8f-i6i3h6e48g8j',
    'e1e9d2a0-4c4f-5g6b-0g4b-e2e9d2a04c4f',
    'Gracias por todo lo que nos enseñaste'
  );

-- Insertar fotos
INSERT INTO photos (tribute_id, url, descripcion) VALUES
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80',
    'Ana en su 80 cumpleaños'
  ),
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'https://images.unsplash.com/photo-1517677129300-07b130802f46?auto=format&fit=crop&q=80',
    'Celebrando la Navidad en familia'
  ),
  (
    'i5i3h6e4-8g8j-9k0f-4k8f-i6i3h6e48g8j',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80',
    'Roberto en su última clase'
  );

-- Insertar eventos de línea de tiempo
INSERT INTO timeline_events (
  tribute_id, fecha, titulo, descripcion, tipo, ubicacion
) VALUES
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    '1940-03-15',
    'Nacimiento',
    'Ana nació en Madrid',
    'nacimiento',
    'Madrid, España'
  ),
  (
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    '1965-06-20',
    'Matrimonio',
    'Se casó con Juan Pérez',
    'matrimonio',
    'Madrid, España'
  ),
  (
    'i5i3h6e4-8g8j-9k0f-4k8f-i6i3h6e48g8j',
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
    'h4h2g5d3-7f7i-8j9e-3j7e-h5h2g5d37f7i',
    'i5i3h6e4-8g8j-9k0f-4k8f-i6i3h6e48g8j',
    'hermana'
  );

-- Insertar suscripciones
INSERT INTO subscriptions (
  user_id, plan_id, estado, fecha_inicio, fecha_fin
) VALUES
  (
    'e1e9d2a0-4c4f-5g6b-0g4b-e2e9d2a04c4f',
    (SELECT id FROM subscription_plans WHERE nombre = 'Premium'),
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
  );
