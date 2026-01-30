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
}: {
  tours: Tour[];
  configs: SelectedTourConfig[];
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
    <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-xl" onClick={onClose}></div>
    <div className="relative bg-white w-full max-w-6xl rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">Comparativa Detallada</h2>
        <button onClick={onClose} className="p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all active:scale-90" aria-label="Cerrar comparación">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-x-auto p-4 sm:p-8 bg-gray-50/30">
        <div className="flex gap-4 sm:gap-8 min-w-[800px] md:min-w-[1000px]">
          {tours.map((tour) => {
            const config = configs.find((c) => c.tourId === tour.id);
            const price = tour.prices.find((p) => p.id === config?.selectedPriceId);
            return (
              <div key={tour.id} className="flex-1 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 flex flex-col shadow-sm">
                <TourImage
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-[1.5rem] sm:rounded-[2rem] mb-6 shadow-md"
                  sizes="(max-width: 768px) 80vw, 40vw"
                />
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 leading-none uppercase truncate">{tour.name}</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest mb-6">{tour.category}</p>

                <div className="space-y-4 sm:space-y-6 flex-1 text-sm">
                  <div className="flex justify-between border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-400 uppercase text-[8px] sm:text-[9px]">Formato</span>
                    <span className="font-black text-gray-900 text-xs sm:text-sm">{price?.label}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-400 uppercase text-[8px] sm:text-[9px]">Precio Ref.</span>
                    <span className="font-black text-red-500 text-xs sm:text-sm">${price?.amount}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold text-gray-400 uppercase text-[8px] sm:text-[9px]">Itinerario:</span>
                    {(config?.customItinerary || tour.itinerary).slice(0, 4).map((step, idx) => (
                      <div key={`${step.time}-${idx}`} className="flex gap-2 text-[10px] sm:text-[11px] font-bold text-gray-600">
                        <span className="text-red-500 shrink-0">{step.time}</span>
                        <span className="truncate">{step.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
  const [isPricingOpen, setIsPricingOpen] = useState(true);
  const [isAddonsOpen, setIsAddonsOpen] = useState(true);
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
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleSelection(tour);
                }}
                className={`absolute top-4 left-4 z-10 p-2.5 rounded-2xl shadow-lg transition-all active:scale-90 ${
                  selectedConfigs.some((config) => config.tourId === tour.id)
                    ? 'bg-red-500 text-white scale-110 shadow-red-200'
                    : 'bg-white/95 text-gray-500 hover:text-red-500'
                }`}
                aria-label={
                  selectedConfigs.some((config) => config.tourId === tour.id)
                    ? `Quitar ${tour.name} del plan`
                    : `Agregar ${tour.name} al plan`
                }
              >
                {selectedConfigs.some((config) => config.tourId === tour.id) ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
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

        <section id="esquema-precios" className="scroll-mt-28 mt-16 sm:mt-24">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.5)] space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%)] pointer-events-none"></div>
              <div className="flex items-start justify-between gap-4">
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                    Esquema
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-3">Esquema de precios (cómo funciona)</h2>
                  <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Definiciones consistentes para todos los tours.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPricingOpen((prev) => !prev)}
                  className="relative z-10 shrink-0 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                  aria-expanded={isPricingOpen}
                  aria-controls="pricing-content"
                >
                  <svg className={`w-4 h-4 transition-transform ${isPricingOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
              {isPricingOpen && (
                <div id="pricing-content" className="relative z-10 space-y-5 text-sm sm:text-base text-gray-700">
                  <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5">
                    <h3 className="font-black text-gray-900">Shared Standard (precio base)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Grupo: 8–12 pax.</li>
                      <li>Guía: bilingüe (EN/ES) compartido.</li>
                      <li>Ritmo: timing estándar (tour clásico).</li>
                      <li>Incluye: operación base del tour + agua.</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5">
                    <h3 className="font-black text-gray-900">Shared Premium</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Grupo: 4–8 pax (más exclusivo).</li>
                      <li>Ritmo: más buffers, menos carreras.</li>
                      <li>
                        Incluye además:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Priority seating en restaurantes (mesa reservada / servicio más rápido cuando aplique).</li>
                          <li>Premium Perk: 1 beneficio tangible definido por tour (ej.: coffee flight, 2do consumo, snack real, headlamp, safe packing, etc.).</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5">
                    <h3 className="font-black text-gray-900">Shared All-in (solo si el tour tiene “terceros”)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Lo mismo que Premium, pero ya incluye el costo de actividades de terceros (zipline, kayak/SUP, yoga/temazcal, etc.).</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5">
                    <h3 className="font-black text-gray-900">Private (precio por grupo)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Lancha/vehículo dedicado + host dedicado.</li>
                      <li>Ruta flexible (se ajusta ritmo/paradas).</li>
                      <li>Precio base incluye hasta 6 pax.</li>
                      <li>Persona adicional (si capacidad lo permite): USD 35 p/p.</li>
                    </ul>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400 border-t border-gray-100 pt-4">Precios sugeridos. Sujeto a cambios según temporada y disponibilidad.</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.5)] space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%)] pointer-events-none"></div>
              <div className="flex items-start justify-between gap-4">
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                    Add-ons
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-3">Add-ons generales (opcionales)</h2>
                  <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Opcionales universales aplicables a cualquier tour.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddonsOpen((prev) => !prev)}
                  className="relative z-10 shrink-0 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm"
                  aria-expanded={isAddonsOpen}
                  aria-controls="addons-content"
                >
                  <svg className={`w-4 h-4 transition-transform ${isAddonsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
              {isAddonsOpen && (
                <div id="addons-content" className="relative z-10 space-y-5 text-sm sm:text-base text-gray-700">
                  {GENERAL_ADDONS.map((category) => (
                    <div key={category.id} className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5">
                      <h3 className="font-black text-gray-900">{category.title}</h3>
                      <ul className="mt-2 space-y-2">
                        {category.items.map((item) => {
                          const isSelected = selectedGeneralAddons.includes(item);
                          return (
                            <li key={item}>
                              <button
                                type="button"
                                onClick={() => toggleGeneralAddon(item)}
                                className={`w-full flex items-start gap-2 rounded-xl px-3 py-2 text-left text-[12px] sm:text-sm font-bold border transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-600/10 border-emerald-200 text-emerald-700'
                                    : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-100 hover:text-emerald-600'
                                }`}
                              >
                                <span className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'}`}>
                                  {isSelected && (
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                  )}
                                </span>
                                <span>{item}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                  <p className="text-[11px] sm:text-xs text-gray-400 border-t border-gray-100 pt-4">Precios sugeridos. Sujeto a cambios según temporada y disponibilidad.</p>
                </div>
              )}
            </div>
          </div>
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
