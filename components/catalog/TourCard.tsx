import React from 'react';
import { Link } from 'react-router-dom';
import TourImage from '../TourImage';
import { Tour, SelectedTourConfig } from '../../types';
import { getTourPath } from '../../seo';

interface TourCardProps {
    tour: Tour;
    isSelected: boolean;
    onToggleSelection: (tour: Tour) => void;
    animationDelay?: number;
}

const TourCard: React.FC<TourCardProps> = ({
    tour,
    isSelected,
    onToggleSelection,
    animationDelay = 0,
}) => {
    return (
        <Link
            to={getTourPath(tour)}
            className="group block animate-fade-in-up relative"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <article className="h-full glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative aspect-[4/5] overflow-hidden">
                    <TourImage
                        src={tour.image}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Comparison button - top right - Enhanced */}
                    <button
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onToggleSelection(tour);
                        }}
                        className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg transition-all duration-300 active:scale-95 ${isSelected
                                ? 'bg-red-500 text-white shadow-red-500/30 scale-105'
                                : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white hover:shadow-red-500/20'
                            }`}
                        aria-label={
                            isSelected
                                ? `Quitar ${tour.name} del plan`
                                : `Agregar ${tour.name} al plan`
                        }
                    >
                        {isSelected ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Agregado</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-wide">Comparar</span>
                            </>
                        )}
                    </button>

                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {tour.isBestSeller && (
                            <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                                Popular
                            </span>
                        )}
                        <span className="px-3 py-1 glass-card text-[9px] font-bold uppercase tracking-wider rounded-full">
                            {tour.category}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <h3 className="text-xl sm:text-2xl font-black leading-tight mb-1 uppercase tracking-tight">
                            {tour.name}
                        </h3>
                        <p className="text-sm text-white/70 line-clamp-2 italic">
                            {tour.concept}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1">Desde</p>
                        <p className="text-2xl font-black text-gray-900">${tour.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold text-gray-700">{tour.rating}</span>
                        </div>
                        <span className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white group-hover:bg-red-500 transition-colors duration-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default React.memo(TourCard);
