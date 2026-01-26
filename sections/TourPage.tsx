import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TOURS } from '../data';
import Seo from './Seo';
import TourImage from './TourImage';
import { Footer, Header, SearchOverlay } from './HomePage';
import {
  buildOrganizationSchema,
  buildTourSchema,
  buildWebSiteSchema,
  getTourBySlug,
  getTourMeta,
} from '../seo';

const formatWhatsApp = (tourName: string) => {
  const base = 'https://wa.me/50222681264?text=';
  const message = `¡Hola Atitlán Experiences! 🌊\n\nMe interesa la experiencia: *${tourName}*.\n¿Podrían compartir disponibilidad y próximos horarios?`;
  return base + encodeURIComponent(message);
};

const TourPage = () => {
  const { slug } = useParams();
  const tour = getTourBySlug(slug);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [passengers, setPassengers] = useState(2);

  const seoMeta = useMemo(() => (tour ? getTourMeta(tour) : null), [tour]);

  if (!tour || !seoMeta) {
    return (
      <div className="min-h-screen bg-white">
        <Header onSearchClick={() => setIsSearchOpen(true)} />
        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          passengers={passengers}
          onPassengersChange={setPassengers}
        />
        <main className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900">Experiencia no encontrada</h2>
          <p className="mt-4 text-gray-500 text-sm sm:text-base font-medium">
            La experiencia que buscas no está disponible. Puedes volver al catálogo para explorar otras opciones.
          </p>
          <Link
            to="/catalogo"
            className="inline-flex mt-6 bg-black text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest"
          >
            Volver al catálogo
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

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
      <Header onSearchClick={() => setIsSearchOpen(true)} />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        passengers={passengers}
        onPassengersChange={setPassengers}
      />

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        <nav className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-gray-400 flex flex-wrap gap-3">
          <Link to="/" className="hover:text-gray-900">Inicio</Link>
          <span>/</span>
          <Link to="/catalogo" className="hover:text-gray-900">Catálogo</Link>
          <span>/</span>
          <span className="text-gray-500">{tour.name}</span>
        </nav>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
            <TourImage
              src={tour.image}
              alt={tour.name}
              className="w-full h-full object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.3em] text-red-500">{tour.category}</span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mt-3 leading-tight">{tour.name}</h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium mt-2">{tour.concept}</p>
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">{tour.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gray-400">Desde</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">${tour.price}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gray-400">Duración</p>
                <p className="text-base sm:text-lg font-black text-gray-900">{tour.duration}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gray-400">Formato</p>
                <p className="text-base sm:text-lg font-black text-gray-900">{tour.format}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={formatWhatsApp(tour.name)}
                target="_blank"
                rel="noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-green-500"
                aria-label={`Reservar ${tour.name} por WhatsApp`}
              >
                Reservar por WhatsApp
              </a>
              <Link
                to="/catalogo"
                className="bg-black text-white px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-red-500"
              >
                Volver al catálogo
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">Lo que incluye</h3>
            <ul className="mt-4 space-y-3 text-sm sm:text-base text-gray-600 font-medium">
              {tour.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-red-500" aria-hidden="true"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">Itinerario sugerido</h3>
            <ul className="mt-4 space-y-3 text-sm sm:text-base text-gray-600 font-medium">
              {tour.itinerary.map((step) => (
                <li key={`${step.time}-${step.activity}`} className="flex items-start gap-3">
                  <span className="font-mono text-[10px] sm:text-xs text-red-500 uppercase tracking-widest">{step.time}</span>
                  <span>{step.activity}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">Opciones de precio</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tour.prices.map((price) => (
                <div key={price.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-sm font-black text-gray-900">{price.label}</p>
                  <p className="text-[10px] sm:text-xs font-mono text-gray-400 uppercase tracking-widest">{price.description}</p>
                  <p className="text-lg font-black text-red-500 mt-2">{price.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {tour.addons.length > 0 && (
          <section className="mt-10">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">Add-ons sugeridos</h3>
              <ul className="mt-4 space-y-3 text-sm sm:text-base text-gray-600 font-medium">
                {tour.addons.map((addon) => (
                  <li key={addon.id} className="flex items-center justify-between">
                    <span>{addon.label}</span>
                    <span className="text-red-500 font-black">${addon.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TourPage;
