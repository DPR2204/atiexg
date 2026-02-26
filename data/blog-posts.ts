export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  publishedAt: string;
  readTime: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'que-hacer-lago-atitlan',
    title: 'Que Hacer en el Lago de Atitlan: Guia Completa 2026',
    excerpt:
      'Descubre todas las actividades, tours y experiencias que puedes disfrutar en el Lago de Atitlan, Guatemala. Desde lanchas privadas hasta volcanes, cultura maya y gastronomia local.',
    image: 'DSC04094_vht4pi',
    category: 'Guias',
    publishedAt: '2026-01-15',
    readTime: '12 min',
    content: `
      <p class="text-lg text-gray-600 leading-relaxed mb-6">El Lago de Atitlan, descrito por Aldous Huxley como "el lago mas bello del mundo", es mucho mas que un destino turistico: es una experiencia que transforma. Rodeado por tres volcanes majestuosos y doce pueblos mayas con culturas vivas, este lago de origen volcanico ofrece una combinacion unica de naturaleza, aventura, cultura y gastronomia que no encontraras en ningun otro lugar del planeta.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Tours en Lancha: La Mejor Forma de Explorar el Lago</h2>
      <p class="text-gray-600 leading-relaxed mb-4">La forma mas iconoca de recorrer el Lago de Atitlan es en lancha. Desde Panajachel, puedes tomar lanchas publicas hacia los principales pueblos o, para una experiencia premium, contratar una lancha privada que te permita crear tu propio itinerario. Las lanchas privadas de Atitlan Experiences incluyen capitan certificado, cooler con bebidas y la flexibilidad de detenerte donde quieras.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Los recorridos mas populares incluyen la ruta de tres pueblos (San Juan La Laguna, San Pedro La Laguna y Santiago Atitlan), ideal para quienes quieren conocer la diversidad cultural del lago en un solo dia. Para los romanticos, el tour de atardecer en lancha ofrece vistas espectaculares mientras el sol se oculta detras del Volcan San Pedro.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Aventura y Naturaleza</h2>
      <p class="text-gray-600 leading-relaxed mb-4">El Lago de Atitlan es un paraiso para los amantes de la aventura. El ascenso al Volcan San Pedro (3,020 msnm) es una de las caminatas mas gratificantes de Guatemala, con vistas que se extienden hasta el Oceano Pacifico en dias claros. Para quienes buscan algo mas accesible, el mirador de Indian Nose ofrece amaneceres espectaculares con solo una hora de caminata.</p>
      <p class="text-gray-600 leading-relaxed mb-4">El kayak y el paddleboard son actividades perfectas para las mananas tranquilas, cuando el lago esta en calma y los reflejos de los volcanes se pintan sobre el agua cristalina. La Reserva Natural Atitlan en Panajachel combina senderos en la selva con puentes colgantes, cascadas y un mariposario que alberga decenas de especies.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Cultura Maya Viva</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Lo que hace verdaderamente unico al Lago de Atitlan es la presencia de comunidades mayas que mantienen vivas sus tradiciones milenarias. En San Juan La Laguna, las cooperativas de mujeres tejedoras utilizan tintes naturales para crear textiles con tecnicas ancestrales. En Santiago Atitlan, la visita a la cofradia de Maximon revela el fascinante sincretismo religioso guatemalteco.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Cada pueblo tiene su propia identidad cultural, idioma y tradiciones. Los kaqchikeles de Santa Catarina y San Antonio Palopo, los tz'utujiles de San Pedro, San Juan y Santiago, cada grupo etnico aporta una riqueza cultural que convierte al lago en un mosaico viviente de la civilizacion maya.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Gastronomia del Lago</h2>
      <p class="text-gray-600 leading-relaxed mb-4">La escena gastronomica del Lago de Atitlan ha evolucionado enormemente en los ultimos anos. Panajachel lidera con restaurantes que fusionan cocina guatemalteca con tecnicas internacionales, mientras que San Pedro ofrece opciones para todos los gustos, desde comida tipica hasta cocina vegana gourmet. Los tours gastronomicos de Atitlan Experiences te llevan a descubrir los mejores sabores del lago, incluyendo degustaciones de cafe organico, chocolate artesanal y platillos tradicionales mayas.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Consejos Practicos para Tu Visita</h2>
      <ul class="list-disc list-inside text-gray-600 space-y-2 mb-6">
        <li><strong>Mejor epoca:</strong> Noviembre a abril (temporada seca), aunque el lago es hermoso todo el ano.</li>
        <li><strong>Como llegar:</strong> Desde Ciudad de Guatemala, aproximadamente 3 horas por carretera. Desde Antigua Guatemala, 2.5 horas.</li>
        <li><strong>Transporte local:</strong> Lanchas publicas conectan todos los pueblos. Para mayor comodidad, reserva lanchas privadas.</li>
        <li><strong>Moneda:</strong> Quetzal guatemalteco (GTQ). Se aceptan dolares en la mayoria de establecimientos turisticos.</li>
        <li><strong>Clima:</strong> Primavera eterna con temperaturas entre 15-25 grados centigrados. Lleva siempre un sueter para las noches.</li>
      </ul>

      <p class="text-gray-600 leading-relaxed mb-4">El Lago de Atitlan no es un destino que se visite una sola vez. Cada visita revela nuevas capas de belleza, cultura y conexion humana. Ya sea que busques aventura, relajacion, inmersion cultural o simplemente las mejores vistas de tu vida, Atitlan tiene algo especial esperandote.</p>
    `,
  },
  {
    slug: 'que-hacer-en-panajachel',
    title: 'Que Hacer en Panajachel: 15 Actividades Imperdibles',
    excerpt:
      'Panajachel es el punto de partida perfecto para explorar el Lago de Atitlan. Conoce las 15 mejores actividades, desde tours en lancha hasta gastronomia y cultura maya.',
    image: 'DSC03855_rixhas',
    category: 'Guias',
    publishedAt: '2026-02-01',
    readTime: '10 min',
    content: `
      <p class="text-lg text-gray-600 leading-relaxed mb-6">Panajachel, o simplemente "Pana" como le dicen los locales y viajeros frecuentes, es mucho mas que el punto de entrada al Lago de Atitlan. Este pueblo cosmopolita ofrece una mezcla unica de cultura maya, vida nocturna, gastronomia internacional y acceso directo a las aguas mas hermosas de Centroamerica. Aqui te presentamos las 15 actividades imperdibles que debes hacer en tu visita.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">1. Paseo en Lancha Privada por el Lago</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Sin duda la actividad numero uno. Una lancha privada te permite explorar el lago a tu ritmo, detenerte en los pueblos que mas te llamen la atencion y disfrutar de vistas que solo son posibles desde el agua. Los tours de Atitlan Experiences incluyen capitan local, bebidas y itinerario personalizado.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">2. Recorrer la Calle Santander</h2>
      <p class="text-gray-600 leading-relaxed mb-4">La arteria principal de Panajachel es un desfile de colores, sabores y sonidos. Desde tiendas de jade y textiles mayas hasta restaurantes con terraza y bares de musica en vivo, Calle Santander es perfecta para pasear al atardecer.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">3. Atardecer desde el Malecon</h2>
      <p class="text-gray-600 leading-relaxed mb-4">El malecon de Panajachel ofrece una de las mejores vistas del Lago de Atitlan. Ver el sol ocultarse detras del Volcan San Pedro mientras los colores del cielo se reflejan en el agua es un espectaculo que nunca se repite igual.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">4. Kayak al Amanecer</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Las mananas en el lago son magicas. El agua esta en calma perfecta y los volcanes se reflejan como en un espejo. Alquilar un kayak o paddleboard en Panajachel es facil y accesible para todos los niveles.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">5. Reserva Natural Atitlan</h2>
      <p class="text-gray-600 leading-relaxed mb-4">A pocos minutos del centro, esta reserva ofrece senderos en la selva, puentes colgantes sobre canones, cascadas naturales, un mariposario y ziplines. Perfecta para una manana de conexion con la naturaleza.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">6. Tour Gastronomico</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Panajachel tiene una escena culinaria sorprendente. Desde pupusas y tamales en el mercado local hasta restaurantes gourmet con vista al lago, un tour gastronomico te revela sabores que no encontraras en ninguna guia turistica.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">7. Mercado Local los Domingos</h2>
      <p class="text-gray-600 leading-relaxed mb-4">El mercado dominical de Panajachel es donde la comunidad kaqchikel se reune para intercambiar productos frescos, textiles y productos artesanales. Es una experiencia autentica lejos del circuito turistico convencional.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">8. Visitar San Juan La Laguna</h2>
      <p class="text-gray-600 leading-relaxed mb-4">A 25 minutos en lancha, San Juan es el pueblo mas artistico del lago. Murales, cooperativas de textiles con tintes naturales, tours de cafe organico y miel de abejas meliponas te esperan.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">9. Conocer a Maximon en Santiago</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Santiago Atitlan alberga a Maximon, una deidad sincrética unica en el mundo. Visitar su cofradia es sumergirte en el sincretismo religioso guatemalteco mas fascinante.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">10. Santa Catarina Palopo: El Pueblo Pintado</h2>
      <p class="text-gray-600 leading-relaxed mb-4">A solo 10 minutos en tuk-tuk, este pueblo de casas pintadas con patrones de huipiles es el lugar mas fotogenico del lago. Perfecto para una visita de medio dia.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">11. Amanecer en Indian Nose</h2>
      <p class="text-gray-600 leading-relaxed mb-4">El mirador de la Nariz del Indio ofrece el amanecer mas espectacular de Guatemala. Una caminata de una hora antes del alba te recompensa con vistas que quitan el aliento.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">12. Comprar Artesanias Mayas</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Los textiles, la ceramica y el jade guatemalteco son souvenirs con alma. En Panajachel encontraras desde piezas economicas hasta obras de arte textil de coleccion.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">13. Yoga con Vista al Lago</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Varios centros en Panajachel y alrededores ofrecen clases de yoga, meditacion y retiros de bienestar con el lago y los volcanes como telon de fondo.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">14. Ceramica en San Antonio Palopo</h2>
      <p class="text-gray-600 leading-relaxed mb-4">A 20 minutos de Panajachel, San Antonio Palopo es conocido por su ceramica pintada a mano y sus textiles azules unicos. Los talleres familiares abren sus puertas a visitantes curiosos.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">15. Noche de Estrellas en el Lago</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Con minima contaminacion luminica, las noches en Atitlan revelan un cielo estrellado impresionante. Algunos tours nocturnos en lancha combinan astronomia con la magia del lago iluminado por la luna.</p>

      <p class="text-lg text-gray-600 leading-relaxed mt-8 mb-4">Panajachel es el campamento base perfecto para explorar todo lo que el Lago de Atitlan tiene para ofrecer. Con Atitlan Experiences, cada una de estas actividades se convierte en una experiencia premium con logistica impecable, guias locales y la flexibilidad de adaptar todo a tus preferencias.</p>
    `,
  },
  {
    slug: 'mejores-pueblos-lago-atitlan',
    title: 'Los Mejores Pueblos del Lago de Atitlan para Visitar',
    excerpt:
      'Conoce los pueblos mas fascinantes del Lago de Atitlan: desde el artistico San Juan La Laguna hasta el mistico Santiago Atitlan. Guia completa con que ver y como llegar.',
    image: 'DSC04177_tcgwam',
    category: 'Destinos',
    publishedAt: '2026-02-10',
    readTime: '8 min',
    content: `
      <p class="text-lg text-gray-600 leading-relaxed mb-6">El Lago de Atitlan esta rodeado por doce pueblos, cada uno con su propia identidad cultural, idioma y tradiciones. Elegir cuales visitar puede ser abrumador, especialmente si tienes tiempo limitado. Esta guia te ayudara a decidir cuales son los pueblos que mejor se adaptan a tus intereses, ya sea cultura, aventura, arte o gastronomia.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">San Juan La Laguna: Para los Amantes del Arte y la Cultura</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Si solo pudieras visitar un pueblo del lago, San Juan La Laguna deberia ser tu eleccion. Este pequeno pueblo tz'utujil ha logrado algo extraordinario: preservar sus tradiciones ancestrales mientras desarrolla un modelo de turismo comunitario que beneficia directamente a la poblacion local.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Las calles de San Juan son una galeria de arte al aire libre, con murales que narran la cosmologia maya y la historia del pueblo. Las cooperativas de mujeres tejedoras son el corazon del pueblo, donde puedes aprender sobre tintes naturales extraidos de plantas e insectos, y observar el proceso completo de creacion de un textil maya en telar de cintura.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>No te pierdas:</strong> El tour de cafe organico, la miel de abejas meliponas y los talleres de tintes naturales.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Santiago Atitlan: Para los Buscadores de Misterio y Tradicion</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Santiago es el pueblo mas grande del lago y el epicentro de la cultura tz'utujil. Aqui la tradicion no es un espectaculo para turistas, sino la vida cotidiana de miles de personas que mantienen viva una civilizacion milenaria.</p>
      <p class="text-gray-600 leading-relaxed mb-4">La visita a la cofradia de Maximon es imprescindible. Esta deidad sincrética, mezcla de espiritualidad maya y catolicismo colonial, es venerada en una ceremonia que cambia de ubicacion cada ano. El mercado de Santiago, especialmente los viernes y domingos, es uno de los mas autenticos del altiplano guatemalteco.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>No te pierdas:</strong> El Centro Cultural Cojolya, el mercado indigena y el retablo maya-colonial de la iglesia del siglo XVI.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">San Pedro La Laguna: Para los Espiritus Libres</h2>
      <p class="text-gray-600 leading-relaxed mb-4">San Pedro es el pueblo mas bohemio del lago, donde mochileros internacionales conviven con la comunidad tz'utujil en una atmosfera relajada y creativa. Los cafes artesanales, las escuelas de espanol y los estudios de yoga definen el caracter de este pueblo al pie del Volcan San Pedro.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Para los aventureros, el ascenso al Volcan San Pedro (3,020 msnm) es la actividad estrella. La caminata de 4-5 horas recompensa con vistas que se extienden hasta el Oceano Pacifico. Si prefieres algo mas accesible, Indian Nose ofrece amaneceres espectaculares con solo una hora de caminata.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>No te pierdas:</strong> El ascenso al volcan, los cafes artesanales y la vida nocturna con musica en vivo.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Santa Catarina Palopo: Para los Fotografos y Amantes del Color</h2>
      <p class="text-gray-600 leading-relaxed mb-4">A solo 4 kilometros de Panajachel, Santa Catarina Palopo se ha transformado en el pueblo mas fotogenico de Guatemala gracias al proyecto "Pintando Santa Catarina", que decoro las fachadas de las casas con patrones inspirados en los huipiles kaqchikeles.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Mas alla de las fotos, el pueblo ofrece cooperativas textiles donde puedes aprender sobre el bordado tradicional, miradores con vistas panoramicas y restaurantes con terraza frente al lago. Es una visita perfecta de medio dia desde Panajachel.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>No te pierdas:</strong> Las calles pintadas, los miradores naturales y un almuerzo con vista al lago.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">San Antonio Palopo: Para los que Buscan Autenticidad</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Si quieres escapar de las multitudes turisticas, San Antonio Palopo es tu destino. Este pueblo kaqchikel es famoso por su ceramica pintada a mano y por ser uno de los pocos lugares donde los hombres aun visten el traje tradicional masculino: camisas tejidas a rayas azules y blancas.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Los talleres de ceramica abren sus puertas a visitantes, y las terrazas agricolas que descienden hasta el lago crean un paisaje unico. El ambiente es tranquilo y autentico, perfecto para quienes buscan conexion genuina con la cultura maya.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>No te pierdas:</strong> Los talleres de ceramica, los textiles azules unicos y las terrazas agricolas.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Como Planificar Tu Recorrido</h2>
      <p class="text-gray-600 leading-relaxed mb-4">La forma mas eficiente de visitar multiples pueblos es con un tour organizado en lancha privada desde Panajachel. Atitlan Experiences ofrece itinerarios personalizados que te permiten combinar los pueblos segun tus intereses, con guias locales que enriquecen la experiencia con historias y contexto cultural.</p>
      <ul class="list-disc list-inside text-gray-600 space-y-2 mb-6">
        <li><strong>1 dia:</strong> San Juan + Santiago (cultura y arte)</li>
        <li><strong>1 dia:</strong> Santa Catarina + San Antonio (fotografia y artesanias)</li>
        <li><strong>1 dia:</strong> San Pedro (aventura y volcan)</li>
        <li><strong>Medio dia:</strong> Santa Catarina desde Panajachel (accesible en tuk-tuk)</li>
      </ul>

      <p class="text-gray-600 leading-relaxed mb-4">Cada pueblo del Lago de Atitlan es un mundo en si mismo. La clave esta en elegir los que resuenan con tus intereses y tomarte el tiempo para sumergirte en la experiencia, no solo tomar fotos. Con Atitlan Experiences, cada visita se convierte en una conexion autentica con la cultura y la belleza natural de este lugar magico.</p>
    `,
  },
];

export const getBlogPostBySlug = (slug: string | undefined): BlogPost | null =>
  BLOG_POSTS.find((p) => p.slug === slug) ?? null;
