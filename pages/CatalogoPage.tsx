import React, { useMemo, useState, useEffect } from 'react';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter, LoadingSpinner } from '../components/shared';
import {
  SearchOverlay,
  ComparisonModal,
  FilterBar,
  TourCard,
  PricingSection,
  SelectionBar,
} from '../components/catalog';
import { useTours } from '../hooks/useTours';
import { SelectedTourConfig, Tour } from '../types';
import {
  PAGE_META,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../seo';
import { useLanguage } from '../contexts/LanguageContext';
import { L, LArray } from '../lib/localize';

const FILTER_CATEGORIES = ['Todos', 'Signature', 'Lago & Momentos', 'Cultura & Pueblos', 'Sabores del Lago', 'Días de Campo'];

interface AddonItem {
  name: string;
  name_en: string;
}

interface AddonCategory {
  id: string;
  title: string;
  title_en: string;
  items: AddonItem[];
}

const GENERAL_ADDONS: AddonCategory[] = [
  {
    id: 'transporte',
    title: 'Transporte (a/desde Ciudad de Guatemala)',
    title_en: 'Transportation (to/from Guatemala City)',
    items: [
      { name: 'Shared shuttle Guatemala City/Airport ↔ Panajachel: USD 32–40 p/p', name_en: 'Shared shuttle Guatemala City/Airport ↔ Panajachel: USD 32–40 p/p' },
      { name: 'Private transfer Guatemala City ↔ Panajachel: 1–3 pax USD 165–195 por vehículo', name_en: 'Private transfer Guatemala City ↔ Panajachel: 1–3 pax USD 165–195 per vehicle' },
      { name: 'Private transfer Guatemala City ↔ Panajachel: 4–6 pax USD 195–225 por vehículo', name_en: 'Private transfer Guatemala City ↔ Panajachel: 4–6 pax USD 195–225 per vehicle' },
      { name: 'Private transfer Guatemala City ↔ Panajachel: 7–10 pax USD 225–255 por vehículo', name_en: 'Private transfer Guatemala City ↔ Panajachel: 7–10 pax USD 225–255 per vehicle' },
      { name: 'Surcharge madrugada/tarde (si aplica): +USD 25–60', name_en: 'Early morning/late surcharge (if applicable): +USD 25–60' },
    ],
  },
  {
    id: 'tiempo-extra',
    title: 'Tiempo extra / flexibilidad',
    title_en: 'Extra time / flexibility',
    items: [
      { name: 'Hora extra lancha privada (navegación + espera): USD 65–95 por hora', name_en: 'Extra hour private boat (navigation + wait): USD 65–95 per hour' },
      { name: 'Hora extra con host/guía (si excede jornada): USD 25–45 por hora', name_en: 'Extra hour with host/guide (if exceeds schedule): USD 25–45 per hour' },
      { name: 'Parada extra planificada (buffer + coordinación): USD 15–35 por grupo', name_en: 'Extra planned stop (buffer + coordination): USD 15–35 per group' },
    ],
  },
  {
    id: 'guias-concierge',
    title: 'Guías y concierge',
    title_en: 'Guides & concierge',
    items: [
      { name: 'Guía premium upgrade: Half day USD 40–80 por grupo', name_en: 'Premium guide upgrade: Half day USD 40–80 per group' },
      { name: 'Guía premium upgrade: Full day USD 80–150 por grupo', name_en: 'Premium guide upgrade: Full day USD 80–150 per group' },
      { name: 'Intérprete 3er idioma (FR/DE/IT): Half day USD 120–220 por grupo', name_en: '3rd language interpreter (FR/DE/IT): Half day USD 120–220 per group' },
      { name: 'Intérprete 3er idioma (FR/DE/IT): Full day USD 220–350 por grupo', name_en: '3rd language interpreter (FR/DE/IT): Full day USD 220–350 per group' },
      { name: 'Concierge WhatsApp (pre-trip + durante tour): USD 15–35 por reserva', name_en: 'WhatsApp concierge (pre-trip + during tour): USD 15–35 per booking' },
    ],
  },
  {
    id: 'foto-video',
    title: 'Foto / video / contenido',
    title_en: 'Photo / video / content',
    items: [
      { name: 'Foto Mini (30–45 min, 15–25 fotos): USD 80–120', name_en: 'Mini photo (30–45 min, 15–25 photos): USD 80–120' },
      { name: 'Foto Standard (60–90 min, 30–50 fotos): USD 150–230', name_en: 'Standard photo (60–90 min, 30–50 photos): USD 150–230' },
      { name: 'Media jornada (3–4h): USD 350–550', name_en: 'Half day (3–4h): USD 350–550' },
      { name: 'Jornada completa (6–8h): USD 550–900', name_en: 'Full day (6–8h): USD 550–900' },
      { name: 'Drone add-on (clips + 5 fotos): USD 80–150', name_en: 'Drone add-on (clips + 5 photos): USD 80–150' },
      { name: 'Reel vertical (30–60s editado): USD 250–450', name_en: 'Vertical reel (30–60s edited): USD 250–450' },
    ],
  },
  {
    id: 'fnb',
    title: 'F&B (upgrade universal)',
    title_en: 'F&B (universal upgrade)',
    items: [
      { name: 'Coffee flight/tasting (3–4 muestras): USD 12–20 p/p', name_en: 'Coffee flight/tasting (3–4 samples): USD 12–20 p/p' },
      { name: 'Upgrade bebida premium (vino/cóctel/beer): USD 8–15 p/p', name_en: 'Premium drink upgrade (wine/cocktail/beer): USD 8–15 p/p' },
      { name: 'Charcutería/tapas upgrade: USD 12–30 p/p', name_en: 'Charcuterie/tapas upgrade: USD 12–30 p/p' },
      { name: 'Botella extra (vino): USD 35–70 | Espumante: USD 45–120', name_en: 'Extra bottle (wine): USD 35–70 | Sparkling: USD 45–120' },
      { name: 'Menú fijo 2–3 tiempos: USD 45–75 p/p', name_en: 'Fixed menu 2–3 courses: USD 45–75 p/p' },
      { name: 'Maridaje 2–3 bebidas: +USD 18–35 p/p', name_en: 'Pairing 2–3 drinks: +USD 18–35 p/p' },
    ],
  },
  {
    id: 'terceros',
    title: 'Actividades de terceros (si las integran como All-in)',
    title_en: 'Third-party activities (if integrated as All-in)',
    items: [
      { name: 'Yoga drop-in: USD 8–13 p/p', name_en: 'Yoga drop-in: USD 8–13 p/p' },
      { name: 'Temazcal: USD 19–39 p/p', name_en: 'Temazcal: USD 19–39 p/p' },
      { name: 'Masaje 60 min: USD 26–52 p/p', name_en: 'Massage 60 min: USD 26–52 p/p' },
      { name: 'Cacao ceremony: USD 13–33 p/p', name_en: 'Cacao ceremony: USD 13–33 p/p' },
      { name: 'Kayak/SUP (medio día): USD 10–16 p/p', name_en: 'Kayak/SUP (half day): USD 10–16 p/p' },
      { name: 'Zipline: USD 52–78 p/p', name_en: 'Zipline: USD 52–78 p/p' },
      { name: 'Parapente tandem: USD 65–104 p/p', name_en: 'Tandem paragliding: USD 65–104 p/p' },
    ],
  },
  {
    id: 'momentos',
    title: 'Momentos especiales',
    title_en: 'Special moments',
    items: [
      { name: 'Proposal kit (sin foto): USD 120–220', name_en: 'Proposal kit (no photo): USD 120–220' },
      { name: 'Proposal + foto mini: USD 220–380', name_en: 'Proposal + mini photo: USD 220–380' },
      { name: 'Cumpleaños a bordo (mini cake + decoración + foto mini opcional): USD 90–160', name_en: 'Birthday on board (mini cake + decoration + optional mini photo): USD 90–160' },
    ],
  },
];

const formatWhatsAppMessage = (selections: SelectedTourConfig[], generalAddons: string[], allTours: Tour[], lang: 'es' | 'en' = 'es') => {
  const base = 'https://wa.me/50222681264?text=';
  const isEn = lang === 'en';
  let message = isEn
    ? 'Hello Atitlan Experiences! 🌊\n\nPremium Booking Request:\n\n'
    : '¡Hola Atitlán Experiences! 🌊\n\nSolicitud de Reserva Premium:\n\n';

  selections.forEach((selection) => {
    const tour = allTours.find((t) => t.id === selection.tourId);
    if (!tour) return;
    const priceOption = tour.prices.find((p) => p.id === selection.selectedPriceId);
    const addons = tour.addons.filter((a) => selection.selectedAddonIds.includes(a.id));

    message += `🔹 *${L(tour, 'name', lang)}*\n`;
    message += `${isEn ? 'Option' : 'Opción'}: ${priceOption ? L(priceOption, 'label', lang) : ''} ($${priceOption?.amount})\n`;

    if (addons.length > 0) {
      message += `Add-ons: ${addons.map((a) => `${L(a, 'label', lang)} ($${a.price})`).join(', ')}\n`;
    }

    if (selection.customItinerary.length > 0) {
      message += isEn ? '_Adjusted Itinerary:_\n' : '_Itinerario Ajustado:_\n';
      selection.customItinerary.forEach((step) => {
        message += `• ${step.time}: ${step.activity}\n`;
      });
    }
    message += '\n';
  });

  if (generalAddons.length > 0) {
    message += isEn
      ? '\n🧩 *Selected general add-ons*\n'
      : '\n🧩 *Add-ons generales seleccionados*\n';
    generalAddons.forEach((addon) => {
      message += `• ${addon}\n`;
    });
  }

  message += isEn
    ? '\nCould you confirm availability for these experiences? Thank you!'
    : '\n¿Me podrían confirmar disponibilidad para estas experiencias? ¡Gracias!';
  return base + encodeURIComponent(message);
};

const CatalogoPage = () => {
  const { t, language } = useLanguage();
  const { tours, loading, error } = useTours();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedConfigs, setSelectedConfigs] = useState<SelectedTourConfig[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedGeneralAddons, setSelectedGeneralAddons] = useState<string[]>([]);
  const [isPricingExpanded, setIsPricingExpanded] = useState(true);
  const [isAddonsExpanded, setIsAddonsExpanded] = useState(true);
  const [expandedAddonCategories, setExpandedAddonCategories] = useState<Set<string>>(new Set(GENERAL_ADDONS.map(c => c.id)));
  const meta = PAGE_META.catalogo;

  // Build display labels for filters — 'Todos' gets translated, categories get localized labels
  const FILTERS = FILTER_CATEGORIES;
  const categoryLabels: Record<string, string> = language === 'en' ? {
    'Todos': 'All',
    'Lago & Momentos': 'Lake & Moments',
    'Cultura & Pueblos': 'Culture & Villages',
    'Sabores del Lago': 'Flavors of the Lake',
    'Días de Campo': 'Field Days',
  } : {};
  const filterDisplayLabel = (filter: string) => {
    if (filter === 'Todos') return t('catalog.filterAll');
    return categoryLabels[filter] || filter;
  };

  const filteredTours = useMemo(() => {
    if (!tours) return [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return tours.filter((tour) => {
      const matchesFilter = activeFilter === 'Todos' || tour.category === activeFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = [L(tour, 'name', language), tour.category, L(tour, 'concept', language), L(tour, 'description', language)]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeFilter, searchQuery, tours, language]);

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Category styles for add-ons
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
    'transporte': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    'tiempo-extra': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'guias-concierge': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    'foto-video': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    'fnb': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>,
    'terceros': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'momentos': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500 text-white rounded-lg">{t('common.back')}</button>
        </div>
      </div>
    );
  }

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
          tours={tours.filter((tour) => selectedConfigs.some((config) => config.tourId === tour.id))}
          configs={selectedConfigs}
          onClose={() => setIsCompareOpen(false)}
          onRemoveTour={(tourId) => {
            setSelectedConfigs((prev) => prev.filter((c) => c.tourId !== tourId));
            if (selectedConfigs.length <= 2) setIsCompareOpen(false);
          }}
        />
      )}

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-10 sm:mb-16 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Guatemala • Lago de Atitlán
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
            {t('catalog.title')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              {t('catalog.titleAccent')}
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            {tours.length} {t('catalog.description')}
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          filters={FILTERS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          labelMap={{ 'Todos': t('catalog.filterAll'), ...categoryLabels }}
        />

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-6 animate-fade-in">
            <p className="text-sm text-gray-500">
              {filteredTours.length} {filteredTours.length !== 1 ? t('common.results') : t('common.result')} {t('common.for')} "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 text-red-500 hover:text-red-600 font-medium"
              >
                {t('common.clear')}
              </button>
            </p>
          </div>
        )}

        {/* Tours Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTours.map((tour, index) => (
            <TourCard
              key={tour.id}
              tour={tour}
              isSelected={selectedConfigs.some((config) => config.tourId === tour.id)}
              onToggleSelection={toggleSelection}
              animationDelay={(index % 6) * 50}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('catalog.noResults')}</h3>
            <p className="text-gray-500 mb-6">
              {t('catalog.noResults')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('Todos');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              {t('common.viewAll')}
            </button>
          </div>
        )}

        {/* Pricing & Add-ons Section */}
        <section id="esquema-precios" className="scroll-mt-28 mt-16 sm:mt-24">
          <PricingSection
            isExpanded={isPricingExpanded}
            onToggle={() => setIsPricingExpanded(!isPricingExpanded)}
          />

          {/* Add-ons Section Header */}
          <div className="mb-8 sm:mb-10 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px w-8 bg-gray-300" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {t('catalog.addonsTag')}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('catalog.addonsTitle')}</h2>
                <p className="text-sm text-gray-500">{t('catalog.addonsDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedGeneralAddons.length > 0 && (
                  <>
                    <span className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-red-600">
                      {selectedGeneralAddons.length} {selectedGeneralAddons.length > 1 ? t('catalog.selectedPlural') : t('catalog.selected')}
                    </span>
                    <button
                      onClick={() => setSelectedGeneralAddons([])}
                      className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                    >
                      {t('common.clear')}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsAddonsExpanded(!isAddonsExpanded)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-all"
                >
                  {isAddonsExpanded ? (language === 'en' ? 'Hide' : 'Ocultar') : (language === 'en' ? 'Show' : 'Mostrar')}
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isAddonsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Add-ons Grid */}
          <div className={`grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-all duration-500 overflow-hidden ${isAddonsExpanded ? 'opacity-100 max-h-[4000px]' : 'opacity-0 max-h-0'}`}>
            {GENERAL_ADDONS.map((category, catIndex) => {
              const style = categoryStyles[category.id] || categoryStyles['transporte'];
              const selectedInCategory = category.items.filter(item => selectedGeneralAddons.includes(item.name)).length;
              const isExpanded = expandedAddonCategories.has(category.id);

              const toggleCategory = () => {
                setExpandedAddonCategories(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(category.id)) {
                    newSet.delete(category.id);
                  } else {
                    newSet.add(category.id);
                  }
                  return newSet;
                });
              };

              return (
                <div
                  key={category.id}
                  className={`${style.bg} border ${style.border} rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${catIndex * 60}ms` }}
                >
                  {/* Category Header */}
                  <button
                    onClick={toggleCategory}
                    className="w-full flex items-center justify-between mb-2 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${style.icon} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        {categoryIcons[category.id]}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 text-sm">{L(category, 'title', language).split(' (')[0]}</h3>
                        <p className="text-[10px] text-gray-400">{category.items.length} {language === 'en' ? 'options' : 'opciones'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedInCategory > 0 && (
                        <span className={`w-6 h-6 rounded-full ${style.icon} flex items-center justify-center text-[10px] font-bold`}>
                          {selectedInCategory}
                        </span>
                      )}
                      <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Items */}
                  <div className={`space-y-1.5 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[180px] opacity-100 mt-3 overflow-y-auto scrollbar-hide' : 'max-h-0 opacity-0'}`}>
                    {category.items.map((item) => {
                      const itemLabel = L(item, 'name', language);
                      const isSelected = selectedGeneralAddons.includes(item.name);
                      const priceMatch = itemLabel.match(/USD\s*[\d,–-]+(?:\s*(?:p\/p|per\s+(?:vehicle|group|hour|booking)|por\s+(?:vehículo|grupo|hora|reserva)))?/i);
                      const price = priceMatch ? priceMatch[0] : null;
                      const itemText = price ? itemLabel.replace(price, '').replace(/:\s*$/, '').trim() : itemLabel;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => toggleGeneralAddon(item.name)}
                          className={`w-full flex items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 ${isSelected
                            ? 'bg-white shadow-sm border border-gray-200'
                            : 'bg-white/50 hover:bg-white border border-transparent'
                            }`}
                        >
                          <span className={`w-4 h-4 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                            ? `${style.icon} border-transparent`
                            : 'border-gray-300'
                            }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
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
          <p className="text-center text-[11px] text-gray-400 mt-8">{language === 'en' ? 'Prices subject to season and availability' : 'Precios sujetos a temporada y disponibilidad'}</p>
        </section>
      </main>

      <SelectionBar
        selectedConfigs={selectedConfigs}
        onClear={() => setSelectedConfigs([])}
        onCompare={() => setIsCompareOpen(true)}
        formatWhatsAppMessage={(selections) => formatWhatsAppMessage(selections, selectedGeneralAddons, tours, language)}
        selectedGeneralAddons={selectedGeneralAddons}
        tours={tours}
      />

      <GlassFooter />
    </div>
  );
};

export default CatalogoPage;
