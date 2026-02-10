import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { TOURS } from '../data';
import {
  getAllRoutes,
  PAGE_META,
  SITE_URL,
  LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_KEYWORDS,
  getTourBySlug,
  getTourMeta,
  getTourPath,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildTourSchema,
  PageKey,
} from '../seo';

const distDir = join(process.cwd(), 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── Navigation links (shared across all pages) ── */
const buildNavHtml = () => {
  const mainLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo de Tours' },
    { href: '/galeria', label: 'Galería' },
    { href: '/conocenos', label: 'Conócenos' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return `<nav aria-label="Navegación principal">
      <ul>${mainLinks.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul>
    </nav>`;
};

/* ── Body HTML generators by page type ── */

const buildHomeBody = () => {
  const topTours = TOURS.slice(0, 6);
  return `<header>${buildNavHtml()}</header>
    <main>
      <h1>Tours en Panajachel y Lago Atitlán | Atitlán Experiences</h1>
      <p>${escapeHtml(PAGE_META.home.description)}</p>
      <section>
        <h2>Experiencias Destacadas en el Lago Atitlán</h2>
        <ul>${topTours.map((t) => `<li><a href="${getTourPath(t)}">${escapeHtml(t.name)}</a> – ${escapeHtml(t.concept)}. Desde $${t.price} USD.</li>`).join('')}</ul>
      </section>
      <section>
        <h2>¿Por qué elegir Atitlán Experiences?</h2>
        <ul>
          <li>Operadores locales en Panajachel, Guatemala</li>
          <li>Lanchas privadas y guías bilingües</li>
          <li>Experiencias curadas con logística premium</li>
          <li>Tours a San Pedro, San Juan, Santiago Atitlán y más</li>
        </ul>
      </section>
      <p><a href="/catalogo">Ver todos los tours y actividades en Lago Atitlán</a></p>
    </main>`;
};

const buildCatalogoBody = () => {
  return `<header>${buildNavHtml()}</header>
    <main>
      <h1>Qué Hacer en Panajachel: Tours, Lanchas y Actividades en Lago Atitlán</h1>
      <p>${escapeHtml(PAGE_META.catalogo.description)}</p>
      <section>
        <h2>Todos los Tours y Experiencias</h2>
        <ul>${TOURS.map((t) => `<li><a href="${getTourPath(t)}">${escapeHtml(t.name)}</a> – ${escapeHtml(t.description)} Categoría: ${t.category}. Desde $${t.price} USD. Duración: ${t.duration}.</li>`).join('')}</ul>
      </section>
    </main>`;
};

const buildGaleriaBody = () => {
  return `<header>${buildNavHtml()}</header>
    <main>
      <h1>Galería de Fotos del Lago Atitlán</h1>
      <p>${escapeHtml(PAGE_META.galeria.description)}</p>
      <p><a href="/catalogo">Explorar tours disponibles</a></p>
    </main>`;
};

const buildConocenosBody = () => {
  return `<header>${buildNavHtml()}</header>
    <main>
      <h1>Operador de Tours en Panajachel, Guatemala</h1>
      <p>${escapeHtml(PAGE_META.conocenos.description)}</p>
      <p><a href="/contacto">Contáctanos para reservar</a></p>
    </main>`;
};

const buildContactoBody = () => {
  return `<header>${buildNavHtml()}</header>
    <main>
      <h1>Reservar Tours en Panajachel | Contacto</h1>
      <p>${escapeHtml(PAGE_META.contacto.description)}</p>
      <p>Teléfono: +502 2268 1264</p>
      <p>Email: hola@atitlancafe.com</p>
      <p><a href="/catalogo">Ver todos los tours disponibles</a></p>
    </main>`;
};

const buildTourBody = (slug: string) => {
  const tour = getTourBySlug(slug);
  if (!tour) {
    return `<header>${buildNavHtml()}</header>
      <main><h1>Experiencia no encontrada</h1><p><a href="/catalogo">Ver catálogo de tours</a></p></main>`;
  }
  const meta = getTourMeta(tour);
  return `<header>${buildNavHtml()}</header>
    <main>
      <h1>${escapeHtml(meta.title)}</h1>
      <p>${escapeHtml(tour.description)}</p>
      <dl>
        <dt>Categoría</dt><dd>${escapeHtml(tour.category)}</dd>
        <dt>Formato</dt><dd>${escapeHtml(tour.format)}</dd>
        <dt>Duración</dt><dd>${escapeHtml(tour.duration)}</dd>
        <dt>Precio desde</dt><dd>$${tour.price} USD</dd>
        ${tour.rating ? `<dt>Calificación</dt><dd>${tour.rating}/5 (${tour.reviews} reseñas)</dd>` : ''}
      </dl>
      <section>
        <h2>Itinerario</h2>
        <ol>${tour.itinerary.map((s) => `<li><strong>${escapeHtml(s.time)}</strong> – ${escapeHtml(s.activity)}</li>`).join('')}</ol>
      </section>
      <section>
        <h2>Incluye</h2>
        <ul>${tour.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
      </section>
      <section>
        <h2>Opciones de precio</h2>
        <ul>${tour.prices.map((p) => `<li>${escapeHtml(p.label)}: $${escapeHtml(p.amount)} USD${p.description ? ` – ${escapeHtml(p.description)}` : ''}</li>`).join('')}</ul>
      </section>
      <p><a href="/catalogo">Ver más tours en Lago Atitlán</a></p>
      <p><a href="/contacto">Reservar este tour</a></p>
    </main>`;
};

/* ── Generate body HTML for any route ── */
const generateBodyHtml = (route: string): string => {
  if (route.startsWith('/experiencias/')) {
    return buildTourBody(route.replace('/experiencias/', ''));
  }
  switch (route) {
    case '/':
      return buildHomeBody();
    case '/catalogo':
      return buildCatalogoBody();
    case '/galeria':
      return buildGaleriaBody();
    case '/conocenos':
      return buildConocenosBody();
    case '/contacto':
      return buildContactoBody();
    default:
      return `<header>${buildNavHtml()}</header><main><h1>Atitlán Experiences</h1><p>${escapeHtml(PAGE_META.home.description)}</p></main>`;
  }
};

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
  const bodyHtml = generateBodyHtml(route);
  const html = template
    .replace('<!--app-head-->', headTags)
    .replace('<!--app-html-->', bodyHtml);

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
