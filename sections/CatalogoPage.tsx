import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Seo from './Seo';
import { GlassNav, GlassFooter } from './shared';
import TourImage from './TourImage';
import { TOURS } from '../data';
import {
  PAGE_META,
  buildOrganizationSchema,
  buildWebSiteSchema,
  getTourPath,
} from '../seo';

const FILTERS = ['Todos', 'Premium', 'Privado', 'Aventura', 'Cultural', 'Gastronomía'];

const SearchOverlay = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl animate-slide-down">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-white/50 rounded-2xl px-4 py-3 border border-gray-100">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Buscar experiencias, categorías..."
              className="flex-1 bg-transparent text-base font-medium outline-none text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange('')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-white/50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Presiona <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">ESC</kbd> para cerrar
        </p>
      </div>
    </div>
  );
};

const CatalogoPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const meta = PAGE_META.catalogo;

  const filteredTours = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return TOURS.filter((tour) => {
      const matchesFilter = activeFilter === 'Todos' || tour.category === activeFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = [tour.name, tour.category, tour.concept, tour.description]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeFilter, searchQuery]);

  // Handle ESC key to close search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.path}
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav onSearchClick={() => setIsSearchOpen(true)} />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-10 sm:mb-16 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Guatemala • Lago de Atitlán
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
            Catálogo de
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              Experiencias Premium
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            {TOURS.length} experiencias diseñadas por expertos locales para el viajero exigente.
            Personaliza tu propia ruta.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : 'glass-card text-gray-600 hover:bg-white/80'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-6 animate-fade-in">
            <p className="text-sm text-gray-500">
              {filteredTours.length} resultado{filteredTours.length !== 1 ? 's' : ''} para "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 text-red-500 hover:text-red-600 font-medium"
              >
                Limpiar
              </button>
            </p>
          </div>
        )}

        {/* Tours Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTours.map((tour, index) => (
            <Link
              key={tour.id}
              to={getTourPath(tour)}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${(index % 6) * 50}ms` }}
            >
              <article className="h-full glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <TourImage
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {tour.isBestSeller && (
                      <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                        Popular
                      </span>
                    )}
                    <span className="px-3 py-1 glass-card text-[9px] font-bold uppercase tracking-wider rounded-full">
                      {tour.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-xl sm:text-2xl font-black leading-tight mb-1 uppercase tracking-tight">
                      {tour.name}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2 italic">
                      {tour.concept}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 flex items-center justify-between bg-white">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">Desde</p>
                    <p className="text-2xl font-black text-gray-900">${tour.price}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="font-bold text-gray-700">{tour.rating}</span>
                    </div>
                    <span className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white group-hover:bg-red-500 transition-colors duration-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No encontramos experiencias</h3>
            <p className="text-gray-500 mb-6">
              Intenta con otros términos de búsqueda o cambia los filtros.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('Todos');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
      </main>

      <GlassFooter />
    </div>
  );
};

export default CatalogoPage;
