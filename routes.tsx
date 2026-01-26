import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './sections/Layout';
import HomePage from './sections/HomePage';
import TourPage from './sections/TourPage';
import { PAGE_META } from './seo';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage pageKey="home" />,
      },
      {
        path: PAGE_META.catalogo.path.slice(1),
        element: <HomePage pageKey="catalogo" focusSection="catalogo" />,
      },
      {
        path: PAGE_META.conocenos.path.slice(1),
        element: <HomePage pageKey="conocenos" focusSection="conocenos" />,
      },
      {
        path: PAGE_META.contacto.path.slice(1),
        element: <HomePage pageKey="contacto" focusSection="contacto" />,
      },
      {
        path: 'experiencias/:slug',
        element: <TourPage />,
      },
    ],
  },
];

export default routes;
