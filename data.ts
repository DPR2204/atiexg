
import { Tour } from './types';

export const TOURS: Tour[] = [
  // ==================== SIGNATURE ====================
  {
    id: 1,
    name: "Atitlán Signature",
    name_en: "Atitlán Signature",
    category: "Signature",
    concept: "3 Pueblos + Almuerzo + Coffee Break (Día Completo)",
    concept_en: "3 Villages + Lunch + Coffee Break (Full Day)",
    description: "El tour insignia: 3 pueblos emblemáticos del lago, almuerzo premium en Santiago Atitlán, guía bilingüe y lancha privada. La experiencia completa del lago en un día.",
    description_en: "The signature tour: 3 iconic lakeside villages, premium lunch in Santiago Atitlán, bilingual guide and private boat. The complete lake experience in one day.",
    price: 65,
    duration: "8–9 h",
    format: "Grupo pequeño (5-10 pax) · Todo incluido",
    format_en: "Small group (5-10 pax) · All inclusive",
    image: "DSC04496_noiz4x",
    gallery: [
      "DSC04496_noiz4x",
      "DSC04101_ktjtcp",
      "DSC04119_oadxam",
      "DSC04174_gnacgl",
      "DSC04185_rgqgug",
      "DSC04199_de2elm",
      "DSC04052_zyoxm8",
      "DSC04019_ox7ytu",
      "DSC04042_ktnwye",
      "DSC04073_teixpq",
      "DSC04081_pc3eoc",
      "DSC03855_rixhas"
    ],
    isBestSeller: true,
    rating: 4.9,
    reviews: 1240,
    features: [
      "Lancha propia + Capitán",
      "Guía bilingüe (EN/ES)",
      "Almuerzo premium en Santiago",
      "Coffee break en café-bar propio (Panajachel)",
      "Todas las entradas incluidas",
      "Café a bordo"
    ],
    features_en: [
      "Private boat + Captain",
      "Bilingual guide (EN/ES)",
      "Premium lunch in Santiago",
      "Coffee break at our own café-bar (Panajachel)",
      "All entrance fees included",
      "Coffee on board"
    ],
    includes: "Lancha privada ida y vuelta, guía bilingüe, almuerzo premium en Santiago, todas las entradas, café a bordo, coffee break en café-bar propio al regreso en Panajachel.",
    includes_en: "Round-trip private boat, bilingual guide, premium lunch in Santiago, all entrance fees, coffee on board, coffee break at our own café-bar upon return to Panajachel.",
    itinerary: [
      { time: "07:30", activity: "Punto de encuentro en muelle de Panajachel. Bienvenida del guía, briefing del día y abordaje a lancha privada." },
      { time: "08:00", activity: "Navegación a Santiago Atitlán (~35 min). El guía narra la historia Tz'utujil durante el trayecto." },
      { time: "08:40", activity: "Santiago Atitlán: Mercado local, iglesia colonial con historia de Maximón, visita a talleres de artesanos." },
      { time: "10:30", activity: "Almuerzo premium en restaurante con vista al lago en Santiago." },
      { time: "11:30", activity: "Navegación a San Juan La Laguna (~20 min)." },
      { time: "12:00", activity: "San Juan La Laguna: Cooperativa de teñido natural con demostración en vivo, galerías de arte naíf, murales y taller breve de textiles." },
      { time: "13:30", activity: "Navegación a San Pedro La Laguna (~10 min)." },
      { time: "13:45", activity: "San Pedro La Laguna: Exploración del pueblo, miradores, tiempo libre con mapa de recomendaciones." },
      { time: "15:00", activity: "Regreso a Panajachel. Coffee break de despedida en el café-bar de Atitlán Experience." }
    ],
    itinerary_en: [
      { time: "07:30", activity: "Meeting point at Panajachel dock. Welcome from the guide, day briefing and boarding the private boat." },
      { time: "08:00", activity: "Navigation to Santiago Atitlán (~35 min). The guide narrates Tz'utujil history during the ride." },
      { time: "08:40", activity: "Santiago Atitlán: Local market, colonial church with the story of Maximón, visit to artisan workshops." },
      { time: "10:30", activity: "Premium lunch at a lakeside restaurant in Santiago." },
      { time: "11:30", activity: "Navigation to San Juan La Laguna (~20 min)." },
      { time: "12:00", activity: "San Juan La Laguna: Natural dye cooperative with live demonstration, naïf art galleries, murals and a short textile workshop." },
      { time: "13:30", activity: "Navigation to San Pedro La Laguna (~10 min)." },
      { time: "13:45", activity: "San Pedro La Laguna: Village exploration, viewpoints, free time with a curated recommendations map." },
      { time: "15:00", activity: "Return to Panajachel. Farewell coffee break at the Atitlán Experience café-bar." }
    ],
    prices: [
      { id: "1-1", label: "Por persona", label_en: "Per person", amount: "$65 USD", description: "Grupo 5-10 pax · Todo incluido", description_en: "Group 5-10 pax · All inclusive" }
    ],
    addons: [
      { id: "a1-1", label: "Fotografía profesional", label_en: "Professional photography", price: "80-120" },
      { id: "a1-2", label: "Drone (clips + fotos)", label_en: "Drone (clips + photos)", price: "80-150" }
    ],
    meals: ['desayuno', 'almuerzo', 'coffee_break']
  },
  {
    id: 2,
    name: "Día Privado en el Lago",
    name_en: "Private Day on the Lake",
    category: "Signature",
    concept: "Lancha Privada · Itinerario a Medida",
    concept_en: "Private Boat · Custom Itinerary",
    description: "Tu día, tu ruta. Lancha privada con itinerario a medida: elige pueblos, playas o miradores. Medio día o día completo.",
    description_en: "Your day, your route. Private boat with a custom itinerary: choose villages, beaches or viewpoints. Half day or full day.",
    price: 55,
    duration: "4–8 h",
    format: "Privado · Personalizable",
    format_en: "Private · Customizable",
    image: "DSC04291_k4ew5f",
    gallery: [
      "DSC04291_k4ew5f",
      "DSC04363_dt2vuy",
      "DSC04374_rdep9d",
      "DSC04387_zcq91s",
      "DSC04073_teixpq",
      "DSC03858_qvws23"
    ],
    rating: 5.0,
    reviews: 120,
    features: [
      "Lancha privada durante todo el tiempo",
      "Itinerario 100% personalizado",
      "Capitán dedicado",
      "Snacks y bebidas a bordo"
    ],
    features_en: [
      "Private boat for the entire duration",
      "100% customized itinerary",
      "Dedicated captain",
      "Snacks and drinks on board"
    ],
    includes: "Lancha privada durante el tiempo contratado, capitán, snacks y bebidas a bordo, itinerario personalizado. Almuerzo no incluido.",
    includes_en: "Private boat for the contracted time, captain, snacks and drinks on board, customized itinerary. Lunch not included.",
    itinerary: [
      { time: "Flexible", activity: "Encuentro en muelle de Panajachel. Revisión del itinerario personalizado con el capitán. Snacks y bebidas ya a bordo." },
      { time: "Parada 1", activity: "Destino a elección del grupo. Opciones populares: playas de Santa Cruz, miradores de Jaibalito, San Marcos La Laguna para yoga/relax." },
      { time: "Parada 2", activity: "Segundo destino. Nadar en aguas cristalinas, explorar un pueblo, almorzar en restaurante con vista." },
      { time: "Parada 3", activity: "Tercer destino para quienes eligen la opción de 8 horas. Atardecer desde el agua si el horario lo permite." },
      { time: "Regreso", activity: "De vuelta a Panajachel cuando el grupo lo decida (dentro del horario contratado)." }
    ],
    itinerary_en: [
      { time: "Flexible", activity: "Meeting at Panajachel dock. Review of your customized itinerary with the captain. Snacks and drinks already on board." },
      { time: "Stop 1", activity: "Destination of the group's choice. Popular options: Santa Cruz beaches, Jaibalito viewpoints, San Marcos La Laguna for yoga/relaxation." },
      { time: "Stop 2", activity: "Second destination. Swim in crystal-clear waters, explore a village, have lunch at a restaurant with a view." },
      { time: "Stop 3", activity: "Third destination for those who choose the 8-hour option. Sunset from the water if timing allows." },
      { time: "Return", activity: "Back to Panajachel whenever the group decides (within the contracted time)." }
    ],
    prices: [
      { id: "2-1", label: "Por persona", label_en: "Per person", amount: "$55 USD", description: "Grupo 5-10 pax", description_en: "Group 5-10 pax" }
    ],
    addons: [
      { id: "a2-1", label: "Almuerzo en restaurante", label_en: "Restaurant lunch", price: "25-45 p/p" },
      { id: "a2-2", label: "Guía premium", label_en: "Premium guide", price: "150" },
      { id: "a2-3", label: "Extensión sunset", label_en: "Sunset extension", price: "+30 p/p" }
    ]
  },

  // ==================== LAGO & MOMENTOS ====================
  {
    id: 3,
    name: "Crucero al Atardecer",
    name_en: "Sunset Cruise",
    category: "Lago & Momentos",
    concept: "Lancha Privada · Bebidas · Snacks · Golden Hour",
    concept_en: "Private Boat · Drinks · Snacks · Golden Hour",
    description: "Crucero al atardecer entre volcanes. Bebidas, snacks y música a bordo. La experiencia más fotogénica del lago.",
    description_en: "Sunset cruise among volcanoes. Drinks, snacks and music on board. The most photogenic experience on the lake.",
    price: 40,
    duration: "1.5–2 h",
    format: "Grupo pequeño (5-10 pax) · Todo incluido",
    format_en: "Small group (5-10 pax) · All inclusive",
    image: "DSC03858_qvws23",
    gallery: [
      "DSC03858_qvws23",
      "DSC04503_mb5wi7",
      "DSC04496_noiz4x",
      "DSC04363_dt2vuy",
      "DSC03855_rixhas"
    ],
    rating: 5.0,
    reviews: 850,
    features: [
      "Lancha privada + capitán",
      "Bebidas (alcohólicas y no alcohólicas)",
      "Tabla de bocadillos y snacks",
      "Música ambiental"
    ],
    features_en: [
      "Private boat + captain",
      "Drinks (alcoholic and non-alcoholic)",
      "Appetizer board and snacks",
      "Ambient music"
    ],
    includes: "Lancha privada, bebidas (alcohólicas y no alcohólicas), snacks y tabla de bocadillos, música ambiental, capitán.",
    includes_en: "Private boat, drinks (alcoholic and non-alcoholic), snacks and appetizer board, ambient music, captain.",
    itinerary: [
      { time: "16:30", activity: "Encuentro en el muelle de Panajachel. Bienvenida con bebida de cortesía (limonada de hierbabuena o agua de jamaica)." },
      { time: "16:45", activity: "Zarpe. Navegación hacia el centro del lago con vista panorámica a los volcanes San Pedro, Tolimán y Atitlán. Música ambiental y snacks servidos." },
      { time: "17:15", activity: "Golden hour. Posición privilegiada frente a los volcanes. Momento ideal para fotografías. Bebidas adicionales y tabla de bocadillos." },
      { time: "17:45", activity: "Atardecer. El sol se oculta detrás del volcán San Pedro. Pausa contemplativa. Última ronda de bebidas." },
      { time: "18:15", activity: "Regreso a Panajachel. Navegación nocturna con las luces de los pueblos reflejadas en el lago." }
    ],
    itinerary_en: [
      { time: "16:30", activity: "Meeting at the Panajachel dock. Welcome with a complimentary drink (spearmint lemonade or hibiscus water)." },
      { time: "16:45", activity: "Departure. Navigation toward the center of the lake with panoramic views of San Pedro, Tolimán and Atitlán volcanoes. Ambient music and snacks served." },
      { time: "17:15", activity: "Golden hour. Prime position facing the volcanoes. Ideal moment for photography. Additional drinks and appetizer board." },
      { time: "17:45", activity: "Sunset. The sun sets behind San Pedro volcano. Contemplative pause. Last round of drinks." },
      { time: "18:15", activity: "Return to Panajachel. Night navigation with the village lights reflected on the lake." }
    ],
    prices: [
      { id: "3-1", label: "Por persona", label_en: "Per person", amount: "$40 USD", description: "Grupo 5-10 pax · Todo incluido", description_en: "Group 5-10 pax · All inclusive" }
    ],
    addons: [
      { id: "a3-1", label: "Fotógrafo 60-90 min", label_en: "Photographer 60-90 min", price: "120-180" },
      { id: "a3-2", label: "Kit propuesta", label_en: "Proposal kit", price: "120-220" },
      { id: "a3-3", label: "Reel vertical 30-60s", label_en: "Vertical reel 30-60s", price: "250-450" }
    ],
    meals: ['snacks']
  },
  {
    id: 4,
    name: "Amanecer en el Lago",
    name_en: "Sunrise on the Lake",
    category: "Lago & Momentos",
    concept: "Salida Pre-Alba · Sesión Fotográfica · Desayuno",
    concept_en: "Pre-Dawn Departure · Photo Session · Breakfast",
    description: "Amanecer desde el lago: salida pre-alba, volcanes reflejados en el agua, sesión fotográfica y desayuno en nuestro café-bar.",
    description_en: "Sunrise from the lake: pre-dawn departure, volcanoes reflected in the water, photo session and breakfast at our café-bar.",
    price: 40,
    duration: "2.5–3 h",
    format: "Grupo pequeño (5-10 pax) · Todo incluido",
    format_en: "Small group (5-10 pax) · All inclusive",
    image: "DSC04490_eqqgtz",
    gallery: [
      "DSC04490_eqqgtz",
      "DSC04496_noiz4x",
      "DSC04503_mb5wi7",
      "DSC03855_rixhas",
      "DSC03858_qvws23"
    ],
    rating: 4.9,
    reviews: 130,
    features: [
      "Lancha privada + capitán",
      "Café caliente a bordo",
      "Mantas para el fresco",
      "Desayuno completo en café-bar propio"
    ],
    features_en: [
      "Private boat + captain",
      "Hot coffee on board",
      "Blankets for the morning chill",
      "Full breakfast at our own café-bar"
    ],
    includes: "Lancha privada, café a bordo, mantas, desayuno completo en café-bar propio, café de especialidad de la tostaduría.",
    includes_en: "Private boat, coffee on board, blankets, full breakfast at our own café-bar, specialty coffee from the roastery.",
    itinerary: [
      { time: "05:00", activity: "Punto de encuentro en el muelle. Café caliente y pan dulce de bienvenida mientras amanece. Briefing breve." },
      { time: "05:15", activity: "Zarpe en oscuridad. Navegación hacia el punto de observación óptimo. Mantas disponibles a bordo para el fresco de la madrugada." },
      { time: "05:45", activity: "Amanecer. Los primeros rayos de luz iluminan los volcanes y se reflejan en el lago inmóvil. Momento fotográfico único." },
      { time: "06:30", activity: "Navegación contemplativa. Recorrido lento por zonas de aguas calmas. Posible avistamiento de aves acuáticas y pescadores locales." },
      { time: "07:15", activity: "Desayuno en el Café-Bar Atitlán Experience. Desayuno completo: huevos al gusto, frijoles, plátanos, pan artesanal, jugo natural y café recién tostado." }
    ],
    itinerary_en: [
      { time: "05:00", activity: "Meeting point at the dock. Hot coffee and sweet bread welcome while dawn breaks. Brief briefing." },
      { time: "05:15", activity: "Departure in darkness. Navigation to the optimal observation point. Blankets available on board for the early morning chill." },
      { time: "05:45", activity: "Sunrise. The first rays of light illuminate the volcanoes and reflect on the still lake. A unique photographic moment." },
      { time: "06:30", activity: "Contemplative navigation. Slow cruise through calm water areas. Possible sighting of waterfowl and local fishermen." },
      { time: "07:15", activity: "Breakfast at the Atitlán Experience Café-Bar. Full breakfast: eggs to order, beans, plantains, artisan bread, fresh juice and freshly roasted coffee." }
    ],
    prices: [
      { id: "4-1", label: "Por persona", label_en: "Per person", amount: "$40 USD", description: "Grupo 5-10 pax · Todo incluido", description_en: "Group 5-10 pax · All inclusive" }
    ],
    addons: [
      { id: "a4-1", label: "Fotógrafo 60-90 min", label_en: "Photographer 60-90 min", price: "120-180" },
      { id: "a4-2", label: "Drone add-on", label_en: "Drone add-on", price: "80-150" }
    ],
    meals: ['desayuno']
  },
  {
    id: 5,
    name: "Escapada Bienestar",
    name_en: "Wellness Escape",
    category: "Lago & Momentos",
    concept: "Yoga · Ceremonia de Cacao · Almuerzo Saludable",
    concept_en: "Yoga · Cacao Ceremony · Healthy Lunch",
    description: "Slow travel: yoga junto al lago, ceremonia de cacao o temazcal, almuerzo saludable. Desconexión total con traslado en lancha privada.",
    description_en: "Slow travel: yoga by the lake, cacao ceremony or temazcal, healthy lunch. Total disconnection with private boat transfer.",
    price: 65,
    duration: "4–5 h",
    format: "Grupo pequeño (5-10 pax) · Todo incluido",
    format_en: "Small group (5-10 pax) · All inclusive",
    image: "DSC03989_ywaz7j",
    gallery: [
      "DSC03989_ywaz7j",
      "DSC03997_qlzxrn",
      "DSC04002_sfqosk",
      "DSC04004_hcety6"
    ],
    rating: 4.9,
    reviews: 320,
    features: [
      "Lancha privada ida y vuelta",
      "Sesión de yoga con vista al lago",
      "Ceremonia de cacao o temazcal",
      "Almuerzo saludable incluido",
      "Guía acompañante"
    ],
    features_en: [
      "Round-trip private boat",
      "Yoga session with lake views",
      "Cacao ceremony or temazcal",
      "Healthy lunch included",
      "Accompanying guide"
    ],
    includes: "Lancha privada ida y vuelta, sesión de yoga, ceremonia de cacao o temazcal, almuerzo saludable, bebidas (tés, jugos), guía acompañante.",
    includes_en: "Round-trip private boat, yoga session, cacao ceremony or temazcal, healthy lunch, beverages (teas, juices), accompanying guide.",
    itinerary: [
      { time: "07:30", activity: "Encuentro en muelle de Panajachel. Té de hierbas de bienvenida. El guía explica la filosofía del día: ritmo lento, conexión con la naturaleza." },
      { time: "08:00", activity: "Navegación a San Marcos La Laguna (~25 min). Música de meditación a bordo." },
      { time: "08:30", activity: "Sesión de yoga con vista al lago. Clase guiada en terraza con vista a los volcanes. Para todos los niveles." },
      { time: "09:45", activity: "Ceremonia de cacao o temazcal (según disponibilidad). Experiencia ancestral maya guiada por facilitador local." },
      { time: "11:00", activity: "Almuerzo saludable. Menú plant-based o de cocina local saludable en restaurante de San Marcos." },
      { time: "12:15", activity: "Regreso en lancha a Panajachel. Navegación relajada. Té herbal de cierre a bordo." }
    ],
    itinerary_en: [
      { time: "07:30", activity: "Meeting at Panajachel dock. Welcome herbal tea. The guide explains the day's philosophy: slow pace, connection with nature." },
      { time: "08:00", activity: "Navigation to San Marcos La Laguna (~25 min). Meditation music on board." },
      { time: "08:30", activity: "Yoga session with lake views. Guided class on a terrace overlooking the volcanoes. Suitable for all levels." },
      { time: "09:45", activity: "Cacao ceremony or temazcal (subject to availability). Ancestral Mayan experience led by a local facilitator." },
      { time: "11:00", activity: "Healthy lunch. Plant-based menu or healthy local cuisine at a San Marcos restaurant." },
      { time: "12:15", activity: "Return by boat to Panajachel. Relaxing navigation. Closing herbal tea on board." }
    ],
    prices: [
      { id: "5-1", label: "Por persona", label_en: "Per person", amount: "$65 USD", description: "Grupo 5-10 pax · Todo incluido", description_en: "Group 5-10 pax · All inclusive" }
    ],
    addons: [
      { id: "a5-1", label: "Masaje 60 min", label_en: "60-min massage", price: "26-52 p/p" },
      { id: "a5-2", label: "Concierge WhatsApp", label_en: "WhatsApp concierge", price: "15-35" }
    ],
    meals: ['almuerzo']
  },

  // ==================== CULTURA & PUEBLOS ====================
  {
    id: 6,
    name: "Ruta Artesanal",
    name_en: "Artisan Route",
    category: "Cultura & Pueblos",
    concept: "San Juan La Laguna + San Antonio Palopó",
    concept_en: "San Juan La Laguna + San Antonio Palopó",
    description: "San Juan La Laguna y San Antonio Palopó: cooperativas de teñido natural, galerías de arte naíf, cerámica pintada y textiles. Guía desde nuestra sucursal.",
    description_en: "San Juan La Laguna and San Antonio Palopó: natural dye cooperatives, naïf art galleries, hand-painted ceramics and textiles. Guide from our branch.",
    price: 55,
    duration: "6–7 h",
    format: "Grupo pequeño (5-10 pax) · Todo incluido",
    format_en: "Small group (5-10 pax) · All inclusive",
    image: "DSC04052_zyoxm8",
    gallery: [
      "DSC04052_zyoxm8",
      "DSC04019_ox7ytu",
      "DSC04033_kq63ay",
      "DSC04042_ktnwye",
      "DSC04045_etlucg",
      "DSC04046_whihtj",
      "DSC04051_qs4st8",
      "DSC04054_skmjsn",
      "DSC04058_ljybdj",
      "DSC04440_r9skha",
      "DSC04444_uppybw",
      "DSC04466_mxfzds",
      "DSC04470_i6h83r",
      "DSC04490_eqqgtz"
    ],
    rating: 4.8,
    reviews: 210,
    features: [
      "Lancha privada + guía bilingüe",
      "Entradas a cooperativas y talleres",
      "Almuerzo típico incluido",
      "Materiales para taller de teñido"
    ],
    features_en: [
      "Private boat + bilingual guide",
      "Entrance to cooperatives and workshops",
      "Traditional lunch included",
      "Materials for dyeing workshop"
    ],
    includes: "Lancha privada, guía bilingüe, entradas a cooperativas y talleres, almuerzo típico, materiales para taller de teñido.",
    includes_en: "Private boat, bilingual guide, entrance to cooperatives and workshops, traditional lunch, materials for dyeing workshop.",
    itinerary: [
      { time: "08:00", activity: "Salida en lancha desde Panajachel rumbo a San Juan La Laguna (~30 min). Guía bilingüe a bordo con contexto histórico sobre la cultura Tz'utujil." },
      { time: "08:30", activity: "Cooperativa de teñido natural. Demostración en vivo del proceso de extracción de tintes de plantas, insectos y minerales. Oportunidad de teñir tu propia pieza." },
      { time: "09:20", activity: "Recorrido por galerías y murales. Arte naíf Tz'utujil, pintura de paisajes del lago. Visita a talleres de artistas locales." },
      { time: "10:15", activity: "Taller de textiles. Cooperativa de mujeres tejedoras con telares de cintura. Explicación de la simbología en los huipiles." },
      { time: "11:00", activity: "Navegación a San Antonio Palopó (~35 min). Almuerzo a bordo o en restaurante local según preferencia." },
      { time: "11:45", activity: "San Antonio Palopó. Pueblo de cerámica pintada. Visita al proyecto comunitario de casas pintadas con diseños mayas. Mirador panorámico." },
      { time: "13:15", activity: "Almuerzo en restaurante con vista. Comida típica guatemalteca: pepián, jocón o pollo en recado." },
      { time: "14:15", activity: "Regreso a Panajachel en lancha (~15 min)." }
    ],
    itinerary_en: [
      { time: "08:00", activity: "Boat departure from Panajachel heading to San Juan La Laguna (~30 min). Bilingual guide on board with historical context about Tz'utujil culture." },
      { time: "08:30", activity: "Natural dye cooperative. Live demonstration of the dye extraction process from plants, insects and minerals. Opportunity to dye your own piece." },
      { time: "09:20", activity: "Tour of galleries and murals. Tz'utujil naïf art, lake landscape paintings. Visit to local artist workshops." },
      { time: "10:15", activity: "Textile workshop. Women weavers' cooperative with backstrap looms. Explanation of the symbolism in huipiles." },
      { time: "11:00", activity: "Navigation to San Antonio Palopó (~35 min). Lunch on board or at a local restaurant based on preference." },
      { time: "11:45", activity: "San Antonio Palopó. Village of painted ceramics. Visit to the community project of houses painted with Mayan designs. Panoramic viewpoint." },
      { time: "13:15", activity: "Lunch at a restaurant with a view. Traditional Guatemalan cuisine: pepián, jocón or chicken in recado sauce." },
      { time: "14:15", activity: "Return to Panajachel by boat (~15 min)." }
    ],
    prices: [
      { id: "6-1", label: "Por persona", label_en: "Per person", amount: "$55 USD", description: "Grupo 5-10 pax · Todo incluido", description_en: "Group 5-10 pax · All inclusive" }
    ],
    addons: [
      { id: "a6-1", label: "Fotografía estándar", label_en: "Standard photography", price: "150-230" },
      { id: "a6-2", label: "Empaque seguro de cerámica", label_en: "Secure ceramic packaging", price: "10-25" }
    ],
    meals: ['almuerzo']
  },
  {
    id: 7,
    name: "Santiago Cultural",
    name_en: "Santiago Cultural",
    category: "Cultura & Pueblos",
    concept: "Inmersión Tz'utujil · Mercado · Maximón · Artesanos",
    concept_en: "Tz'utujil Immersion · Market · Maximón · Artisans",
    description: "Inmersión Tz'utujil: mercado de Santiago, iglesia con Maximón, talleres de artesanos y almuerzo típico. Guía desde nuestra sucursal en Santiago.",
    description_en: "Tz'utujil immersion: Santiago market, church with Maximón, artisan workshops and traditional lunch. Guide from our Santiago branch.",
    price: 55,
    duration: "5–6 h",
    format: "Grupo pequeño (5-10 pax) · Todo incluido",
    format_en: "Small group (5-10 pax) · All inclusive",
    image: "DSC04177_tcgwam",
    gallery: [
      "DSC04177_tcgwam",
      "DSC04174_gnacgl",
      "DSC04170_dswiko",
      "DSC04160_ajbk7r",
      "DSC04185_rgqgug",
      "DSC04188_gpbth7",
      "DSC04192_yvloo0",
      "DSC04193_obgcum",
      "DSC04194_panqpm",
      "DSC04199_de2elm",
      "DSC04200_h0ije3",
      "DSC04201_xxscdr",
      "DSC04206_ainpux",
      "DSC04119_oadxam",
      "DSC04116_qt2mjq",
      "DSC04114_bjxcf6",
      "DSC04183_g7ffkv"
    ],
    isNew: true,
    rating: 4.8,
    reviews: 85,
    features: [
      "Lancha privada ida y vuelta",
      "Guía local bilingüe",
      "Entradas (Maximón, iglesia)",
      "Almuerzo típico Tz'utujil",
      "Visitas a talleres de artesanos"
    ],
    features_en: [
      "Round-trip private boat",
      "Local bilingual guide",
      "Entrance fees (Maximón, church)",
      "Traditional Tz'utujil lunch",
      "Visits to artisan workshops"
    ],
    includes: "Lancha privada ida y vuelta, guía local bilingüe, entradas (Maximón, iglesia), almuerzo típico, visitas a talleres.",
    includes_en: "Round-trip private boat, local bilingual guide, entrance fees (Maximón, church), traditional lunch, workshop visits.",
    itinerary: [
      { time: "08:00", activity: "Salida en lancha desde Panajachel rumbo a Santiago Atitlán (~35 min). El guía introduce la historia del pueblo más grande del lago." },
      { time: "08:40", activity: "Mercado de Santiago. Recorrido guiado por el mercado local: frutas exóticas, textiles, hierbas medicinales." },
      { time: "09:40", activity: "Iglesia de Santiago Apóstol. Arquitectura colonial con sincretismo maya. Historia del padre Stanley Rother." },
      { time: "10:30", activity: "Visita a Maximón (Rilaj Maam). Deidad sincrética maya-católica. El guía explica el significado cultural y las ofrendas." },
      { time: "11:10", activity: "Talleres de artesanos. Visita a familias que tallan madera, tejen y bordan. Proceso de creación del traje tradicional." },
      { time: "12:15", activity: "Almuerzo típico. Restaurante local con platillos Tz'utujiles: caldo de gallina criolla, tortillas hechas a mano, atol." },
      { time: "13:30", activity: "Regreso en lancha a Panajachel. Tiempo para fotos del lago desde la popa." }
    ],
    itinerary_en: [
      { time: "08:00", activity: "Boat departure from Panajachel heading to Santiago Atitlán (~35 min). The guide introduces the history of the largest village on the lake." },
      { time: "08:40", activity: "Santiago market. Guided tour of the local market: exotic fruits, textiles, medicinal herbs." },
      { time: "09:40", activity: "Santiago Apóstol Church. Colonial architecture with Mayan syncretism. Story of Father Stanley Rother." },
      { time: "10:30", activity: "Visit to Maximón (Rilaj Maam). Syncretic Maya-Catholic deity. The guide explains the cultural significance and offerings." },
      { time: "11:10", activity: "Artisan workshops. Visit to families who carve wood, weave and embroider. The creation process of traditional garments." },
      { time: "12:15", activity: "Traditional lunch. Local restaurant with Tz'utujil dishes: free-range chicken broth, handmade tortillas, atol." },
      { time: "13:30", activity: "Return by boat to Panajachel. Time for photos of the lake from the stern." }
    ],
    prices: [
      { id: "7-1", label: "Por persona", label_en: "Per person", amount: "$55 USD", description: "Grupo 5-10 pax · Todo incluido", description_en: "Group 5-10 pax · All inclusive" }
    ],
    addons: [
      { id: "a7-1", label: "Fotografía profesional", label_en: "Professional photography", price: "80-120" },
      { id: "a7-2", label: "Concierge WhatsApp", label_en: "WhatsApp concierge", price: "15-35" }
    ],
    meals: ['almuerzo']
  },

  // ==================== SABORES DEL LAGO ====================
  {
    id: 8,
    name: "Laboratorio de Café",
    name_en: "Coffee Lab",
    category: "Sabores del Lago",
    concept: "Tostaduría Propia · Tostado en Vivo · Catación Profesional",
    concept_en: "Our Own Roastery · Live Roasting · Professional Cupping",
    description: "Experiencia completa en nuestra tostaduría: origen del grano, tostado en vivo, catación profesional y maridaje con repostería artesanal.",
    description_en: "The complete experience at our roastery: bean origins, live roasting, professional cupping and pairing with artisan pastries.",
    price: 25,
    duration: "2.5–3 h",
    format: "Grupo pequeño · En tostaduría",
    format_en: "Small group · At the roastery",
    image: "DSC04238_swyart",
    gallery: [
      "DSC04238_swyart",
      "DSC03855_rixhas",
      "DSC03858_qvws23"
    ],
    rating: 5.0,
    reviews: 95,
    features: [
      "Catación de 4 cafés de Guatemala",
      "Demostración de tostado en vivo",
      "Maridaje con repostería artesanal",
      "Bolsa de café de regalo (100g)",
      "Descuento 15% en tienda"
    ],
    features_en: [
      "Cupping of 4 Guatemalan coffees",
      "Live roasting demonstration",
      "Pairing with artisan pastries",
      "Complimentary bag of coffee (100g)",
      "15% shop discount"
    ],
    includes: "Catación de 4 cafés, demostración de tostado, maridaje con repostería, bolsa de café de regalo (100g), descuento en tienda.",
    includes_en: "Cupping of 4 coffees, roasting demonstration, pastry pairing, complimentary bag of coffee (100g), shop discount.",
    itinerary: [
      { time: "09:00", activity: "Bienvenida en la tostaduría. Café de bienvenida (método a elegir: V60, prensa francesa o chemex). Introducción al café de especialidad." },
      { time: "09:20", activity: "Del grano a la taza. Recorrido por el proceso: café cereza, despulpado, secado, clasificación. Historia del café en Guatemala." },
      { time: "10:00", activity: "Tostado en vivo. Demostración con nuestra tostadora. Explicación de perfiles de tueste y cómo afectan el sabor." },
      { time: "10:30", activity: "Catación profesional (cupping). Flight de 4 cafés de diferentes regiones: Huehuetenango, Atitlán, Antigua, Cobán." },
      { time: "11:00", activity: "Maridaje. Cada café se acompaña con repostería artesanal que complementa sus notas." },
      { time: "11:30", activity: "Cierre. Bolsa de café recién tostado para llevar. Descuento del 15% en productos de la tienda." }
    ],
    itinerary_en: [
      { time: "09:00", activity: "Welcome at the roastery. Welcome coffee (method of your choice: V60, French press or Chemex). Introduction to specialty coffee." },
      { time: "09:20", activity: "From bean to cup. Tour of the process: coffee cherry, pulping, drying, sorting. History of coffee in Guatemala." },
      { time: "10:00", activity: "Live roasting. Demonstration with our roaster. Explanation of roast profiles and how they affect flavor." },
      { time: "10:30", activity: "Professional cupping. Flight of 4 coffees from different regions: Huehuetenango, Atitlán, Antigua, Cobán." },
      { time: "11:00", activity: "Pairing. Each coffee is accompanied by artisan pastry that complements its tasting notes." },
      { time: "11:30", activity: "Wrap-up. Bag of freshly roasted coffee to take home. 15% discount on shop products." }
    ],
    prices: [
      { id: "8-1", label: "Por persona", label_en: "Per person", amount: "$25 USD", description: "Grupo 5-10 pax", description_en: "Group 5-10 pax" }
    ],
    addons: [
      { id: "a8-1", label: "Upgrade 5-6 muestras", label_en: "Upgrade to 5-6 samples", price: "+10-18 p/p" },
      { id: "a8-2", label: "Maridaje con vino", label_en: "Wine pairing", price: "+15-35 p/p" }
    ]
  },
  {
    id: 9,
    name: "Café y Lago Combo",
    name_en: "Coffee & Lake Combo",
    category: "Sabores del Lago",
    concept: "Laboratorio de Café + Recorrido por el Lago",
    concept_en: "Coffee Lab + Lake Tour",
    description: "Laboratorio de Café en la mañana + recorrido por el lago en la tarde. El combo perfecto para quien tiene un solo día en Panajachel.",
    description_en: "Coffee Lab in the morning + lake tour in the afternoon. The perfect combo for those with just one day in Panajachel.",
    price: 55,
    duration: "6–7 h",
    format: "Grupo pequeño (5-10 pax) · Todo incluido",
    format_en: "Small group (5-10 pax) · All inclusive",
    image: "DSC04025_x0dtae",
    gallery: [
      "DSC04025_x0dtae",
      "DSC04238_swyart",
      "DSC03855_rixhas",
      "DSC04052_zyoxm8",
      "DSC04019_ox7ytu",
      "DSC04073_teixpq",
      "DSC04081_pc3eoc"
    ],
    isNew: true,
    rating: 4.9,
    reviews: 65,
    features: [
      "Laboratorio de Café (catación + tostado)",
      "Lancha privada",
      "Almuerzo incluido",
      "Cold brew a bordo",
      "Visitas a San Juan y San Pedro",
      "Bolsa de café de regalo"
    ],
    features_en: [
      "Coffee Lab (cupping + roasting)",
      "Private boat",
      "Lunch included",
      "Cold brew on board",
      "Visits to San Juan and San Pedro",
      "Complimentary bag of coffee"
    ],
    includes: "Laboratorio de Café (catación + tostado), lancha privada, almuerzo, cold brew a bordo, visitas en San Juan y San Pedro, bolsa de café de regalo.",
    includes_en: "Coffee Lab (cupping + roasting), private boat, lunch, cold brew on board, visits to San Juan and San Pedro, complimentary bag of coffee.",
    itinerary: [
      { time: "08:30", activity: "Inicio en la tostaduría. Laboratorio de Café condensado: tostado en vivo, catación de 3 cafés, maridaje express con repostería artesanal." },
      { time: "10:30", activity: "Caminata al muelle (~5 min). Tiempo para comprar café en la tienda. Abordaje a lancha privada." },
      { time: "10:45", activity: "Navegación a San Juan La Laguna (~30 min). Cold brew de la tostaduría a bordo. Vista de los volcanes." },
      { time: "11:15", activity: "San Juan La Laguna. Visita express a cooperativa de teñido y galería de arte naíf. Almuerzo en restaurante local con vista al lago." },
      { time: "12:45", activity: "Navegación a San Pedro (~10 min). Parada breve para explorar la calle principal y tomar un chocolate artesanal." },
      { time: "13:30", activity: "San Pedro La Laguna. Tiempo libre para explorar. Mapa curado con recomendaciones." },
      { time: "15:00", activity: "Regreso a Panajachel. Bolsa de café recién tostado como recuerdo del día." }
    ],
    itinerary_en: [
      { time: "08:30", activity: "Start at the roastery. Condensed Coffee Lab: live roasting, cupping of 3 coffees, express pairing with artisan pastries." },
      { time: "10:30", activity: "Walk to the dock (~5 min). Time to buy coffee at the shop. Boarding the private boat." },
      { time: "10:45", activity: "Navigation to San Juan La Laguna (~30 min). Roastery cold brew on board. Volcano views." },
      { time: "11:15", activity: "San Juan La Laguna. Express visit to natural dye cooperative and naïf art gallery. Lunch at a local restaurant with lake views." },
      { time: "12:45", activity: "Navigation to San Pedro (~10 min). Brief stop to explore the main street and enjoy an artisan hot chocolate." },
      { time: "13:30", activity: "San Pedro La Laguna. Free time to explore. Curated map with recommendations." },
      { time: "15:00", activity: "Return to Panajachel. Bag of freshly roasted coffee as a souvenir of the day." }
    ],
    prices: [
      { id: "9-1", label: "Por persona", label_en: "Per person", amount: "$55 USD", description: "Grupo 5-10 pax · Todo incluido", description_en: "Group 5-10 pax · All inclusive" }
    ],
    addons: [
      { id: "a9-1", label: "Fotografía profesional", label_en: "Professional photography", price: "80-120" },
      { id: "a9-2", label: "Upgrade cena en Panajachel", label_en: "Dinner upgrade in Panajachel", price: "25-45 p/p" }
    ],
    meals: ['almuerzo']
  },

  // ==================== DÍAS DE CAMPO ====================
  {
    id: 10,
    name: "Día de Campo Esencial",
    name_en: "Essential Picnic Day",
    category: "Días de Campo",
    concept: "Canasta Esencial · San Lucas Tolimán · Tu Ritmo",
    concept_en: "Essential Basket · San Lucas Tolimán · Your Pace",
    description: "Canasta con lo esencial para un día perfecto al aire libre en San Lucas Tolimán. Sándwiches gourmet, frutas, bebidas. Nosotros resolvemos la logística, tú disfrutas.",
    description_en: "A basket with all the essentials for a perfect outdoor day in San Lucas Tolimán. Gourmet sandwiches, fruits, drinks. We handle the logistics, you enjoy.",
    price: 45,
    duration: "4–8 h (tú decides)",
    format: "Privado · Tu ritmo",
    format_en: "Private · Your pace",
    image: "DSC04226_xwlrkb",
    gallery: [
      "DSC04226_xwlrkb",
      "DSC04213_y7d6xs",
      "DSC04235_vi1v0p",
      "DSC04269_oyeeuc",
      "DSC04361_iuucat",
      "DSC04359_kkmswv"
    ],
    isNew: true,
    rating: 4.9,
    reviews: 45,
    features: [
      "Lancha ida y vuelta a San Lucas",
      "Canasta esencial completa",
      "Mantel + vajilla reutilizable",
      "Asesoría de spot"
    ],
    features_en: [
      "Round-trip boat to San Lucas",
      "Complete essential basket",
      "Tablecloth + reusable dinnerware",
      "Spot selection advice"
    ],
    includes: "Lancha ida y vuelta a San Lucas, canasta esencial (sándwiches gourmet, fruta, limonada, café frío, galletas), mantel, vajilla reutilizable, asesoría de spot.",
    includes_en: "Round-trip boat to San Lucas, essential basket (gourmet sandwiches, fruit, lemonade, iced coffee, cookies), tablecloth, reusable dinnerware, spot selection advice.",
    itinerary: [
      { time: "09:00", activity: "Encuentro en muelle de Panajachel. Tu canasta ya está lista y cargada en la lancha. Revisión del contenido con el equipo." },
      { time: "09:40", activity: "Llegada a San Lucas Tolimán. Nuestro equipo te ayuda a elegir tu spot: playa a orillas del lago, área verde con sombra, o mirador con vista al volcán Tolimán." },
      { time: "Todo el día", activity: "Tu día, tu ritmo. No es un tour guiado — es TU día de campo. Sándwiches gourmet, fruta de temporada, limonada natural, café frío de la tostaduría, galletas artesanales." },
      { time: "Flexible", activity: "Recogida. Llámanos o envía mensaje cuando estés listo. La lancha viene por ti. Recogemos la canasta y equipo." }
    ],
    itinerary_en: [
      { time: "09:00", activity: "Meeting at Panajachel dock. Your basket is ready and loaded on the boat. Content review with the team." },
      { time: "09:40", activity: "Arrival at San Lucas Tolimán. Our team helps you choose your spot: lakeside beach, shaded green area, or viewpoint overlooking Tolimán volcano." },
      { time: "All day", activity: "Your day, your pace. This is not a guided tour -- it's YOUR picnic day. Gourmet sandwiches, seasonal fruit, natural lemonade, iced coffee from the roastery, artisan cookies." },
      { time: "Flexible", activity: "Pickup. Call or message us when you're ready. The boat comes to get you. We collect the basket and equipment." }
    ],
    prices: [
      { id: "10-1", label: "Por persona", label_en: "Per person", amount: "$45 USD", description: "Grupo 5-10 pax", description_en: "Group 5-10 pax" }
    ],
    addons: [
      { id: "a10-1", label: "Kayak/SUP (renta)", label_en: "Kayak/SUP (rental)", price: "10-16 p/p" },
      { id: "a10-2", label: "Upgrade a canasta premium", label_en: "Upgrade to premium basket", price: "+15 p/p" }
    ],
    meals: ['picnic']
  },
  {
    id: 11,
    name: "Día de Campo Premium",
    name_en: "Premium Picnic Day",
    category: "Días de Campo",
    concept: "Canasta Premium · Quesos · Vino · Cold Brew",
    concept_en: "Premium Basket · Cheeses · Wine · Cold Brew",
    description: "Canasta elevada: tabla de quesos y embutidos, vino o cervezas artesanales, ensalada fresca, pan artesanal y cold brew de nuestra tostaduría.",
    description_en: "Elevated basket: cheese and charcuterie board, wine or craft beers, fresh salad, artisan bread and cold brew from our roastery.",
    price: 60,
    duration: "4–8 h (tú decides)",
    format: "Privado · Tu ritmo",
    format_en: "Private · Your pace",
    image: "DSC04336_bqmz9o",
    gallery: [
      "DSC04336_bqmz9o",
      "DSC04238_swyart",
      "DSC04291_k4ew5f",
      "DSC04213_y7d6xs",
      "DSC04216_v998mf",
      "DSC04218_lluvgq",
      "DSC04226_xwlrkb",
      "DSC04235_vi1v0p",
      "DSC04269_oyeeuc",
      "DSC04286_dnfvaq"
    ],
    isNew: true,
    rating: 5.0,
    reviews: 30,
    features: [
      "Lancha ida y vuelta",
      "Canasta premium completa",
      "Tabla de quesos y embutidos",
      "Vino o cervezas artesanales",
      "Vajilla de cerámica + copas",
      "Bolsa térmica"
    ],
    features_en: [
      "Round-trip boat",
      "Complete premium basket",
      "Cheese and charcuterie board",
      "Wine or craft beers",
      "Ceramic dinnerware + glasses",
      "Thermal bag"
    ],
    includes: "Lancha ida y vuelta, canasta premium (tabla de quesos, embutidos, ensalada, pan, vino/cervezas, cold brew, postre, fruta), mantel premium, vajilla de cerámica, copas, bolsa térmica.",
    includes_en: "Round-trip boat, premium basket (cheese board, charcuterie, salad, bread, wine/beers, cold brew, dessert, fruit), premium tablecloth, ceramic dinnerware, glasses, thermal bag.",
    itinerary: [
      { time: "09:00", activity: "Encuentro en muelle de Panajachel. Tu canasta premium ya cargada. Incluye bolsa térmica para mantener fríos los vinos y quesos." },
      { time: "09:40", activity: "Llegada a San Lucas Tolimán. Nuestro equipo te lleva al spot ideal: playa privada, zona de sombra en finca, o terraza con vista volcánica." },
      { time: "Todo el día", activity: "Canasta Premium desplegada. Tabla de quesos y embutidos, ensalada fresca, pan artesanal, vino o cervezas artesanales guatemaltecas, cold brew, postre del día, fruta de temporada." },
      { time: "Flexible", activity: "Recogida cuando tú decidas. La lancha regresa por ti y recogemos todo el equipo." }
    ],
    itinerary_en: [
      { time: "09:00", activity: "Meeting at Panajachel dock. Your premium basket already loaded. Includes thermal bag to keep wines and cheeses chilled." },
      { time: "09:40", activity: "Arrival at San Lucas Tolimán. Our team takes you to the ideal spot: private beach, shaded area on a finca, or terrace with volcanic views." },
      { time: "All day", activity: "Premium Basket deployed. Cheese and charcuterie board, fresh salad, artisan bread, wine or Guatemalan craft beers, cold brew, dessert of the day, seasonal fruit." },
      { time: "Flexible", activity: "Pickup whenever you decide. The boat returns for you and we collect all the equipment." }
    ],
    prices: [
      { id: "11-1", label: "Por persona", label_en: "Per person", amount: "$60 USD", description: "Grupo 5-10 pax", description_en: "Group 5-10 pax" }
    ],
    addons: [
      { id: "a11-1", label: "Kayak/SUP (renta)", label_en: "Kayak/SUP (rental)", price: "10-16 p/p" },
      { id: "a11-2", label: "Upgrade a Celebración", label_en: "Upgrade to Celebration", price: "+15 p/p" }
    ],
    meals: ['picnic']
  },
  {
    id: 12,
    name: "Canasta Celebración",
    name_en: "Celebration Basket",
    category: "Días de Campo",
    concept: "Todo lo Premium + Prosecco · Decoración · Personalizado",
    concept_en: "Everything Premium + Prosecco · Décor · Personalized",
    description: "Para momentos especiales: todo lo Premium + prosecco, decoración con flores y velas, mensaje personalizado. Aniversarios, cumpleaños, propuestas.",
    description_en: "For special moments: everything Premium + prosecco, floral and candle décor, personalized message. Anniversaries, birthdays, proposals.",
    price: 75,
    duration: "4–8 h (tú decides)",
    format: "Privado · Exclusivo",
    format_en: "Private · Exclusive",
    image: "DSC04213-2_nw4evi",
    gallery: [
      "DSC04213-2_nw4evi",
      "DSC04216_v998mf",
      "DSC04218_lluvgq",
      "DSC04286_dnfvaq",
      "DSC04336_bqmz9o",
      "DSC04238_swyart",
      "DSC04291_k4ew5f",
      "DSC04363_dt2vuy"
    ],
    isNew: true,
    rating: 5.0,
    reviews: 15,
    features: [
      "Lancha ida y vuelta",
      "Canasta celebración completa",
      "Prosecco o champagne",
      "Decoración personalizada (flores, velas)",
      "Pastel o postre especial",
      "Setup y desmontaje por equipo",
      "Bocina bluetooth"
    ],
    features_en: [
      "Round-trip boat",
      "Complete celebration basket",
      "Prosecco or champagne",
      "Personalized décor (flowers, candles)",
      "Cake or special dessert",
      "Setup and teardown by our team",
      "Bluetooth speaker"
    ],
    includes: "Lancha ida y vuelta, canasta celebración completa (todo lo Premium + prosecco/champagne, pastel especial), decoración personalizada (flores, velas, mensaje), setup y desmontaje, bocina bluetooth, coordinación previa.",
    includes_en: "Round-trip boat, complete celebration basket (everything Premium + prosecco/champagne, special cake), personalized décor (flowers, candles, message), setup and teardown, Bluetooth speaker, prior coordination.",
    itinerary: [
      { time: "Flexible", activity: "Encuentro en muelle de Panajachel. Tu canasta celebración está lista. El equipo ha preparado la decoración según tus indicaciones (coordinación 48h antes)." },
      { time: "+40 min", activity: "Llegada a San Lucas Tolimán. Nuestro equipo monta el setup de celebración: mantel especial, flores, velas, mensaje personalizado, decoración temática." },
      { time: "+15 min", activity: "Setup listo, sorpresa revelada. Si es una propuesta o sorpresa, coordinamos el momento. Brindis con prosecco/champagne." },
      { time: "Todo el día", activity: "Canasta Celebración. Todo lo de la Premium + prosecco, pastel especial, decoración con flores frescas, velas aromáticas, tarjeta personalizada. Bocina bluetooth." },
      { time: "Flexible", activity: "Recogida. Desmontamos todo discretamente. Opción de atardecer en lancha de regreso si el horario lo permite." }
    ],
    itinerary_en: [
      { time: "Flexible", activity: "Meeting at Panajachel dock. Your celebration basket is ready. The team has prepared the décor according to your instructions (coordinated 48h in advance)." },
      { time: "+40 min", activity: "Arrival at San Lucas Tolimán. Our team sets up the celebration: special tablecloth, flowers, candles, personalized message, themed décor." },
      { time: "+15 min", activity: "Setup ready, surprise revealed. If it's a proposal or surprise, we coordinate the moment. Toast with prosecco/champagne." },
      { time: "All day", activity: "Celebration Basket. Everything from the Premium + prosecco, special cake, fresh flower décor, aromatic candles, personalized card. Bluetooth speaker." },
      { time: "Flexible", activity: "Pickup. We discreetly tear down everything. Option for a sunset boat ride back if timing allows." }
    ],
    prices: [
      { id: "12-1", label: "Por persona", label_en: "Per person", amount: "$75 USD", description: "Grupo 5-10 pax · Exclusivo", description_en: "Group 5-10 pax · Exclusive" }
    ],
    addons: [
      { id: "a12-1", label: "Fotógrafo 60-90 min", label_en: "Photographer 60-90 min", price: "120-180" },
      { id: "a12-2", label: "Reel vertical 30-60s", label_en: "Vertical reel 30-60s", price: "250-450" }
    ],
    meals: ['picnic']
  }
];
