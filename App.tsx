import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import ErrorBoundary from './components/ErrorBoundary';

const router = createBrowserRouter(routes);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
