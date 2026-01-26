import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { getAllRoutes, SITE_URL } from '../seo';

const routes = getAllRoutes();
const urls = routes.map((path) => `${SITE_URL}${path === '/' ? '' : path}`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n') +
  `\n</urlset>\n`;

const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, xml, 'utf8');

console.log(`Sitemap generado: ${outputPath}`);
