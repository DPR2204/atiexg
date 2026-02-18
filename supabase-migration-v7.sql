-- Migration v7: Tours Management & Custom Itineraries

-- 1. Create Tours Table
CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  concept TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  duration TEXT,
  image TEXT,
  gallery TEXT[], -- Array of image public_ids
  is_best_seller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  reviews INT DEFAULT 0,
  features TEXT[],
  includes TEXT,
  itinerary JSONB, -- Array of {time, activity}
  prices JSONB, -- Array of {id, label, amount, description}
  addons JSONB, -- Array of {id, label, price}
  meals TEXT[], -- Array of meal types
  format TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- 2. Enable RLS on Tours
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- 3. Policies for Tours
-- Public read access
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON tours;
CREATE POLICY "Public items are viewable by everyone" ON tours
  FOR SELECT USING (true);

-- Authenticated (admin/agents) can insert/update/delete
DROP POLICY IF EXISTS "Authenticated can insert tours" ON tours;
CREATE POLICY "Authenticated can insert tours" ON tours
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update tours" ON tours;
CREATE POLICY "Authenticated can update tours" ON tours
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete tours" ON tours;
CREATE POLICY "Authenticated can delete tours" ON tours
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Add custom_tour_data to Reservations and Link to Tours
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS custom_tour_data JSONB DEFAULT NULL;

-- Add FK if not exists (handling via DO block or simple ALTER if we assume it doesn't exist yet, 
-- but safe way is to add it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_tour_id_fkey') THEN
        ALTER TABLE reservations
        ADD CONSTRAINT reservations_tour_id_fkey
        FOREIGN KEY (tour_id)
        REFERENCES tours(id);
    END IF;
END $$;

-- 5. Helper function to get full reservation details including custom tour data (updated v6 function)
DROP FUNCTION IF EXISTS get_public_reservation(uuid);

CREATE OR REPLACE FUNCTION get_public_reservation(token_input uuid)
RETURNS TABLE (
  id INT,
  tour_name TEXT,
  tour_date DATE,
  start_time TIME,
  status TEXT,
  pax_count INT,
  agent_name TEXT,
  meal_options JSONB,
  custom_tour_data JSONB, -- Added
  tour_includes TEXT,
  tour_itinerary JSONB,
  passengers JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.tour_name,
    r.tour_date,
    r.start_time,
    r.status,
    r.pax_count,
    a.name as agent_name,
    r.meal_options,
    r.custom_tour_data, -- Return custom data
    t.includes as tour_includes,
    t.itinerary as tour_itinerary,
    COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'age', p.age,
          'id_document', p.id_document,
          'email', p.email,
          'phone', p.phone,
          'meals', (
             SELECT COALESCE(json_agg(json_build_object(
               'meal_type', pm.meal_type,
               'food', pm.food_order,
               'notes', pm.dietary_notes
             )), '[]'::json)
             FROM passenger_meals pm
             WHERE pm.passenger_id = p.id
          )
        ))
        FROM passengers p
        WHERE p.reservation_id = r.id
      ),
      '[]'::json
    ) as passengers
  FROM reservations r
  LEFT JOIN agents a ON r.agent_id = a.id
  LEFT JOIN tours t ON r.tour_id = t.id
  WHERE r.public_token = token_input
  AND r.status NOT IN ('cancelled');
END;
$$;

INSERT INTO tours (
  id, name, category, concept, description, price, duration, image, gallery, is_best_seller, is_new, rating, reviews, features, includes, itinerary, prices, addons, meals, format
) VALUES
(
    1,
    'Atitlán Signature',
    'Signature',
    '3 Pueblos + Almuerzo + Coffee Break (Día Completo)',
    'El tour insignia: 3 pueblos emblemáticos del lago, almuerzo premium en Santiago Atitlán, guía bilingüe y lancha privada. La experiencia completa del lago en un día.',
    65,
    '8–9 h',
    'DSC04496_noiz4x',
    ARRAY['DSC04496_noiz4x','DSC04101_ktjtcp','DSC04119_oadxam','DSC04174_gnacgl','DSC04185_rgqgug','DSC04199_de2elm','DSC04052_zyoxm8','DSC04019_ox7ytu','DSC04042_ktnwye','DSC04073_teixpq','DSC04081_pc3eoc','DSC03855_rixhas'],
    true,
    false,
    4.9,
    1240,
    ARRAY['Lancha propia + Capitán','Guía bilingüe (EN/ES)','Almuerzo premium en Santiago','Coffee break en café-bar propio (Panajachel)','Todas las entradas incluidas','Café a bordo'],
    'Lancha privada ida y vuelta, guía bilingüe, almuerzo premium en Santiago, todas las entradas, café a bordo, coffee break en café-bar propio al regreso en Panajachel.',
    '[{"time":"07:30","activity":"Punto de encuentro en muelle de Panajachel. Bienvenida del guía, briefing del día y abordaje a lancha privada."},{"time":"08:00","activity":"Navegación a Santiago Atitlán (~35 min). El guía narra la historia Tz''utujil durante el trayecto."},{"time":"08:40","activity":"Santiago Atitlán: Mercado local, iglesia colonial con historia de Maximón, visita a talleres de artesanos."},{"time":"10:30","activity":"Almuerzo premium en restaurante con vista al lago en Santiago."},{"time":"11:30","activity":"Navegación a San Juan La Laguna (~20 min)."},{"time":"12:00","activity":"San Juan La Laguna: Cooperativa de teñido natural con demostración en vivo, galerías de arte naíf, murales y taller breve de textiles."},{"time":"13:30","activity":"Navegación a San Pedro La Laguna (~10 min)."},{"time":"13:45","activity":"San Pedro La Laguna: Exploración del pueblo, miradores, tiempo libre con mapa de recomendaciones."},{"time":"15:00","activity":"Regreso a Panajachel. Coffee break de despedida en el café-bar de Atitlán Experience."}]',
    '[{"id":"1-1","label":"Por persona","amount":"$65 USD","description":"Grupo 5-10 pax · Todo incluido"}]',
    '[{"id":"a1-1","label":"Fotografía profesional","price":"80-120"},{"id":"a1-2","label":"Drone (clips + fotos)","price":"80-150"}]',
    ARRAY['desayuno','almuerzo','coffee_break'],
    'Grupo pequeño (5-10 pax) · Todo incluido'
  ),
(
    2,
    'Día Privado en el Lago',
    'Signature',
    'Lancha Privada · Itinerario a Medida',
    'Tu día, tu ruta. Lancha privada con itinerario a medida: elige pueblos, playas o miradores. Medio día o día completo.',
    55,
    '4–8 h',
    'DSC04291_k4ew5f',
    ARRAY['DSC04291_k4ew5f','DSC04363_dt2vuy','DSC04374_rdep9d','DSC04387_zcq91s','DSC04073_teixpq','DSC03858_qvws23'],
    false,
    false,
    5,
    120,
    ARRAY['Lancha privada durante todo el tiempo','Itinerario 100% personalizado','Capitán dedicado','Snacks y bebidas a bordo'],
    'Lancha privada durante el tiempo contratado, capitán, snacks y bebidas a bordo, itinerario personalizado. Almuerzo no incluido.',
    '[{"time":"Flexible","activity":"Encuentro en muelle de Panajachel. Revisión del itinerario personalizado con el capitán. Snacks y bebidas ya a bordo."},{"time":"Parada 1","activity":"Destino a elección del grupo. Opciones populares: playas de Santa Cruz, miradores de Jaibalito, San Marcos La Laguna para yoga/relax."},{"time":"Parada 2","activity":"Segundo destino. Nadar en aguas cristalinas, explorar un pueblo, almorzar en restaurante con vista."},{"time":"Parada 3","activity":"Tercer destino para quienes eligen la opción de 8 horas. Atardecer desde el agua si el horario lo permite."},{"time":"Regreso","activity":"De vuelta a Panajachel cuando el grupo lo decida (dentro del horario contratado)."}]',
    '[{"id":"2-1","label":"Por persona","amount":"$55 USD","description":"Grupo 5-10 pax"}]',
    '[{"id":"a2-1","label":"Almuerzo en restaurante","price":"25-45 p/p"},{"id":"a2-2","label":"Guía premium","price":"150"},{"id":"a2-3","label":"Extensión sunset","price":"+30 p/p"}]',
    ARRAY['snacks'],
    'Privado · Personalizable'
  ),
(
    3,
    'Crucero al Atardecer',
    'Lago & Momentos',
    'Lancha Privada · Bebidas · Snacks · Golden Hour',
    'Crucero al atardecer entre volcanes. Bebidas, snacks y música a bordo. La experiencia más fotogénica del lago.',
    40,
    '1.5–2 h',
    'DSC03858_qvws23',
    ARRAY['DSC03858_qvws23','DSC04503_mb5wi7','DSC04496_noiz4x','DSC04363_dt2vuy','DSC03855_rixhas'],
    false,
    false,
    5,
    850,
    ARRAY['Lancha privada + capitán','Bebidas (alcohólicas y no alcohólicas)','Tabla de bocadillos y snacks','Música ambiental'],
    'Lancha privada, bebidas (alcohólicas y no alcohólicas), snacks y tabla de bocadillos, música ambiental, capitán.',
    '[{"time":"16:30","activity":"Encuentro en el muelle de Panajachel. Bienvenida con bebida de cortesía (limonada de hierbabuena o agua de jamaica)."},{"time":"16:45","activity":"Zarpe. Navegación hacia el centro del lago con vista panorámica a los volcanes San Pedro, Tolimán y Atitlán. Música ambiental y snacks servidos."},{"time":"17:15","activity":"Golden hour. Posición privilegiada frente a los volcanes. Momento ideal para fotografías. Bebidas adicionales y tabla de bocadillos."},{"time":"17:45","activity":"Atardecer. El sol se oculta detrás del volcán San Pedro. Pausa contemplativa. Última ronda de bebidas."},{"time":"18:15","activity":"Regreso a Panajachel. Navegación nocturna con las luces de los pueblos reflejadas en el lago."}]',
    '[{"id":"3-1","label":"Por persona","amount":"$40 USD","description":"Grupo 5-10 pax · Todo incluido"}]',
    '[{"id":"a3-1","label":"Fotógrafo 60-90 min","price":"120-180"},{"id":"a3-2","label":"Kit propuesta","price":"120-220"},{"id":"a3-3","label":"Reel vertical 30-60s","price":"250-450"}]',
    ARRAY['snacks'],
    'Grupo pequeño (5-10 pax) · Todo incluido'
  ),
(
    4,
    'Amanecer en el Lago',
    'Lago & Momentos',
    'Salida Pre-Alba · Sesión Fotográfica · Desayuno',
    'Amanecer desde el lago: salida pre-alba, volcanes reflejados en el agua, sesión fotográfica y desayuno en nuestro café-bar.',
    40,
    '2.5–3 h',
    'DSC04490_eqqgtz',
    ARRAY['DSC04490_eqqgtz','DSC04496_noiz4x','DSC04503_mb5wi7','DSC03855_rixhas','DSC03858_qvws23'],
    false,
    false,
    4.9,
    130,
    ARRAY['Lancha privada + capitán','Café caliente a bordo','Mantas para el fresco','Desayuno completo en café-bar propio'],
    'Lancha privada, café a bordo, mantas, desayuno completo en café-bar propio, café de especialidad de la tostaduría.',
    '[{"time":"05:00","activity":"Punto de encuentro en el muelle. Café caliente y pan dulce de bienvenida mientras amanece. Briefing breve."},{"time":"05:15","activity":"Zarpe en oscuridad. Navegación hacia el punto de observación óptimo. Mantas disponibles a bordo para el fresco de la madrugada."},{"time":"05:45","activity":"Amanecer. Los primeros rayos de luz iluminan los volcanes y se reflejan en el lago inmóvil. Momento fotográfico único."},{"time":"06:30","activity":"Navegación contemplativa. Recorrido lento por zonas de aguas calmas. Posible avistamiento de aves acuáticas y pescadores locales."},{"time":"07:15","activity":"Desayuno en el Café-Bar Atitlán Experience. Desayuno completo: huevos al gusto, frijoles, plátanos, pan artesanal, jugo natural y café recién tostado."}]',
    '[{"id":"4-1","label":"Por persona","amount":"$40 USD","description":"Grupo 5-10 pax · Todo incluido"}]',
    '[{"id":"a4-1","label":"Fotógrafo 60-90 min","price":"120-180"},{"id":"a4-2","label":"Drone add-on","price":"80-150"}]',
    ARRAY['desayuno'],
    'Grupo pequeño (5-10 pax) · Todo incluido'
  ),
(
    5,
    'Escapada Bienestar',
    'Lago & Momentos',
    'Yoga · Ceremonia de Cacao · Almuerzo Saludable',
    'Slow travel: yoga junto al lago, ceremonia de cacao o temazcal, almuerzo saludable. Desconexión total con traslado en lancha privada.',
    65,
    '4–5 h',
    'DSC03989_ywaz7j',
    ARRAY['DSC03989_ywaz7j','DSC03997_qlzxrn','DSC04002_sfqosk','DSC04004_hcety6'],
    false,
    false,
    4.9,
    320,
    ARRAY['Lancha privada ida y vuelta','Sesión de yoga con vista al lago','Ceremonia de cacao o temazcal','Almuerzo saludable incluido','Guía acompañante'],
    'Lancha privada ida y vuelta, sesión de yoga, ceremonia de cacao o temazcal, almuerzo saludable, bebidas (tés, jugos), guía acompañante.',
    '[{"time":"07:30","activity":"Encuentro en muelle de Panajachel. Té de hierbas de bienvenida. El guía explica la filosofía del día: ritmo lento, conexión con la naturaleza."},{"time":"08:00","activity":"Navegación a San Marcos La Laguna (~25 min). Música de meditación a bordo."},{"time":"08:30","activity":"Sesión de yoga con vista al lago. Clase guiada en terraza con vista a los volcanes. Para todos los niveles."},{"time":"09:45","activity":"Ceremonia de cacao o temazcal (según disponibilidad). Experiencia ancestral maya guiada por facilitador local."},{"time":"11:00","activity":"Almuerzo saludable. Menú plant-based o de cocina local saludable en restaurante de San Marcos."},{"time":"12:15","activity":"Regreso en lancha a Panajachel. Navegación relajada. Té herbal de cierre a bordo."}]',
    '[{"id":"5-1","label":"Por persona","amount":"$65 USD","description":"Grupo 5-10 pax · Todo incluido"}]',
    '[{"id":"a5-1","label":"Masaje 60 min","price":"26-52 p/p"},{"id":"a5-2","label":"Concierge WhatsApp","price":"15-35"}]',
    ARRAY['almuerzo'],
    'Grupo pequeño (5-10 pax) · Todo incluido'
  ),
(
    6,
    'Ruta Artesanal',
    'Cultura & Pueblos',
    'San Juan La Laguna + San Antonio Palopó',
    'San Juan La Laguna y San Antonio Palopó: cooperativas de teñido natural, galerías de arte naíf, cerámica pintada y textiles. Guía desde nuestra sucursal.',
    55,
    '6–7 h',
    'DSC04052_zyoxm8',
    ARRAY['DSC04052_zyoxm8','DSC04019_ox7ytu','DSC04033_kq63ay','DSC04042_ktnwye','DSC04045_etlucg','DSC04046_whihtj','DSC04051_qs4st8','DSC04054_skmjsn','DSC04058_ljybdj','DSC04440_r9skha','DSC04444_uppybw','DSC04466_mxfzds','DSC04470_i6h83r','DSC04490_eqqgtz'],
    false,
    false,
    4.8,
    210,
    ARRAY['Lancha privada + guía bilingüe','Entradas a cooperativas y talleres','Almuerzo típico incluido','Materiales para taller de teñido'],
    'Lancha privada, guía bilingüe, entradas a cooperativas y talleres, almuerzo típico, materiales para taller de teñido.',
    '[{"time":"08:00","activity":"Salida en lancha desde Panajachel rumbo a San Juan La Laguna (~30 min). Guía bilingüe a bordo con contexto histórico sobre la cultura Tz''utujil."},{"time":"08:30","activity":"Cooperativa de teñido natural. Demostración en vivo del proceso de extracción de tintes de plantas, insectos y minerales. Oportunidad de teñir tu propia pieza."},{"time":"09:20","activity":"Recorrido por galerías y murales. Arte naíf Tz''utujil, pintura de paisajes del lago. Visita a talleres de artistas locales."},{"time":"10:15","activity":"Taller de textiles. Cooperativa de mujeres tejedoras con telares de cintura. Explicación de la simbología en los huipiles."},{"time":"11:00","activity":"Navegación a San Antonio Palopó (~35 min). Almuerzo a bordo o en restaurante local según preferencia."},{"time":"11:45","activity":"San Antonio Palopó. Pueblo de cerámica pintada. Visita al proyecto comunitario de casas pintadas con diseños mayas. Mirador panorámico."},{"time":"13:15","activity":"Almuerzo en restaurante con vista. Comida típica guatemalteca: pepián, jocón o pollo en recado."},{"time":"14:15","activity":"Regreso a Panajachel en lancha (~15 min)."}]',
    '[{"id":"6-1","label":"Por persona","amount":"$55 USD","description":"Grupo 5-10 pax · Todo incluido"}]',
    '[{"id":"a6-1","label":"Fotografía estándar","price":"150-230"},{"id":"a6-2","label":"Empaque seguro de cerámica","price":"10-25"}]',
    ARRAY['almuerzo'],
    'Grupo pequeño (5-10 pax) · Todo incluido'
  ),
(
    7,
    'Santiago Cultural',
    'Cultura & Pueblos',
    'Inmersión Tz''utujil · Mercado · Maximón · Artesanos',
    'Inmersión Tz''utujil: mercado de Santiago, iglesia con Maximón, talleres de artesanos y almuerzo típico. Guía desde nuestra sucursal en Santiago.',
    55,
    '5–6 h',
    'DSC04177_tcgwam',
    ARRAY['DSC04177_tcgwam','DSC04174_gnacgl','DSC04170_dswiko','DSC04160_ajbk7r','DSC04185_rgqgug','DSC04188_gpbth7','DSC04192_yvloo0','DSC04193_obgcum','DSC04194_panqpm','DSC04199_de2elm','DSC04200_h0ije3','DSC04201_xxscdr','DSC04206_ainpux','DSC04119_oadxam','DSC04116_qt2mjq','DSC04114_bjxcf6','DSC04183_g7ffkv'],
    false,
    true,
    4.8,
    85,
    ARRAY['Lancha privada ida y vuelta','Guía local bilingüe','Entradas (Maximón, iglesia)','Almuerzo típico Tz''utujil','Visitas a talleres de artesanos'],
    'Lancha privada ida y vuelta, guía local bilingüe, entradas (Maximón, iglesia), almuerzo típico, visitas a talleres.',
    '[{"time":"08:00","activity":"Salida en lancha desde Panajachel rumbo a Santiago Atitlán (~35 min). El guía introduce la historia del pueblo más grande del lago."},{"time":"08:40","activity":"Mercado de Santiago. Recorrido guiado por el mercado local: frutas exóticas, textiles, hierbas medicinales."},{"time":"09:40","activity":"Iglesia de Santiago Apóstol. Arquitectura colonial con sincretismo maya. Historia del padre Stanley Rother."},{"time":"10:30","activity":"Visita a Maximón (Rilaj Maam). Deidad sincrética maya-católica. El guía explica el significado cultural y las ofrendas."},{"time":"11:10","activity":"Talleres de artesanos. Visita a familias que tallan madera, tejen y bordan. Proceso de creación del traje tradicional."},{"time":"12:15","activity":"Almuerzo típico. Restaurante local con platillos Tz''utujiles: caldo de gallina criolla, tortillas hechas a mano, atol."},{"time":"13:30","activity":"Regreso en lancha a Panajachel. Tiempo para fotos del lago desde la popa."}]',
    '[{"id":"7-1","label":"Por persona","amount":"$55 USD","description":"Grupo 5-10 pax · Todo incluido"}]',
    '[{"id":"a7-1","label":"Fotografía profesional","price":"80-120"},{"id":"a7-2","label":"Concierge WhatsApp","price":"15-35"}]',
    ARRAY['almuerzo'],
    'Grupo pequeño (5-10 pax) · Todo incluido'
  ),
(
    8,
    'Laboratorio de Café',
    'Sabores del Lago',
    'Tostaduría Propia · Tostado en Vivo · Catación Profesional',
    'Experiencia completa en nuestra tostaduría: origen del grano, tostado en vivo, catación profesional y maridaje con repostería artesanal.',
    25,
    '2.5–3 h',
    'DSC04238_swyart',
    ARRAY['DSC04238_swyart','DSC03855_rixhas','DSC03858_qvws23'],
    false,
    false,
    5,
    95,
    ARRAY['Catación de 4 cafés de Guatemala','Demostración de tostado en vivo','Maridaje con repostería artesanal','Bolsa de café de regalo (100g)','Descuento 15% en tienda'],
    'Catación de 4 cafés, demostración de tostado, maridaje con repostería, bolsa de café de regalo (100g), descuento en tienda.',
    '[{"time":"09:00","activity":"Bienvenida en la tostaduría. Café de bienvenida (método a elegir: V60, prensa francesa o chemex). Introducción al café de especialidad."},{"time":"09:20","activity":"Del grano a la taza. Recorrido por el proceso: café cereza, despulpado, secado, clasificación. Historia del café en Guatemala."},{"time":"10:00","activity":"Tostado en vivo. Demostración con nuestra tostadora. Explicación de perfiles de tueste y cómo afectan el sabor."},{"time":"10:30","activity":"Catación profesional (cupping). Flight de 4 cafés de diferentes regiones: Huehuetenango, Atitlán, Antigua, Cobán."},{"time":"11:00","activity":"Maridaje. Cada café se acompaña con repostería artesanal que complementa sus notas."},{"time":"11:30","activity":"Cierre. Bolsa de café recién tostado para llevar. Descuento del 15% en productos de la tienda."}]',
    '[{"id":"8-1","label":"Por persona","amount":"$25 USD","description":"Grupo 5-10 pax"}]',
    '[{"id":"a8-1","label":"Upgrade 5-6 muestras","price":"+10-18 p/p"},{"id":"a8-2","label":"Maridaje con vino","price":"+15-35 p/p"}]',
    ARRAY['snacks'],
    'Grupo pequeño · En tostaduría'
  ),
(
    9,
    'Café y Lago Combo',
    'Sabores del Lago',
    'Laboratorio de Café + Recorrido por el Lago',
    'Laboratorio de Café en la mañana + recorrido por el lago en la tarde. El combo perfecto para quien tiene un solo día en Panajachel.',
    55,
    '6–7 h',
    'DSC04025_x0dtae',
    ARRAY['DSC04025_x0dtae','DSC04238_swyart','DSC03855_rixhas','DSC04052_zyoxm8','DSC04019_ox7ytu','DSC04073_teixpq','DSC04081_pc3eoc'],
    false,
    true,
    4.9,
    65,
    ARRAY['Laboratorio de Café (catación + tostado)','Lancha privada','Almuerzo incluido','Cold brew a bordo','Visitas a San Juan y San Pedro','Bolsa de café de regalo'],
    'Laboratorio de Café (catación + tostado), lancha privada, almuerzo, cold brew a bordo, visitas en San Juan y San Pedro, bolsa de café de regalo.',
    '[{"time":"08:30","activity":"Inicio en la tostaduría. Laboratorio de Café condensado: tostado en vivo, catación de 3 cafés, maridaje express con repostería artesanal."},{"time":"10:30","activity":"Caminata al muelle (~5 min). Tiempo para comprar café en la tienda. Abordaje a lancha privada."},{"time":"10:45","activity":"Navegación a San Juan La Laguna (~30 min). Cold brew de la tostaduría a bordo. Vista de los volcanes."},{"time":"11:15","activity":"San Juan La Laguna. Visita express a cooperativa de teñido y galería de arte naíf. Almuerzo en restaurante local con vista al lago."},{"time":"12:45","activity":"Navegación a San Pedro (~10 min). Parada breve para explorar la calle principal y tomar un chocolate artesanal."},{"time":"13:30","activity":"San Pedro La Laguna. Tiempo libre para explorar. Mapa curado con recomendaciones."},{"time":"15:00","activity":"Regreso a Panajachel. Bolsa de café recién tostado como recuerdo del día."}]',
    '[{"id":"9-1","label":"Por persona","amount":"$55 USD","description":"Grupo 5-10 pax · Todo incluido"}]',
    '[{"id":"a9-1","label":"Fotografía profesional","price":"80-120"},{"id":"a9-2","label":"Upgrade cena en Panajachel","price":"25-45 p/p"}]',
    ARRAY['almuerzo'],
    'Grupo pequeño (5-10 pax) · Todo incluido'
  ),
(
    10,
    'Día de Campo Esencial',
    'Días de Campo',
    'Canasta Esencial · San Lucas Tolimán · Tu Ritmo',
    'Canasta con lo esencial para un día perfecto al aire libre en San Lucas Tolimán. Sándwiches gourmet, frutas, bebidas. Nosotros resolvemos la logística, tú disfrutas.',
    45,
    '4–8 h (tú decides)',
    'DSC04226_xwlrkb',
    ARRAY['DSC04226_xwlrkb','DSC04213_y7d6xs','DSC04235_vi1v0p','DSC04269_oyeeuc','DSC04361_iuucat','DSC04359_kkmswv'],
    false,
    true,
    4.9,
    45,
    ARRAY['Lancha ida y vuelta a San Lucas','Canasta esencial completa','Mantel + vajilla reutilizable','Asesoría de spot'],
    'Lancha ida y vuelta a San Lucas, canasta esencial (sándwiches gourmet, fruta, limonada, café frío, galletas), mantel, vajilla reutilizable, asesoría de spot.',
    '[{"time":"09:00","activity":"Encuentro en muelle de Panajachel. Tu canasta ya está lista y cargada en la lancha. Revisión del contenido con el equipo."},{"time":"09:40","activity":"Llegada a San Lucas Tolimán. Nuestro equipo te ayuda a elegir tu spot: playa a orillas del lago, área verde con sombra, o mirador con vista al volcán Tolimán."},{"time":"Todo el día","activity":"Tu día, tu ritmo. No es un tour guiado — es TU día de campo. Sándwiches gourmet, fruta de temporada, limonada natural, café frío de la tostaduría, galletas artesanales."},{"time":"Flexible","activity":"Recogida. Llámanos o envía mensaje cuando estés listo. La lancha viene por ti. Recogemos la canasta y equipo."}]',
    '[{"id":"10-1","label":"Por persona","amount":"$45 USD","description":"Grupo 5-10 pax"}]',
    '[{"id":"a10-1","label":"Kayak/SUP (renta)","price":"10-16 p/p"},{"id":"a10-2","label":"Upgrade a canasta premium","price":"+15 p/p"}]',
    ARRAY['picnic'],
    'Privado · Tu ritmo'
  ),
(
    11,
    'Día de Campo Premium',
    'Días de Campo',
    'Canasta Premium · Quesos · Vino · Cold Brew',
    'Canasta elevada: tabla de quesos y embutidos, vino o cervezas artesanales, ensalada fresca, pan artesanal y cold brew de nuestra tostaduría.',
    60,
    '4–8 h (tú decides)',
    'DSC04336_bqmz9o',
    ARRAY['DSC04336_bqmz9o','DSC04238_swyart','DSC04291_k4ew5f','DSC04213_y7d6xs','DSC04216_v998mf','DSC04218_lluvgq','DSC04226_xwlrkb','DSC04235_vi1v0p','DSC04269_oyeeuc','DSC04286_dnfvaq'],
    false,
    true,
    5,
    30,
    ARRAY['Lancha ida y vuelta','Canasta premium completa','Tabla de quesos y embutidos','Vino o cervezas artesanales','Vajilla de cerámica + copas','Bolsa térmica'],
    'Lancha ida y vuelta, canasta premium (tabla de quesos, embutidos, ensalada, pan, vino/cervezas, cold brew, postre, fruta), mantel premium, vajilla de cerámica, copas, bolsa térmica.',
    '[{"time":"09:00","activity":"Encuentro en muelle de Panajachel. Tu canasta premium ya cargada. Incluye bolsa térmica para mantener fríos los vinos y quesos."},{"time":"09:40","activity":"Llegada a San Lucas Tolimán. Nuestro equipo te lleva al spot ideal: playa privada, zona de sombra en finca, o terraza con vista volcánica."},{"time":"Todo el día","activity":"Canasta Premium desplegada. Tabla de quesos y embutidos, ensalada fresca, pan artesanal, vino o cervezas artesanales guatemaltecas, cold brew, postre del día, fruta de temporada."},{"time":"Flexible","activity":"Recogida cuando tú decidas. La lancha regresa por ti y recogemos todo el equipo."}]',
    '[{"id":"11-1","label":"Por persona","amount":"$60 USD","description":"Grupo 5-10 pax"}]',
    '[{"id":"a11-1","label":"Kayak/SUP (renta)","price":"10-16 p/p"},{"id":"a11-2","label":"Upgrade a Celebración","price":"+15 p/p"}]',
    ARRAY['picnic'],
    'Privado · Tu ritmo'
  ),
(
    12,
    'Canasta Celebración',
    'Días de Campo',
    'Todo lo Premium + Prosecco · Decoración · Personalizado',
    'Para momentos especiales: todo lo Premium + prosecco, decoración con flores y velas, mensaje personalizado. Aniversarios, cumpleaños, propuestas.',
    75,
    '4–8 h (tú decides)',
    'DSC04213-2_nw4evi',
    ARRAY['DSC04213-2_nw4evi','DSC04216_v998mf','DSC04218_lluvgq','DSC04286_dnfvaq','DSC04336_bqmz9o','DSC04238_swyart','DSC04291_k4ew5f','DSC04363_dt2vuy'],
    false,
    true,
    5,
    15,
    ARRAY['Lancha ida y vuelta','Canasta celebración completa','Prosecco o champagne','Decoración personalizada (flores, velas)','Pastel o postre especial','Setup y desmontaje por equipo','Bocina bluetooth'],
    'Lancha ida y vuelta, canasta celebración completa (todo lo Premium + prosecco/champagne, pastel especial), decoración personalizada (flores, velas, mensaje), setup y desmontaje, bocina bluetooth, coordinación previa.',
    '[{"time":"Flexible","activity":"Encuentro en muelle de Panajachel. Tu canasta celebración está lista. El equipo ha preparado la decoración según tus indicaciones (coordinación 48h antes)."},{"time":"+40 min","activity":"Llegada a San Lucas Tolimán. Nuestro equipo monta el setup de celebración: mantel especial, flores, velas, mensaje personalizado, decoración temática."},{"time":"+15 min","activity":"Setup listo, sorpresa revelada. Si es una propuesta o sorpresa, coordinamos el momento. Brindis con prosecco/champagne."},{"time":"Todo el día","activity":"Canasta Celebración. Todo lo de la Premium + prosecco, pastel especial, decoración con flores frescas, velas aromáticas, tarjeta personalizada. Bocina bluetooth."},{"time":"Flexible","activity":"Recogida. Desmontamos todo discretamente. Opción de atardecer en lancha de regreso si el horario lo permite."}]',
    '[{"id":"12-1","label":"Por persona","amount":"$75 USD","description":"Grupo 5-10 pax · Exclusivo"}]',
    '[{"id":"a12-1","label":"Fotógrafo 60-90 min","price":"120-180"},{"id":"a12-2","label":"Reel vertical 30-60s","price":"250-450"}]',
    ARRAY['picnic'],
    'Privado · Exclusivo'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  concept = EXCLUDED.concept,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration = EXCLUDED.duration,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  is_best_seller = EXCLUDED.is_best_seller,
  is_new = EXCLUDED.is_new,
  rating = EXCLUDED.rating,
  reviews = EXCLUDED.reviews,
  features = EXCLUDED.features,
  includes = EXCLUDED.includes,
  itinerary = EXCLUDED.itinerary,
  prices = EXCLUDED.prices,
  addons = EXCLUDED.addons,
  meals = EXCLUDED.meals,
  format = EXCLUDED.format;

-- 6. Grant Permissions for Public RPCs (Fix for Guest Portal)
GRANT EXECUTE ON FUNCTION get_public_reservation(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION register_public_passenger(uuid, text, int, text, text, text, jsonb, int) TO anon, authenticated, service_role;

