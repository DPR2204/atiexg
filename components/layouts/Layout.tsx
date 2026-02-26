import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import WhatsAppButton from '../shared/WhatsAppButton';
import ScrollToTop from '../ScrollToTop';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <>
      <Outlet />
      <ScrollToTop />
      <WhatsAppButton />
    </>
  );
};

export default Layout;
