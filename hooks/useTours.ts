import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tour } from '../types';
import { dbRowToTour } from '../lib/tour-mapper';

let toursCache: Tour[] | null = null;
let toursFetchPromise: Promise<Tour[]> | null = null;
const listeners = new Set<(tours: Tour[]) => void>();

async function fetchToursFromSupabase(): Promise<Tour[]> {
    const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true });

    if (error) throw error;

    const mapped: Tour[] = (data || []).map(dbRowToTour);

    toursCache = mapped;
    toursFetchPromise = null;
    return mapped;
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
