import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, Ship, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SearchResult {
    id: number;
    type: 'reservation' | 'passenger';
    title: string;
    subtitle: string;
    meta: string;
    status?: string;
}

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    // Search logic with debounce
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // Search Reservations: by ID or tour_name
                let resQuery = supabase
                    .from('reservations')
                    .select('id, tour_name, tour_date, pax_count, status, boat:boats(name)')
                    .limit(5);

                if (!isNaN(Number(query))) {
                    resQuery = resQuery.eq('id', Number(query));
                } else {
                    resQuery = resQuery.ilike('tour_name', `%${query}%`);
                }

                const { data: resData } = await resQuery;

                // Search Passengers: by full_name
                const { data: paxData } = await supabase
                    .from('passengers')
                    .select(`
                        id, 
                        full_name, 
                        reservation_id, 
                        reservation:reservations!inner(tour_name, tour_date)
                    `)
                    .ilike('full_name', `%${query}%`)
                    .limit(5);

                const mappedRes: SearchResult[] = (resData || []).map((r: any) => ({
                    id: r.id,
                    type: 'reservation',
                    title: r.tour_name,
                    subtitle: `Reserva #${r.id} • ${new Date(r.tour_date).toLocaleDateString()}`,
                    meta: `${r.pax_count} pax • ${(r.boat as any)?.name || 'Sin lancha'}`,
                    status: r.status
                }));

                const mappedPax: SearchResult[] = (paxData || []).map((p: any) => ({
                    id: p.reservation_id, // Link to reservation
                    type: 'passenger',
                    title: p.full_name,
                    subtitle: `Pasajero en ${(p.reservation as any)?.tour_name}`,
                    meta: new Date((p.reservation as any)?.tour_date).toLocaleDateString(),
                }));

                setResults([...mappedRes, ...mappedPax]);
                setSelectedIndex(0);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    function handleSelect(result: SearchResult) {
        navigate(`/backoffice/reservas?editId=${result.id}`);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="bo-palette-overlay" onClick={onClose}>
            <div className="bo-palette-modal" onClick={e => e.stopPropagation()}>
                <div className="bo-palette-header">
                    <Search className="bo-palette-icon" size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="bo-palette-input"
                        placeholder="Buscar ID, pasajero, tour..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    {loading && <Loader className="animate-spin text-slate-400" size={16} />}
                </div>

                <div className="bo-palette-body">
                    {results.length === 0 && query.length > 0 && !loading && (
                        <div className="bo-palette-empty">No se encontraron resultados</div>
                    )}

                    <div className="bo-palette-list">
                        {results.map((result, index) => (
                            <div
                                key={`${result.type}-${result.id}-${index}`}
                                className={`bo-palette-item ${index === selectedIndex ? 'bo-palette-item--active' : ''}`}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="bo-palette-item-icon">
                                    {result.type === 'reservation' ? <Calendar size={16} /> : <User size={16} />}
                                </div>
                                <div className="bo-palette-item-content">
                                    <div className="bo-palette-item-title">
                                        {result.title}
                                        {result.status && <span className={`bo-status-dot bo-status-${result.status}`} />}
                                    </div>
                                    <div className="bo-palette-item-subtitle">{result.subtitle}</div>
                                </div>
                                <div className="bo-palette-item-meta">
                                    {result.meta}
                                    {index === selectedIndex && <ArrowRight size={14} className="ml-2" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bo-palette-footer">
                    <span>Use <strong>↑↓</strong> para navegar</span>
                    <span><strong>Enter</strong> para seleccionar</span>
                    <span><strong>Esc</strong> para cerrar</span>
                </div>
            </div>
        </div>
    );
}
