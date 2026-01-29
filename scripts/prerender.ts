import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import routes from '../routes';
import { getAllRoutes } from '../seo';

const distDir = join(process.cwd(), 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const renderRoute = (route: string) => {
  const helmetContext: { helmet?: { title: { toString: () => string }; meta: { toString: () => string }; link: { toString: () => string }; script: { toString: () => string } } } = {};
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const app = (
    <HelmetProvider context={helmetContext}>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
  const appHtml = renderToString(app);
  const helmet = helmetContext.helmet;
  const headTags = helmet
    ? `${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}`
    : '';
  const html = template
    .replace('<!--app-html-->', appHtml)
    .replace('<!--app-head-->', headTags);

  const normalizedRoute = route.replace(/^\/+/, '').replace(/\/+$/, '');
  const outputPath = normalizedRoute === ''
    ? join(distDir, 'index.html')
    : join(distDir, normalizedRoute, 'index.html');

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, 'utf8');
};

getAllRoutes().forEach(renderRoute);

console.log('Pre-render completado.');
