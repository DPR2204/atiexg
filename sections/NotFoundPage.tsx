import React from 'react';
import { Link } from 'react-router-dom';
import Seo from './Seo';
import { GlassNav, GlassFooter } from './shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Seo
        title="Página no encontrada | Atitlán Experiences"
        description="La página que buscas no existe. Explora nuestro catálogo de experiencias premium en el Lago de Atitlán, Guatemala."
        canonicalPath="/404"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 */}
          <div className="relative mb-8">
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-100/50 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />

            {/* 404 Number */}
            <div className="relative">
              <h1 className="text-[120px] sm:text-[180px] lg:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-gray-300 leading-none select-none animate-fade-in">
                404
              </h1>

              {/* Floating boat icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/40">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              ¡Parece que te perdiste en el lago!
            </h2>
            <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-md mx-auto">
              No te preocupes, hasta los mejores exploradores se pierden a veces.
              Pero no encontramos la página que buscas.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-all duration-300 shadow-xl shadow-gray-900/20"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span>Volver al inicio</span>
              </Link>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider glass-card hover:bg-white/80 transition-all duration-300"
              >
                Explorar catálogo
              </Link>
            </div>

            {/* Quick Links */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 inline-block">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                O puedes visitar
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: 'Inicio', path: '/' },
                  { label: 'Catálogo', path: '/catalogo' },
                  { label: 'Galería', path: '/galeria' },
                  { label: 'Conócenos', path: '/conocenos' },
                  { label: 'Contacto', path: '/contacto' },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="px-4 py-2 rounded-xl bg-white/50 border border-gray-100 text-sm font-medium text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative waves at bottom */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 sm:h-32 text-gray-50"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                fill="currentColor"
                opacity="0.3"
              />
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                fill="currentColor"
                opacity="0.5"
              />
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </main>

      <GlassFooter />
    </div>
  );
};

export default NotFoundPage;
