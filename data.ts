
import { Tour } from './types';

export const TOURS: Tour[] = [
  {
    id: 1,
    name: "Atitlán Signature",
    category: "Premium",
    concept: "3 Pueblos + 3 Sabores (Full Day)",
    description: "Tour insignia combinando cultura + hospitalidad sin fricción con 3 consumos reservados en pueblos icónicos.",
    price: 129,
    duration: "8–9 h",
    format: "Small group premium / Privado",
    image: "DSC04496_noiz4x",
    isBestSeller: true,
    rating: 4.9,
    reviews: 1240,
    features: ["Lancha propia + Capitán", "Host bilingüe (EN/ES)", "3 Consumos incluidos", "Agua"],
    itinerary: [
      { time: "08:00", activity: "Recepción en Panajachel + welcome drink" },
      { time: "08:15", activity: "Desayuno breve + briefing" },
      { time: "09:15", activity: "Lancha a San Juan La Laguna" },
      { time: "09:45", activity: "Ruta curada (murales/arte + taller)" },
      { time: "11:15", activity: "Almuerzo reservado (San Juan)" },
      { time: "12:45", activity: "Lancha a Santiago Atitlán" },
      { time: "13:15", activity: "Experiencia cultural + tiempo libre" },
      { time: "15:00", activity: "Coffee/postre reservado (Santiago)" },
      { time: "16:15", activity: "Regreso a Panajachel + cierre" }
    ],
    prices: [
      { id: "1-1", label: "Small group Classic", amount: "129 p/p", description: "Precio piso" },
      { id: "1-2", label: "Small group Premium", amount: "139 p/p", description: "Precio objetivo" },
      { id: "1-3", label: "Privado (2-6 pax)", amount: "890 grupo", description: "+35 p/p adicional" }
    ],
    addons: [
      { id: "a1-1", label: "Fotografía Mini", price: "80-120" },
      { id: "a1-2", label: "Drone (clips + fotos)", price: "80-150" },
      { id: "a1-3", label: "Coffee flight/tasting", price: "12-20 p/p" }
    ]
  },
  {
    id: 2,
    name: "Sunset Cruise",
    category: "Privado",
    concept: "Lancha Privada + Vino & Tapas (Golden Hour)",
    description: "Atardecer premium tipo 'boat lounge' con tabla y bebidas en el momento más mágico del lago.",
    price: 290,
    duration: "1.5–2 h",
    format: "Privado (por lancha)",
    image: "DSC04503_mb5wi7",
    rating: 5.0,
    reviews: 850,
    features: ["Lancha privada + capitán", "Host a bordo", "Tabla gourmet", "Bebidas premium"],
    itinerary: [
      { time: "16:30", activity: "Check-in muelle Panajachel + briefing" },
      { time: "16:40", activity: "Embarque + welcome drink" },
      { time: "16:50", activity: "Ruta golden hour + spot fotos" },
      { time: "17:20", activity: "Servicio de tabla premium + bebidas" },
      { time: "18:10", activity: "Retorno" }
    ],
    prices: [
      { id: "2-1", label: "Sunset Classic", amount: "290", description: "Vino + tabla base" },
      { id: "2-2", label: "Sunset Craft", amount: "320", description: "Cervezas premium + tapas" },
      { id: "2-3", label: "Sunset Luxury", amount: "420", description: "Espumante + tabla premium + postre" }
    ],
    addons: [
      { id: "a2-1", label: "Fotógrafo 60-90 min", price: "120-180" },
      { id: "a2-2", label: "Proposal kit", price: "120-220" },
      { id: "a2-3", label: "Reel vertical 30-60s", price: "250-450" }
    ]
  },
  {
    id: 3,
    name: "Amanecer Indian Nose",
    category: "Aventura",
    concept: "Indian Nose + Brunch (Half Day)",
    description: "Peak memory de Atitlán: amanecer espectacular seguido de un brunch premium en Panajachel.",
    price: 129,
    duration: "5–7 h",
    format: "Small group / Privado",
    image: "DSC04387_zcq91s",
    rating: 4.8,
    reviews: 2100,
    features: ["Transporte coordinado", "Guía bilingüe + local", "Brunch premium"],
    itinerary: [
      { time: "03:00", activity: "Pick-up o punto fijo + traslado" },
      { time: "04:30", activity: "Inicio caminata con guía local" },
      { time: "06:00", activity: "Amanecer + fotos" },
      { time: "07:30", activity: "Retorno" },
      { time: "08:30", activity: "Brunch reservado en Panajachel" }
    ],
    prices: [
      { id: "3-1", label: "Small group Standard", amount: "129 p/p", description: "Básico" },
      { id: "3-2", label: "Small group Comfort", amount: "139 p/p", description: "Grupo pequeño + extras" },
      { id: "3-3", label: "Privado (2-4 pax)", amount: "620 grupo", description: "+45 p/p adicional" }
    ],
    addons: [
      { id: "a3-1", label: "Headlamp incluido", price: "5-10 p/p" },
      { id: "a3-2", label: "Drone add-on", price: "80-150" },
      { id: "a3-3", label: "Wellness (temazcal)", price: "25-80 p/p" }
    ]
  },
  {
    id: 4,
    name: "Nature & Zipline",
    category: "Aventura",
    concept: "Nature & Zipline + Lunch (Pana Adventure)",
    description: "Naturaleza controlada en reserva natural con opción de adrenalina y almuerzo garantizado.",
    price: 89,
    duration: "4–6 h",
    format: "Small group",
    image: "DSC04002_sfqosk",
    rating: 4.7,
    reviews: 530,
    features: ["Entrada incluida", "Caminata guiada ligera", "Almuerzo reservado"],
    itinerary: [
      { time: "09:00", activity: "Traslado local + ingreso a reserva" },
      { time: "09:30", activity: "Caminata guiada (senderos/mariposario)" },
      { time: "11:00", activity: "Opción zipline (upgrade)" },
      { time: "13:00", activity: "Almuerzo reservado en Panajachel" }
    ],
    prices: [
      { id: "4-1", label: "Nature Classic", amount: "89 p/p", description: "Sin zipline" },
      { id: "4-2", label: "Nature All-in", amount: "109 p/p", description: "Con entrada zipline" }
    ],
    addons: [
      { id: "a4-1", label: "Fotografía Mini", price: "80-120" },
      { id: "a4-2", label: "Upgrade bebidas/comida", price: "8-15 p/p" }
    ]
  },
  {
    id: 5,
    name: "Private Lake Day",
    category: "Privado",
    concept: "Ruta Flexible + Mesa Garantizada",
    description: "Ruta a la carta con lancha privada y logística completa para un día perfecto en el lago.",
    price: 420,
    duration: "4 h o 8 h",
    format: "Privado (por lancha)",
    image: "DSC04291_k4ew5f",
    rating: 5.0,
    reviews: 120,
    features: ["Lancha privada", "Planificación previa", "Reservas garantizadas"],
    itinerary: [
      { time: "09:00", activity: "Briefing + propuesta de ruta (2-4 paradas)" },
      { time: "10:30", activity: "Paradas curadas (arte/playa/cultura)" },
      { time: "13:00", activity: "Almuerzo en sucursal recomendada" },
      { time: "15:00", activity: "Retorno a muelle de origen" }
    ],
    prices: [
      { id: "5-1", label: "Half Day Explorer (4h)", amount: "420 grupo", description: "Hasta 6 pax" },
      { id: "5-2", label: "Full Day Elite (8h)", amount: "650 grupo", description: "Hasta 6 pax" }
    ],
    addons: [
      { id: "a5-1", label: "Lunch menú fijo", price: "25-45 p/p" },
      { id: "a5-2", label: "Guía premium Full Day", price: "150" },
      { id: "a5-3", label: "Sunset add-on", price: "+290-420" }
    ]
  },
  {
    id: 6,
    name: "Palopó Art Route",
    category: "Cultural",
    concept: "Santa Catarina + San Antonio (Half/Full)",
    description: "Ruta estética y artesanal visitando pueblos pintados y talleres cerámicos menos saturados.",
    price: 119,
    duration: "5–9 h",
    format: "Small group / Privado",
    image: "DSC04414_ziuyjw",
    rating: 4.8,
    reviews: 210,
    features: ["Lancha + coordinación", "Taller cerámico curado", "Guía bilingüe"],
    itinerary: [
      { time: "09:00", activity: "Lancha a Santa Catarina: caminata + fotos" },
      { time: "11:00", activity: "Lancha a San Antonio: visita taller cerámico" },
      { time: "12:30", activity: "Tiempo de compra curado" },
      { time: "13:30", activity: "Opción Full Day: comida reservada" }
    ],
    prices: [
      { id: "6-1", label: "Half (Art Walk)", amount: "119 p/p", description: "Solo mañana" },
      { id: "6-2", label: "Full (Art + Lunch)", amount: "149 p/p", description: "Con almuerzo" },
      { id: "6-3", label: "Privado (2-6 pax)", amount: "720 grupo", description: "+35 p/p adicional" }
    ],
    addons: [
      { id: "a6-1", label: "Fotografía Standard", price: "150-230" },
      { id: "a6-2", label: "Safe packing cerámica", price: "10-25" }
    ]
  },
  {
    id: 7,
    name: "Wellness Escape",
    category: "Cultural",
    concept: "Yoga/Temazcal + Lunch (San Marcos)",
    description: "Wellness slow travel: inmersión en yoga, cacao o temazcal con almuerzo saludable reservado.",
    price: 129,
    duration: "4–6 h",
    format: "Small group / Privado",
    image: "DSC03989_ywaz7j",
    rating: 4.9,
    reviews: 320,
    features: ["Host bilingüe", "Actividad wellness incluida", "Almuerzo saludable"],
    itinerary: [
      { time: "09:00", activity: "Lancha a San Marcos La Laguna" },
      { time: "10:00", activity: "Actividad wellness (Yoga/Cacao/Temazcal)" },
      { time: "12:30", activity: "Almuerzo reservado en Panajachel" },
      { time: "14:00", activity: "Retorno y cierre" }
    ],
    prices: [
      { id: "7-1", label: "Yoga & Lunch", amount: "129 p/p", description: "Small Group" },
      { id: "7-2", label: "Privado (2-6 pax)", amount: "690 grupo", description: "+35 p/p adicional" }
    ],
    addons: [
      { id: "a7-1", label: "Masaje 60 min", price: "26-52 p/p" },
      { id: "a7-2", label: "Concierge WhatsApp", price: "15-35" }
    ]
  },
  {
    id: 8,
    name: "Hidden South Shore",
    category: "Privado",
    concept: "San Lucas Tolimán Beach Picnic (Full Day)",
    description: "Destino menos visitado con día de playa y picnic premium en la orilla del lago.",
    price: 149,
    duration: "6–8 h",
    format: "Small group / Privado",
    image: "DSC04226_xwlrkb",
    rating: 4.9,
    reviews: 85,
    features: ["Lancha + capitán", "Picnic premium + agua", "Manejo de residuos (Leave No Trace)"],
    itinerary: [
      { time: "08:30", activity: "Briefing + desayuno breve (opcional)" },
      { time: "09:30", activity: "Lancha a San Lucas Tolimán" },
      { time: "11:00", activity: "Playa/lago (nadar/relax/fotos)" },
      { time: "13:00", activity: "Picnic premium servido" },
      { time: "15:30", activity: "Regreso a Panajachel" }
    ],
    prices: [
      { id: "8-1", label: "Small group Premium", amount: "149 p/p", description: "Mín 4 pax" },
      { id: "8-2", label: "Privado (2-6 pax)", amount: "820 grupo", description: "+35 p/p adicional" }
    ],
    addons: [
      { id: "a8-1", label: "Wine/Craft add-on", price: "25-55 p/p" },
      { id: "a8-2", label: "Kayak/SUP (renta)", price: "10-16 p/p" }
    ]
  },
  {
    id: 9,
    name: "San Pedro Foodies",
    category: "Gastronomía",
    concept: "Food & Viewpoints (Half Day)",
    description: "San Pedro 'curado': miradores, calle gastronómica y tiempo libre controlado sin saturar.",
    price: 99,
    duration: "4–6 h",
    format: "Small group / Privado",
    image: "DSC04188_gpbth7",
    rating: 4.7,
    reviews: 440,
    features: ["Guía bilingüe", "1 Consumo curado", "Caminata suave"],
    itinerary: [
      { time: "09:00", activity: "Salida Panajachel → San Pedro" },
      { time: "09:30", activity: "Caminata corta a miradores" },
      { time: "11:00", activity: "Food stop curado (Street food/Café/Helado)" },
      { time: "12:15", activity: "Tiempo libre guiado (compras/arte)" },
      { time: "13:30", activity: "Regreso Panajachel" }
    ],
    prices: [
      { id: "9-1", label: "Small group Classic", amount: "99 p/p", description: "Básico" },
      { id: "9-2", label: "Small group Premium", amount: "109 p/p", description: "+2 consumos" },
      { id: "9-3", label: "Privado (2-6 pax)", amount: "590 grupo", description: "+35 p/p adicional" }
    ],
    addons: [
      { id: "a9-1", label: "Reel vertical", price: "250-450" },
      { id: "a9-2", label: "Dinner upgrade Pana", price: "25-45 p/p" }
    ]
  },
  {
    id: 10,
    name: "Volcano Hike",
    category: "Aventura",
    concept: "Volcán San Pedro (Full Day Adventure)",
    description: "Aventura 'top tier' con logística completa: caminata intensa y recuperación con comida reservada.",
    price: 159,
    duration: "10–12 h",
    format: "Small group / Privado",
    image: "DSC04094_vht4pi",
    rating: 4.9,
    reviews: 1500,
    features: ["Guía montaña", "Comida recuperación incluida", "Transporte completo"],
    itinerary: [
      { time: "05:00", activity: "Pick-up temprano + lancha a San Pedro" },
      { time: "06:00", activity: "Inicio ascenso con guía local" },
      { time: "11:00", activity: "Cumbre + descanso/fotos" },
      { time: "14:00", activity: "Descenso" },
      { time: "16:00", activity: "Comida de recuperación reservada" }
    ],
    prices: [
      { id: "10-1", label: "Small group Standard", amount: "159 p/p", description: "Base" },
      { id: "10-2", label: "Small group Premium", amount: "179 p/p", description: "Hidratación + snacks reales" },
      { id: "10-3", label: "Privado (2-4 pax)", amount: "780 grupo", description: "+55 p/p adicional" }
    ],
    addons: [
      { id: "a10-1", label: "Pack hidratación premium", price: "8-15 p/p" },
      { id: "a10-2", label: "Fotografía (caminata)", price: "150-550" },
      { id: "a10-3", label: "Masaje post-hike", price: "26-52 p/p" }
    ]
  },
  {
    id: 11,
    name: "Santa Cruz Bay",
    category: "Aventura",
    concept: "Kayak / SUP + Coffee & Brunch (Half Day)",
    description: "Mañana tranquila en bahía de bajo oleaje con actividad suave y brunch premium.",
    price: 109,
    duration: "4–6 h",
    format: "Small group / Privado",
    image: "DSC04374_rdep9d",
    rating: 4.8,
    reviews: 670,
    features: ["Equipo Kayak/SUP", "Coffee break simple", "Brunch incluido"],
    itinerary: [
      { time: "07:30", activity: "Salida Panajachel → Santa Cruz" },
      { time: "08:00", activity: "Actividad Kayak o SUP" },
      { time: "09:30", activity: "Coffee break / fruta" },
      { time: "10:30", activity: "Brunch reservado" },
      { time: "12:00", activity: "Cierre" }
    ],
    prices: [
      { id: "11-1", label: "Small group Standard", amount: "109 p/p", description: "Básico" },
      { id: "11-2", label: "Small group All-in", amount: "129-139 p/p", description: "Con Kayak/SUP incl." },
      { id: "11-3", label: "Privado (2-6 pax)", amount: "640 grupo", description: "+35 p/p adicional" }
    ],
    addons: [
      { id: "a11-1", label: "Coffee flight upgrade", price: "12-20 p/p" },
      { id: "a11-2", label: "Upgrade brunch premium", price: "12-25 p/p" }
    ]
  },
  {
    id: 12,
    name: "Atitlán Artisan Day",
    category: "Cultural",
    concept: "Textiles + Cerámica (Full Day)",
    description: "Día de artesanía auténtica: textiles en San Juan y cerámica en San Antonio con tiempo curado.",
    price: 139,
    duration: "7–9 h",
    format: "Small group / Privado",
    image: "DSC04052_zyoxm8",
    rating: 4.9,
    reviews: 180,
    features: ["Ruta textil curada", "Taller cerámico", "Almuerzo menú fijo"],
    itinerary: [
      { time: "08:30", activity: "Salida Panajachel → San Juan" },
      { time: "09:00", activity: "Ruta textil curada + demostración" },
      { time: "11:00", activity: "Coffee/postre reservado" },
      { time: "12:00", activity: "Lancha a San Antonio" },
      { time: "14:30", activity: "Almuerzo reservado" },
      { time: "16:00", activity: "Regreso + cierre" }
    ],
    prices: [
      { id: "12-1", label: "Small group Standard", amount: "139 p/p", description: "Full Day" },
      { id: "12-2", label: "Small group Premium", amount: "159 p/p", description: "Grupo más pequeño" },
      { id: "12-3", label: "Privado (2-6 pax)", amount: "820 grupo", description: "+35 p/p adicional" }
    ],
    addons: [
      { id: "a12-1", label: "Safe packing cerámica", price: "10-25" },
      { id: "a12-2", label: "Concierge WhatsApp", price: "15-35" }
    ]
  },
  {
    id: 13,
    name: "Coffee Lab",
    category: "Gastronomía",
    concept: "Cata + Agua + Pairing (Half Day)",
    description: "Experiencia premium de café: flight, explicación técnica y pairing para extranjeros curiosos.",
    price: 59,
    duration: "3–4 h",
    format: "Small group (limitado) / Privado",
    image: "DSC04238_swyart",
    rating: 5.0,
    reviews: 95,
    features: ["Cata profesional", "Pairing postre/tapas", "Guía barista"],
    itinerary: [
      { time: "10:00", activity: "Recepción + introducción" },
      { time: "10:20", activity: "Coffee flight (3-4 muestras)" },
      { time: "11:10", activity: "Charla: El agua y por qué importa" },
      { time: "11:40", activity: "Pairing (postre/tapas)" },
      { time: "12:30", activity: "Cierre + opción de compra" }
    ],
    prices: [
      { id: "13-1", label: "Small group Standard", amount: "59 p/p", description: "Cata básica" },
      { id: "13-2", label: "Small group Premium", amount: "79 p/p", description: "Grupo ultra pequeño" },
      { id: "13-3", label: "Privado (2-8 pax)", amount: "320 grupo", description: "+25 p/p adicional" }
    ],
    addons: [
      { id: "a13-1", label: "Upgrade 5-6 muestras", price: "+10-18 p/p" },
      { id: "a13-2", label: "Bottle/wine pairing", price: "+15-35 p/p" }
    ]
  },
  {
    id: 14,
    name: "Sunrise on Water",
    category: "Privado",
    concept: "Kayak/Boat Photos + Breakfast",
    description: "Amanecer sin caminata: sesión de fotos en el lago con luz dorada y desayuno reservado.",
    price: 69,
    duration: "2.5–4 h",
    format: "Privado / Small group mini",
    image: "DSC04490_eqqgtz",
    rating: 4.9,
    reviews: 130,
    features: ["Kayak/Lancha propia", "Desayuno menú fijo", "Host bilingüe"],
    itinerary: [
      { time: "05:30", activity: "Encuentro muelle Panajachel" },
      { time: "05:45", activity: "Salida a spot de amanecer" },
      { time: "06:15", activity: "Sesión foto (luz dorada)" },
      { time: "07:30", activity: "Desayuno reservado en Panajachel" }
    ],
    prices: [
      { id: "14-1", label: "Small group mini", amount: "69 p/p", description: "Cupo 6-8" },
      { id: "14-2", label: "Privado (hasta 4 pax)", amount: "260 grupo", description: "Total grupo" },
      { id: "14-3", label: "Privado (hasta 6 pax)", amount: "320 grupo", description: "Total grupo" }
    ],
    addons: [
      { id: "a14-1", label: "Fotógrafo 60-90 min", price: "120-180" },
      { id: "a14-2", label: "Drone add-on", price: "80-150" }
    ]
  }
];
