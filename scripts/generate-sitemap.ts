import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { getAllRoutes, SITE_URL } from '../seo';

const today = new Date().toISOString().split('T')[0];
const routes = getAllRoutes();

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

const entries: SitemapEntry[] = routes.map((path) => {
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const isHome = path === '/';
  const isTour = path.startsWith('/experiencias/');

  return {
    loc: url,
    lastmod: today,
    changefreq: isHome ? 'weekly' : isTour ? 'weekly' : 'monthly',
    priority: isHome ? '1.0' : isTour ? '0.8' : '0.7',
  };
});

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries
    .map(
      (e) =>
        `  <url>\n` +
        `    <loc>${e.loc}</loc>\n` +
        `    <lastmod>${e.lastmod}</lastmod>\n` +
        `    <changefreq>${e.changefreq}</changefreq>\n` +
        `    <priority>${e.priority}</priority>\n` +
        `  </url>`
    )
    .join('\n') +
  `\n</urlset>\n`;

const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, xml, 'utf8');

console.log(`Sitemap generado: ${outputPath} (${entries.length} URLs)`);
