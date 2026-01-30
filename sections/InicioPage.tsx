import React from 'react';
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

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
      </svg>
    ),
    title: 'Experiencias Premium',
    description: 'Tours privados, concierge y logística personalizada para viajeros exigentes.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
    ),
    title: 'Gastronomía Local',
    description: 'Conectamos con AtitlánRestaurantes.com y los mejores aliados gastronómicos.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    ),
    title: 'Cultura & Bienestar',
    description: 'Encuentros con artesanos, rituales locales y experiencias de wellness.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    title: 'Operación 360°',
    description: 'Traslados, staff bilingüe y coordinación total para tu tranquilidad.',
  },
];

const FEATURED_TOURS = TOURS.filter((t) => t.isBestSeller || t.rating >= 4.9).slice(0, 3);

const InicioPage = () => {
  const meta = PAGE_META.home;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.path}
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[75vh] sm:min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/30" />
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-red-100/40 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl animate-float-delayed" />

          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Content */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-gray-600">Lago de Atitlán, Guatemala</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight">
                  Más que tours:
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                    experiencias premium
                  </span>
                  en el lago.
                </h1>

                <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-xl">
                  Creamos rutas de alto nivel para visitantes exigentes. Gastronomía, hospitalidad y actividades privadas en el corazón de Atitlán.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/catalogo"
                    className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-all duration-300 shadow-xl shadow-gray-900/20 hover:shadow-red-600/30"
                  >
                    <span>Explorar Catálogo</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </Link>
                  <Link
                    to="/contacto"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider glass-card hover:bg-white/80 transition-all duration-300"
                  >
                    Contactar
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 pt-4">
                  <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <p className="text-3xl font-black text-gray-900">14+</p>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Experiencias</p>
                  </div>
                  <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <p className="text-3xl font-black text-gray-900">4.9</p>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</p>
                  </div>
                  <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <p className="text-3xl font-black text-gray-900">1000+</p>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Viajeros</p>
                  </div>
                </div>
              </div>

              {/* Hero Image Grid */}
              <div className="relative animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                      <TourImage
                        src="https://picsum.photos/seed/hero-1/600/800"
                        alt="Experiencia en el lago"
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                      <TourImage
                        src="https://picsum.photos/seed/hero-3/400/400"
                        alt="Cultura local"
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="aspect-square rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                      <TourImage
                        src="https://picsum.photos/seed/hero-2/400/400"
                        alt="Atardecer en Atitlán"
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                      <TourImage
                        src="https://picsum.photos/seed/hero-4/600/800"
                        alt="Aventura en lancha"
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                </div>

                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Reserva confirmada</p>
                      <p className="text-xs text-gray-500">Sunset Cruise - 2 personas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">¿Por qué elegirnos?</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                Una experiencia diferente en cada detalle
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group glass-card rounded-3xl p-6 hover:bg-white/80 transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Tours Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">Destacados</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Experiencias más populares</h2>
              </div>
              <Link
                to="/catalogo"
                className="group inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
              >
                <span>Ver todas</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURED_TOURS.map((tour, index) => (
                <Link
                  key={tour.id}
                  to={getTourPath(tour)}
                  className="group block animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <article className="glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <TourImage
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {tour.isBestSeller && (
                          <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            Popular
                          </span>
                        )}
                        <span className="px-3 py-1 glass-card text-[10px] font-bold uppercase tracking-wider rounded-full">
                          {tour.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-black mb-1">{tour.name}</h3>
                        <p className="text-sm opacity-80 line-clamp-1">{tour.concept}</p>
                      </div>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Desde</p>
                        <p className="text-2xl font-black text-gray-900">${tour.price}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-600">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span>{tour.rating}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative glass-card rounded-[2.5rem] overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.15),transparent_50%)]" />

              <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                  ¿Listo para tu próxima aventura?
                </h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
                  Contáctanos para diseñar la experiencia perfecta. Nuestro equipo responde rápido con opciones claras y personalizadas.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://wa.me/50222681264"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all duration-300 shadow-xl shadow-green-500/30"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                  <Link
                    to="/contacto"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                  >
                    Ver más opciones
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default InicioPage;
