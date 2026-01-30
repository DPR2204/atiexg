import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  isExternal?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Catálogo', path: '/catalogo' },
  { label: 'Galería', path: '/galeria' },
  { label: 'Conócenos', path: '/conocenos' },
  { label: 'Contacto', path: '/contacto' },
];

export const GlassNav = ({ onSearchClick }: { onSearchClick?: () => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-nav shadow-lg shadow-black/5'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="relative">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 transition-all duration-300 group-hover:shadow-red-500/40 group-hover:scale-105">
                <span className="text-white font-black text-xl sm:text-2xl italic">A</span>
              </div>
              <div className="absolute -inset-1 bg-red-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight leading-none text-gray-900">ATITLÁN</span>
              <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 tracking-[0.2em] uppercase">Experiences</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 rounded-xl group ${
                  isActive(item.path)
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-red-500 rounded-full transition-all duration-300 ${
                    isActive(item.path) ? 'w-4' : 'w-0 group-hover:w-3'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Search & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass-card hover:bg-white/80 transition-all duration-300 group min-w-[200px]"
                aria-label="Buscar experiencias"
              >
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">Buscar experiencias...</span>
              </button>
            )}

            {/* Mobile Search */}
            {onSearchClick && (
              <button
                onClick={onSearchClick}
                className="md:hidden w-10 h-10 rounded-xl glass-card flex items-center justify-center text-red-500 hover:bg-white/80 transition-all"
                aria-label="Buscar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            )}

            {/* Desktop CTA */}
            <Link
              to="/catalogo"
              className="hidden sm:inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-red-600 active:scale-95 transition-all duration-300 shadow-lg shadow-gray-900/20 hover:shadow-red-600/30"
            >
              <span>Ver Tours</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl glass-card flex items-center justify-center text-gray-700 hover:bg-white/80 transition-all"
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="relative w-5 h-4">
                <span
                  className={`absolute left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'top-1.5 -rotate-45' : 'top-3'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
          isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass-card mx-4 mb-4 rounded-2xl p-4 space-y-1">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 animate-slide-up ${
                isActive(item.path)
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-semibold">{item.label}</span>
              {isActive(item.path) && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
            <a
              href="https://wa.me/50222681264"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <Link
              to="/catalogo"
              className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Catálogo
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlassNav;
