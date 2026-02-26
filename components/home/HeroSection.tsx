import React from 'react';
import { Link } from 'react-router-dom';
import TourImage from '../TourImage';
import { useLanguage } from '../../contexts/LanguageContext';

const HeroSection: React.FC = () => {
    const { t, language } = useLanguage();
    return (
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
                            <span className="text-xs font-semibold text-gray-600">{t('hero.tag')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight">
                            {t('hero.titleMain')}
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                                {t('hero.titleAccent')}
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-xl">
                            {t('hero.description')}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/catalogo"
                                className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-all duration-300 shadow-xl shadow-gray-900/20 hover:shadow-red-600/30"
                            >
                                <span>{t('hero.primaryCTA')}</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                to="/contacto"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider glass-card hover:bg-white/80 transition-all duration-300"
                            >
                                {t('hero.secondaryCTA')}
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 pt-4">
                            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <p className="text-3xl font-black text-gray-900">14+</p>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('hero.stats.experiences')}</p>
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                <p className="text-3xl font-black text-gray-900">4.9</p>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('hero.stats.rating')}</p>
                            </div>
                            <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                                <p className="text-3xl font-black text-gray-900">1000+</p>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('hero.stats.travelers')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image Grid */}
                    <div className="relative animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                    <TourImage
                                        src="DSC04336_bqmz9o"
                                        alt="Experiencia en el lago"
                                        className="w-full h-full object-cover"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </div>
                                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                                    <TourImage
                                        src="DSC04192_yvloo0"
                                        alt="Cultura local"
                                        className="w-full h-full object-cover"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 pt-8">
                                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-500">
                                    <TourImage
                                        src="DSC03858_qvws23"
                                        alt="Atardecer en Atitlán"
                                        className="w-full h-full object-cover"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </div>
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                                    <TourImage
                                        src="DSC04101_ktjtcp"
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{language === 'en' ? 'Booking confirmed' : 'Reserva confirmada'}</p>
                                    <p className="text-xs text-gray-500">{language === 'en' ? 'Sunset Cruise - 2 guests' : 'Sunset Cruise - 2 personas'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
