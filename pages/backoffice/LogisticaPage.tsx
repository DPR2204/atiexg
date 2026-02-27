import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { updateReservation } from '../../lib/reservation-logic';
import { toast } from 'sonner';
import {
    Reservation, Boat, Staff, MEAL_TYPE_LABELS, STATUS_CONFIG,
    type ReservationStatus, type MealSchedule
} from '../../types/backoffice';
import { Ship, Users, AlertTriangle, Check, X, Printer, Clock } from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────
const TIMELINE_START = 6; // 6:00
const TIMELINE_END = 18;  // 18:00
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;
const DEFAULT_DURATION_H = 3;

type TabKey = 'operaciones' | 'timeline' | 'manifiestos';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'operaciones', label: 'Operaciones', icon: <Ship size={14} /> },
    { key: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
    { key: 'manifiestos', label: 'Manifiestos', icon: <Printer size={14} /> },
];

// ─── Helpers ────────────────────────────────────────────────
function timeToMinutes(t?: string | null): number | null {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
}

function conflictKey(type: string, id: number) {
    return `${type}-${id}`;
}

// ─── Component ──────────────────────────────────────────────
export default function LogisticaPage() {
    const { agent, isAdmin } = useAuth();

    // Data
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [boats, setBoats] = useState<Boat[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);

    // UI
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useLocalStorage<TabKey>('logistica-tab', 'operaciones');

    // ─── Staff lookup ───────────────────────────────────────
    const staffMap = useMemo(() => new Map(staffList.map(s => [s.id, s])), [staffList]);
    const drivers = useMemo(() => staffList.filter(s => s.role === 'lanchero'), [staffList]);
    const guides = useMemo(() => staffList.filter(s => s.role === 'guia'), [staffList]);

    // ─── Fetch data ─────────────────────────────────────────
    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [resResult, boatResult, staffResult] = await Promise.all([
                supabase
                    .from('reservations')
                    .select(`
                        *,
                        agent:agents(name),
                        boat:boats(name, capacity),
                        passengers(*, meals:passenger_meals(*)),
                        meal_schedules(*)
                    `)
                    .eq('tour_date', filterDate)
                    .neq('status', 'cancelled')
                    .order('start_time'),
                supabase.from('boats').select('*').eq('status', 'active').order('name'),
                supabase.from('staff').select('*').eq('active', true).order('name'),
            ]);

            if (resResult.error) throw resResult.error;
            setReservations(resResult.data || []);
            setBoats(boatResult.data || []);
            setStaffList(staffResult.data || []);
        } catch (err) {
            console.error('Error fetching logistics:', err);
            if (!silent) toast.error('Error al cargar datos de logística');
        } finally {
            setLoading(false);
        }
    }, [filterDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Real-time ──────────────────────────────────────────
    useRealtimeTable('reservations', () => fetchData(true), { debounceMs: 3000 });

    // ─── Computed values ────────────────────────────────────
    const totalPax = useMemo(() =>
        reservations.reduce((sum, r) => sum + (r.pax_count || 0), 0),
        [reservations]
    );

    const allFoodOrders = useMemo(() =>
        reservations.flatMap(res =>
            (res.passengers || []).flatMap((p: any) =>
                (p.meals || []).filter((m: any) => m.food_order).map((m: any) => ({
                    passenger_name: p.full_name,
                    tour: res.tour_name,
                    meal_type: m.meal_type,
                    food_order: m.food_order,
                    dietary_notes: m.dietary_notes,
                    id: m.id,
                }))
            )
        ),
        [reservations]
    );

    const boatsAssigned = useMemo(() =>
        new Set(reservations.filter(r => r.boat_id).map(r => r.boat_id)).size,
        [reservations]
    );

    // ─── Conflict detection ─────────────────────────────────
    const conflicts = useMemo(() => {
        const map = new Map<string, number[]>();

        function addConflict(key: string, resId: number) {
            const arr = map.get(key) || [];
            if (!arr.includes(resId)) arr.push(resId);
            map.set(key, arr);
        }

        reservations.forEach(res => {
            if (res.boat_id) addConflict(conflictKey('boat', res.boat_id), res.id);
            if (res.driver_id) addConflict(conflictKey('driver', res.driver_id), res.id);
            if (res.guide_id) addConflict(conflictKey('guide', res.guide_id), res.id);
        });

        // Only keep entries with ≥2 reservations (actual conflicts)
        const result = new Map<string, number[]>();
        map.forEach((ids, key) => {
            if (ids.length >= 2) result.set(key, ids);
        });
        return result;
    }, [reservations]);

    const conflictResIds = useMemo(() => {
        const ids = new Set<number>();
        conflicts.forEach(arr => arr.forEach(id => ids.add(id)));
        return ids;
    }, [conflicts]);

    function getConflictsForRes(res: Reservation): string[] {
        const warnings: string[] = [];
        if (res.boat_id) {
            const k = conflictKey('boat', res.boat_id);
            const arr = conflicts.get(k);
            if (arr && arr.length >= 2) {
                const otherNames = arr
                    .filter(id => id !== res.id)
                    .map(id => reservations.find(r => r.id === id)?.tour_name || `#${id}`);
                warnings.push(`Lancha compartida con: ${otherNames.join(', ')}`);
            }
        }
        if (res.driver_id) {
            const k = conflictKey('driver', res.driver_id);
            const arr = conflicts.get(k);
            if (arr && arr.length >= 2) {
                warnings.push(`Lanchero asignado a ${arr.length} tours`);
            }
        }
        if (res.guide_id) {
            const k = conflictKey('guide', res.guide_id);
            const arr = conflicts.get(k);
            if (arr && arr.length >= 2) {
                warnings.push(`Guía asignado/a a ${arr.length} tours`);
            }
        }
        return warnings;
    }

    // ─── Meal coordination by restaurant ────────────────────
    const restaurantGroups = useMemo(() => {
        const groups = new Map<string, {
            name: string;
            arrivalTimes: string[];
            tours: { tourName: string; pax: number; resId: number }[];
            totalPax: number;
            orders: { passenger: string; order: string; notes?: string }[];
        }>();

        reservations.forEach(res => {
            (res.meal_schedules || []).forEach((ms: MealSchedule) => {
                const key = ms.restaurant_name.toLowerCase().trim();
                const group = groups.get(key) || {
                    name: ms.restaurant_name,
                    arrivalTimes: [],
                    tours: [],
                    totalPax: 0,
                    orders: [],
                };

                if (ms.arrival_time && !group.arrivalTimes.includes(ms.arrival_time.slice(0, 5))) {
                    group.arrivalTimes.push(ms.arrival_time.slice(0, 5));
                }
                group.tours.push({ tourName: res.tour_name, pax: res.pax_count, resId: res.id });
                group.totalPax += ms.pax_count || res.pax_count || 0;

                // Gather passenger food orders for this reservation
                (res.passengers || []).forEach((p: any) => {
                    (p.meals || []).forEach((m: any) => {
                        if (m.food_order) {
                            group.orders.push({
                                passenger: p.full_name,
                                order: m.food_order,
                                notes: m.dietary_notes,
                            });
                        }
                    });
                });

                groups.set(key, group);
            });
        });

        return Array.from(groups.values());
    }, [reservations]);

    // ─── Boats with reservations (for manifests + timeline) ─
    const boatGroups = useMemo(() => {
        const map = new Map<number | 'unassigned', { boat: Boat | null; reservations: Reservation[] }>();

        // Initialize with all active boats
        boats.forEach(b => map.set(b.id, { boat: b, reservations: [] }));

        const unassigned: Reservation[] = [];
        reservations.forEach(res => {
            if (res.boat_id && map.has(res.boat_id)) {
                map.get(res.boat_id)!.reservations.push(res);
            } else {
                unassigned.push(res);
            }
        });

        const result = Array.from(map.values()).filter(g => g.reservations.length > 0);
        if (unassigned.length > 0) {
            result.push({ boat: null, reservations: unassigned });
        }
        return result;
    }, [reservations, boats]);

    // ─── Assignment handler ─────────────────────────────────
    async function handleAssign(resId: number, field: 'boat_id' | 'driver_id' | 'guide_id', value: number | null) {
        if (!agent) return;
        setSaving(resId);
        try {
            const { success, error } = await updateReservation(resId, { [field]: value } as any, agent as any);
            if (!success) throw error;

            const labels = { boat_id: 'Lancha', driver_id: 'Lanchero', guide_id: 'Guía' };
            toast.success(`${labels[field]} actualizado`);
            await fetchData(true);
        } catch (err) {
            console.error('Assignment error:', err);
            toast.error('Error al actualizar asignación');
        } finally {
            setSaving(null);
        }
    }

    // ─── Print restaurant sheet ─────────────────────────────
    function printRestaurantSheet(restaurant: typeof restaurantGroups[0]) {
        const w = window.open('', '_blank', 'width=800,height=600');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>${restaurant.name} — ${filterDate}</title>
            <style>
                body { font-family: -apple-system, sans-serif; padding: 2rem; color: #000; }
                h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
                h2 { font-size: 0.875rem; color: #666; margin-bottom: 1rem; }
                table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; font-size: 0.8125rem; }
                th { background: #f0f0f0; font-weight: 600; }
                .total { font-weight: 700; font-size: 1rem; margin: 1rem 0; }
            </style></head><body>
            <h1>${restaurant.name}</h1>
            <h2>Fecha: ${new Date(filterDate + 'T12:00:00').toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${restaurant.arrivalTimes.length ? ' — Llegada: ' + restaurant.arrivalTimes.join(', ') : ''}</h2>
            <p class="total">Total Comensales: ${restaurant.totalPax}</p>
            <table>
                <thead><tr><th>#</th><th>Pasajero</th><th>Pedido</th><th>Notas/Alergias</th></tr></thead>
                <tbody>${restaurant.orders.map((o, i) =>
            `<tr><td>${i + 1}</td><td>${o.passenger}</td><td>${o.order}</td><td>${o.notes || '—'}</td></tr>`
        ).join('')}</tbody>
            </table>
        </body></html>`);
        w.document.close();
        w.print();
    }

    // ─── Checklist for a reservation ────────────────────────
    function getChecklist(res: Reservation) {
        return [
            { label: 'Lancha', done: !!res.boat_id },
            { label: 'Lanchero', done: !!res.driver_id },
            { label: 'Guía', done: !!res.guide_id },
            { label: 'Comidas', done: (res.passengers || []).some((p: any) => (p.meals || []).length > 0) },
        ];
    }

    // ─── Readiness score ────────────────────────────────────
    const readyCount = useMemo(() =>
        reservations.filter(r => r.boat_id && r.driver_id && r.guide_id).length,
        [reservations]
    );

    // ─── Loading state ──────────────────────────────────────
    if (loading) {
        return (
            <div className="bo-logistica" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <div className="bo-loading-spinner" />
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────
    return (
        <div className="bo-logistica">
            {/* Header */}
            <header className="bo-page-header">
                <div>
                    <h2 className="bo-page-title">Logística y Operaciones</h2>
                    <p style={{ color: 'var(--bo-text-muted)', fontSize: '0.8125rem', margin: 0 }}>
                        Control de asignaciones, manifiesto y restauración
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="date"
                        className="bo-input"
                        style={{ width: 'auto' }}
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    <button
                        className="bo-btn bo-btn--secondary"
                        onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
                        title="Ir a hoy"
                    >
                        Hoy
                    </button>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="bo-stats-grid">
                <div className="bo-stat-card">
                    <div className="bo-stat-icon">
                        <Users size={18} />
                    </div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Pasajeros</span>
                        <span className="bo-stat-value">{totalPax}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--info">
                        <Ship size={18} />
                    </div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Tours</span>
                        <span className="bo-stat-value">{reservations.length}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className={`bo-stat-icon ${conflictResIds.size > 0 ? 'bo-stat-icon--warning' : 'bo-stat-icon--success'}`}>
                        {conflictResIds.size > 0 ? <AlertTriangle size={18} /> : <Check size={18} />}
                    </div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Conflictos</span>
                        <span className="bo-stat-value">{conflicts.size}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--success">
                        <Check size={18} />
                    </div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Listos</span>
                        <span className="bo-stat-value">{readyCount}/{reservations.length}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bo-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`bo-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span style={{ marginLeft: '0.375rem' }}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ═══ TAB: OPERACIONES ═══ */}
            {activeTab === 'operaciones' && (
                <div className="bo-logistica-operations">
                    {/* Reservation cards with assignments */}
                    {reservations.length === 0 ? (
                        <div className="bo-empty-state">
                            <span className="bo-empty-state-icon">⛵</span>
                            <p>No hay tours programados para esta fecha</p>
                            <span className="bo-empty-state-hint">Seleccioná otra fecha o creá una reserva</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {reservations.map(res => {
                                const resConflicts = getConflictsForRes(res);
                                const checklist = getChecklist(res);
                                const driver = res.driver_id ? staffMap.get(res.driver_id) : null;
                                const guide = res.guide_id ? staffMap.get(res.guide_id) : null;
                                const isSaving = saving === res.id;

                                return (
                                    <div
                                        key={res.id}
                                        className={`bo-logistica-card ${resConflicts.length > 0 ? 'bo-logistica-card--conflict' : ''}`}
                                    >
                                        {/* Card Header */}
                                        <div className="bo-logistica-card-header">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--bo-text)' }}>
                                                        {res.tour_name}
                                                    </span>
                                                    <span
                                                        className="bo-status-badge"
                                                        style={{
                                                            background: STATUS_CONFIG[res.status as ReservationStatus]?.bg,
                                                            color: STATUS_CONFIG[res.status as ReservationStatus]?.color,
                                                        }}
                                                    >
                                                        {STATUS_CONFIG[res.status as ReservationStatus]?.label}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--bo-text-secondary)' }}>
                                                    <span><Clock size={12} style={{ verticalAlign: '-2px' }} /> {res.start_time?.slice(0, 5) || '—'}</span>
                                                    <span><Users size={12} style={{ verticalAlign: '-2px' }} /> {res.pax_count} pax</span>
                                                    <span>Agente: {(res.agent as any)?.name || '—'}</span>
                                                </div>
                                            </div>
                                            {isSaving && <div className="bo-loading-spinner" style={{ width: 20, height: 20 }} />}
                                        </div>

                                        {/* Conflict warnings */}
                                        {resConflicts.length > 0 && (
                                            <div className="bo-logistica-conflicts">
                                                {resConflicts.map((w, i) => (
                                                    <div key={i} className="bo-alert bo-alert--error" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                        <AlertTriangle size={14} />
                                                        <span>{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Assignment dropdowns */}
                                        <div className="bo-logistica-assignments">
                                            <div className="bo-form-group" style={{ marginBottom: 0 }}>
                                                <label className="bo-label">Lancha</label>
                                                <select
                                                    className="bo-select bo-select--sm"
                                                    value={res.boat_id || ''}
                                                    onChange={e => handleAssign(res.id, 'boat_id', e.target.value ? Number(e.target.value) : null)}
                                                    disabled={isSaving}
                                                >
                                                    <option value="">Sin asignar</option>
                                                    {boats.map(b => (
                                                        <option key={b.id} value={b.id}>
                                                            {b.name} ({b.capacity} pax)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="bo-form-group" style={{ marginBottom: 0 }}>
                                                <label className="bo-label">Lanchero</label>
                                                <select
                                                    className="bo-select bo-select--sm"
                                                    value={res.driver_id || ''}
                                                    onChange={e => handleAssign(res.id, 'driver_id', e.target.value ? Number(e.target.value) : null)}
                                                    disabled={isSaving}
                                                >
                                                    <option value="">Sin asignar</option>
                                                    {drivers.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="bo-form-group" style={{ marginBottom: 0 }}>
                                                <label className="bo-label">Guía</label>
                                                <select
                                                    className="bo-select bo-select--sm"
                                                    value={res.guide_id || ''}
                                                    onChange={e => handleAssign(res.id, 'guide_id', e.target.value ? Number(e.target.value) : null)}
                                                    disabled={isSaving}
                                                >
                                                    <option value="">Sin asignar</option>
                                                    {guides.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Crew info (when assigned) */}
                                        {(driver || guide) && (
                                            <div className="bo-logistica-crew">
                                                {driver && (
                                                    <span className="bo-logistica-crew-badge">
                                                        <Ship size={12} /> {driver.name}
                                                        {driver.phone && (
                                                            <a href={`tel:${driver.phone}`} className="bo-logistica-phone">{driver.phone}</a>
                                                        )}
                                                    </span>
                                                )}
                                                {guide && (
                                                    <span className="bo-logistica-crew-badge">
                                                        <Users size={12} /> {guide.name}
                                                        {guide.phone && (
                                                            <a href={`tel:${guide.phone}`} className="bo-logistica-phone">{guide.phone}</a>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Stops + meals summary */}
                                        <div className="bo-logistica-details">
                                            {((res.custom_stops as any[]) || []).length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                    {(res.custom_stops as any[]).map((stop: any, i: number) => (
                                                        <span key={i} className="bo-tag bo-tag--info" style={{ fontSize: '0.75rem' }}>
                                                            {typeof stop === 'string' ? stop : stop.location || stop}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {(res.meal_schedules || []).length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                                    {(res.meal_schedules || []).map((ms: MealSchedule) => (
                                                        <span key={ms.id} className="bo-badge" style={{ fontSize: '0.6875rem' }}>
                                                            {ms.restaurant_name} {ms.arrival_time ? `@ ${ms.arrival_time.slice(0, 5)}` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Operational checklist */}
                                        <div className="bo-logistica-checklist">
                                            {checklist.map(item => (
                                                <span
                                                    key={item.label}
                                                    className={`bo-logistica-check ${item.done ? 'bo-logistica-check--done' : 'bo-logistica-check--pending'}`}
                                                >
                                                    {item.done ? <Check size={10} /> : <X size={10} />}
                                                    {item.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Restaurant coordination */}
                    {restaurantGroups.length > 0 && (
                        <section style={{ marginTop: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--bo-text)', marginBottom: '1rem' }}>
                                Coordinación de Restaurantes
                            </h3>
                            <div className="bo-logistica-restaurants">
                                {restaurantGroups.map((rg, i) => (
                                    <div key={i} className="bo-logistica-restaurant-card bo-card">
                                        <div className="bo-logistica-restaurant-header">
                                            <h3>{rg.name}</h3>
                                            <span className="bo-badge">{rg.totalPax} pax</span>
                                            {rg.arrivalTimes.length > 0 && (
                                                <span className="bo-logistica-restaurant-times">
                                                    <Clock size={12} style={{ verticalAlign: '-2px' }} /> {rg.arrivalTimes.join(', ')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="bo-logistica-restaurant-tours">
                                            {rg.tours.map((t, j) => (
                                                <div key={j} className="bo-logistica-restaurant-tour">
                                                    <span style={{ flex: 1 }}>{t.tourName}</span>
                                                    <span className="bo-badge" style={{ fontSize: '0.6875rem' }}>{t.pax} pax</span>
                                                </div>
                                            ))}
                                        </div>

                                        {rg.orders.length > 0 && (
                                            <div className="bo-logistica-restaurant-orders">
                                                <h4>Pedidos individuales ({rg.orders.length})</h4>
                                                {rg.orders.slice(0, 5).map((o, j) => (
                                                    <div key={j} style={{ fontSize: '0.8125rem', padding: '0.25rem 0', borderBottom: '1px solid var(--bo-border)' }}>
                                                        <span style={{ fontWeight: 500 }}>{o.passenger}</span>: {o.order}
                                                        {o.notes && <span style={{ color: 'var(--bo-warning)', marginLeft: '0.25rem' }}>({o.notes})</span>}
                                                    </div>
                                                ))}
                                                {rg.orders.length > 5 && (
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--bo-text-muted)', margin: '0.25rem 0 0' }}>
                                                        +{rg.orders.length - 5} más
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            className="bo-btn bo-btn--ghost bo-btn--sm"
                                            onClick={() => printRestaurantSheet(rg)}
                                            style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                                        >
                                            <Printer size={12} /> Imprimir hoja
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* ═══ TAB: TIMELINE ═══ */}
            {activeTab === 'timeline' && (
                <div className="bo-logistica-timeline">
                    {reservations.length === 0 ? (
                        <div className="bo-empty-state" style={{ padding: '3rem' }}>
                            <span className="bo-empty-state-icon">
                                <Clock size={32} />
                            </span>
                            <p>No hay tours para mostrar en el timeline</p>
                        </div>
                    ) : (
                        <>
                            {/* Header with hours */}
                            <div className="bo-timeline-header">
                                <div className="bo-timeline-label-col">Recurso</div>
                                <div style={{ display: 'flex', flex: 1 }}>
                                    {Array.from({ length: TIMELINE_HOURS }, (_, i) => (
                                        <div
                                            key={i}
                                            className="bo-timeline-hour"
                                            style={{ flex: 1 }}
                                        >
                                            {String(TIMELINE_START + i).padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rows per boat */}
                            {boatGroups.map((group, gi) => {
                                const label = group.boat?.name || 'Sin lancha';

                                return (
                                    <div key={gi} className="bo-timeline-row">
                                        <div className="bo-timeline-label-col">
                                            <span className="bo-timeline-resource-name">{label}</span>
                                            {group.boat && (
                                                <span style={{ fontSize: '0.6875rem', color: 'var(--bo-text-muted)' }}>
                                                    {group.boat.capacity} pax
                                                </span>
                                            )}
                                        </div>
                                        <div className="bo-timeline-track">
                                            {/* Gridlines */}
                                            {Array.from({ length: TIMELINE_HOURS }, (_, i) => (
                                                <div
                                                    key={i}
                                                    className="bo-timeline-gridline"
                                                    style={{ left: `${(i / TIMELINE_HOURS) * 100}%` }}
                                                />
                                            ))}

                                            {/* Blocks */}
                                            {group.reservations.map(res => {
                                                const startMin = timeToMinutes(res.start_time);
                                                if (startMin === null) return null;

                                                const rangeStartMin = TIMELINE_START * 60;
                                                const rangeTotalMin = TIMELINE_HOURS * 60;
                                                const durationMin = DEFAULT_DURATION_H * 60;

                                                const leftPct = Math.max(0, ((startMin - rangeStartMin) / rangeTotalMin) * 100);
                                                const widthPct = Math.min((durationMin / rangeTotalMin) * 100, 100 - leftPct);

                                                const cfg = STATUS_CONFIG[res.status as ReservationStatus];
                                                const hasConflict = conflictResIds.has(res.id);

                                                return (
                                                    <div
                                                        key={res.id}
                                                        className={`bo-timeline-block ${hasConflict ? 'bo-timeline-block--conflict' : ''}`}
                                                        style={{
                                                            left: `${leftPct}%`,
                                                            width: `${widthPct}%`,
                                                            background: cfg?.bg || 'var(--bo-surface-hover)',
                                                            borderLeft: `3px solid ${cfg?.color || 'var(--bo-border)'}`,
                                                        }}
                                                        title={`${res.tour_name} — ${res.pax_count} pax — ${res.start_time?.slice(0, 5)}`}
                                                    >
                                                        <span className="bo-timeline-block-title">{res.tour_name}</span>
                                                        <span className="bo-timeline-block-meta">{res.pax_count} pax</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}

            {/* ═══ TAB: MANIFIESTOS ═══ */}
            {activeTab === 'manifiestos' && (
                <div className="bo-logistica-manifests">
                    {boatGroups.length === 0 ? (
                        <div className="bo-empty-state">
                            <span className="bo-empty-state-icon"><Ship size={32} /></span>
                            <p>No hay tours para generar manifiestos</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }} className="bo-manifests-actions">
                                <button className="bo-btn bo-btn--primary" onClick={() => window.print()}>
                                    <Printer size={14} /> Imprimir Todo
                                </button>
                            </div>

                            {boatGroups.map((group, gi) => {
                                const totalGroupPax = group.reservations.reduce((s, r) => s + (r.pax_count || 0), 0);

                                return (
                                    <div key={gi} className={`bo-manifest ${gi < boatGroups.length - 1 ? 'bo-manifest-page-break' : ''}`}>
                                        {/* Manifest header */}
                                        <div className="bo-manifest-header">
                                            <div>
                                                <h2 className="bo-manifest-boat-name">
                                                    {group.boat ? `⛵ ${group.boat.name}` : '⚠️ Sin lancha asignada'}
                                                </h2>
                                                <p className="bo-manifest-date">
                                                    {new Date(filterDate + 'T12:00:00').toLocaleDateString('es-GT', {
                                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="bo-manifest-meta">
                                                <div>{group.reservations.length} tours</div>
                                                <div>{totalGroupPax} pax total</div>
                                                {group.boat && <div>Capacidad: {group.boat.capacity}</div>}
                                            </div>
                                        </div>

                                        {/* Per-tour sections */}
                                        {group.reservations.map(res => {
                                            const driver = res.driver_id ? staffMap.get(res.driver_id) : null;
                                            const guide = res.guide_id ? staffMap.get(res.guide_id) : null;
                                            const passengers = (res.passengers || []) as any[];

                                            return (
                                                <div key={res.id} className="bo-manifest-tour">
                                                    <div className="bo-manifest-tour-header">
                                                        <h3>{res.tour_name}</h3>
                                                        <span>{res.start_time?.slice(0, 5) || '—'}</span>
                                                        <span>{res.pax_count} pax</span>
                                                        <span
                                                            className="bo-status-badge"
                                                            style={{
                                                                background: STATUS_CONFIG[res.status as ReservationStatus]?.bg,
                                                                color: STATUS_CONFIG[res.status as ReservationStatus]?.color,
                                                            }}
                                                        >
                                                            {STATUS_CONFIG[res.status as ReservationStatus]?.label}
                                                        </span>
                                                    </div>

                                                    {/* Crew */}
                                                    <div className="bo-manifest-crew">
                                                        <span>Lanchero: {driver?.name || 'No asignado'}{driver?.phone ? ` (${driver.phone})` : ''}</span>
                                                        <span>Guía: {guide?.name || 'No asignado'}{guide?.phone ? ` (${guide.phone})` : ''}</span>
                                                    </div>

                                                    {/* Passenger table */}
                                                    {passengers.length > 0 && (
                                                        <table className="bo-table bo-manifest-pax-table">
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ width: '2rem' }}>#</th>
                                                                    <th>Nombre</th>
                                                                    <th style={{ width: '3rem' }}>Edad</th>
                                                                    <th>Comida</th>
                                                                    <th>Notas</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {passengers.map((p: any, pi: number) => {
                                                                    const meals = (p.meals || []) as any[];
                                                                    const foodOrder = meals.map((m: any) => m.food_order).filter(Boolean).join(', ');
                                                                    const dietaryNotes = meals.map((m: any) => m.dietary_notes).filter(Boolean).join(', ');
                                                                    return (
                                                                        <tr key={p.id}>
                                                                            <td>{pi + 1}</td>
                                                                            <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                                                                            <td>{p.age || '—'}</td>
                                                                            <td>{foodOrder || '—'}</td>
                                                                            <td>{dietaryNotes || p.dietary_notes || '—'}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    )}

                                                    {/* Stops */}
                                                    {((res.custom_stops as any[]) || []).length > 0 && (
                                                        <div className="bo-manifest-stops">
                                                            <strong>Paradas:</strong>{' '}
                                                            {(res.custom_stops as any[]).map((s: any) =>
                                                                typeof s === 'string' ? s : s.location
                                                            ).join(' → ')}
                                                        </div>
                                                    )}

                                                    {/* Meals */}
                                                    {(res.meal_schedules || []).length > 0 && (
                                                        <div className="bo-manifest-meals">
                                                            <strong>Restaurante:</strong>{' '}
                                                            {(res.meal_schedules || []).map((ms: MealSchedule) =>
                                                                `${ms.restaurant_name}${ms.arrival_time ? ` @ ${ms.arrival_time.slice(0, 5)}` : ''}`
                                                            ).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}

            {/* Print styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .bo-sidebar, .bo-header, .bo-menu-toggle,
                    .bo-stats-grid, .bo-tabs, .bo-page-header,
                    .bo-logistica-operations, .bo-logistica-timeline,
                    .bo-manifests-actions { display: none !important; }
                    .bo-main { margin-left: 0 !important; padding: 0 !important; }
                    .bo-content { padding: 0 !important; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
                    .bo-logistica { padding: 0 !important; }
                    .bo-logistica-manifests { display: block !important; }
                    .bo-manifest {
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        border-radius: 0 !important;
                        padding: 1rem 0 !important;
                    }
                    .bo-manifest-header {
                        border-bottom: 2px solid black !important;
                    }
                    .bo-manifest-page-break { page-break-after: always; }
                    .bo-table, .bo-table th, .bo-table td {
                        border: 1px solid #999 !important;
                        background: white !important;
                        color: black !important;
                    }
                    .bo-table th { background: #f0f0f0 !important; }
                    .bo-manifest-boat-name, .bo-manifest-tour-header h3 { color: black !important; }
                    .bo-manifest-date, .bo-manifest-meta,
                    .bo-manifest-crew, .bo-manifest-stops,
                    .bo-manifest-meals { color: #333 !important; }
                }
            `}} />
        </div>
    );
}
