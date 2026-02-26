import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './styles/backoffice.css';

const router = createBrowserRouter(routes);

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <LanguageProvider>
        <HelmetProvider>
          <SkipLink />
          <RouterProvider router={router} />
        </HelmetProvider>
      </LanguageProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
