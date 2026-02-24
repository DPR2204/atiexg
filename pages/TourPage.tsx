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

const isVideoGalleryItem = (item: string) => item.startsWith('video:');
const getGalleryPublicId = (item: string) => isVideoGalleryItem(item) ? item.slice(6) : item;

const TourRouteMap = lazy(() => import('../components/TourRouteMap'));

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
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4">Experiencia no encontrada</h2>
            <p className="text-gray-500 text-sm sm:text-base font-medium mb-8 max-w-md mx-auto">
              La experiencia que buscas no está disponible. Puedes explorar otras opciones en nuestro catálogo.
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al catálogo
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
        ]}
      />
      <GlassNav />

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 animate-fade-in">
          <Link to="/" className="hover:text-red-500 transition-colors">Inicio</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/catalogo" className="hover:text-red-500 transition-colors">Catálogo</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 font-medium truncate">{tour.name}</span>
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
                  alt={tour.name}
                  className="w-full aspect-[4/3] object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {tour.isBestSeller && (
                  <span className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Popular
                  </span>
                )}
                {tour.isNew && (
                  <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Nuevo
                  </span>
                )}
                <span className="px-3 py-1.5 glass-card text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {tour.category}
                </span>
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
                {tour.name}
              </h1>
              <p className="text-base sm:text-lg text-gray-500 italic">{tour.concept}</p>
            </div>

            <p className="text-gray-600 leading-relaxed">{tour.description}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="glass-card rounded-2xl px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Desde</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">${tour.price}</p>
              </div>
              <div className="glass-card rounded-2xl px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Duración</p>
                <p className="text-lg font-bold text-gray-900">{tour.duration}</p>
              </div>
              <div className="glass-card rounded-2xl px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Rating</p>
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
                Reservar ahora
              </a>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider glass-card hover:bg-white/80 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Ver más tours
              </Link>
            </div>
            {/* Deposit Option */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">¿Prefieres asegurar tu lugar?</span>
              <Link
                to={`/checkout?tour=${tour.id}`}
                className="text-red-500 hover:text-red-600 font-bold underline underline-offset-2 transition-colors"
              >
                Pagar $50 de anticipo
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
              Lo que incluye
            </h3>
            <ul className="space-y-3">
              {tour.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-gray-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Itinerary */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Itinerario sugerido
            </h3>
            <ul className="space-y-4">
              {tour.itinerary.map((step, index) => (
                <li key={`${step.time}-${step.activity}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xs font-bold text-red-600">
                      {step.time.split(':')[0]}
                    </span>
                    {index !== tour.itinerary.length - 1 && (
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
                Ruta del tour
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
              Opciones de precio
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
                    <p className="font-bold text-gray-900 mb-1">{price.label}</p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-3">
                      {price.description}
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
                Add-ons sugeridos
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
                      <span className="text-gray-700 font-medium">{addon.label}</span>
                      <span className="text-red-500 font-bold">${addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Related Tours */}
        {relatedTours.length > 0 && (
          <section className="mt-16 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900">Experiencias similares</h3>
              <Link
                to="/catalogo"
                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                Ver más
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
                      alt={relatedTour.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm">{relatedTour.name}</h4>
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
