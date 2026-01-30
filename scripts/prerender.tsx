import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import {
  getAllRoutes,
  PAGE_META,
  SITE_URL,
  LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_KEYWORDS,
  getTourBySlug,
  getTourMeta,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildTourSchema,
  PageKey,
} from '../seo';

const distDir = join(process.cwd(), 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const generateHeadTags = (route: string): string => {
  let title: string;
  let description: string;
  let canonicalPath: string;
  let ogImage = DEFAULT_OG_IMAGE;
  const schemas: object[] = [buildOrganizationSchema(), buildWebSiteSchema()];

  // Check if it's a tour page
  if (route.startsWith('/experiencias/')) {
    const slug = route.replace('/experiencias/', '');
    const tour = getTourBySlug(slug);
    if (tour) {
      const meta = getTourMeta(tour);
      title = meta.title;
      description = meta.description;
      canonicalPath = meta.path;
      ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
      schemas.push(buildTourSchema(tour));
    } else {
      // Fallback for unknown tour
      title = 'Experiencia | Atitlán Experiences';
      description = 'Descubre experiencias únicas en el Lago Atitlán';
      canonicalPath = route;
    }
  } else {
    // Static pages
    const pageKey = Object.keys(PAGE_META).find(
      (key) => PAGE_META[key as PageKey].path === route
    ) as PageKey | undefined;

    if (pageKey) {
      const meta = PAGE_META[pageKey];
      title = meta.title;
      description = meta.description;
      canonicalPath = meta.path;
    } else {
      title = 'Atitlán Experiences';
      description = 'Experiencias premium en el Lago Atitlán';
      canonicalPath = route;
    }
  }

  const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;

  const headTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${DEFAULT_KEYWORDS}" />
    <meta name="robots" content="index,follow" />
    <meta name="geo.region" content="GT-SO" />
    <meta name="geo.placename" content="Panajachel, Sololá, Guatemala" />
    <meta name="geo.position" content="14.7412;-91.1597" />
    <meta name="ICBM" content="14.7412, -91.1597" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="${LOCALE}" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="es" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Atitlán Experiences - Tours en Panajachel" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:locale" content="es_419" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:alt" content="${title}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('\n    ')}
  `.trim();

  return headTags;
};

const renderRoute = (route: string) => {
  const headTags = generateHeadTags(route);
  const html = template.replace('<!--app-head-->', headTags);

  const normalizedRoute = route.replace(/^\/+/, '').replace(/\/+$/, '');
  const outputPath =
    normalizedRoute === ''
      ? join(distDir, 'index.html')
      : join(distDir, normalizedRoute, 'index.html');

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, 'utf8');
  console.log(`Pre-rendered: ${route}`);
};

getAllRoutes().forEach(renderRoute);

console.log('Pre-render completado.');
