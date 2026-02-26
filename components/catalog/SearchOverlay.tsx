import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
    isOpen,
    onClose,
    searchQuery,
    onSearchQueryChange,
}) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl animate-slide-down" role="search" aria-label={t('catalog.searchPlaceholder')}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 flex items-center gap-3 bg-white/50 rounded-2xl px-4 py-3 border border-gray-100">
                        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            placeholder={t('catalog.searchPlaceholder')}
                            className="flex-1 bg-transparent text-base font-medium outline-none text-gray-900 placeholder:text-gray-400"
                            autoFocus
                            aria-label={t('common.search')}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchQueryChange('')}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label={t('common.clear')}
                            >
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl bg-white/50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-all"
                        aria-label={t('common.escToClose')}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                    {t('common.escToClose')} <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">ESC</kbd>
                </p>
            </div>
        </div>
    );
};

export default SearchOverlay;
