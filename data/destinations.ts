export interface Destination {
  slug: string;
  name: string;
  subtitle: string;
  subtitle_en?: string;
  description: string;
  description_en?: string;
  heroImage: string;
  gallery: string[];
  highlights: string[];
  highlights_en?: string[];
  activities: string[];
  activities_en?: string[];
  travelTime: string;
  travelTime_en?: string;
  bestTime: string;
  bestTime_en?: string;
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'panajachel',
    name: 'Panajachel',
    subtitle: 'La puerta de entrada al Lago de Atitlán',
    subtitle_en: 'The gateway to Lake Atitlán',
    description:
      'Panajachel, conocido cariñosamente como "Pana", es el pueblo más visitado y cosmopolita del Lago de Atitlán. Ubicado en la orilla norte del lago, este vibrante destino combina la cultura maya tz\'utujil con una escena turística internacional que lo convierte en el punto de partida ideal para explorar toda la región. La famosa Calle Santander es el corazón comercial del pueblo, donde encontrarás una mezcla fascinante de tiendas de artesanías, restaurantes con cocina internacional y guatemalteca, cafeterías de especialidad y bares con música en vivo. Caminar por esta calle al atardecer, cuando los volcanes San Pedro y Tolimán se pintan de tonos dorados, es una experiencia que define la magia de Atitlán. El malecón de Panajachel ofrece vistas panorámicas incomparables del lago y los tres volcanes que lo rodean. Desde aquí parten las lanchas públicas y privadas hacia todos los pueblos del lago, convirtiendo a Pana en el centro logístico perfecto para tu aventura. La Reserva Natural Atitlán, ubicada a pocos minutos del centro, alberga senderos entre la selva, puentes colgantes, cascadas naturales y una impresionante diversidad de mariposas y aves. Para los amantes de la gastronomía, Panajachel ofrece desde pupusas callejeras hasta restaurantes gourmet con vistas al lago. No te pierdas el mercado local los domingos, donde la comunidad kaqchikel comercia frutas, verduras y textiles tradicionales en un ambiente auténtico y colorido.',
    description_en:
      'Panajachel, affectionately known as "Pana", is the most visited and cosmopolitan town on Lake Atitlán. Located on the northern shore of the lake, this vibrant destination blends Tz\'utujil Maya culture with an international tourism scene that makes it the ideal starting point for exploring the entire region. The famous Calle Santander is the commercial heart of town, where you\'ll find a fascinating mix of handicraft shops, restaurants serving both international and Guatemalan cuisine, specialty coffee houses and live music bars. Walking down this street at sunset, when the San Pedro and Tolimán volcanoes glow golden, is an experience that defines the magic of Atitlán. The Panajachel boardwalk offers unparalleled panoramic views of the lake and the three volcanoes that surround it. Public and private boats depart from here to all the lakeside villages, making Pana the perfect logistics hub for your adventure. The Atitlán Natural Reserve, located just minutes from the center, features jungle trails, hanging bridges, natural waterfalls and an impressive diversity of butterflies and birds. For food lovers, Panajachel offers everything from street pupusas to gourmet restaurants with lake views. Don\'t miss the Sunday local market, where the Kaqchikel community trades fresh fruits, vegetables and traditional textiles in an authentic and colorful atmosphere.',
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
    highlights_en: [
      'Calle Santander: shopping, dining and nightlife',
      'Boardwalk with panoramic views of all 3 volcanoes',
      'Atitlán Natural Reserve with hanging bridges and waterfalls',
      'Departure point for boats to all lakeside villages',
      'Sunday local market with Kaqchikel products',
      'Wide range of accommodations for every budget',
    ],
    activities: [
      'Paseos en lancha privada por el lago',
      'Kayak y paddleboard al atardecer',
      'Recorrido gastronómico por Calle Santander',
      'Senderismo en la Reserva Natural Atitlán',
      'Compras de artesanías y textiles mayas',
      'Tour de atardecer en lancha',
    ],
    activities_en: [
      'Private boat rides on the lake',
      'Sunset kayaking and paddleboarding',
      'Food tour along Calle Santander',
      'Hiking at the Atitlán Natural Reserve',
      'Shopping for handicrafts and Mayan textiles',
      'Sunset boat tour',
    ],
    travelTime: 'Punto de partida',
    travelTime_en: 'Starting point',
    bestTime: 'Todo el año, especialmente noviembre a abril',
    bestTime_en: 'Year-round, especially November to April',
  },
  {
    slug: 'san-pedro-la-laguna',
    name: 'San Pedro La Laguna',
    subtitle: 'El pueblo bohemio al pie del volcán',
    subtitle_en: 'The bohemian village at the foot of the volcano',
    description:
      'San Pedro La Laguna es el destino favorito de viajeros independientes, mochileros y espíritus libres que buscan una experiencia auténtica en el Lago de Atitlán. Ubicado al pie del imponente Volcán San Pedro (3,020 metros sobre el nivel del mar), este pueblo tz\'utujil combina una vibrante escena bohemia con tradiciones mayas profundamente arraigadas. Las calles empedradas de San Pedro están llenas de cafeterías artesanales, escuelas de español, estudios de yoga y pequeños restaurantes que sirven desde comida típica guatemalteca hasta cocina vegana internacional. El ambiente es relajado y multicultural, con una comunidad de expatriados que se mezcla armoniosamente con la población local maya tz\'utujil. La principal atracción de aventura es el ascenso al Volcán San Pedro, una caminata desafiante de 4-5 horas que recompensa con vistas espectaculares del lago, los volcanes circundantes y, en días claros, hasta el Océano Pacífico. Se recomienda iniciar la caminata antes del amanecer para disfrutar del espectáculo de luz sobre el lago. El mirador de la Nariz del Indio (Indian Nose), accesible desde San Pedro, es otro punto icónico para ver el amanecer sobre el Lago de Atitlán. San Pedro también es conocido por su escena artística, con murales coloridos que adornan las fachadas de las casas y galerías de arte local. Los fines de semana, el pueblo cobra vida con música en vivo y eventos culturales que atraen visitantes de todo el lago.',
    description_en:
      'San Pedro La Laguna is the favorite destination for independent travelers, backpackers and free spirits seeking an authentic experience on Lake Atitlán. Located at the foot of the imposing San Pedro Volcano (3,020 meters above sea level), this Tz\'utujil village blends a vibrant bohemian scene with deeply rooted Mayan traditions. The cobblestone streets of San Pedro are lined with artisan coffee shops, Spanish schools, yoga studios and small restaurants serving everything from traditional Guatemalan food to international vegan cuisine. The atmosphere is relaxed and multicultural, with an expat community that blends harmoniously with the local Tz\'utujil Maya population. The main adventure attraction is the ascent of San Pedro Volcano, a challenging 4-5 hour hike rewarded with spectacular views of the lake, surrounding volcanoes and, on clear days, all the way to the Pacific Ocean. It\'s recommended to start the hike before dawn to enjoy the light show over the lake. The Indian Nose viewpoint, accessible from San Pedro, is another iconic spot for watching the sunrise over Lake Atitlán. San Pedro is also known for its art scene, with colorful murals adorning house facades and local art galleries. On weekends, the village comes alive with live music and cultural events that attract visitors from around the lake.',
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
    highlights_en: [
      'San Pedro Volcano: hike with Pacific Ocean views',
      'Indian Nose viewpoint for epic sunrises',
      'Bohemian scene with cafés, yoga and street art',
      'Internationally recognized Spanish schools',
      'Living and authentic Tz\'utujil culture',
      'Relaxed nightlife with live music',
    ],
    activities: [
      'Ascenso al Volcán San Pedro (3,020 m)',
      'Amanecer en Indian Nose',
      'Clases de español inmersivas',
      'Yoga y meditación con vista al lago',
      'Recorrido de murales y arte callejero',
      'Kayak desde el muelle de San Pedro',
    ],
    activities_en: [
      'San Pedro Volcano ascent (3,020 m)',
      'Sunrise at Indian Nose',
      'Immersive Spanish classes',
      'Yoga and meditation with lake views',
      'Mural and street art tour',
      'Kayaking from the San Pedro dock',
    ],
    travelTime: '20-25 minutos en lancha',
    travelTime_en: '20-25 minutes by boat',
    bestTime: 'Todo el año; ascensos al volcán de nov a abril',
    bestTime_en: 'Year-round; volcano hikes from Nov to Apr',
  },
  {
    slug: 'san-juan-la-laguna',
    name: 'San Juan La Laguna',
    subtitle: 'Capital del arte y los textiles mayas',
    subtitle_en: 'Capital of Mayan art and textiles',
    description:
      'San Juan La Laguna es una joya cultural del Lago de Atitlán, reconocido como el pueblo más artístico y organizado de la región. Este pequeño pero fascinante destino tz\'utujil ha logrado preservar sus tradiciones ancestrales mientras desarrolla un modelo de turismo comunitario que es ejemplo en toda Centroamérica. Las calles de San Juan están decoradas con impresionantes murales que cuentan la historia y cosmología maya, creando una galería de arte al aire libre que sorprende a cada paso. El pueblo es famoso por sus cooperativas de mujeres tejedoras que mantienen vivas las técnicas ancestrales de tejido en telar de cintura, utilizando tintes naturales extraídos de plantas, insectos y minerales locales. Visitar estos talleres es una experiencia transformadora donde puedes aprender el proceso completo, desde la recolección de plantas para tintes hasta la creación de complejos diseños que representan símbolos sagrados mayas. La cooperativa de café orgánico de San Juan produce algunos de los mejores granos de la región volcánica de Atitlán. Los tours de café te llevan desde la plantación hasta la taza, explicando cada etapa del proceso con pasión y conocimiento ancestral. La miel de abejas nativas sin aguijón (meliponas) es otro producto artesanal único que solo encontrarás aquí. San Juan también ofrece excelentes miradores naturales con vistas al lago y senderos ecológicos que atraviesan bosques de café y aguacate. La gastronomía local destaca por su uso de ingredientes orgánicos y recetas tradicionales mayas preparadas con técnicas contemporáneas.',
    description_en:
      'San Juan La Laguna is a cultural gem of Lake Atitlán, recognized as the most artistic and well-organized village in the region. This small but fascinating Tz\'utujil destination has managed to preserve its ancestral traditions while developing a community tourism model that serves as an example throughout Central America. The streets of San Juan are decorated with stunning murals that tell the story and cosmology of the Maya, creating an open-air art gallery that surprises at every turn. The village is famous for its women weavers\' cooperatives that keep alive the ancestral techniques of backstrap loom weaving, using natural dyes extracted from local plants, insects and minerals. Visiting these workshops is a transformative experience where you can learn the complete process, from collecting plants for dyes to creating complex designs representing sacred Mayan symbols. San Juan\'s organic coffee cooperative produces some of the finest beans in the volcanic Atitlán region. Coffee tours take you from plantation to cup, explaining each stage of the process with passion and ancestral knowledge. Honey from native stingless bees (meliponas) is another unique artisan product you\'ll only find here. San Juan also offers excellent natural viewpoints with lake views and ecological trails that wind through coffee and avocado groves. The local cuisine stands out for its use of organic ingredients and traditional Mayan recipes prepared with contemporary techniques.',
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
    highlights_en: [
      'Textile cooperatives with natural dyes',
      'Artistic murals depicting Mayan cosmology',
      'Organic coffee tour from seed to cup',
      'Melipona stingless bee honey',
      'Exemplary community tourism model',
      'Local cuisine with organic ingredients',
    ],
    activities: [
      'Taller de tejido con tintes naturales',
      'Tour de café orgánico en finca local',
      'Recorrido de murales y galerías de arte',
      'Degustación de miel de abejas meliponas',
      'Caminata por senderos ecológicos',
      'Visita a cooperativas de mujeres artesanas',
    ],
    activities_en: [
      'Natural dye weaving workshop',
      'Organic coffee tour at a local farm',
      'Mural and art gallery tour',
      'Melipona bee honey tasting',
      'Hike along ecological trails',
      'Visit to women artisan cooperatives',
    ],
    travelTime: '25-30 minutos en lancha',
    travelTime_en: '25-30 minutes by boat',
    bestTime: 'Todo el año; talleres disponibles lunes a sábado',
    bestTime_en: 'Year-round; workshops available Monday to Saturday',
  },
  {
    slug: 'santiago-atitlan',
    name: 'Santiago Atitlán',
    subtitle: 'Corazón de la cultura tz\'utujil',
    subtitle_en: 'Heart of Tz\'utujil culture',
    description:
      'Santiago Atitlán es el pueblo más grande e históricamente significativo del Lago de Atitlán, hogar de la cultura maya tz\'utujil que ha resistido siglos de cambio manteniendo sus tradiciones, idioma y cosmovisión vivos hasta el día de hoy. Ubicado entre los volcanes Tolimán y San Pedro, Santiago ofrece una inmersión cultural profunda que va más allá del turismo convencional. El pueblo es famoso mundialmente por ser el hogar de Maximón (también conocido como Rilaj Mam), una deidad sincrética que combina elementos de la espiritualidad maya con el catolicismo colonial. Visitar la cofradía donde se venera a Maximón es una experiencia única que revela la complejidad y riqueza del sincretismo religioso guatemalteco. La ceremonia cambia de ubicación cada año, y los guías locales te conducen hasta el altar decorado con ofrendas de tabaco, alcohol y flores. El mercado de Santiago Atitlán es uno de los más auténticos y vibrantes del altiplano guatemalteco. Los días de mercado (especialmente martes, viernes y domingos), las calles se llenan de vendedores que ofrecen frutas tropicales, vegetales de la milpa, textiles bordados a mano y el característico tocado ceremonial de las mujeres santiagueñas, una faja roja enrollada en la cabeza que simboliza la serpiente emplumada. La iglesia de Santiago Apóstol, construida en el siglo XVI, alberga un retablo tallado que muestra la fusión del arte colonial español con la iconografía maya. El Centro Cultural Cojolya documenta y preserva el arte textil tz\'utujil, mostrando la evolución de los diseños y técnicas a lo largo de generaciones.',
    description_en:
      'Santiago Atitlán is the largest and most historically significant town on Lake Atitlán, home to the Tz\'utujil Maya culture that has withstood centuries of change while keeping its traditions, language and worldview alive to this day. Nestled between the Tolimán and San Pedro volcanoes, Santiago offers a deep cultural immersion that goes beyond conventional tourism. The town is world-famous as the home of Maximón (also known as Rilaj Mam), a syncretic deity that combines elements of Mayan spirituality with colonial Catholicism. Visiting the cofradía where Maximón is venerated is a unique experience that reveals the complexity and richness of Guatemalan religious syncretism. The ceremony changes location each year, and local guides lead you to the altar adorned with offerings of tobacco, alcohol and flowers. The Santiago Atitlán market is one of the most authentic and vibrant in the Guatemalan highlands. On market days (especially Tuesday, Friday and Sunday), the streets fill with vendors offering tropical fruits, milpa vegetables, hand-embroidered textiles and the distinctive ceremonial headdress of Santiago women -- a red sash wrapped around the head symbolizing the feathered serpent. The Santiago Apóstol church, built in the 16th century, houses a carved altarpiece that showcases the fusion of Spanish colonial art with Mayan iconography. The Cojolya Cultural Center documents and preserves Tz\'utujil textile art, displaying the evolution of designs and techniques across generations.',
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
    highlights_en: [
      'Visit to the Maximón cofradía (Rilaj Mam)',
      'Authentic indigenous market (Tue, Fri, Sun)',
      '16th-century church with Maya-colonial altarpiece',
      'Cojolya Cultural Center for Tz\'utujil textiles',
      'Ceremonial headdress of Santiago women',
      'The largest and most culturally rich village on the lake',
    ],
    activities: [
      'Visita guiada a la cofradía de Maximón',
      'Recorrido por el mercado indígena',
      'Tour histórico por la iglesia colonial',
      'Visita al Centro Cultural Cojolya',
      'Taller de textiles tz\'utujiles',
      'Almuerzo típico con familia local',
    ],
    activities_en: [
      'Guided visit to the Maximón cofradía',
      'Tour of the indigenous market',
      'Historical tour of the colonial church',
      'Visit to the Cojolya Cultural Center',
      'Tz\'utujil textile workshop',
      'Traditional lunch with a local family',
    ],
    travelTime: '30-35 minutos en lancha',
    travelTime_en: '30-35 minutes by boat',
    bestTime: 'Todo el año; mercado principal: viernes y domingos',
    bestTime_en: 'Year-round; main market days: Fridays and Sundays',
  },
  {
    slug: 'santa-catarina-palopo',
    name: 'Santa Catarina Palopó',
    subtitle: 'El pueblo pintado de colores junto al lago',
    subtitle_en: 'The colorfully painted village by the lake',
    description:
      'Santa Catarina Palopó es uno de los pueblos más fotogénicos del Lago de Atitlán, famoso por su proyecto de arte comunitario que transformó las fachadas de sus casas en un mosaico de colores vibrantes inspirados en los diseños de los huipiles tradicionales kaqchikeles. Este pequeño pueblo, ubicado a solo 4 kilómetros de Panajachel, se ha convertido en uno de los destinos más instagrameables de toda Guatemala. El proyecto "Pintando Santa Catarina" fue iniciado en 2016 y ha revitalizado la economía local atrayendo visitantes que recorren sus calles empinadas admirando los patrones geométricos que adornan cada edificio. Los colores azules, rojos, verdes y amarillos reflejan los tonos del lago, los volcanes y los textiles mayas, creando una experiencia visual incomparable. Más allá de la pintura, Santa Catarina Palopó es un pueblo kaqchikel donde las mujeres aún visten los huipiles tradicionales bordados a mano con diseños que representan la flora y fauna del lago. Las cooperativas textiles locales ofrecen talleres donde puedes aprender sobre el significado de cada símbolo y técnica de bordado. El pueblo cuenta con varios miradores naturales que ofrecen algunas de las mejores vistas del Lago de Atitlán y los volcanes. El camino hacia Santa Catarina desde Panajachel, ya sea en tuk-tuk o caminando, ofrece panorámicas espectaculares del lago. La gastronomía local incluye pescado fresco del lago preparado con recetas tradicionales y restaurantes con terrazas que miran directamente al agua turquesa. Santa Catarina también alberga algunos de los hoteles boutique más exclusivos de la región, perfectos para quienes buscan lujo con vistas incomparables.',
    description_en:
      'Santa Catarina Palopó is one of the most photogenic villages on Lake Atitlán, famous for its community art project that transformed house facades into a mosaic of vibrant colors inspired by the designs of traditional Kaqchikel huipiles. This small village, located just 4 kilometers from Panajachel, has become one of the most Instagrammable destinations in all of Guatemala. The "Painting Santa Catarina" project was launched in 2016 and has revitalized the local economy by attracting visitors who stroll its steep streets admiring the geometric patterns adorning every building. The blues, reds, greens and yellows reflect the tones of the lake, the volcanoes and Mayan textiles, creating an unmatched visual experience. Beyond the paint, Santa Catarina Palopó is a Kaqchikel village where women still wear traditional huipiles hand-embroidered with designs representing the flora and fauna of the lake. Local textile cooperatives offer workshops where you can learn about the meaning of each symbol and embroidery technique. The village boasts several natural viewpoints offering some of the best views of Lake Atitlán and its volcanoes. The route to Santa Catarina from Panajachel, whether by tuk-tuk or on foot, delivers spectacular lake panoramas. The local cuisine features fresh lake fish prepared with traditional recipes and restaurants with terraces looking directly onto the turquoise water. Santa Catarina also hosts some of the most exclusive boutique hotels in the region, perfect for those seeking luxury with incomparable views.',
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
    highlights_en: [
      'Houses painted with Kaqchikel huipil designs',
      'One of the most photogenic villages in Guatemala',
      'Textile cooperatives with traditional embroidery',
      'Viewpoints with panoramic lake views',
      'Just 4 km from Panajachel (accessible by tuk-tuk)',
      'Exclusive boutique hotels with lake views',
    ],
    activities: [
      'Recorrido fotográfico por las calles pintadas',
      'Taller de bordado kaqchikel',
      'Visita a cooperativas textiles',
      'Almuerzo con vista al lago',
      'Caminata escénica desde Panajachel',
      'Sesión de fotos en miradores naturales',
    ],
    activities_en: [
      'Photo tour through the painted streets',
      'Kaqchikel embroidery workshop',
      'Visit to textile cooperatives',
      'Lunch with lake views',
      'Scenic walk from Panajachel',
      'Photo session at natural viewpoints',
    ],
    travelTime: '10 minutos en tuk-tuk o 30 min caminando',
    travelTime_en: '10 minutes by tuk-tuk or 30 min walking',
    bestTime: 'Todo el año; mañanas para mejor luz fotográfica',
    bestTime_en: 'Year-round; mornings for best photographic light',
  },
  {
    slug: 'san-antonio-palopo',
    name: 'San Antonio Palopó',
    subtitle: 'Tradición cerámica y textil a orillas del lago',
    subtitle_en: 'Ceramic and textile tradition on the lakeshore',
    description:
      'San Antonio Palopó es un pueblo kaqchikel ubicado en la orilla este del Lago de Atitlán, reconocido por sus tradiciones cerámicas ancestrales y sus textiles de diseño único. A diferencia de otros pueblos del lago que han adoptado un perfil más turístico, San Antonio mantiene una autenticidad que permite a los visitantes experimentar la vida cotidiana de una comunidad maya de manera genuina y respetuosa. El pueblo es famoso por su cerámica pintada a mano, una tradición que se remonta a la época precolombina. Los talleres familiares producen desde utensilios de cocina hasta piezas decorativas con diseños que reflejan la cosmovisión maya y los elementos naturales del lago. Observar a los artesanos trabajar el barro con técnicas transmitidas de generación en generación es una ventana a la historia viva de Guatemala. Los hombres de San Antonio Palopó son de los pocos en el altiplano que aún visten el traje tradicional masculino kaqchikel: una camisa tejida a rayas azules y blancas y un pantalón de lana oscura. Las mujeres lucen huipiles bordados con motivos geométricos en tonos azules que representan el agua del lago y los cielos del altiplano. El mercado semanal de San Antonio es una experiencia auténtica donde la comunidad intercambia productos agrícolas, cerámica y textiles sin la presencia masiva de turistas. Las terrazas agrícolas que rodean el pueblo, cultivadas con cebolla, anís y hierbas aromáticas, crean un paisaje escalonado de tonos verdes que desciende hasta el lago. La iglesia colonial del pueblo, con su fachada blanca y campanario visible desde el lago, es un punto de referencia arquitectónico que domina el paisaje. Los alrededores de San Antonio ofrecen caminatas tranquilas con vistas excepcionales del lago y los volcanes, lejos de las multitudes turísticas.',
    description_en:
      'San Antonio Palopó is a Kaqchikel village located on the eastern shore of Lake Atitlán, renowned for its ancestral ceramic traditions and uniquely designed textiles. Unlike other lakeside villages that have adopted a more touristic profile, San Antonio maintains an authenticity that allows visitors to experience the daily life of a Mayan community in a genuine and respectful way. The village is famous for its hand-painted ceramics, a tradition dating back to pre-Columbian times. Family workshops produce everything from kitchen utensils to decorative pieces with designs reflecting the Mayan worldview and the natural elements of the lake. Watching artisans work the clay with techniques passed down through generations is a window into the living history of Guatemala. The men of San Antonio Palopó are among the few in the highlands who still wear the traditional Kaqchikel male outfit: a blue-and-white striped woven shirt and dark wool trousers. Women wear huipiles embroidered with geometric motifs in blue tones representing the lake water and highland skies. San Antonio\'s weekly market is an authentic experience where the community trades agricultural products, ceramics and textiles without the massive presence of tourists. The agricultural terraces surrounding the village, cultivated with onions, anise and aromatic herbs, create a stepped landscape of green tones descending down to the lake. The village\'s colonial church, with its white facade and bell tower visible from the lake, is an architectural landmark that dominates the landscape. The surroundings of San Antonio offer peaceful hikes with exceptional views of the lake and volcanoes, far from the tourist crowds.',
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
    highlights_en: [
      'Hand-painted ceramics with pre-Columbian techniques',
      'Men in traditional Kaqchikel attire (rare in Guatemala)',
      'Blue huipiles representing the lake water',
      'Terraced farmland stepping down to the lake',
      'Authentic weekly market without mass tourism',
      'Colonial church visible from the lake',
    ],
    activities: [
      'Visita a talleres de cerámica artesanal',
      'Recorrido por cooperativas textiles',
      'Caminata por terrazas agrícolas',
      'Visita a la iglesia colonial',
      'Compra directa de cerámica y textiles',
      'Almuerzo típico en comedor local',
    ],
    activities_en: [
      'Visit to artisan ceramic workshops',
      'Tour of textile cooperatives',
      'Walk through agricultural terraces',
      'Visit to the colonial church',
      'Direct purchase of ceramics and textiles',
      'Traditional lunch at a local eatery',
    ],
    travelTime: '20 minutos en tuk-tuk desde Panajachel',
    travelTime_en: '20 minutes by tuk-tuk from Panajachel',
    bestTime: 'Todo el año; días de mercado para mayor actividad',
    bestTime_en: 'Year-round; market days for more activity',
  },
];

export const getDestinationBySlug = (slug: string | undefined): Destination | null =>
  DESTINATIONS.find((d) => d.slug === slug) ?? null;
