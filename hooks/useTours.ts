import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tour } from '../types';
import { dbRowToTour } from '../lib/tour-mapper';
import { TOURS as STATIC_TOURS } from '../data';

let toursCache: Tour[] | null = null;
let toursFetchPromise: Promise<Tour[]> | null = null;
const listeners = new Set<(tours: Tour[]) => void>();

/** Merge _en translation fields from static data into Supabase tours */
function mergeStaticTranslations(tours: Tour[]): Tour[] {
    const staticById = new Map(STATIC_TOURS.map(t => [t.id, t]));
    return tours.map(tour => {
        const fallback = staticById.get(tour.id);
        if (!fallback) return tour;
        return {
            ...tour,
            name_en: tour.name_en || fallback.name_en,
            concept_en: tour.concept_en || fallback.concept_en,
            description_en: tour.description_en || fallback.description_en,
            features_en: tour.features_en || fallback.features_en,
            includes_en: tour.includes_en || fallback.includes_en,
            itinerary_en: tour.itinerary_en || fallback.itinerary_en,
            format_en: tour.format_en || fallback.format_en,
            prices: tour.prices.map((p, i) => ({
                ...p,
                label_en: p.label_en || fallback.prices?.[i]?.label_en,
                description_en: p.description_en || fallback.prices?.[i]?.description_en,
            })),
            addons: tour.addons.map((a, i) => ({
                ...a,
                label_en: a.label_en || fallback.addons?.[i]?.label_en,
            })),
        };
    });
}

async function fetchToursFromSupabase(): Promise<Tour[]> {
    const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true });

    if (error) throw error;

    const mapped: Tour[] = (data || []).map(dbRowToTour);
    const withTranslations = mergeStaticTranslations(mapped);

    toursCache = withTranslations;
    toursFetchPromise = null;
    return withTranslations;
}

/** Invalidate global tours cache and notify all mounted useTours consumers */
export function invalidateToursCache() {
    toursCache = null;
    toursFetchPromise = null;
    fetchToursFromSupabase().then(data => {
        listeners.forEach(fn => fn(data));
    });
}

export function useTours() {
    const [tours, setTours] = useState<Tour[]>(toursCache || []);
    const [loading, setLoading] = useState(!toursCache);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Subscribe to global updates
        listeners.add(setTours);
        return () => { listeners.delete(setTours); };
    }, []);

    useEffect(() => {
        if (toursCache) {
            setTours(toursCache);
            setLoading(false);
            return;
        }

        if (!toursFetchPromise) {
            toursFetchPromise = fetchToursFromSupabase();
        }

        toursFetchPromise
            .then(data => { setTours(data); })
            .catch(err => { setError(err.message); })
            .finally(() => { setLoading(false); });
    }, []);

    function refresh() {
        toursCache = null;
        toursFetchPromise = null;
        return fetchToursFromSupabase().then(data => {
            setTours(data);
            listeners.forEach(fn => { if (fn !== setTours) fn(data); });
        });
    }

    return { tours, loading, error, refresh };
}
