import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogoPage = lazy(() => import('./pages/CatalogoPage'));
const GaleriaPage = lazy(() => import('./pages/GaleriaPage'));
const ConocenosPage = lazy(() => import('./pages/ConocenosPage'));
const ContactoPage = lazy(() => import('./pages/ContactoPage'));
const TourPage = lazy(() => import('./pages/TourPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><HomePage /></SuspenseWrapper>,
      },
      {
        path: 'catalogo',
        element: <SuspenseWrapper><CatalogoPage /></SuspenseWrapper>,
      },
      {
        path: 'galeria',
        element: <SuspenseWrapper><GaleriaPage /></SuspenseWrapper>,
      },
      {
        path: 'conocenos',
        element: <SuspenseWrapper><ConocenosPage /></SuspenseWrapper>,
      },
      {
        path: 'contacto',
        element: <SuspenseWrapper><ContactoPage /></SuspenseWrapper>,
      },
      {
        path: 'experiencias/:slug',
        element: <SuspenseWrapper><TourPage /></SuspenseWrapper>,
      },
      {
        path: 'checkout',
        element: <SuspenseWrapper><CheckoutPage /></SuspenseWrapper>,
      },
      {
        path: 'pago-exitoso',
        element: <SuspenseWrapper><PaymentSuccessPage /></SuspenseWrapper>,
      },
      {
        path: '*',
        element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper>,
      },
    ],
  },
];

export default routes;
