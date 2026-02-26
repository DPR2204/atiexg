import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { getCloudinaryUrl } from '../src/utils/cloudinary';
import { DESTINATIONS, getDestinationBySlug } from '../data/destinations';
import { SITE_URL } from '../seo';

const DestinoPage = () => {
  const { slug } = useParams();
  const destination = getDestinationBySlug(slug);

  if (!destination) {
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
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4">Destino no encontrado</h2>
            <p className="text-gray-500 text-sm sm:text-base font-medium mb-8 max-w-md mx-auto">
              El destino que buscas no esta disponible. Explora otros pueblos del Lago de Atitlan.
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ver catalogo
            </Link>
          </div>
        </main>
        <GlassFooter />
      </div>
    );
  }

  const otherDestinations = DESTINATIONS.filter((d) => d.slug !== destination.slug);

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.name,
    description: destination.description,
    url: `${SITE_URL}/destinos/${destination.slug}`,
    image: getCloudinaryUrl(destination.heroImage, { width: 1200, height: 630 }),
    touristType: 'Adventure, Cultural, Nature',
    containedInPlace: {
      '@type': 'Place',
      name: 'Lago de Atitlan, Guatemala',
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${destination.name} | Que Hacer y Como Llegar | Lago Atitlan`}
        description={`Descubre ${destination.name} en el Lago de Atitlan: ${destination.subtitle}. ${destination.highlights.slice(0, 3).join(', ')}. Tours desde Panajachel.`}
        canonicalPath={`/destinos/${destination.slug}`}
        ogImage={getCloudinaryUrl(destination.heroImage, { width: 1200, height: 630 })}
        structuredData={[placeSchema]}
      />
      <GlassNav />

      <main id="main-content">
        {/* Hero */}
        <section className="relative h-[60vh] sm:h-[70vh] min-h-[400px] overflow-hidden">
          <img
            src={getCloudinaryUrl(destination.heroImage, { width: 1600, height: 900 })}
            alt={`Vista de ${destination.name}, Lago de Atitlan`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
                <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white font-medium">{destination.name}</span>
              </nav>

              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-8 bg-red-500" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                  Destino
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-3">
                {destination.name}
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl">
                {destination.subtitle}
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-white/60">Tiempo de viaje</p>
                  <p className="text-white font-bold text-sm">{destination.travelTime}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-white/60">Mejor epoca</p>
                  <p className="text-white font-bold text-sm">{destination.bestTime}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16">
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-red-500" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                    Sobre el destino
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
                  Conoce {destination.name}
                </h2>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  {destination.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="glass-card rounded-3xl p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </span>
                    Destacados
                  </h3>
                  <ul className="space-y-3">
                    {destination.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3 text-gray-600">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-12 lg:py-20 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 animate-fade-in-up">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                Galeria
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Imagenes de {destination.name}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {destination.gallery.map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={getCloudinaryUrl(image, { width: 600, height: 450 })}
                    alt={`${destination.name} - imagen ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 animate-fade-in-up">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                Que Hacer
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Actividades en {destination.name}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.activities.map((activity, index) => (
                <div
                  key={activity}
                  className="glass-card rounded-3xl p-6 hover:bg-white/80 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-red-500/25">
                    <span className="text-lg font-black">{index + 1}</span>
                  </div>
                  <h3 className="text-gray-900 font-bold mb-1">{activity}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="relative glass-card rounded-[2.5rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.15),transparent_50%)]" />

              <div className="relative px-8 py-14 sm:px-14 sm:py-20 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
                  Visita {destination.name} con nosotros
                </h2>
                <p className="text-white/70 max-w-xl mx-auto mb-8">
                  Disenaremos una experiencia a tu medida que incluya lo mejor de {destination.name}
                  y el Lago de Atitlan.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href={`https://wa.me/50222681264?text=${encodeURIComponent(`Hola! Me interesa visitar ${destination.name}. Pueden ayudarme a planificar un tour?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all duration-300 shadow-xl shadow-green-500/30"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Planificar mi visita
                  </a>
                  <Link
                    to="/catalogo"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                  >
                    Ver tours disponibles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Destinations */}
        <section className="py-16 lg:py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 animate-fade-in-up">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                Explora Mas
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                Otros destinos en el Lago
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherDestinations.map((dest, index) => (
                <Link
                  key={dest.slug}
                  to={`/destinos/${dest.slug}`}
                  className="group block glass-card rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img
                      src={getCloudinaryUrl(dest.heroImage, { width: 600, height: 400 })}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-black text-lg">{dest.name}</h3>
                      <p className="text-white/80 text-sm">{dest.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{dest.travelTime}</span>
                      <span className="text-red-500 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explorar
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default DestinoPage;
