import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tour } from '../types';

export function useTours() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTours();
    }, []);

    async function fetchTours() {
        try {
            const { data, error } = await supabase
                .from('tours')
                .select('*')
                .eq('active', true)
                .order('id', { ascending: true });

            if (error) throw error;

            if (data) {
                // Map Supabase data to Tour type if necessary
                // Currently, Supabase columns match Tour interface mostly
                // but we need to ensure JSON fields are parsed correctly if they come as strings
                // Supabase JS client usually handles JSONB automatically.
                const mappedTours: Tour[] = data.map((item: any) => ({
                    ...item,
                    // Ensure arrays are arrays (Supabase might return null for empty arrays)
                    gallery: item.gallery || [],
                    features: item.features || [],
                    meals: item.meals || [],
                    // Ensure JSON fields are correct (Supabase returns object/array for JSONB)
                    prices: item.prices || [],
                    addons: item.addons || [],
                    itinerary: item.itinerary || []
                }));
                setTours(mappedTours);
            }
        } catch (err: any) {
            console.error('Error fetching tours:', err);
            setError(err.message || 'Error al cargar experiencias');
        } finally {
            setLoading(false);
        }
    }

    return { tours, loading, error, refresh: fetchTours };
}
