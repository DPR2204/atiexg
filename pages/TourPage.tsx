import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import TourImage from '../components/TourImage';
import { GlassNav, GlassFooter, LoadingSpinner } from '../components/shared';
import { useTours } from '../hooks/useTours';
import {
  buildOrganizationSchema,
  buildTourSchema,
  buildWebSiteSchema,
  getTourSlug,
  getTourMeta,
  getTourPath,
} from '../seo';
import { buildRouteFromItinerary } from '../lib/lake-coordinates';
import { getCloudinaryUrl } from '../src/utils/cloudinary';
import { useLanguage } from '../contexts/LanguageContext';
import { L, LArray, LItinerary } from '../lib/localize';

const isVideoGalleryItem = (item: string) => item.startsWith('video:');
const getGalleryPublicId = (item: string) => isVideoGalleryItem(item) ? item.slice(6) : item;

const TourRouteMap = lazy(() => import('../components/TourRouteMap'));

const NOT_INCLUDED: Record<string, string[]> = {
  'Signature': ['Propinas para guías y lancheros', 'Gastos personales en pueblos', 'Souvenirs y artesanías'],
  'Lago & Momentos': ['Alimentos y bebidas (salvo que se indique)', 'Propinas', 'Transporte terrestre desde tu hotel'],
  'Cultura & Pueblos': ['Entradas a museos opcionales', 'Propinas', 'Compras personales'],
  'Sabores del Lago': ['Bebidas alcohólicas adicionales', 'Propinas', 'Transporte terrestre'],
  'Días de Campo': ['Bebidas alcohólicas premium', 'Propinas', 'Actividades no especificadas'],
};
const DEFAULT_NOT_INCLUDED = ['Propinas para guías y lancheros', 'Gastos personales', 'Transporte desde tu hotel al punto de encuentro'];

const TOUR_FAQ: Record<string, Array<{ q: string; a: string }>> = {
  'Signature': [
    { q: '¿Cuánto dura el tour completo?', a: 'El tour Signature dura entre 8 y 9 horas, es una experiencia de día completo que incluye visitas a 3 pueblos, almuerzo y coffee break.' },
    { q: '¿Está incluido el almuerzo?', a: 'Sí, el almuerzo está incluido en nuestro restaurante partner en Santiago Atitlán con opciones de comida local y menú internacional.' },
    { q: '¿Puedo personalizar el itinerario?', a: 'Absolutamente. Contáctanos por WhatsApp y diseñaremos una ruta a tu medida manteniendo los highlights del tour.' },
    { q: '¿Es apto para niños?', a: 'Sí, el tour es familiar. Los niños menores de 5 años viajan gratis y los menores de 12 tienen descuento.' },
  ],
  'Lago & Momentos': [
    { q: '¿A qué hora sale la lancha?', a: 'Las salidas dependen del tour elegido, pero generalmente partimos entre 8:00 y 9:00 AM desde el muelle de Panajachel.' },
    { q: '¿Qué pasa si llueve?', a: 'Monitoreamos las condiciones climáticas. En caso de lluvia fuerte, reprogramamos sin costo adicional o ajustamos la ruta.' },
    { q: '¿Necesito saber nadar?', a: 'No es necesario. Todos los pasajeros llevan chaleco salvavidas y las actividades acuáticas son opcionales.' },
  ],
  'Cultura & Pueblos': [
    { q: '¿Se visitan comunidades indígenas?', a: 'Sí, visitamos pueblos tz\'utujil y kaqchikel con respeto a sus tradiciones. Nuestros guías son locales y facilitan el intercambio cultural.' },
    { q: '¿Puedo comprar artesanías?', a: 'Por supuesto. Haremos paradas en mercados y talleres donde podrás comprar directamente a los artesanos locales.' },
    { q: '¿Es necesario hablar español?', a: 'No, nuestros guías son bilingües (español/inglés) y pueden comunicarse en ambos idiomas durante todo el recorrido.' },
  ],
  'Sabores del Lago': [
    { q: '¿Hay opciones vegetarianas?', a: 'Sí, todos nuestros tours gastronómicos incluyen opciones vegetarianas y podemos adaptarnos a restricciones alimentarias con aviso previo.' },
    { q: '¿Incluye bebidas alcohólicas?', a: 'El tour incluye una degustación de bebidas locales. Bebidas alcohólicas adicionales se pueden comprar por cuenta propia.' },
    { q: '¿Cuántas degustaciones incluye?', a: 'Dependiendo del tour, incluimos entre 4 y 6 paradas gastronómicas con degustaciones de platillos típicos de la región.' },
  ],
  'Días de Campo': [
    { q: '¿Qué actividades están incluidas?', a: 'Incluimos actividades como kayak, senderismo, natación y juegos al aire libre según el paquete elegido.' },
    { q: '¿Es apto para grupos grandes?', a: 'Sí, podemos acomodar grupos de hasta 25 personas. Para grupos más grandes, contáctanos para un presupuesto personalizado.' },
    { q: '¿Qué comida se incluye?', a: 'Incluimos un picnic o almuerzo tipo barbacoa con ingredientes frescos y locales, además de snacks y bebidas no alcohólicas.' },
  ],
};
const DEFAULT_FAQ: Array<{ q: string; a: string }> = [
  { q: '¿Cuánto tiempo de anticipación necesito para reservar?', a: 'Recomendamos reservar con al menos 24-48 horas de anticipación para garantizar disponibilidad.' },
  { q: '¿Qué pasa si necesito cancelar?', a: 'Ofrecemos cancelación gratuita hasta 48 horas antes de la fecha del tour. Después de ese plazo, aplican cargos.' },
  { q: '¿El tour es apto para todas las edades?', a: 'Sí, nuestros tours están diseñados para ser disfrutados por personas de todas las edades en un ambiente seguro y familiar.' },
];

const formatWhatsApp = (tourName: string, priceLabel?: string, priceAmount?: string, addons?: string[]) => {
  const base = 'https://wa.me/50222681264?text=';
  let message = `¡Hola Atitlán Experiences! 🌊\n\nMe interesa la experiencia: *${tourName}*.`;
  if (priceLabel && priceAmount) {
    message += `\nOpción: ${priceLabel} ($${priceAmount})`;
  }
  if (addons && addons.length > 0) {
    message += `\nAdd-ons: ${addons.join(', ')}`;
  }
  message += '\n¿Podrían compartir disponibilidad y próximos horarios?';
  return base + encodeURIComponent(message);
};

const TourPage = () => {
  const { t, language } = useLanguage();
  const { slug } = useParams();
  const { tours, loading, error } = useTours();

  const tour = useMemo(() => {
    if (!tours || !slug) return null;
    return tours.find((t) => getTourSlug(t) === slug) ?? null;
  }, [tours, slug]);

  const seoMeta = useMemo(() => (tour ? getTourMeta(tour) : null), [tour]);
  const [selectedPriceId, setSelectedPriceId] = useState('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!tour) return;
    setSelectedPriceId(tour.prices[0]?.id ?? '');
    setSelectedAddonIds([]);
    setSelectedImageIndex(0);
  }, [tour]);

  // Get related tours (same category, excluding current)
  const relatedTours = useMemo(() => {
    if (!tour || !tours) return [];
    return tours.filter((t) => t.category === tour.category && t.id !== tour.id).slice(0, 3);
  }, [tour, tours]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || (!loading && !tour)) {
    return (
      <div className="min-h-screen bg-white">
        <GlassNav />
        <main className="max-w-5xl mx-auto px-4 py-16 animate-fade-in-up">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4">{t('tour.notFoundTitle')}</h2>
            <p className="text-gray-500 text-sm sm:text-base font-medium mb-8 max-w-md mx-auto">
              {t('tour.notFoundDesc')}
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('tour.backToCatalog')}
            </Link>
          </div>
        </main>
        <GlassFooter />
      </div>
    );
  }

  if (!tour || !seoMeta) return null; // Logic handled above, keeps TS happy

  const selectedPrice = tour.prices.find((price) => price.id === selectedPriceId);
  const selectedAddons = tour.addons.filter((addon) => selectedAddonIds.includes(addon.id));
  const selectedAddonLabels = selectedAddons.map((addon) => `${addon.label} ($${addon.price})`);
  const galleryImages = tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.image];
  const currentImage = galleryImages[selectedImageIndex] || tour.image;
  const notIncludedItems = NOT_INCLUDED[tour.category] ?? DEFAULT_NOT_INCLUDED;
  const faqItems = TOUR_FAQ[tour.category] ?? DEFAULT_FAQ;
  const hasMeals = tour.meals && tour.meals.length > 0;
  const hasLancha = tour.features.some((f) => /lancha/i.test(f));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={seoMeta.title}
        description={seoMeta.description}
        canonicalPath={seoMeta.path}
        ogImage={seoMeta.ogImage}
        structuredData={[
          buildOrganizationSchema(),
          buildWebSiteSchema(),
          buildTourSchema(tour),
          faqSchema,
        ]}
      />
      <GlassNav />

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-red-500 transition-colors">{t('nav.home')}</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/catalogo" className="hover:text-red-500 transition-colors">{t('nav.catalog')}</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 font-medium truncate">{L(tour, 'name', language)}</span>
        </nav>

        {/* Hero Section */}
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="animate-fade-in-up">
            {/* Main Image / Video */}
            <div className="relative rounded-3xl overflow-hidden glass-card">
              {isVideoGalleryItem(currentImage) ? (
                <video
                  key={currentImage}
                  src={getCloudinaryUrl(getGalleryPublicId(currentImage), { resourceType: 'video' })}
                  className="w-full aspect-[4/3] object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              ) : (
                <TourImage
                  src={currentImage}
                  alt={L(tour, 'name', language)}
                  className="w-full aspect-[4/3] object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {tour.isBestSeller && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    {t('tour.popular')}
                  </span>
                )}
                {tour.isNew && (
                  <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    {language === 'en' ? 'New' : 'Nuevo'}
                  </span>
                )}
                <span className="px-3 py-1.5 glass-card text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {tour.category}
                </span>
                {hasMeals && (
                  <span className="px-3 py-1.5 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    {language === 'en' ? 'Meals included' : 'Comidas incluidas'}
                  </span>
                )}
                {hasLancha && (
                  <span className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    {language === 'en' ? 'Private boat' : 'Lancha privada'}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 relative ${idx === selectedImageIndex
                      ? 'border-red-500 shadow-lg shadow-red-500/20 scale-[1.02]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    {isVideoGalleryItem(img) ? (
                      <>
                        <img
                          src={getCloudinaryUrl(getGalleryPublicId(img), { width: 80, height: 56, crop: 'fill', format: 'jpg', resourceType: 'video' })}
                          alt={`${tour.name} - video ${idx + 1}`}
                          className="w-16 h-12 sm:w-20 sm:h-14 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <TourImage
                        src={img}
                        alt={`${tour.name} - foto ${idx + 1}`}
                        className="w-16 h-12 sm:w-20 sm:h-14 object-cover"
                        sizes="80px"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-red-500" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                  {tour.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-3">
                {L(tour, 'name', language)}
              </h1>
              <p className="text-base sm:text-lg text-gray-500 italic">{L(tour, 'concept', language)}</p>
            </div>

            <p className="text-gray-600 leading-relaxed">{L(tour, 'description', language)}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="glass-card rounded-2xl px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">{t('tour.from')}</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">${tour.price}</p>
              </div>
              <div className="glass-card rounded-2xl px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">{t('tour.duration')}</p>
                <p className="text-lg font-bold text-gray-900">{tour.duration}</p>
              </div>
              <div className="glass-card rounded-2xl px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">{t('tour.rating')}</p>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-gray-900">{tour.rating}</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href={formatWhatsApp(tour.name, selectedPrice?.label, selectedPrice?.amount, selectedAddonLabels)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all shadow-lg shadow-green-500/30"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('tour.reserve')}
              </a>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider glass-card hover:bg-white/80 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('tour.viewMore')}
              </Link>
            </div>
            {/* Deposit Option */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{language === 'en' ? 'Prefer to secure your spot?' : '¿Prefieres asegurar tu lugar?'}</span>
              <Link
                to={`/checkout?tour=${tour.id}`}
                className="text-red-500 hover:text-red-600 font-bold underline underline-offset-2 transition-colors"
              >
                {language === 'en' ? 'Pay $50 deposit' : 'Pagar $50 de anticipo'}
              </Link>
            </div>

            {/* Cancellation Notice Banner */}
            <div className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
              <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700">{language === 'en' ? 'Free cancellation up to 48h before' : 'Cancelación gratuita hasta 48h antes'}</p>
              </div>
              <Link
                to="/politica-cancelacion"
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors shrink-0"
              >
                {language === 'en' ? 'View policy' : 'Ver política'}
              </Link>
            </div>
          </div>
        </section>

        {/* Details Grid */}
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Features */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {t('tour.includes')}
            </h3>
            <ul className="space-y-3">
              {LArray(tour, 'features', language).map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-gray-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {tour.includes && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">Incluye</p>
                <p className="text-gray-600 text-sm whitespace-pre-line">{tour.includes}</p>
              </div>
            )}
          </div>

          {/* Itinerary */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              {t('tour.itinerary')}
            </h3>
            <ul className="space-y-4">
              {LItinerary(tour, language).map((step, index) => (
                <li key={`${step.time}-${step.activity}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xs font-bold text-red-600">
                      {step.time.split(':')[0]}
                    </span>
                    {index !== LItinerary(tour, language).length - 1 && (
                      <div className="w-px h-full bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-red-500 mb-0.5">
                      {step.time}
                    </p>
                    <p className="text-gray-700 font-medium">{step.activity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* No Incluye */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              {language === 'en' ? 'Not included' : 'No incluye'}
            </h3>
            <ul className="space-y-3">
              {notIncludedItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Qué Llevar / Qué Esperar */}
        <section className="mt-8 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Qué Llevar */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </span>
                  {language === 'en' ? 'What to bring' : 'Qué llevar'}
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', text: 'Protector solar y sombrero' },
                    { icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z', text: 'Ropa cómoda y zapatos cerrados' },
                    { icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', text: 'Cámara o smartphone' },
                    { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', text: 'Efectivo para compras personales' },
                    { icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', text: 'Botella de agua reutilizable' },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-gray-600">
                      <span className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                      </span>
                      <span className="text-sm">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Qué Esperar */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  {language === 'en' ? 'What to expect' : 'Qué esperar'}
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', text: 'Punto de encuentro en muelle de Panajachel' },
                    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', text: 'Grupos pequeños para experiencia personalizada' },
                    { icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129', text: 'Guía bilingüe (español/inglés) durante todo el recorrido' },
                    { icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', text: 'Posibles cambios por condiciones climáticas' },
                    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Ambiente familiar y seguro' },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-gray-600">
                      <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                      </span>
                      <span className="text-sm">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Route Map */}
        {buildRouteFromItinerary(tour.itinerary).length >= 2 && (
          <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </span>
                {language === 'en' ? 'Tour route' : 'Ruta del tour'}
              </h3>
              <Suspense fallback={<div className="h-[300px] sm:h-[360px] rounded-2xl bg-gray-100 animate-pulse" />}>
                <TourRouteMap
                  itinerary={tour.itinerary}
                  className="h-[300px] sm:h-[360px] rounded-2xl overflow-hidden"
                />
              </Suspense>
              <div className="mt-4 flex flex-wrap gap-3">
                {buildRouteFromItinerary(tour.itinerary).map((stop, idx, arr) => (
                  <div key={`${stop.name}-${idx}`} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: idx === 0 ? '#dc2626' : idx === arr.length - 1 ? '#16a34a' : '#1d4ed8' }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-medium">
                      {stop.isReturn ? `${stop.name} (regreso)` : stop.name}
                    </span>
                    {idx < arr.length - 1 && (
                      <svg className="w-3 h-3 text-gray-300 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing Options */}
        <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              {t('tour.pricingOptions')}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tour.prices.map((price) => {
                const isSelected = selectedPriceId === price.id;
                return (
                  <button
                    key={price.id}
                    type="button"
                    onClick={() => setSelectedPriceId(price.id)}
                    className={`text-left bg-white rounded-2xl p-5 border transition-colors ${isSelected ? 'border-red-400 bg-red-50/40' : 'border-gray-100 hover:border-red-200'}`}
                    aria-pressed={isSelected}
                  >
                    <p className="font-bold text-gray-900 mb-1">{L(price, 'label', language)}</p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-3">
                      {L(price, 'description', language)}
                    </p>
                    <p className="text-2xl font-black text-red-500">{price.amount}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Add-ons */}
        {tour.addons.length > 0 && (
          <section className="mt-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
                {t('tour.addons')}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {tour.addons.map((addon) => {
                  const isSelected = selectedAddonIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() =>
                        setSelectedAddonIds((prev) =>
                          prev.includes(addon.id)
                            ? prev.filter((id) => id !== addon.id)
                            : [...prev, addon.id],
                        )
                      }
                      className={`flex items-center justify-between p-4 bg-white rounded-xl border transition-colors ${isSelected ? 'border-red-400 bg-red-50/40' : 'border-gray-100 hover:border-red-200'}`}
                      aria-pressed={isSelected}
                    >
                      <span className="text-gray-700 font-medium">{L(addon, 'label', language)}</span>
                      <span className="text-red-500 font-bold">${addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '550ms' }}>
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              {t('contact.faqTag')}
            </h3>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                  >
                    <span className="text-sm font-bold text-gray-900 pr-4">{item.q}</span>
                    <span className={`w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180 bg-red-100' : ''}`}>
                      <svg className={`w-3.5 h-3.5 ${openFaq === index ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                      <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Tours */}
        {relatedTours.length > 0 && (
          <section className="mt-16 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">{t('tour.relatedTitle')}</h3>
              <Link
                to="/catalogo"
                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                {t('tour.viewMore')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTours.map((relatedTour) => (
                <Link
                  key={relatedTour.id}
                  to={getTourPath(relatedTour)}
                  className="group block glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <TourImage
                      src={relatedTour.image}
                      alt={L(relatedTour, 'name', language)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm">{L(relatedTour, 'name', language)}</h4>
                      <p className="text-xs opacity-80">${relatedTour.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <GlassFooter />
    </div>
  );
};

export default TourPage;
