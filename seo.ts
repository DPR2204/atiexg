import { TOURS } from './data';
import { Tour } from './types';
import { getCloudinaryUrl } from './src/utils/cloudinary';
import { Language } from './contexts/LanguageContext';

export const SITE_URL = 'https://atitlanexperience.com';
export const SITE_URL_EN = 'https://en.atitlanexperience.com';

/** @deprecated Use getLocale(lang) instead */
export const LOCALE = 'es-419';

export const getLocale = (lang: Language) => (lang === 'en' ? 'en' : 'es-419');

export const DEFAULT_OG_IMAGE =
  'https://static.wixstatic.com/media/acc6a6_239e70f3ee8d48aab8d7041ebafb9892~mv2.jpg';
export const LOGO_URL =
  'https://static.wixstatic.com/media/acc6a6_923203f0b02b49afadd0f156f6363de3~mv2.png';

// Keywords principales para SEO (Spanish)
export const DEFAULT_KEYWORDS = [
  'tours Panajachel',
  'tours en Pana',
  'que hacer en Panajachel',
  'lanchas Lago Atitlan',
  'lanchas privadas Panajachel',
  'tours Lago Atitlan',
  'actividades Lago Atitlan',
  'excursiones Guatemala',
  'paseos en lancha Atitlan',
  'San Pedro La Laguna tours',
  'San Juan La Laguna tours',
  'Santiago Atitlan tours',
  'kayak Lago Atitlan',
  'volcan San Pedro Guatemala',
  'atardecer Lago Atitlan',
  'Indian Nose amanecer',
  'turismo Guatemala',
  'que hacer en Pana Guatemala',
].join(', ');

// Keywords for SEO (English)
export const DEFAULT_KEYWORDS_EN = [
  'Panajachel tours',
  'Lake Atitlan tours',
  'things to do in Panajachel',
  'private boats Lake Atitlan',
  'Guatemala boat tours',
  'Lake Atitlan activities',
  'San Pedro La Laguna tours',
  'Santiago Atitlan tours',
  'kayak Lake Atitlan',
  'San Pedro volcano Guatemala',
  'Lake Atitlan sunset',
  'Indian Nose sunrise',
  'Guatemala tourism',
  'what to do in Panajachel Guatemala',
].join(', ');

export const getKeywords = (lang: Language) =>
  lang === 'en' ? DEFAULT_KEYWORDS_EN : DEFAULT_KEYWORDS;

export type PageKey = 'home' | 'catalogo' | 'galeria' | 'conocenos' | 'contacto';

export type PageMeta = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
};

export const PAGE_META: Record<PageKey, PageMeta> = {
  home: {
    title: 'Tours en Panajachel y Lago Atitlan | Lanchas, Excursiones y Actividades | Atitlan Experiences',
    description:
      'Tours en Panajachel y Lago Atitlan, Guatemala: lanchas privadas, excursiones a pueblos mayas, actividades de aventura y experiencias gastronomicas. Reserva que hacer en Pana con logistica premium.',
    path: '/',
  },
  catalogo: {
    title: 'Que Hacer en Panajachel: Tours, Lanchas y Actividades en Lago Atitlan',
    description:
      'Catalogo de tours en Panajachel: lanchas a San Pedro, San Juan y Santiago, paseos en kayak, volcanes, atardeceres y mas. Las mejores actividades en el Lago Atitlan, Guatemala.',
    path: '/catalogo',
  },
  galeria: {
    title: 'Galeria de Fotos del Lago Atitlan | Paisajes, Cultura y Aventuras',
    description:
      'Explora nuestra galeria de fotos del Lago de Atitlan, Guatemala. Paisajes impresionantes, cultura maya, gastronomia local y aventuras en el lago mas hermoso del mundo.',
    path: '/galeria',
  },
  conocenos: {
    title: 'Operador de Tours en Panajachel, Guatemala | Atitlan Experiences',
    description:
      'Somos operadores locales de tours en Panajachel y Lago Atitlan. Lanchas privadas, guias bilingues y experiencias curadas en Guatemala. Conoce nuestro equipo.',
    path: '/conocenos',
  },
  contacto: {
    title: 'Reservar Tours en Panajachel | Contacto | Atitlan Experiences',
    description:
      'Reserva tours, lanchas privadas y actividades en Panajachel y Lago Atitlan. WhatsApp disponible. Planifica que hacer en tu visita a Guatemala.',
    path: '/contacto',
  },
};

export const PAGE_META_EN: Record<PageKey, PageMeta> = {
  home: {
    title: 'Tours in Panajachel & Lake Atitlan | Boats, Excursions & Activities | Atitlan Experiences',
    description:
      'Tours in Panajachel and Lake Atitlan, Guatemala: private boats, Mayan village excursions, adventure activities, and culinary experiences. Book things to do in Pana with premium logistics.',
    path: '/',
  },
  catalogo: {
    title: 'Things to Do in Panajachel: Tours, Boats & Activities on Lake Atitlan',
    description:
      'Tour catalog in Panajachel: boats to San Pedro, San Juan and Santiago, kayak rides, volcanoes, sunsets and more. The best activities on Lake Atitlan, Guatemala.',
    path: '/catalogo',
  },
  galeria: {
    title: 'Lake Atitlan Photo Gallery | Landscapes, Culture & Adventures',
    description:
      'Explore our photo gallery of Lake Atitlan, Guatemala. Stunning landscapes, Mayan culture, local cuisine and adventures on the most beautiful lake in the world.',
    path: '/galeria',
  },
  conocenos: {
    title: 'Tour Operator in Panajachel, Guatemala | Atitlan Experiences',
    description:
      'We are local tour operators in Panajachel and Lake Atitlan. Private boats, bilingual guides and curated experiences in Guatemala. Meet our team.',
    path: '/conocenos',
  },
  contacto: {
    title: 'Book Tours in Panajachel | Contact | Atitlan Experiences',
    description:
      'Book tours, private boats and activities in Panajachel and Lake Atitlan. WhatsApp available. Plan what to do on your visit to Guatemala.',
    path: '/contacto',
  },
};

export const getPageMeta = (key: PageKey, lang: Language): PageMeta => {
  if (lang === 'en') return PAGE_META_EN[key];
  return PAGE_META[key];
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getTourSlug = (tour: Tour) => slugify(tour.name);

export const getTourPath = (tour: Tour) => `/experiencias/${getTourSlug(tour)}`;

export const getTourUrl = (tour: Tour) => `${SITE_URL}${getTourPath(tour)}`;

// Keywords por categoria para mejorar SEO (Spanish)
const CATEGORY_KEYWORDS: Record<string, string> = {
  'Signature': 'tour premium en Panajachel',
  'Lago & Momentos': 'lancha privada Lago Atitlan, atardecer Atitlan',
  'Cultura & Pueblos': 'tour cultural pueblos mayas, artesanias Guatemala',
  'Sabores del Lago': 'experiencia gastronomica Atitlan, cafe Guatemala',
  'Dias de Campo': 'dia de campo Lago Atitlan, picnic San Lucas Toliman',
};

// Keywords by category for SEO (English)
const CATEGORY_KEYWORDS_EN: Record<string, string> = {
  'Signature': 'premium tour in Panajachel',
  'Lago & Momentos': 'private boat Lake Atitlan, sunset Atitlan',
  'Cultura & Pueblos': 'cultural tour Mayan villages, Guatemala handicrafts',
  'Sabores del Lago': 'culinary experience Atitlan, Guatemala coffee',
  'Dias de Campo': 'field day Lake Atitlan, picnic San Lucas Toliman',
};

export const getTourMeta = (tour: Tour, lang: Language = 'es'): PageMeta => {
  if (lang === 'en') {
    const categoryKeyword = CATEGORY_KEYWORDS_EN[tour.category] || 'tour in Panajachel';
    const name = tour.name_en || tour.name;
    const description = tour.description_en || tour.description;
    return {
      title: `${name} | Experience in Panajachel, Lake Atitlan`,
      description: `${description} ${categoryKeyword}. From $${tour.price} USD. Duration ${tour.duration}. Book in Panajachel, Guatemala.`,
      path: getTourPath(tour),
      ogImage: tour.image ? getCloudinaryUrl(tour.image, { width: 1200, height: 630 }) : undefined,
    };
  }

  const categoryKeyword = CATEGORY_KEYWORDS[tour.category] || 'tour en Panajachel';
  return {
    title: `${tour.name} | Experiencia en Panajachel, Lago Atitlan`,
    description: `${tour.description} ${categoryKeyword}. Desde $${tour.price} USD. Duracion ${tour.duration}. Reserva en Panajachel, Guatemala.`,
    path: getTourPath(tour),
    ogImage: tour.image ? getCloudinaryUrl(tour.image, { width: 1200, height: 630 }) : undefined,
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

export const getAlternateUrls = (path: string) => [
  { hreflang: 'es', href: `${SITE_URL}${path}` },
  { hreflang: 'en', href: `${SITE_URL_EN}${path}` },
  { hreflang: 'x-default', href: `${SITE_URL}${path}` },
];

export const buildOrganizationSchema = (lang: Language = 'es') => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${SITE_URL}/#organization`,
  name: 'Atitlan Experiences',
  alternateName: ['Tours Panajachel', 'Tours Pana', 'Lanchas Atitlan', 'Tours Lago Atitlan'],
  url: SITE_URL,
  logo: LOGO_URL,
  image: DEFAULT_OG_IMAGE,
  description:
    lang === 'en'
      ? 'Tour operator in Panajachel and Lake Atitlan, Guatemala. Private boats, Mayan village excursions, adventure activities, kayak rides, and culinary experiences.'
      : 'Operador de tours en Panajachel y Lago Atitlan, Guatemala. Lanchas privadas, excursiones a pueblos mayas, actividades de aventura, paseos en kayak y experiencias gastronomicas.',
  slogan:
    lang === 'en'
      ? 'Premium tours in Panajachel and Lake Atitlan'
      : 'Tours premium en Panajachel y Lago Atitlan',
  telephone: '+502 2268 1264',
  email: 'hola@atitlanexperience.com',
  priceRange: '$$-$$$',
  currenciesAccepted: 'USD, GTQ',
  paymentAccepted:
    lang === 'en'
      ? 'Cash, Credit card, Transfer'
      : 'Efectivo, Tarjeta de credito, Transferencia',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Principal',
    addressLocality: 'Panajachel',
    addressRegion: 'Solola',
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
      name: 'Lago Atitlan',
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
      name: 'Santiago Atitlan',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name:
      lang === 'en'
        ? 'Tours and Activities on Lake Atitlan'
        : 'Tours y Actividades en Lago Atitlan',
    itemListElement: lang === 'en'
      ? [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Boat tours on Lake Atitlan',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Mayan village excursions',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Private boats in Panajachel',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Kayak and SUP rides',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'San Pedro volcano hiking',
            },
          },
        ]
      : [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Tours en lancha por el Lago Atitlan',
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
              name: 'Senderismo volcan San Pedro',
            },
          },
        ],
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: lang === 'en' ? 'reservations' : 'reservas',
    telephone: '+502 2268 1264',
    email: 'hola@atitlanexperience.com',
    availableLanguage: ['es', 'en'],
  },
  sameAs: ['https://wa.me/50222681264', 'https://instagram.com/atitlanexperience'],
});

export const buildWebSiteSchema = (lang: Language = 'es') => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Atitlan Experiences',
  url: SITE_URL,
  inLanguage: getLocale(lang),
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/catalogo?buscar={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const buildTourSchema = (tour: Tour, lang: Language = 'es') => {
  const duration = getDurationIso(tour.duration);
  const name = lang === 'en' ? (tour.name_en || tour.name) : tour.name;
  const description = lang === 'en' ? (tour.description_en || tour.description) : tour.description;
  const itinerary = lang === 'en' ? (tour.itinerary_en || tour.itinerary) : tour.itinerary;

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${getTourUrl(tour)}#trip`,
    name,
    description,
    image: tour.image ? getCloudinaryUrl(tour.image, { width: 1200, height: 630 }) : undefined,
    url: getTourUrl(tour),
    inLanguage: getLocale(lang),
    category: tour.category,
    itinerary: itinerary.map((step) => ({
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tour.rating || 4.9,
      bestRating: 5,
      reviewCount: Math.round((tour.rating || 4.9) * 50),
    },
    provider: {
      '@type': 'Organization',
      name: 'Atitlan Experiences',
      url: SITE_URL,
    },
    location: {
      '@type': 'Place',
      name: 'Lago Atitlan',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Solola',
        addressCountry: 'GT',
      },
    },
  };
};
