import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './sections/Layout';
import InicioPage from './sections/InicioPage';
import CatalogoPage from './sections/CatalogoPage';
import GaleriaPage from './sections/GaleriaPage';
import ConocenosPage from './sections/ConocenosPage';
import ContactoPage from './sections/ContactoPage';
import TourPage from './sections/TourPage';
import NotFoundPage from './sections/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <InicioPage />,
      },
      {
        path: 'catalogo',
        element: <CatalogoPage />,
      },
      {
        path: 'galeria',
        element: <GaleriaPage />,
      },
      {
        path: 'conocenos',
        element: <ConocenosPage />,
      },
      {
        path: 'contacto',
        element: <ContactoPage />,
      },
      {
        path: 'experiencias/:slug',
        element: <TourPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
