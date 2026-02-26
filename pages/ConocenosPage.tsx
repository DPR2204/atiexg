import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import TourImage from '../components/TourImage';
import {
  PAGE_META,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../seo';
import { useLanguage } from '../contexts/LanguageContext';

const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Hospitalidad Auténtica',
    title_en: 'Authentic Hospitality',
    description: 'Equipo bilingüe y atención personalizada antes, durante y después del viaje. Tu experiencia es nuestra prioridad.',
    description_en: 'Bilingual team and personalized attention before, during, and after your trip. Your experience is our priority.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Curaduría Local',
    title_en: 'Local Curation',
    description: 'Colaboramos con los mejores chefs, capitanes y artesanos de la zona para ofrecerte experiencias únicas.',
    description_en: 'We collaborate with the best chefs, captains, and artisans in the area to offer you unique experiences.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Sostenibilidad',
    title_en: 'Sustainability',
    description: 'Priorizamos aliados que cuidan la comunidad y el entorno. El turismo responsable es parte de nuestra filosofía.',
    description_en: 'We prioritize partners who care for the community and environment. Responsible tourism is part of our philosophy.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: 'Flexibilidad Total',
    title_en: 'Total Flexibility',
    description: 'Ajustamos horarios, menús y actividades según tus preferencias. Cada experiencia se adapta a ti.',
    description_en: 'We adjust schedules, menus, and activities to your preferences. Every experience adapts to you.',
  },
];


const ConocenosPage = () => {
  const { t, language } = useLanguage();
  const L = (obj: Record<string, any>, field: string) => {
    if (language === 'en') {
      const enKey = `${field}_en`;
      if (enKey in obj && obj[enKey]) return obj[enKey] as string;
    }
    return (obj[field] ?? '') as string;
  };
  const meta = PAGE_META.conocenos;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.path}
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/30" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-px w-8 bg-red-500" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                    {t('about.tag')}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
                  {t('about.title')}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                    {t('about.titleAccent')}
                  </span>
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  {t('about.description')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/catalogo"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-all duration-300 shadow-lg shadow-gray-900/20"
                  >
                    <span>{t('about.viewExperiences')}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/contacto"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider glass-card hover:bg-white/80 transition-all"
                  >
                    {t('nav.contact')}
                  </Link>
                </div>
              </div>

              <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <video
                    src="https://res.cloudinary.com/dhtcup7uv/video/upload/v1771889289/SanAntonio_yuz1zc.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label="Vista del malecón de San Antonio Palopó en el Lago de Atitlán"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Floating Stats */}
                <div className="absolute -bottom-6 -left-6 glass-card p-5 rounded-2xl shadow-xl animate-float">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-500/30">
                      5+
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-900">{t('about.years')}</p>
                      <p className="text-xs text-gray-500">{t('about.ofExperience')}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 glass-card p-4 rounded-2xl shadow-xl animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-black text-gray-900">4.9</span>
                    <span className="text-xs text-gray-500">rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 lg:py-32 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                {t('about.valuesTag')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                {t('about.valuesTitle')}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((value, index) => (
                <div
                  key={value.title}
                  className="group glass-card rounded-3xl p-6 hover:bg-white/80 transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{L(value, 'title')}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{L(value, 'description')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-20 lg:py-32 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                    {t('about.partnersTag')}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-6">
                    {t('about.partnersTitle')}
                  </h2>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    {t('about.partnersDesc')}
                  </p>
                  <ul className="space-y-4">
                    {[
                      'AtitlánRestaurantes.com - Red gastronómica premium',
                      'Capitanes certificados con 15+ años de experiencia',
                      'Artesanos locales en San Juan y Santiago',
                      'Operadores de actividades (kayak, yoga, zipline)',
                      'Hoteles boutique seleccionados',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-gray-600 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                    <TourImage
                      src="https://res.cloudinary.com/dhtcup7uv/image/upload/v1771101946/DSC04135-HDR_gyllyu.jpg"
                      alt="Restaurante Atitlán en Santiago Atitlán"
                      className="w-full h-full object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative glass-card rounded-[2.5rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.15),transparent_50%)]" />

              <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                  {t('about.ctaTitle')}
                </h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
                  {t('about.ctaDesc')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://wa.me/50222681264"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all duration-300 shadow-xl shadow-green-500/30"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>{t('about.ctaWhatsapp')}</span>
                  </a>
                  <Link
                    to="/contacto"
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all duration-300"
                  >
                    {t('about.ctaMore')}
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

export default ConocenosPage;
