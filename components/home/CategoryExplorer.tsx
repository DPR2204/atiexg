import React from 'react';
import { Link } from 'react-router-dom';
import TourImage from '../TourImage';
import { useTours } from '../../hooks/useTours';
import { useLanguage } from '../../contexts/LanguageContext';

const CATEGORIES = [
    { name: 'Signature', desc: 'Experiencia de día completo', image: 'DSC04496_noiz4x', count: 0 },
    { name: 'Lago & Momentos', desc: 'Atardeceres y paseos en lancha', image: 'DSC03858_qvws23', count: 0 },
    { name: 'Cultura & Pueblos', desc: 'Pueblos mayas y artesanías', image: 'DSC04192_yvloo0', count: 0 },
    { name: 'Sabores del Lago', desc: 'Gastronomía y café local', image: 'DSC04185_rgqgug', count: 0 },
    { name: 'Días de Campo', desc: 'Picnic y naturaleza', image: 'DSC04226_xwlrkb', count: 0 },
];

const CategoryExplorer: React.FC = () => {
    const { t, language } = useLanguage();
    const { tours } = useTours();

    // Count tours per category
    const categoriesWithCounts = CATEGORIES.map((cat) => {
        const count = tours.filter((tour) => tour.category === cat.name).length;
        return { ...cat, count };
    });

    return (
        <section className="py-20 lg:py-32 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                        {t('destinations.tag')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                        {t('destinations.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">{t('destinations.titleAccent')}</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                        {t('destinations.description')}
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                    {categoriesWithCounts.map((cat, index) => (
                        <Link
                            key={cat.name}
                            to={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
                            className="group block animate-fade-in-up"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <TourImage
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 50vw, 20vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                                    <h3 className="text-base lg:text-lg font-black text-white leading-tight">
                                        {cat.name}
                                    </h3>
                                    <p className="text-xs text-white/70 mt-1 line-clamp-2">
                                        {cat.desc}
                                    </p>
                                    {cat.count > 0 && (
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white rounded-full">
                                            {cat.count} {cat.count === 1 ? (language === 'en' ? 'experience' : 'experiencia') : (language === 'en' ? 'experiences' : 'experiencias')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryExplorer;
