import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Subscribe to real-time postgres_changes on a given table.
 * Calls `onEvent` (debounced) when changes occur.
 */
export function useRealtimeTable(
    tableName: string,
    onEvent: () => void,
    options?: { debounceMs?: number; enabled?: boolean }
) {
    const { debounceMs = 3000, enabled = true } = options || {};
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onEventRef = useRef(onEvent);

    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        if (!enabled) return;

        const channelName = `rt-${tableName}-${Math.random().toString(36).slice(2, 8)}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                () => {
                    if (timerRef.current) clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => {
                        onEventRef.current();
                    }, debounceMs);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [tableName, debounceMs, enabled]);
}
