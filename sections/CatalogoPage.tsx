import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from './Seo';
import { GlassNav, GlassFooter } from './shared';
import TourImage from './TourImage';
import { TOURS } from '../data';
import { SelectedTourConfig, Tour } from '../types';
import {
  PAGE_META,
  buildOrganizationSchema,
  buildWebSiteSchema,
  getTourPath,
} from '../seo';

const FILTERS = ['Todos', 'Premium', 'Privado', 'Aventura', 'Cultural', 'Gastronomía'];

const formatWhatsAppMessage = (selections: SelectedTourConfig[], generalAddons: string[]) => {
  const base = 'https://wa.me/50222681264?text=';
  let message = '¡Hola Atitlán Experiences! 🌊\n\nSolicitud de Reserva Premium:\n\n';

  selections.forEach((selection) => {
    const tour = TOURS.find((t) => t.id === selection.tourId);
    if (!tour) return;
    const priceOption = tour.prices.find((p) => p.id === selection.selectedPriceId);
    const addons = tour.addons.filter((a) => selection.selectedAddonIds.includes(a.id));

    message += `🔹 *${tour.name}*\n`;
    message += `Opción: ${priceOption?.label} ($${priceOption?.amount})\n`;

    if (addons.length > 0) {
      message += `Add-ons: ${addons.map((a) => `${a.label} ($${a.price})`).join(', ')}\n`;
    }

    if (selection.customItinerary.length > 0) {
      message += '_Itinerario Ajustado:_\n';
      selection.customItinerary.forEach((step) => {
        message += `• ${step.time}: ${step.activity}\n`;
      });
    }
    message += '\n';
  });

  if (generalAddons.length > 0) {
    message += '\n🧩 *Add-ons generales seleccionados*\n';
    generalAddons.forEach((addon) => {
      message += `• ${addon}\n`;
    });
  }

  message += '\n¿Me podrían confirmar disponibilidad para estas experiencias? ¡Gracias!';
  return base + encodeURIComponent(message);
};

const GENERAL_ADDONS = [
  {
    id: 'transporte',
    title: 'Transporte (a/desde Ciudad de Guatemala)',
    items: [
      'Shared shuttle Guatemala City/Airport ↔ Panajachel: USD 32–40 p/p',
      'Private transfer Guatemala City ↔ Panajachel: 1–3 pax USD 165–195 por vehículo',
      'Private transfer Guatemala City ↔ Panajachel: 4–6 pax USD 195–225 por vehículo',
      'Private transfer Guatemala City ↔ Panajachel: 7–10 pax USD 225–255 por vehículo',
      'Surcharge madrugada/tarde (si aplica): +USD 25–60',
    ],
  },
  {
    id: 'tiempo-extra',
    title: 'Tiempo extra / flexibilidad',
    items: [
      'Hora extra lancha privada (navegación + espera): USD 65–95 por hora',
      'Hora extra con host/guía (si excede jornada): USD 25–45 por hora',
      'Parada extra planificada (buffer + coordinación): USD 15–35 por grupo',
    ],
  },
  {
    id: 'guias-concierge',
    title: 'Guías y concierge',
    items: [
      'Guía premium upgrade: Half day USD 40–80 por grupo',
      'Guía premium upgrade: Full day USD 80–150 por grupo',
      'Intérprete 3er idioma (FR/DE/IT): Half day USD 120–220 por grupo',
      'Intérprete 3er idioma (FR/DE/IT): Full day USD 220–350 por grupo',
      'Concierge WhatsApp (pre-trip + durante tour): USD 15–35 por reserva',
    ],
  },
  {
    id: 'foto-video',
    title: 'Foto / video / contenido',
    items: [
      'Foto Mini (30–45 min, 15–25 fotos): USD 80–120',
      'Foto Standard (60–90 min, 30–50 fotos): USD 150–230',
      'Media jornada (3–4h): USD 350–550',
      'Jornada completa (6–8h): USD 550–900',
      'Drone add-on (clips + 5 fotos): USD 80–150',
      'Reel vertical (30–60s editado): USD 250–450',
    ],
  },
  {
    id: 'fnb',
    title: 'F&B (upgrade universal)',
    items: [
      'Coffee flight/tasting (3–4 muestras): USD 12–20 p/p',
      'Upgrade bebida premium (vino/cóctel/beer): USD 8–15 p/p',
      'Charcutería/tapas upgrade: USD 12–30 p/p',
      'Botella extra (vino): USD 35–70 | Espumante: USD 45–120',
      'Menú fijo 2–3 tiempos: USD 45–75 p/p',
      'Maridaje 2–3 bebidas: +USD 18–35 p/p',
    ],
  },
  {
    id: 'terceros',
    title: 'Actividades de terceros (si las integran como All-in)',
    items: [
      'Yoga drop-in: USD 8–13 p/p',
      'Temazcal: USD 19–39 p/p',
      'Masaje 60 min: USD 26–52 p/p',
      'Cacao ceremony: USD 13–33 p/p',
      'Kayak/SUP (medio día): USD 10–16 p/p',
      'Zipline: USD 52–78 p/p',
      'Parapente tandem: USD 65–104 p/p',
    ],
  },
  {
    id: 'momentos',
    title: 'Momentos especiales',
    items: [
      'Proposal kit (sin foto): USD 120–220',
      'Proposal + foto mini: USD 220–380',
      'Cumpleaños a bordo (mini cake + decoración + foto mini opcional): USD 90–160',
    ],
  },
];

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

const ComparisonModal = ({
  tours,
  configs,
  onClose,
  onRemoveTour,
}: {
  tours: Tour[];
  configs: SelectedTourConfig[];
  onClose: () => void;
  onRemoveTour: (tourId: string) => void;
}) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose}></div>
    <div className="relative bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Comparar Experiencias</h2>
            <p className="text-xs text-gray-400">{tours.length} tours seleccionados</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-95" aria-label="Cerrar comparación">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-gray-50/50">
        <div className="flex gap-4 sm:gap-5" style={{ minWidth: `${Math.max(tours.length * 280, 560)}px` }}>
          {tours.map((tour, index) => {
            const config = configs.find((c) => c.tourId === tour.id);
            const price = tour.prices.find((p) => p.id === config?.selectedPriceId);
            return (
              <div
                key={tour.id}
                className="flex-1 min-w-[260px] max-w-[320px] bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm hover:shadow-lg transition-shadow animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Tour Image with Remove Button */}
                <div className="relative">
                  <TourImage
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-36 sm:h-44 object-cover rounded-t-2xl"
                    sizes="(max-width: 768px) 80vw, 320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveTour(tour.id)}
                    className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-red-500 rounded-xl text-white/80 hover:text-white transition-all active:scale-90 backdrop-blur-sm"
                    aria-label={`Quitar ${tour.name} de comparación`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>

                  {/* Category Badge */}
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[9px] font-bold uppercase tracking-wider rounded-lg text-gray-700">
                    {tour.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2">{tour.name}</h3>

                  {/* Key Info */}
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Formato</span>
                      <span className="text-xs font-bold text-gray-900">{price?.label || 'Standard'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-xl">
                      <span className="text-[10px] font-medium text-red-400 uppercase tracking-wide">Desde</span>
                      <span className="text-sm font-black text-red-600">${price?.amount || tour.price}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Rating</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span className="text-xs font-bold text-gray-900">{tour.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Itinerary Preview */}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Itinerario</p>
                    <div className="space-y-1.5">
                      {(config?.customItinerary || tour.itinerary).slice(0, 3).map((step, idx) => (
                        <div key={`${step.time}-${idx}`} className="flex gap-2 text-[11px]">
                          <span className="font-mono font-semibold text-red-500 shrink-0 w-12">{step.time}</span>
                          <span className="text-gray-600 truncate">{step.activity}</span>
                        </div>
                      ))}
                      {tour.itinerary.length > 3 && (
                        <p className="text-[10px] text-gray-400 italic">+{tour.itinerary.length - 3} paradas más...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">Desliza horizontalmente para ver todos los tours</p>
      </div>
    </div>
  </div>
);

const CatalogoPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedConfigs, setSelectedConfigs] = useState<SelectedTourConfig[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedGeneralAddons, setSelectedGeneralAddons] = useState<string[]>([]);
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

  const toggleSelection = (tour: Tour) => {
    const exists = selectedConfigs.some((config) => config.tourId === tour.id);
    if (exists) {
      setSelectedConfigs((prev) => prev.filter((config) => config.tourId !== tour.id));
      return;
    }
    setSelectedConfigs((prev) => [
      ...prev,
      {
        tourId: tour.id,
        selectedPriceId: tour.prices[0]?.id ?? '',
        selectedAddonIds: [],
        customItinerary: tour.itinerary,
      },
    ]);
  };

  const toggleGeneralAddon = (label: string) => {
    setSelectedGeneralAddons((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

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
      {isCompareOpen && (
        <ComparisonModal
          tours={TOURS.filter((tour) => selectedConfigs.some((config) => config.tourId === tour.id))}
          configs={selectedConfigs}
          onClose={() => setIsCompareOpen(false)}
          onRemoveTour={(tourId) => {
            setSelectedConfigs((prev) => prev.filter((c) => c.tourId !== tourId));
            if (selectedConfigs.length <= 2) setIsCompareOpen(false);
          }}
        />
      )}

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
              className="group block animate-fade-in-up relative"
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

                  {/* Comparison button - top right - Enhanced */}
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleSelection(tour);
                    }}
                    className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg transition-all duration-300 active:scale-95 ${
                      selectedConfigs.some((config) => config.tourId === tour.id)
                        ? 'bg-red-500 text-white shadow-red-500/30 scale-105'
                        : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white hover:shadow-red-500/20'
                    }`}
                    aria-label={
                      selectedConfigs.some((config) => config.tourId === tour.id)
                        ? `Quitar ${tour.name} del plan`
                        : `Agregar ${tour.name} al plan`
                    }
                  >
                    {selectedConfigs.some((config) => config.tourId === tour.id) ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Agregado</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Comparar</span>
                      </>
                    )}
                  </button>

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

        {/* Pricing & Add-ons Section - Minimalist Independent Cards */}
        <section id="esquema-precios" className="scroll-mt-28 mt-16 sm:mt-24">
          {/* Section Header */}
          <div className="mb-8 sm:mb-12 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-gray-300" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Opciones de servicio
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Esquema de Precios</h2>
            <p className="text-sm text-gray-500 max-w-xl">Elige el nivel de experiencia que mejor se adapte a tu viaje</p>
          </div>

          {/* Pricing Cards - Independent Minimalist Boxes */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-16 sm:mb-20">
            {/* Standard */}
            <div className="group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Standard</h3>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">Compartido</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
                  <span>8-12 personas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  <span>Timing clásico</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.466 3.429A1 1 0 012 14.502a17.09 17.09 0 003.037-2.936 18.93 18.93 0 01-1.065-2.572 1 1 0 111.898-.633c.217.65.473 1.276.766 1.875a17.09 17.09 0 001.39-3.536H4a1 1 0 110-2h3V3a1 1 0 011-1z" clipRule="evenodd"/></svg>
                  <span>Guía EN/ES</span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Desde</span>
                <p className="text-lg font-bold text-gray-900">Precio base</p>
              </div>
            </div>

            {/* Premium */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-blue-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Premium</h3>
                    <span className="text-[9px] font-medium uppercase tracking-wider text-blue-500">Popular</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
                  <span>4-8 personas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  <span>Ritmo flexible</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Mesa reservada</span>
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Premium perk</span>
              </div>
              <div className="pt-3 border-t border-blue-100">
                <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400">Desde</span>
                <p className="text-lg font-bold text-gray-900">+15-25%</p>
              </div>
            </div>

            {/* All-in */}
            <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-emerald-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">All-in</h3>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-emerald-500">Todo incluido</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-3">Premium + actividades incluidas</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Zipline</span>
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Kayak</span>
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Yoga</span>
              </div>
              <div className="pt-3 border-t border-emerald-100">
                <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">Desde</span>
                <p className="text-lg font-bold text-gray-900">+40-60%</p>
              </div>
            </div>

            {/* Private */}
            <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-amber-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Private</h3>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-amber-500">Exclusivo</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
                  <span>Hasta 6 pax (+$35 p/p extra)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Lancha dedicada</span>
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Host privado</span>
                <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Ruta flexible</span>
              </div>
              <div className="pt-3 border-t border-amber-100">
                <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400">Desde</span>
                <p className="text-lg font-bold text-gray-900">+80-120%</p>
              </div>
            </div>
          </div>

          {/* Add-ons Section Header */}
          <div className="mb-8 sm:mb-10 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px w-8 bg-gray-300" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Personaliza
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Add-ons Opcionales</h2>
                <p className="text-sm text-gray-500">Complementa tu experiencia con servicios adicionales</p>
              </div>
              {selectedGeneralAddons.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-red-600">
                    {selectedGeneralAddons.length} seleccionado{selectedGeneralAddons.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setSelectedGeneralAddons([])}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add-ons Grid - Independent Minimalist Boxes */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GENERAL_ADDONS.map((category, catIndex) => {
              const categoryStyles: Record<string, { bg: string; icon: string; border: string; accent: string }> = {
                'transporte': { bg: 'bg-slate-50', icon: 'bg-slate-100 text-slate-600', border: 'border-slate-100 hover:border-slate-200', accent: 'text-slate-600' },
                'tiempo-extra': { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-100 hover:border-violet-200', accent: 'text-violet-600' },
                'guias-concierge': { bg: 'bg-sky-50', icon: 'bg-sky-100 text-sky-600', border: 'border-sky-100 hover:border-sky-200', accent: 'text-sky-600' },
                'foto-video': { bg: 'bg-pink-50', icon: 'bg-pink-100 text-pink-600', border: 'border-pink-100 hover:border-pink-200', accent: 'text-pink-600' },
                'fnb': { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-100 hover:border-amber-200', accent: 'text-amber-600' },
                'terceros': { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100 hover:border-emerald-200', accent: 'text-emerald-600' },
                'momentos': { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', border: 'border-rose-100 hover:border-rose-200', accent: 'text-rose-600' },
              };
              const categoryIcons: Record<string, React.ReactNode> = {
                'transporte': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>,
                'tiempo-extra': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                'guias-concierge': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
                'foto-video': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
                'fnb': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>,
                'terceros': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                'momentos': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
              };
              const style = categoryStyles[category.id] || categoryStyles['transporte'];
              const selectedInCategory = category.items.filter(item => selectedGeneralAddons.includes(item)).length;

              return (
                <div
                  key={category.id}
                  className={`${style.bg} border ${style.border} rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${catIndex * 60}ms` }}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${style.icon} flex items-center justify-center`}>
                        {categoryIcons[category.id]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{category.title.split(' (')[0]}</h3>
                        <p className="text-[10px] text-gray-400">{category.items.length} opciones</p>
                      </div>
                    </div>
                    {selectedInCategory > 0 && (
                      <span className={`w-6 h-6 rounded-full ${style.icon} flex items-center justify-center text-[10px] font-bold`}>
                        {selectedInCategory}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-hide">
                    {category.items.map((item) => {
                      const isSelected = selectedGeneralAddons.includes(item);
                      const priceMatch = item.match(/USD\s*[\d,–-]+(?:\s*(?:p\/p|por\s+(?:vehículo|grupo|hora|reserva)))?/i);
                      const price = priceMatch ? priceMatch[0] : null;
                      const itemText = price ? item.replace(price, '').replace(/:\s*$/, '').trim() : item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleGeneralAddon(item)}
                          className={`w-full flex items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 ${
                            isSelected
                              ? 'bg-white shadow-sm border border-gray-200'
                              : 'bg-white/50 hover:bg-white border border-transparent'
                          }`}
                        >
                          <span className={`w-4 h-4 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? `${style.icon} border-transparent`
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-[11px] leading-tight ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {itemText}
                            </span>
                            {price && (
                              <span className={`text-[10px] font-semibold ${style.accent}`}>
                                {price}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <p className="text-center text-[11px] text-gray-400 mt-8">Precios sujetos a temporada y disponibilidad</p>
        </section>
      </main>

      <div className={`fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[94%] max-w-2xl bg-black rounded-2xl sm:rounded-[2.5rem] shadow-lg px-3 py-3 sm:px-5 sm:py-5 border border-white/10 text-white transition-all duration-700 ${selectedConfigs.length > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-40 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="flex items-center justify-between gap-1.5 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex -space-x-2.5 sm:-space-x-4 overflow-hidden p-0.5 shrink-0">
              {selectedConfigs.slice(0, 2).map((config) => {
                const tour = TOURS.find((t) => t.id === config.tourId);
                return (
                  <div key={config.tourId} className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl border-2 border-black overflow-hidden ring-1 ring-white/10">
                    {tour?.image && tour?.name && (
                      <TourImage
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                );
              })}
              {selectedConfigs.length > 2 && (
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl border-2 border-black bg-gray-800 flex items-center justify-center text-[9px] sm:text-[10px] font-bold">
                  +{selectedConfigs.length - 2}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-tighter leading-none truncate">{selectedConfigs.length} Item{selectedConfigs.length > 1 ? 's' : ''}</span>
              <span className="text-[7px] sm:text-[9px] text-white/30 font-mono uppercase tracking-widest mt-1 hidden xs:block">Plan de viaje</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              onClick={() => setSelectedConfigs([])}
              className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white px-1 sm:px-2"
            >
              Limpiar
            </button>
            {selectedConfigs.length > 1 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="bg-white/10 text-white border border-white/20 px-2.5 sm:px-6 py-2 sm:py-3.5 rounded-xl text-[8px] sm:text-[10px] font-mono uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
              >
                Comparar
              </button>
            )}
            <a
              href={formatWhatsAppMessage(selectedConfigs, selectedGeneralAddons)}
              target="_blank"
              rel="noreferrer"
              className="bg-green-600 text-white px-4 sm:px-8 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-green-500 active:scale-95 shadow-sm"
              aria-label="Reservar experiencias seleccionadas por WhatsApp"
            >
              RESERVAR
            </a>
          </div>
        </div>
      </div>

      <GlassFooter />
    </div>
  );
};

export default CatalogoPage;
