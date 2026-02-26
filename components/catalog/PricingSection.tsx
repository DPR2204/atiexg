import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PricingSectionProps {
    isExpanded: boolean;
    onToggle: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
    isExpanded,
    onToggle,
}) => {
    const { t, language } = useLanguage();

    return (
        <>
            {/* Section Header */}
            <div className="mb-8 sm:mb-12 animate-fade-in-up">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-px w-8 bg-gray-300" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                {t('catalog.pricingTag')}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('catalog.pricingTitle')}</h2>
                        <p className="text-sm text-gray-500 max-w-xl">{t('catalog.pricingDesc')}</p>
                    </div>
                    <button
                        onClick={onToggle}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-all"
                    >
                        {isExpanded ? (language === 'en' ? 'Hide' : 'Ocultar') : (language === 'en' ? 'Show' : 'Mostrar')}
                        <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className={`grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-16 sm:mb-20 transition-all duration-500 overflow-hidden ${isExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 mb-0'}`}>
                {/* Standard */}
                <div className="group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Standard</h3>
                            <span className="text-[9px] font-medium uppercase tracking-wider text-gray-400">{language === 'en' ? 'Shared' : 'Compartido'}</span>
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                            <span>{language === 'en' ? '8-12 people' : '8-12 personas'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                            <span>{language === 'en' ? 'Classic timing' : 'Timing clásico'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.466 3.429A1 1 0 012 14.502a17.09 17.09 0 003.037-2.936 18.93 18.93 0 01-1.065-2.572 1 1 0 111.898-.633c.217.65.473 1.276.766 1.875a17.09 17.09 0 001.39-3.536H4a1 1 0 110-2h3V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            <span>{language === 'en' ? 'Guide EN/ES' : 'Guía EN/ES'}</span>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-gray-50">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{t('tour.from')}</span>
                        <p className="text-lg font-bold text-gray-900">{language === 'en' ? 'Base price' : 'Precio base'}</p>
                    </div>
                </div>

                {/* Premium */}
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-blue-200">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Premium</h3>
                                <span className="text-[9px] font-medium uppercase tracking-wider text-blue-500">{t('common.popular')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                            <span>{language === 'en' ? '4-8 people' : '4-8 personas'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                            <span>{language === 'en' ? 'Flexible pace' : 'Ritmo flexible'}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">{language === 'en' ? 'Reserved table' : 'Mesa reservada'}</span>
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Premium perk</span>
                    </div>
                    <div className="pt-3 border-t border-blue-100">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400">{t('tour.from')}</span>
                        <p className="text-lg font-bold text-gray-900">+15-25%</p>
                    </div>
                </div>

                {/* All-in */}
                <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-emerald-200">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">All-in</h3>
                            <span className="text-[9px] font-medium uppercase tracking-wider text-emerald-500">{language === 'en' ? 'All inclusive' : 'Todo incluido'}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{language === 'en' ? 'Premium + activities included' : 'Premium + actividades incluidas'}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Zipline</span>
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Kayak</span>
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">Yoga</span>
                    </div>
                    <div className="pt-3 border-t border-emerald-100">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">{t('tour.from')}</span>
                        <p className="text-lg font-bold text-gray-900">+40-60%</p>
                    </div>
                </div>

                {/* Private */}
                <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-amber-200">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Private</h3>
                            <span className="text-[9px] font-medium uppercase tracking-wider text-amber-500">{language === 'en' ? 'Exclusive' : 'Exclusivo'}</span>
                        </div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                            <span>{language === 'en' ? 'Up to 6 pax (+$35 p/p extra)' : 'Hasta 6 pax (+$35 p/p extra)'}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">{language === 'en' ? 'Dedicated boat' : 'Lancha dedicada'}</span>
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">{language === 'en' ? 'Private host' : 'Host privado'}</span>
                        <span className="px-2 py-1 bg-white/80 rounded-lg text-[10px] font-medium text-gray-600">{language === 'en' ? 'Flexible route' : 'Ruta flexible'}</span>
                    </div>
                    <div className="pt-3 border-t border-amber-100">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400">{t('tour.from')}</span>
                        <p className="text-lg font-bold text-gray-900">+80-120%</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PricingSection;
