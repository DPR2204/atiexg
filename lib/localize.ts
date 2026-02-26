import type { Language } from '../contexts/LanguageContext';

/**
 * Get a localized string field from a data object.
 * Looks for `field_en` when lang is 'en', falls back to `field`.
 */
export function L<T extends Record<string, any>>(
    obj: T,
    field: string,
    lang: Language,
): string {
    if (lang === 'en') {
        const enKey = `${field}_en`;
        if (enKey in obj && obj[enKey]) return obj[enKey] as string;
    }
    return (obj[field] ?? '') as string;
}

/**
 * Get a localized string-array field from a data object.
 */
export function LArray<T extends Record<string, any>>(
    obj: T,
    field: string,
    lang: Language,
): string[] {
    if (lang === 'en') {
        const enKey = `${field}_en`;
        if (enKey in obj && Array.isArray(obj[enKey])) return obj[enKey] as string[];
    }
    return (obj[field] ?? []) as string[];
}

/**
 * Get localized itinerary (array of {time, activity}) from a Tour-like object.
 */
export function LItinerary<T extends Record<string, any>>(
    obj: T,
    lang: Language,
): Array<{ time: string; activity: string }> {
    if (lang === 'en' && 'itinerary_en' in obj && Array.isArray(obj.itinerary_en)) {
        return obj.itinerary_en;
    }
    return (obj.itinerary ?? []) as Array<{ time: string; activity: string }>;
}
