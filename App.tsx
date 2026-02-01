import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';
import ScrollToTop from './components/ScrollToTop';

const router = createBrowserRouter(routes);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <SkipLink />
      <RouterProvider router={router} />
      <ScrollToTop />
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
