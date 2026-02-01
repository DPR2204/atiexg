import React from 'react';
import TourImage from '../TourImage';
import { Tour, SelectedTourConfig } from '../../types';

interface ComparisonModalProps {
    tours: Tour[];
    configs: SelectedTourConfig[];
    onClose: () => void;
    onRemoveTour: (tourId: string) => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({
    tours,
    configs,
    onClose,
    onRemoveTour,
}) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Comparar Experiencias</h2>
                        <p className="text-xs text-gray-400">{tours.length} tours seleccionados</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-95" aria-label="Cerrar comparación">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Comparison Grid */}
            <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-gray-50/50">
                <div className="flex gap-4 sm:gap-5" style={{ minWidth: `${Math.max(tours.length * 280, 560)}px` }}>
                    {tours.map((tour, index) => {
                        const config = configs.find((c) => c.tourId === tour.id);
                        const price = tour.prices.find((p) => p.id === config?.selectedPriceId);
                        return (
                            <div
                                key={tour.id}
                                className="flex-1 min-w-[260px] max-w-[320px] bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm hover:shadow-lg transition-shadow animate-slide-up"
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                {/* Tour Image with Remove Button */}
                                <div className="relative">
                                    <TourImage
                                        src={tour.image}
                                        alt={tour.name}
                                        className="w-full h-36 sm:h-44 object-cover rounded-t-2xl"
                                        sizes="(max-width: 768px) 80vw, 320px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => onRemoveTour(tour.id)}
                                        className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-red-500 rounded-xl text-white/80 hover:text-white transition-all active:scale-90 backdrop-blur-sm"
                                        aria-label={`Quitar ${tour.name} de comparación`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    {/* Category Badge */}
                                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[9px] font-bold uppercase tracking-wider rounded-lg text-gray-700">
                                        {tour.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2">{tour.name}</h3>

                                    {/* Key Info */}
                                    <div className="space-y-2.5 mb-4">
                                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Formato</span>
                                            <span className="text-xs font-bold text-gray-900">{price?.label || 'Standard'}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-xl">
                                            <span className="text-[10px] font-medium text-red-400 uppercase tracking-wide">Desde</span>
                                            <span className="text-sm font-black text-red-600">${price?.amount || tour.price}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-xs font-bold text-gray-900">{tour.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itinerary Preview */}
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Itinerario</p>
                                        <div className="space-y-1.5">
                                            {(config?.customItinerary || tour.itinerary).slice(0, 3).map((step, idx) => (
                                                <div key={`${step.time}-${idx}`} className="flex gap-2 text-[11px]">
                                                    <span className="font-mono font-semibold text-red-500 shrink-0 w-12">{step.time}</span>
                                                    <span className="text-gray-600 truncate">{step.activity}</span>
                                                </div>
                                            ))}
                                            {tour.itinerary.length > 3 && (
                                                <p className="text-[10px] text-gray-400 italic">+{tour.itinerary.length - 3} paradas más...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Hint */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">Desliza horizontalmente para ver todos los tours</p>
            </div>
        </div>
    </div>
);

export default ComparisonModal;
