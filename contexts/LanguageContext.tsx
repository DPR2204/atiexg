import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import translations
import { es, en } from '../translations';

const translations: Record<Language, typeof es> = { es, en };

/** Detect language from subdomain, localStorage, or default to 'es' */
const detectLanguage = (): Language => {
    if (typeof window === 'undefined') return 'es';
    // localStorage override (user explicitly toggled)
    const saved = localStorage.getItem('atiexg_lang');
    if (saved === 'es' || saved === 'en') return saved;
    // Subdomain detection: en.atitlanexperience.com → 'en'
    const hostname = window.location.hostname;
    if (hostname.startsWith('en.')) return 'en';
    return 'es';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(detectLanguage);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('atiexg_lang', lang);
    };

    // Translate function that supports nested keys like "nav.home"
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Fallback to key itself if not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
