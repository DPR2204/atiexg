import React from 'react';
import { Link } from 'react-router-dom';
import TourImage from '../TourImage';
import { useTours } from '../../hooks/useTours';
import { getTourPath } from '../../seo';
import { useLanguage } from '../../contexts/LanguageContext';

const FeaturedTours: React.FC = () => {
    const { t } = useLanguage();
    const { tours, loading } = useTours();

    // Filter and slice tours
    const featuredTours = tours
        .filter((tour) => tour.isBestSeller || tour.rating >= 4.9)
        .slice(0, 3);

    if (loading) return <div className="py-20 text-center">{t('common.loading')}</div>;

    return (
        <section className="py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
                    <div>
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">{t('common.popular')}</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{t('tour.popular')}</h2>
                    </div>
                    <Link
                        to="/catalogo"
                        className="group inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <span>{t('common.viewAll')}</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredTours.map((tour, index) => (
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
                                                {t('common.popular')}
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
                                        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{t('tour.from')}</p>
                                        <p className="text-2xl font-black text-gray-900">${tour.price}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold text-gray-600">
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
    );
};

export default FeaturedTours;
