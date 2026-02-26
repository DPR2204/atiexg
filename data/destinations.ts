export interface Destination {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  heroImage: string;
  gallery: string[];
  highlights: string[];
  activities: string[];
  travelTime: string;
  bestTime: string;
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'panajachel',
    name: 'Panajachel',
    subtitle: 'La puerta de entrada al Lago de Atitlán',
    description:
      'Panajachel, conocido cariñosamente como "Pana", es el pueblo más visitado y cosmopolita del Lago de Atitlán. Ubicado en la orilla norte del lago, este vibrante destino combina la cultura maya tz\'utujil con una escena turística internacional que lo convierte en el punto de partida ideal para explorar toda la región. La famosa Calle Santander es el corazón comercial del pueblo, donde encontrarás una mezcla fascinante de tiendas de artesanías, restaurantes con cocina internacional y guatemalteca, cafeterías de especialidad y bares con música en vivo. Caminar por esta calle al atardecer, cuando los volcanes San Pedro y Tolimán se pintan de tonos dorados, es una experiencia que define la magia de Atitlán. El malecón de Panajachel ofrece vistas panorámicas incomparables del lago y los tres volcanes que lo rodean. Desde aquí parten las lanchas públicas y privadas hacia todos los pueblos del lago, convirtiendo a Pana en el centro logístico perfecto para tu aventura. La Reserva Natural Atitlán, ubicada a pocos minutos del centro, alberga senderos entre la selva, puentes colgantes, cascadas naturales y una impresionante diversidad de mariposas y aves. Para los amantes de la gastronomía, Panajachel ofrece desde pupusas callejeras hasta restaurantes gourmet con vistas al lago. No te pierdas el mercado local los domingos, donde la comunidad kaqchikel comercia frutas, verduras y textiles tradicionales en un ambiente auténtico y colorido.',
    heroImage: 'DSC03855_rixhas',
    gallery: ['DSC03858_qvws23', 'IMG_9661_sekr0f'],
    highlights: [
      'Calle Santander: compras, gastronomía y vida nocturna',
      'Malecón con vistas panorámicas a los 3 volcanes',
      'Reserva Natural Atitlán con puentes colgantes y cascadas',
      'Punto de partida para lanchas a todos los pueblos',
      'Mercado local los domingos con productos kaqchikeles',
      'Amplia oferta de hospedaje para todos los presupuestos',
    ],
    activities: [
      'Paseos en lancha privada por el lago',
      'Kayak y paddleboard al atardecer',
      'Recorrido gastronómico por Calle Santander',
      'Senderismo en la Reserva Natural Atitlán',
      'Compras de artesanías y textiles mayas',
      'Tour de atardecer en lancha',
    ],
    travelTime: 'Punto de partida',
    bestTime: 'Todo el año, especialmente noviembre a abril',
  },
  {
    slug: 'san-pedro-la-laguna',
    name: 'San Pedro La Laguna',
    subtitle: 'El pueblo bohemio al pie del volcán',
    description:
      'San Pedro La Laguna es el destino favorito de viajeros independientes, mochileros y espíritus libres que buscan una experiencia auténtica en el Lago de Atitlán. Ubicado al pie del imponente Volcán San Pedro (3,020 metros sobre el nivel del mar), este pueblo tz\'utujil combina una vibrante escena bohemia con tradiciones mayas profundamente arraigadas. Las calles empedradas de San Pedro están llenas de cafeterías artesanales, escuelas de español, estudios de yoga y pequeños restaurantes que sirven desde comida típica guatemalteca hasta cocina vegana internacional. El ambiente es relajado y multicultural, con una comunidad de expatriados que se mezcla armoniosamente con la población local maya tz\'utujil. La principal atracción de aventura es el ascenso al Volcán San Pedro, una caminata desafiante de 4-5 horas que recompensa con vistas espectaculares del lago, los volcanes circundantes y, en días claros, hasta el Océano Pacífico. Se recomienda iniciar la caminata antes del amanecer para disfrutar del espectáculo de luz sobre el lago. El mirador de la Nariz del Indio (Indian Nose), accesible desde San Pedro, es otro punto icónico para ver el amanecer sobre el Lago de Atitlán. San Pedro también es conocido por su escena artística, con murales coloridos que adornan las fachadas de las casas y galerías de arte local. Los fines de semana, el pueblo cobra vida con música en vivo y eventos culturales que atraen visitantes de todo el lago.',
    heroImage: 'DSC04073_teixpq',
    gallery: [
      'DSC04063_bompv3',
      'DSC04064_nlwvxb',
      'DSC04081_pc3eoc',
      'DSC04089_rahsad',
      'DSC04090_wrgixg',
    ],
    highlights: [
      'Volcán San Pedro: ascenso con vistas al Pacífico',
      'Mirador Indian Nose para amaneceres épicos',
      'Escena bohemia con cafés, yoga y arte callejero',
      'Escuelas de español reconocidas internacionalmente',
      'Cultura tz\'utujil viva y auténtica',
      'Vida nocturna relajada con música en vivo',
    ],
    activities: [
      'Ascenso al Volcán San Pedro (3,020 m)',
      'Amanecer en Indian Nose',
      'Clases de español inmersivas',
      'Yoga y meditación con vista al lago',
      'Recorrido de murales y arte callejero',
      'Kayak desde el muelle de San Pedro',
    ],
    travelTime: '20-25 minutos en lancha',
    bestTime: 'Todo el año; ascensos al volcán de nov a abril',
  },
  {
    slug: 'san-juan-la-laguna',
    name: 'San Juan La Laguna',
    subtitle: 'Capital del arte y los textiles mayas',
    description:
      'San Juan La Laguna es una joya cultural del Lago de Atitlán, reconocido como el pueblo más artístico y organizado de la región. Este pequeño pero fascinante destino tz\'utujil ha logrado preservar sus tradiciones ancestrales mientras desarrolla un modelo de turismo comunitario que es ejemplo en toda Centroamérica. Las calles de San Juan están decoradas con impresionantes murales que cuentan la historia y cosmología maya, creando una galería de arte al aire libre que sorprende a cada paso. El pueblo es famoso por sus cooperativas de mujeres tejedoras que mantienen vivas las técnicas ancestrales de tejido en telar de cintura, utilizando tintes naturales extraídos de plantas, insectos y minerales locales. Visitar estos talleres es una experiencia transformadora donde puedes aprender el proceso completo, desde la recolección de plantas para tintes hasta la creación de complejos diseños que representan símbolos sagrados mayas. La cooperativa de café orgánico de San Juan produce algunos de los mejores granos de la región volcánica de Atitlán. Los tours de café te llevan desde la plantación hasta la taza, explicando cada etapa del proceso con pasión y conocimiento ancestral. La miel de abejas nativas sin aguijón (meliponas) es otro producto artesanal único que solo encontrarás aquí. San Juan también ofrece excelentes miradores naturales con vistas al lago y senderos ecológicos que atraviesan bosques de café y aguacate. La gastronomía local destaca por su uso de ingredientes orgánicos y recetas tradicionales mayas preparadas con técnicas contemporáneas.',
    heroImage: 'DSC04023_zfkjq7',
    gallery: [
      'DSC04033_kq63ay',
      'DSC04037_hi3wgr',
      'DSC04042_ktnwye',
      'DSC04046_whihtj',
      'DSC04052_zyoxm8',
      'DSC04055_mhf1ao',
    ],
    highlights: [
      'Cooperativas de textiles con tintes naturales',
      'Murales artísticos que narran la cosmología maya',
      'Tour de café orgánico de la semilla a la taza',
      'Miel de abejas meliponas (sin aguijón)',
      'Modelo de turismo comunitario ejemplar',
      'Gastronomía local con ingredientes orgánicos',
    ],
    activities: [
      'Taller de tejido con tintes naturales',
      'Tour de café orgánico en finca local',
      'Recorrido de murales y galerías de arte',
      'Degustación de miel de abejas meliponas',
      'Caminata por senderos ecológicos',
      'Visita a cooperativas de mujeres artesanas',
    ],
    travelTime: '25-30 minutos en lancha',
    bestTime: 'Todo el año; talleres disponibles lunes a sábado',
  },
  {
    slug: 'santiago-atitlan',
    name: 'Santiago Atitlán',
    subtitle: 'Corazón de la cultura tz\'utujil',
    description:
      'Santiago Atitlán es el pueblo más grande e históricamente significativo del Lago de Atitlán, hogar de la cultura maya tz\'utujil que ha resistido siglos de cambio manteniendo sus tradiciones, idioma y cosmovisión vivos hasta el día de hoy. Ubicado entre los volcanes Tolimán y San Pedro, Santiago ofrece una inmersión cultural profunda que va más allá del turismo convencional. El pueblo es famoso mundialmente por ser el hogar de Maximón (también conocido como Rilaj Mam), una deidad sincrética que combina elementos de la espiritualidad maya con el catolicismo colonial. Visitar la cofradía donde se venera a Maximón es una experiencia única que revela la complejidad y riqueza del sincretismo religioso guatemalteco. La ceremonia cambia de ubicación cada año, y los guías locales te conducen hasta el altar decorado con ofrendas de tabaco, alcohol y flores. El mercado de Santiago Atitlán es uno de los más auténticos y vibrantes del altiplano guatemalteco. Los días de mercado (especialmente martes, viernes y domingos), las calles se llenan de vendedores que ofrecen frutas tropicales, vegetales de la milpa, textiles bordados a mano y el característico tocado ceremonial de las mujeres santiagueñas, una faja roja enrollada en la cabeza que simboliza la serpiente emplumada. La iglesia de Santiago Apóstol, construida en el siglo XVI, alberga un retablo tallado que muestra la fusión del arte colonial español con la iconografía maya. El Centro Cultural Cojolya documenta y preserva el arte textil tz\'utujil, mostrando la evolución de los diseños y técnicas a lo largo de generaciones.',
    heroImage: 'DSC04160_ajbk7r',
    gallery: [
      'DSC04174_gnacgl',
      'DSC04177_tcgwam',
      'DSC04185_rgqgug',
      'DSC04192_yvloo0',
      'DSC04193_obgcum',
      'DSC04200_h0ije3',
    ],
    highlights: [
      'Visita a la cofradía de Maximón (Rilaj Mam)',
      'Mercado indígena auténtico (martes, viernes, domingos)',
      'Iglesia del siglo XVI con retablo maya-colonial',
      'Centro Cultural Cojolya de textiles tz\'utujiles',
      'Tocado ceremonial de mujeres santiagueñas',
      'El pueblo más grande y culturalmente rico del lago',
    ],
    activities: [
      'Visita guiada a la cofradía de Maximón',
      'Recorrido por el mercado indígena',
      'Tour histórico por la iglesia colonial',
      'Visita al Centro Cultural Cojolya',
      'Taller de textiles tz\'utujiles',
      'Almuerzo típico con familia local',
    ],
    travelTime: '30-35 minutos en lancha',
    bestTime: 'Todo el año; mercado principal: viernes y domingos',
  },
  {
    slug: 'santa-catarina-palopo',
    name: 'Santa Catarina Palopó',
    subtitle: 'El pueblo pintado de colores junto al lago',
    description:
      'Santa Catarina Palopó es uno de los pueblos más fotogénicos del Lago de Atitlán, famoso por su proyecto de arte comunitario que transformó las fachadas de sus casas en un mosaico de colores vibrantes inspirados en los diseños de los huipiles tradicionales kaqchikeles. Este pequeño pueblo, ubicado a solo 4 kilómetros de Panajachel, se ha convertido en uno de los destinos más instagrameables de toda Guatemala. El proyecto "Pintando Santa Catarina" fue iniciado en 2016 y ha revitalizado la economía local atrayendo visitantes que recorren sus calles empinadas admirando los patrones geométricos que adornan cada edificio. Los colores azules, rojos, verdes y amarillos reflejan los tonos del lago, los volcanes y los textiles mayas, creando una experiencia visual incomparable. Más allá de la pintura, Santa Catarina Palopó es un pueblo kaqchikel donde las mujeres aún visten los huipiles tradicionales bordados a mano con diseños que representan la flora y fauna del lago. Las cooperativas textiles locales ofrecen talleres donde puedes aprender sobre el significado de cada símbolo y técnica de bordado. El pueblo cuenta con varios miradores naturales que ofrecen algunas de las mejores vistas del Lago de Atitlán y los volcanes. El camino hacia Santa Catarina desde Panajachel, ya sea en tuk-tuk o caminando, ofrece panorámicas espectaculares del lago. La gastronomía local incluye pescado fresco del lago preparado con recetas tradicionales y restaurantes con terrazas que miran directamente al agua turquesa. Santa Catarina también alberga algunos de los hoteles boutique más exclusivos de la región, perfectos para quienes buscan lujo con vistas incomparables.',
    heroImage: 'DSC04369_mpx3ng',
    gallery: [
      'DSC04374_rdep9d',
      'DSC04381_ro3yne',
      'DSC04387_zcq91s',
      'DSC04401_isltck',
      'DSC04406_cwmb3x',
      'DSC04414_ziuyjw',
    ],
    highlights: [
      'Casas pintadas con diseños de huipiles kaqchikeles',
      'Uno de los pueblos más fotogénicos de Guatemala',
      'Cooperativas textiles con bordados tradicionales',
      'Miradores con vistas panorámicas al lago',
      'A solo 4 km de Panajachel (accesible en tuk-tuk)',
      'Hoteles boutique exclusivos con vistas al lago',
    ],
    activities: [
      'Recorrido fotográfico por las calles pintadas',
      'Taller de bordado kaqchikel',
      'Visita a cooperativas textiles',
      'Almuerzo con vista al lago',
      'Caminata escénica desde Panajachel',
      'Sesión de fotos en miradores naturales',
    ],
    travelTime: '10 minutos en tuk-tuk o 30 min caminando',
    bestTime: 'Todo el año; mañanas para mejor luz fotográfica',
  },
  {
    slug: 'san-antonio-palopo',
    name: 'San Antonio Palopó',
    subtitle: 'Tradición cerámica y textil a orillas del lago',
    description:
      'San Antonio Palopó es un pueblo kaqchikel ubicado en la orilla este del Lago de Atitlán, reconocido por sus tradiciones cerámicas ancestrales y sus textiles de diseño único. A diferencia de otros pueblos del lago que han adoptado un perfil más turístico, San Antonio mantiene una autenticidad que permite a los visitantes experimentar la vida cotidiana de una comunidad maya de manera genuina y respetuosa. El pueblo es famoso por su cerámica pintada a mano, una tradición que se remonta a la época precolombina. Los talleres familiares producen desde utensilios de cocina hasta piezas decorativas con diseños que reflejan la cosmovisión maya y los elementos naturales del lago. Observar a los artesanos trabajar el barro con técnicas transmitidas de generación en generación es una ventana a la historia viva de Guatemala. Los hombres de San Antonio Palopó son de los pocos en el altiplano que aún visten el traje tradicional masculino kaqchikel: una camisa tejida a rayas azules y blancas y un pantalón de lana oscura. Las mujeres lucen huipiles bordados con motivos geométricos en tonos azules que representan el agua del lago y los cielos del altiplano. El mercado semanal de San Antonio es una experiencia auténtica donde la comunidad intercambia productos agrícolas, cerámica y textiles sin la presencia masiva de turistas. Las terrazas agrícolas que rodean el pueblo, cultivadas con cebolla, anís y hierbas aromáticas, crean un paisaje escalonado de tonos verdes que desciende hasta el lago. La iglesia colonial del pueblo, con su fachada blanca y campanario visible desde el lago, es un punto de referencia arquitectónico que domina el paisaje. Los alrededores de San Antonio ofrecen caminatas tranquilas con vistas excepcionales del lago y los volcanes, lejos de las multitudes turísticas.',
    heroImage: 'DSC04496_noiz4x',
    gallery: [
      'DSC04440_r9skha',
      'DSC04444_uppybw',
      'DSC04451_gbforf',
      'DSC04466_mxfzds',
      'DSC04490_eqqgtz',
    ],
    highlights: [
      'Cerámica pintada a mano con técnicas precolombinas',
      'Hombres con traje tradicional kaqchikel (raro en Guatemala)',
      'Huipiles azules que representan el agua del lago',
      'Terrazas agrícolas escalonadas hasta el lago',
      'Mercado semanal auténtico sin turismo masivo',
      'Iglesia colonial visible desde el lago',
    ],
    activities: [
      'Visita a talleres de cerámica artesanal',
      'Recorrido por cooperativas textiles',
      'Caminata por terrazas agrícolas',
      'Visita a la iglesia colonial',
      'Compra directa de cerámica y textiles',
      'Almuerzo típico en comedor local',
    ],
    travelTime: '20 minutos en tuk-tuk desde Panajachel',
    bestTime: 'Todo el año; días de mercado para mayor actividad',
  },
];

export const getDestinationBySlug = (slug: string | undefined): Destination | null =>
  DESTINATIONS.find((d) => d.slug === slug) ?? null;
