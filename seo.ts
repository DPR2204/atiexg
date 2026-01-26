import { TOURS } from './data';
import { Tour } from './types';

export const SITE_URL = 'https://atitlanexperience.com';
export const LOCALE = 'es-419';
export const DEFAULT_OG_IMAGE =
  'https://static.wixstatic.com/media/acc6a6_239e70f3ee8d48aab8d7041ebafb9892~mv2.jpg';
export const LOGO_URL =
  'https://static.wixstatic.com/media/acc6a6_923203f0b02b49afadd0f156f6363de3~mv2.png';

export type PageKey = 'home' | 'catalogo' | 'conocenos' | 'contacto';

export type PageMeta = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
};

export const PAGE_META: Record<PageKey, PageMeta> = {
  home: {
    title: 'Atitlán Experiences | Tours premium en Lago Atitlán',
    description:
      'Experiencias premium en el Lago Atitlán: tours curados, hospitalidad bilingüe y logística sin fricciones. Descubre rutas culturales, gastronomía y bienestar.',
    path: '/',
  },
  catalogo: {
    title: 'Catálogo de experiencias premium en Lago Atitlán',
    description:
      'Explora el catálogo de experiencias premium: tours culturales, aventura, gastronomía y bienestar en el Lago Atitlán con logística confiable.',
    path: '/catalogo',
  },
  conocenos: {
    title: 'Conócenos | Atitlán Experiences',
    description:
      'Conoce al equipo detrás de Atitlán Experiences: hospitalidad local, curaduría premium y aliados sostenibles en el Lago Atitlán.',
    path: '/conocenos',
  },
  contacto: {
    title: 'Contacto | Atitlán Experiences',
    description:
      'Habla con nuestro equipo para planificar tours privados, experiencias gastronómicas o programas corporativos en el Lago Atitlán.',
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

export const getTourMeta = (tour: Tour): PageMeta => ({
  title: `${tour.name} | Experiencia premium en Lago Atitlán`,
  description: `${tour.description} Desde $${tour.price}. Duración ${tour.duration}.`,
  path: getTourPath(tour),
  ogImage: tour.image,
});

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
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#organization`,
  name: 'Atitlán Experiences',
  url: SITE_URL,
  logo: LOGO_URL,
  image: DEFAULT_OG_IMAGE,
  telephone: '+502 2268 1264',
  email: 'hola@atitlancafe.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Panajachel',
    addressRegion: 'Sololá',
    addressCountry: 'GT',
  },
  areaServed: 'Lago Atitlán, Guatemala',
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
