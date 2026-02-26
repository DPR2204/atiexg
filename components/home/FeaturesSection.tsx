import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const FEATURE_ICONS = [
    (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
];

const FEATURE_KEYS = ['hospitality', 'logistics', 'impact'] as const;

const FeaturesSection: React.FC = () => {
    const { t } = useLanguage();
    return (
        <section className="py-20 lg:py-32 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">{t('about.valuesTag')}</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                        {t('about.valuesTitle')}
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURE_KEYS.map((key, index) => (
                        <div
                            key={key}
                            className="group glass-card rounded-3xl p-6 hover:bg-white/80 transition-all duration-500 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform duration-300">
                                {FEATURE_ICONS[index]}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`features.${key}.title`)}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{t(`features.${key}.desc`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
