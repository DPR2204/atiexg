import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy load public pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogoPage = lazy(() => import('./pages/CatalogoPage'));
const GaleriaPage = lazy(() => import('./pages/GaleriaPage'));
const ConocenosPage = lazy(() => import('./pages/ConocenosPage'));
const ContactoPage = lazy(() => import('./pages/ContactoPage'));
const TourPage = lazy(() => import('./pages/TourPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy load back-office pages
const BackofficeLayout = lazy(() => import('./components/backoffice/BackofficeLayout'));
const LoginPage = lazy(() => import('./pages/backoffice/LoginPage'));
const DashboardPage = lazy(() => import('./pages/backoffice/DashboardPage'));
const ReservasPage = lazy(() => import('./pages/backoffice/ReservasPage'));
const CalendarioPage = lazy(() => import('./pages/backoffice/CalendarioPage'));
const KanbanPage = lazy(() => import('./pages/backoffice/KanbanPage'));
const LogisticaPage = lazy(() => import('./pages/backoffice/LogisticaPage'));
const RecursosPage = lazy(() => import('./pages/backoffice/RecursosPage'));
const ToursPage = lazy(() => import('./pages/backoffice/ToursPage'));

const ReservationCheckinPage = lazy(() => import('./pages/public/ReservationCheckinPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

export const routes: RouteObject[] = [
  // Guest Portal (No Layout)
  {
    path: '/reservas/checkin/:token',
    element: <SuspenseWrapper><ReservationCheckinPage /></SuspenseWrapper>,
  },
  // Public site
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
  // Back-office: Login (no layout wrapper)
  {
    path: '/backoffice/login',
    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
  },
  // Back-office: Protected routes
  {
    path: '/backoffice',
    element: <SuspenseWrapper><BackofficeLayout /></SuspenseWrapper>,
    children: [
      {
        index: true,
        element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper>,
      },
      {
        path: 'reservas',
        element: <SuspenseWrapper><ReservasPage /></SuspenseWrapper>,
      },
      {
        path: 'kanban',
        element: <SuspenseWrapper><KanbanPage /></SuspenseWrapper>,
      },
      {
        path: 'calendario',
        element: <SuspenseWrapper><CalendarioPage /></SuspenseWrapper>,
      },
      {
        path: 'logistica',
        element: <SuspenseWrapper><LogisticaPage /></SuspenseWrapper>,
      },
      {
        path: 'recursos',
        element: <SuspenseWrapper><RecursosPage /></SuspenseWrapper>,
      },
      {
        path: 'tours',
        element: <SuspenseWrapper><ToursPage /></SuspenseWrapper>,
      },
    ],
  },
];

export default routes;
