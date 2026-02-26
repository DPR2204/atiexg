export interface BlogPost {
  slug: string;
  title: string;
  title_en?: string;
  excerpt: string;
  excerpt_en?: string;
  content: string;
  content_en?: string;
  image: string;
  category: string;
  category_en?: string;
  publishedAt: string;
  readTime: string;
  readTime_en?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'que-hacer-lago-atitlan',
    title: 'Que Hacer en el Lago de Atitlan: Guia Completa 2026',
    title_en: 'Things to Do at Lake Atitlan: Complete Guide 2026',
    excerpt:
      'Descubre todas las actividades, tours y experiencias que puedes disfrutar en el Lago de Atitlan, Guatemala. Desde lanchas privadas hasta volcanes, cultura maya y gastronomia local.',
    excerpt_en:
      'Discover all the activities, tours and experiences you can enjoy at Lake Atitlan, Guatemala. From private boats to volcanoes, Mayan culture and local cuisine.',
    image: 'DSC04094_vht4pi',
    category: 'Guias',
    category_en: 'Guides',
    publishedAt: '2026-01-15',
    readTime: '12 min',
    readTime_en: '12 min',
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
    content_en: `
      <p class="text-lg text-gray-600 leading-relaxed mb-6">Lake Atitlan, described by Aldous Huxley as "the most beautiful lake in the world", is much more than a tourist destination: it is a transformative experience. Surrounded by three majestic volcanoes and twelve Mayan villages with living cultures, this volcanic lake offers a unique combination of nature, adventure, culture and cuisine that you won't find anywhere else on the planet.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Boat Tours: The Best Way to Explore the Lake</h2>
      <p class="text-gray-600 leading-relaxed mb-4">The most iconic way to explore Lake Atitlan is by boat. From Panajachel, you can take public boats to the main villages or, for a premium experience, hire a private boat that lets you create your own itinerary. Atitlan Experiences' private boats include a certified captain, a cooler with drinks and the flexibility to stop wherever you want.</p>
      <p class="text-gray-600 leading-relaxed mb-4">The most popular routes include the three-village tour (San Juan La Laguna, San Pedro La Laguna and Santiago Atitlan), ideal for those who want to experience the cultural diversity of the lake in a single day. For the romantics, the sunset boat tour offers spectacular views as the sun sets behind San Pedro Volcano.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Adventure and Nature</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Lake Atitlan is a paradise for adventure lovers. The ascent of San Pedro Volcano (3,020 m above sea level) is one of the most rewarding hikes in Guatemala, with views stretching to the Pacific Ocean on clear days. For those seeking something more accessible, the Indian Nose viewpoint offers spectacular sunrises with just a one-hour hike.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Kayaking and paddleboarding are perfect activities for calm mornings, when the lake is still and the volcano reflections paint themselves on the crystal-clear water. The Atitlan Natural Reserve in Panajachel combines jungle trails with hanging bridges, waterfalls and a butterfly sanctuary housing dozens of species.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Living Mayan Culture</h2>
      <p class="text-gray-600 leading-relaxed mb-4">What makes Lake Atitlan truly unique is the presence of Mayan communities that keep their thousand-year-old traditions alive. In San Juan La Laguna, women weavers' cooperatives use natural dyes to create textiles with ancestral techniques. In Santiago Atitlan, visiting the Maximon cofrad&iacute;a reveals the fascinating Guatemalan religious syncretism.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Each village has its own cultural identity, language and traditions. The Kaqchikels of Santa Catarina and San Antonio Palopo, the Tz'utujils of San Pedro, San Juan and Santiago -- each ethnic group contributes a cultural richness that turns the lake into a living mosaic of Mayan civilization.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Lake Cuisine</h2>
      <p class="text-gray-600 leading-relaxed mb-4">The culinary scene at Lake Atitlan has evolved enormously in recent years. Panajachel leads with restaurants fusing Guatemalan cuisine with international techniques, while San Pedro offers options for every palate, from traditional food to gourmet vegan cuisine. Atitlan Experiences' food tours take you to discover the best flavors of the lake, including tastings of organic coffee, artisan chocolate and traditional Mayan dishes.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Practical Tips for Your Visit</h2>
      <ul class="list-disc list-inside text-gray-600 space-y-2 mb-6">
        <li><strong>Best time:</strong> November to April (dry season), though the lake is beautiful year-round.</li>
        <li><strong>Getting there:</strong> From Guatemala City, approximately 3 hours by road. From Antigua Guatemala, 2.5 hours.</li>
        <li><strong>Local transport:</strong> Public boats connect all villages. For greater comfort, book private boats.</li>
        <li><strong>Currency:</strong> Guatemalan Quetzal (GTQ). US dollars are accepted at most tourist establishments.</li>
        <li><strong>Climate:</strong> Eternal spring with temperatures between 15-25 degrees Celsius. Always bring a sweater for the evenings.</li>
      </ul>

      <p class="text-gray-600 leading-relaxed mb-4">Lake Atitlan is not a destination you visit just once. Each visit reveals new layers of beauty, culture and human connection. Whether you're looking for adventure, relaxation, cultural immersion or simply the best views of your life, Atitlan has something special waiting for you.</p>
    `,
  },
  {
    slug: 'que-hacer-en-panajachel',
    title: 'Que Hacer en Panajachel: 15 Actividades Imperdibles',
    title_en: 'Things to Do in Panajachel: 15 Must-Do Activities',
    excerpt:
      'Panajachel es el punto de partida perfecto para explorar el Lago de Atitlan. Conoce las 15 mejores actividades, desde tours en lancha hasta gastronomia y cultura maya.',
    excerpt_en:
      'Panajachel is the perfect starting point to explore Lake Atitlan. Discover the 15 best activities, from boat tours to cuisine and Mayan culture.',
    image: 'DSC03855_rixhas',
    category: 'Guias',
    category_en: 'Guides',
    publishedAt: '2026-02-01',
    readTime: '10 min',
    readTime_en: '10 min',
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
    content_en: `
      <p class="text-lg text-gray-600 leading-relaxed mb-6">Panajachel, or simply "Pana" as locals and frequent travelers call it, is much more than the gateway to Lake Atitlan. This cosmopolitan town offers a unique blend of Mayan culture, nightlife, international cuisine and direct access to the most beautiful waters in Central America. Here are the 15 must-do activities for your visit.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">1. Private Boat Ride on the Lake</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Without a doubt the number one activity. A private boat lets you explore the lake at your own pace, stop at the villages that catch your eye and enjoy views only possible from the water. Atitlan Experiences tours include a local captain, drinks and a personalized itinerary.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">2. Walk Along Calle Santander</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Panajachel's main artery is a parade of colors, flavors and sounds. From jade shops and Mayan textiles to terrace restaurants and live music bars, Calle Santander is perfect for an evening stroll.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">3. Sunset from the Boardwalk</h2>
      <p class="text-gray-600 leading-relaxed mb-4">The Panajachel boardwalk offers one of the best views of Lake Atitlan. Watching the sun disappear behind San Pedro Volcano while the colors of the sky reflect on the water is a spectacle that never repeats the same way twice.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">4. Sunrise Kayaking</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Mornings on the lake are magical. The water is perfectly calm and the volcanoes reflect like a mirror. Renting a kayak or paddleboard in Panajachel is easy and accessible for all levels.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">5. Atitlan Natural Reserve</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Just minutes from the center, this reserve offers jungle trails, hanging bridges over canyons, natural waterfalls, a butterfly sanctuary and ziplines. Perfect for a morning of connecting with nature.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">6. Food Tour</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Panajachel has a surprisingly vibrant culinary scene. From pupusas and tamales at the local market to gourmet restaurants with lake views, a food tour reveals flavors you won't find in any guidebook.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">7. Sunday Local Market</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Panajachel's Sunday market is where the Kaqchikel community gathers to exchange fresh produce, textiles and artisan products. It's an authentic experience away from the conventional tourist circuit.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">8. Visit San Juan La Laguna</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Just 25 minutes by boat, San Juan is the most artistic village on the lake. Murals, textile cooperatives with natural dyes, organic coffee tours and melipona bee honey await you.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">9. Meet Maximon in Santiago</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Santiago Atitlan is home to Maximon, a syncretic deity unique in the world. Visiting his cofrad&iacute;a is immersing yourself in Guatemala's most fascinating religious syncretism.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">10. Santa Catarina Palopo: The Painted Village</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Just 10 minutes by tuk-tuk, this village of houses painted with huipil patterns is the most photogenic spot on the lake. Perfect for a half-day visit.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">11. Sunrise at Indian Nose</h2>
      <p class="text-gray-600 leading-relaxed mb-4">The Indian Nose viewpoint offers the most spectacular sunrise in Guatemala. A one-hour hike before dawn rewards you with breathtaking views.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">12. Buy Mayan Handicrafts</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Textiles, ceramics and Guatemalan jade are souvenirs with soul. In Panajachel you'll find everything from affordable pieces to collectible textile art.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">13. Yoga with Lake Views</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Several centers in and around Panajachel offer yoga classes, meditation and wellness retreats with the lake and volcanoes as a backdrop.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">14. Ceramics in San Antonio Palopo</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Twenty minutes from Panajachel, San Antonio Palopo is known for its hand-painted ceramics and unique blue textiles. Family workshops open their doors to curious visitors.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">15. Stargazing on the Lake</h2>
      <p class="text-gray-600 leading-relaxed mb-4">With minimal light pollution, nights at Atitlan reveal an impressive starry sky. Some nighttime boat tours combine astronomy with the magic of the moonlit lake.</p>

      <p class="text-lg text-gray-600 leading-relaxed mt-8 mb-4">Panajachel is the perfect base camp to explore everything Lake Atitlan has to offer. With Atitlan Experiences, each of these activities becomes a premium experience with flawless logistics, local guides and the flexibility to tailor everything to your preferences.</p>
    `,
  },
  {
    slug: 'mejores-pueblos-lago-atitlan',
    title: 'Los Mejores Pueblos del Lago de Atitlan para Visitar',
    title_en: 'The Best Villages on Lake Atitlan to Visit',
    excerpt:
      'Conoce los pueblos mas fascinantes del Lago de Atitlan: desde el artistico San Juan La Laguna hasta el mistico Santiago Atitlan. Guia completa con que ver y como llegar.',
    excerpt_en:
      'Discover the most fascinating villages on Lake Atitlan: from artistic San Juan La Laguna to mystical Santiago Atitlan. Complete guide with what to see and how to get there.',
    image: 'DSC04177_tcgwam',
    category: 'Destinos',
    category_en: 'Destinations',
    publishedAt: '2026-02-10',
    readTime: '8 min',
    readTime_en: '8 min',
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
    content_en: `
      <p class="text-lg text-gray-600 leading-relaxed mb-6">Lake Atitlan is surrounded by twelve villages, each with its own cultural identity, language and traditions. Choosing which ones to visit can be overwhelming, especially if your time is limited. This guide will help you decide which villages best match your interests, whether it's culture, adventure, art or cuisine.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">San Juan La Laguna: For Art and Culture Lovers</h2>
      <p class="text-gray-600 leading-relaxed mb-4">If you could only visit one village on the lake, San Juan La Laguna should be your choice. This small Tz'utujil village has achieved something extraordinary: preserving its ancestral traditions while developing a community tourism model that directly benefits the local population.</p>
      <p class="text-gray-600 leading-relaxed mb-4">San Juan's streets are an open-air art gallery, with murals narrating Mayan cosmology and the village's history. The women weavers' cooperatives are the heart of the village, where you can learn about natural dyes extracted from plants and insects, and observe the complete process of creating a Mayan textile on a backstrap loom.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>Don't miss:</strong> The organic coffee tour, melipona bee honey and natural dye workshops.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Santiago Atitlan: For Seekers of Mystery and Tradition</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Santiago is the largest village on the lake and the epicenter of Tz'utujil culture. Here, tradition is not a show for tourists but the daily life of thousands of people keeping a thousand-year-old civilization alive.</p>
      <p class="text-gray-600 leading-relaxed mb-4">A visit to the Maximon cofrad&iacute;a is essential. This syncretic deity, a blend of Mayan spirituality and colonial Catholicism, is venerated in a ceremony that changes location every year. Santiago's market, especially on Fridays and Sundays, is one of the most authentic in the Guatemalan highlands.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>Don't miss:</strong> The Cojolya Cultural Center, the indigenous market and the Maya-colonial altarpiece in the 16th-century church.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">San Pedro La Laguna: For Free Spirits</h2>
      <p class="text-gray-600 leading-relaxed mb-4">San Pedro is the most bohemian village on the lake, where international backpackers coexist with the Tz'utujil community in a relaxed and creative atmosphere. Artisan coffee shops, Spanish schools and yoga studios define the character of this village at the foot of San Pedro Volcano.</p>
      <p class="text-gray-600 leading-relaxed mb-4">For adventurers, the ascent of San Pedro Volcano (3,020 m above sea level) is the star activity. The 4-5 hour hike rewards with views stretching to the Pacific Ocean. If you prefer something more accessible, Indian Nose offers spectacular sunrises with just a one-hour hike.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>Don't miss:</strong> The volcano ascent, artisan coffee shops and nightlife with live music.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">Santa Catarina Palopo: For Photographers and Color Lovers</h2>
      <p class="text-gray-600 leading-relaxed mb-4">Just 4 kilometers from Panajachel, Santa Catarina Palopo has been transformed into the most photogenic village in Guatemala thanks to the "Painting Santa Catarina" project, which decorated house facades with patterns inspired by Kaqchikel huipiles.</p>
      <p class="text-gray-600 leading-relaxed mb-4">Beyond the photos, the village offers textile cooperatives where you can learn about traditional embroidery, viewpoints with panoramic views and restaurants with lakefront terraces. It's a perfect half-day visit from Panajachel.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>Don't miss:</strong> The painted streets, natural viewpoints and a lunch with lake views.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">San Antonio Palopo: For Those Seeking Authenticity</h2>
      <p class="text-gray-600 leading-relaxed mb-4">If you want to escape the tourist crowds, San Antonio Palopo is your destination. This Kaqchikel village is famous for its hand-painted ceramics and for being one of the few places where men still wear the traditional male outfit: blue-and-white striped woven shirts.</p>
      <p class="text-gray-600 leading-relaxed mb-4">The ceramic workshops open their doors to visitors, and the agricultural terraces descending to the lake create a unique landscape. The atmosphere is quiet and authentic, perfect for those seeking a genuine connection with Mayan culture.</p>
      <p class="text-gray-600 leading-relaxed mb-4"><strong>Don't miss:</strong> The ceramic workshops, the unique blue textiles and the agricultural terraces.</p>

      <h2 class="text-2xl font-black text-gray-900 mt-10 mb-4">How to Plan Your Route</h2>
      <p class="text-gray-600 leading-relaxed mb-4">The most efficient way to visit multiple villages is with an organized private boat tour from Panajachel. Atitlan Experiences offers customized itineraries that let you combine villages according to your interests, with local guides who enrich the experience with stories and cultural context.</p>
      <ul class="list-disc list-inside text-gray-600 space-y-2 mb-6">
        <li><strong>1 day:</strong> San Juan + Santiago (culture and art)</li>
        <li><strong>1 day:</strong> Santa Catarina + San Antonio (photography and crafts)</li>
        <li><strong>1 day:</strong> San Pedro (adventure and volcano)</li>
        <li><strong>Half day:</strong> Santa Catarina from Panajachel (accessible by tuk-tuk)</li>
      </ul>

      <p class="text-gray-600 leading-relaxed mb-4">Each village on Lake Atitlan is a world unto itself. The key is choosing the ones that resonate with your interests and taking the time to immerse yourself in the experience, not just take photos. With Atitlan Experiences, every visit becomes an authentic connection with the culture and natural beauty of this magical place.</p>
    `,
  },
];

export const getBlogPostBySlug = (slug: string | undefined): BlogPost | null =>
  BLOG_POSTS.find((p) => p.slug === slug) ?? null;
