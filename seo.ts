import { TOURS } from './data';
import { Tour } from './types';

export const SITE_URL = 'https://atitlanexperience.com';
export const LOCALE = 'es-419';
export const DEFAULT_OG_IMAGE =
  'https://static.wixstatic.com/media/acc6a6_239e70f3ee8d48aab8d7041ebafb9892~mv2.jpg';
export const LOGO_URL =
  'https://static.wixstatic.com/media/acc6a6_923203f0b02b49afadd0f156f6363de3~mv2.png';

// Keywords principales para SEO
export const DEFAULT_KEYWORDS = [
  'tours Panajachel',
  'tours en Pana',
  'que hacer en Panajachel',
  'lanchas Lago Atitlán',
  'lanchas privadas Panajachel',
  'tours Lago Atitlán',
  'actividades Lago Atitlán',
  'excursiones Guatemala',
  'paseos en lancha Atitlán',
  'San Pedro La Laguna tours',
  'San Juan La Laguna tours',
  'Santiago Atitlán tours',
  'kayak Lago Atitlán',
  'volcán San Pedro Guatemala',
  'atardecer Lago Atitlán',
  'Indian Nose amanecer',
  'turismo Guatemala',
  'que hacer en Pana Guatemala',
].join(', ');

export type PageKey = 'home' | 'catalogo' | 'conocenos' | 'contacto';

export type PageMeta = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
};

export const PAGE_META: Record<PageKey, PageMeta> = {
  home: {
    title: 'Tours en Panajachel y Lago Atitlán | Lanchas, Excursiones y Actividades | Atitlán Experiences',
    description:
      'Tours en Panajachel y Lago Atitlán, Guatemala: lanchas privadas, excursiones a pueblos mayas, actividades de aventura y experiencias gastronómicas. Reserva qué hacer en Pana con logística premium.',
    path: '/',
  },
  catalogo: {
    title: 'Qué Hacer en Panajachel: Tours, Lanchas y Actividades en Lago Atitlán',
    description:
      'Catálogo de tours en Panajachel: lanchas a San Pedro, San Juan y Santiago, paseos en kayak, volcanes, atardeceres y más. Las mejores actividades en el Lago Atitlán, Guatemala.',
    path: '/catalogo',
  },
  conocenos: {
    title: 'Operador de Tours en Panajachel, Guatemala | Atitlán Experiences',
    description:
      'Somos operadores locales de tours en Panajachel y Lago Atitlán. Lanchas privadas, guías bilingües y experiencias curadas en Guatemala. Conoce nuestro equipo.',
    path: '/conocenos',
  },
  contacto: {
    title: 'Reservar Tours en Panajachel | Contacto | Atitlán Experiences',
    description:
      'Reserva tours, lanchas privadas y actividades en Panajachel y Lago Atitlán. WhatsApp disponible. Planifica qué hacer en tu visita a Guatemala.',
    path: '/contacto',
  },
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

export const getTourSlug = (tour: Tour) => slugify(tour.name);

export const getTourPath = (tour: Tour) => `/experiencias/${getTourSlug(tour)}`;

export const getTourUrl = (tour: Tour) => `${SITE_URL}${getTourPath(tour)}`;

// Keywords por categoría para mejorar SEO
const CATEGORY_KEYWORDS: Record<string, string> = {
  Premium: 'tour premium en Panajachel',
  Privado: 'lancha privada Lago Atitlán',
  Aventura: 'actividades de aventura en Guatemala',
  Cultural: 'tour cultural pueblos mayas',
  Gastronomía: 'experiencia gastronómica Atitlán',
};

export const getTourMeta = (tour: Tour): PageMeta => {
  const categoryKeyword = CATEGORY_KEYWORDS[tour.category] || 'tour en Panajachel';
  return {
    title: `${tour.name} | ${tour.category === 'Privado' ? 'Lancha Privada' : 'Tour'} en Panajachel, Lago Atitlán`,
    description: `${tour.description} ${categoryKeyword}. Desde $${tour.price} USD. Duración ${tour.duration}. Reserva en Panajachel, Guatemala.`,
    path: getTourPath(tour),
    ogImage: tour.image,
  };
};

export const getTourBySlug = (slug: string | undefined) =>
  TOURS.find((tour) => getTourSlug(tour) === slug) ?? null;

export const getAllRoutes = () => [
  ...Object.values(PAGE_META).map((page) => page.path),
  ...TOURS.map((tour) => getTourPath(tour)),
];

export const getDurationIso = (duration: string) => {
  const match = duration.replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const hours = Number(match[1]);
  if (Number.isNaN(hours)) return undefined;
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes > 0) {
    return `PT${whole}H${minutes}M`;
  }
  return `PT${whole}H`;
};

export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${SITE_URL}/#organization`,
  name: 'Atitlán Experiences',
  alternateName: ['Tours Panajachel', 'Tours Pana', 'Lanchas Atitlán', 'Tours Lago Atitlán'],
  url: SITE_URL,
  logo: LOGO_URL,
  image: DEFAULT_OG_IMAGE,
  description: 'Operador de tours en Panajachel y Lago Atitlán, Guatemala. Lanchas privadas, excursiones a pueblos mayas, actividades de aventura, paseos en kayak y experiencias gastronómicas.',
  slogan: 'Tours premium en Panajachel y Lago Atitlán',
  telephone: '+502 2268 1264',
  email: 'hola@atitlancafe.com',
  priceRange: '$$-$$$',
  currenciesAccepted: 'USD, GTQ',
  paymentAccepted: 'Efectivo, Tarjeta de crédito, Transferencia',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Principal',
    addressLocality: 'Panajachel',
    addressRegion: 'Sololá',
    postalCode: '07010',
    addressCountry: 'GT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 14.7412,
    longitude: -91.1597,
  },
  areaServed: [
    {
      '@type': 'Place',
      name: 'Lago Atitlán',
    },
    {
      '@type': 'City',
      name: 'Panajachel',
    },
    {
      '@type': 'City',
      name: 'San Pedro La Laguna',
    },
    {
      '@type': 'City',
      name: 'San Juan La Laguna',
    },
    {
      '@type': 'City',
      name: 'Santiago Atitlán',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Tours y Actividades en Lago Atitlán',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Tours en lancha por el Lago Atitlán',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Excursiones a pueblos mayas',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Lanchas privadas en Panajachel',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Paseos en kayak y SUP',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Senderismo volcán San Pedro',
        },
      },
    ],
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'reservas',
    telephone: '+502 2268 1264',
    email: 'hola@atitlancafe.com',
    availableLanguage: ['es', 'en'],
  },
  sameAs: ['https://wa.me/50222681264'],
});

export const buildWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Atitlán Experiences',
  url: SITE_URL,
  inLanguage: LOCALE,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/catalogo?buscar={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const buildTourSchema = (tour: Tour) => {
  const duration = getDurationIso(tour.duration);
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${getTourUrl(tour)}#trip`,
    name: tour.name,
    description: tour.description,
    image: tour.image,
    url: getTourUrl(tour),
    inLanguage: LOCALE,
    category: tour.category,
    itinerary: tour.itinerary.map((step) => ({
      '@type': 'TouristAttraction',
      name: step.activity,
    })),
    duration,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: tour.price,
      url: getTourUrl(tour),
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'Organization',
      name: 'Atitlán Experiences',
      url: SITE_URL,
    },
    location: {
      '@type': 'Place',
      name: 'Lago Atitlán',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Sololá',
        addressCountry: 'GT',
      },
    },
  };
};
