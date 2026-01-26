import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';

const router = createBrowserRouter(routes);

const App = () => (
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);

export default App;
