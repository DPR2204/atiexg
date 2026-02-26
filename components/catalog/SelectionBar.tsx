import React from 'react';
import { Link } from 'react-router-dom';
import TourImage from '../TourImage';
import { Tour, SelectedTourConfig } from '../../types';
import { useLanguage, type Language } from '../../contexts/LanguageContext';

interface SelectionBarProps {
    selectedConfigs: SelectedTourConfig[];
    onClear: () => void;
    onCompare: () => void;
    formatWhatsAppMessage: (selections: SelectedTourConfig[], generalAddons: string[]) => string;
    selectedGeneralAddons: string[];
    tours: Tour[];
}

const SelectionBar: React.FC<SelectionBarProps> = ({
    selectedConfigs,
    onClear,
    onCompare,
    formatWhatsAppMessage,
    selectedGeneralAddons,
    tours,
}) => {
    const { t, language } = useLanguage();

    // Build checkout URL with tour info
    const firstTour = selectedConfigs.length > 0
        ? tours.find((t) => t.id === selectedConfigs[0].tourId)
        : null;
    const checkoutUrl = firstTour
        ? `/checkout?tour=${firstTour.id}&items=${encodeURIComponent(JSON.stringify(selectedConfigs.map(c => c.tourId)))}`
        : '/checkout';

    return (
        <div className={`fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[94%] max-w-2xl bg-black rounded-2xl sm:rounded-[2.5rem] shadow-lg px-3 py-3 sm:px-5 sm:py-5 border border-white/10 text-white transition-all duration-700 ${selectedConfigs.length > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-40 opacity-0 scale-90 pointer-events-none'}`}>
            <div className="flex items-center justify-between gap-1.5 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div className="flex -space-x-2.5 sm:-space-x-4 overflow-hidden p-0.5 shrink-0">
                        {selectedConfigs.slice(0, 2).map((config) => {
                            const tour = tours.find((t) => t.id === config.tourId);
                            return (
                                <div key={config.tourId} className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl border-2 border-black overflow-hidden ring-1 ring-white/10">
                                    {tour?.image && tour?.name && (
                                        <TourImage
                                            src={tour.image}
                                            alt={tour.name}
                                            className="w-full h-full object-cover"
                                            sizes="64px"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        {selectedConfigs.length > 2 && (
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl border-2 border-black bg-gray-800 flex items-center justify-center text-[9px] sm:text-[10px] font-bold">
                                +{selectedConfigs.length - 2}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] sm:text-xs font-black uppercase tracking-tighter leading-none truncate">{selectedConfigs.length} Item{selectedConfigs.length > 1 ? 's' : ''}</span>
                        <span className="text-[7px] sm:text-[9px] text-white/30 font-mono uppercase tracking-widest mt-1 hidden xs:block">{language === 'en' ? 'Travel plan' : 'Plan de viaje'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                    <button
                        onClick={onClear}
                        className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white px-1 sm:px-2"
                    >
                        {t('common.clear')}
                    </button>
                    {selectedConfigs.length > 1 && (
                        <button
                            onClick={onCompare}
                            className="bg-white/10 text-white border border-white/20 px-2.5 sm:px-6 py-2 sm:py-3.5 rounded-xl text-[8px] sm:text-[10px] font-mono uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                        >
                            {t('catalog.compare')}
                        </button>
                    )}
                    <div className="flex flex-col gap-1">
                        <a
                            href={formatWhatsAppMessage(selectedConfigs, selectedGeneralAddons)}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-600 text-white px-4 sm:px-8 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-green-500 active:scale-95 shadow-sm text-center"
                            aria-label={t('tour.reserve')}
                        >
                            {t('tour.reserve')}
                        </a>
                        <Link
                            to={checkoutUrl}
                            className="text-[7px] sm:text-[8px] text-white/50 hover:text-white/80 text-center transition-colors underline underline-offset-2"
                        >
                            {language === 'en' ? 'Pay deposit' : 'Pagar anticipo'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectionBar;
