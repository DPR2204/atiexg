import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { updateReservation } from '../../lib/reservation-logic';
import { toast } from 'sonner';
import {
    Reservation, Boat, Staff, MEAL_TYPE_LABELS, STATUS_CONFIG,
    type ReservationStatus, type MealSchedule, type MealType
} from '../../types/backoffice';
import { Ship, Users, AlertTriangle, Check, X, Printer, Clock, FileText } from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────
const TIMELINE_START = 6;
const TIMELINE_END = 18;
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;
const DEFAULT_DURATION_H = 3;
const BOAT_MAX_CAPACITY = 23;

const KITCHEN_LOCATIONS = [
    'Atitlán Central',
    'Atitlán Mirador',
    'Atitlán Café',
    'Atitlán Café Bar',
    'Atitlán Santiago',
    'Atitlán San Juan',
] as const;

const EQUIPMENT_CHECKLIST = [
    'Chalecos salvavidas',
    'Botiquín',
    'Combustible',
    'Radio',
    'Extintor',
    'Cuerdas',
];

const BLANK_MANIFEST_ROWS = 3;

type TabKey = 'operaciones' | 'timeline' | 'manifiestos';
type PrintMode = 'all' | 'boat' | 'guide' | 'reservation';

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

function capacityColor(pax: number, cap: number): string {
    const pct = pax / cap;
    if (pct >= 1) return 'var(--bo-danger)';
    if (pct >= 0.8) return 'var(--bo-warning)';
    return 'var(--bo-success)';
}

function formatDateLong(date: string) {
    return new Date(date + 'T12:00:00').toLocaleDateString('es-GT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
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

    // Daily notes
    const [dailyNote, setDailyNote] = useState('');
    const [dailyNoteSaving, setDailyNoteSaving] = useState(false);
    const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // UI
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useLocalStorage<TabKey>('logistica-tab', 'operaciones');
    const [printMode, setPrintMode] = useState<PrintMode>('all');
    const [printFilter, setPrintFilter] = useState<number | null>(null);

    // ─── Staff lookup ───────────────────────────────────────
    const staffMap = useMemo(() => new Map(staffList.map(s => [s.id, s])), [staffList]);
    const drivers = useMemo(() => staffList.filter(s => s.role === 'lanchero'), [staffList]);
    const guides = useMemo(() => staffList.filter(s => s.role === 'guia'), [staffList]);

    // ─── Fetch data ─────────────────────────────────────────
    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [resResult, boatResult, staffResult, noteResult] = await Promise.all([
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
                supabase.from('daily_notes').select('*').eq('note_date', filterDate).maybeSingle(),
            ]);

            if (resResult.error) throw resResult.error;
            setReservations(resResult.data || []);
            setBoats(boatResult.data || []);
            setStaffList(staffResult.data || []);
            setDailyNote(noteResult.data?.content || '');
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
    useRealtimeTable('daily_notes', () => fetchData(true), { debounceMs: 2000 });

    // ─── Daily note save (debounced) ────────────────────────
    function handleDailyNoteChange(value: string) {
        setDailyNote(value);
        if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
        noteTimerRef.current = setTimeout(() => saveDailyNote(value), 1000);
    }

    async function saveDailyNote(content: string) {
        if (!agent) return;
        setDailyNoteSaving(true);
        try {
            await supabase.from('daily_notes').upsert({
                note_date: filterDate,
                content,
                updated_by: agent.id,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'note_date' });
        } catch (err) {
            console.error('Error saving daily note:', err);
        } finally {
            setDailyNoteSaving(false);
        }
    }

    // ─── Computed values ────────────────────────────────────
    const totalPax = useMemo(() =>
        reservations.reduce((sum, r) => sum + (r.pax_count || 0), 0),
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
        const result = new Map<string, number[]>();
        map.forEach((ids, key) => { if (ids.length >= 2) result.set(key, ids); });
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
            const arr = conflicts.get(conflictKey('boat', res.boat_id));
            if (arr && arr.length >= 2) {
                const others = arr.filter(id => id !== res.id).map(id => reservations.find(r => r.id === id)?.tour_name || `#${id}`);
                warnings.push(`Lancha compartida con: ${others.join(', ')}`);
            }
        }
        if (res.driver_id) {
            const arr = conflicts.get(conflictKey('driver', res.driver_id));
            if (arr && arr.length >= 2) warnings.push(`Lanchero asignado a ${arr.length} tours`);
        }
        if (res.guide_id) {
            const arr = conflicts.get(conflictKey('guide', res.guide_id));
            if (arr && arr.length >= 2) warnings.push(`Guía asignado/a a ${arr.length} tours`);
        }
        return warnings;
    }

    // ─── Restaurant coordination (fixed locations) ──────────
    type RestaurantGroup = {
        name: string;
        arrivalTimes: string[];
        tours: { tourName: string; pax: number; resId: number; boatName?: string }[];
        totalPax: number;
        ordersByMealType: Map<string, { passenger: string; order: string; notes?: string }[]>;
        allergies: { passenger: string; note: string }[];
        isFixed: boolean;
    };
    const restaurantGroups: RestaurantGroup[] = useMemo(() => {
        // Build data from meal_schedules
        const dataMap = new Map<string, {
            name: string;
            arrivalTimes: string[];
            tours: { tourName: string; pax: number; resId: number; boatName?: string }[];
            totalPax: number;
            ordersByMealType: Map<string, { passenger: string; order: string; notes?: string }[]>;
            allergies: { passenger: string; note: string }[];
        }>();

        reservations.forEach(res => {
            (res.meal_schedules || []).forEach((ms: MealSchedule) => {
                const key = ms.restaurant_name.toLowerCase().trim();
                const group = dataMap.get(key) || {
                    name: ms.restaurant_name,
                    arrivalTimes: [],
                    tours: [],
                    totalPax: 0,
                    ordersByMealType: new Map(),
                    allergies: [],
                };

                if (ms.arrival_time && !group.arrivalTimes.includes(ms.arrival_time.slice(0, 5))) {
                    group.arrivalTimes.push(ms.arrival_time.slice(0, 5));
                }
                group.tours.push({
                    tourName: res.tour_name,
                    pax: res.pax_count,
                    resId: res.id,
                    boatName: (res.boat as any)?.name,
                });
                group.totalPax += ms.pax_count || res.pax_count || 0;

                (res.passengers || []).forEach((p: any) => {
                    (p.meals || []).forEach((m: any) => {
                        if (m.food_order) {
                            const mealKey = m.meal_type || 'general';
                            const arr = group.ordersByMealType.get(mealKey) || [];
                            arr.push({ passenger: p.full_name, order: m.food_order, notes: m.dietary_notes });
                            group.ordersByMealType.set(mealKey, arr);
                        }
                        if (m.dietary_notes) {
                            group.allergies.push({ passenger: p.full_name, note: m.dietary_notes });
                        }
                    });
                    // Legacy dietary_notes on passenger
                    if (p.dietary_notes && !p.meals?.length) {
                        group.allergies.push({ passenger: p.full_name, note: p.dietary_notes });
                    }
                });

                dataMap.set(key, group);
            });
        });

        // Map fixed kitchen locations + any extras
        const result: RestaurantGroup[] = [];
        const usedKeys = new Set<string>();

        KITCHEN_LOCATIONS.forEach(loc => {
            const key = loc.toLowerCase().trim();
            const data = dataMap.get(key);
            usedKeys.add(key);
            result.push({
                name: loc,
                arrivalTimes: data?.arrivalTimes || [],
                tours: data?.tours || [],
                totalPax: data?.totalPax || 0,
                ordersByMealType: data?.ordersByMealType || new Map<string, { passenger: string; order: string; notes?: string }[]>(),
                allergies: data?.allergies || [],
                isFixed: true,
            });
        });

        // Add any non-fixed restaurants
        dataMap.forEach((data, key) => {
            if (!usedKeys.has(key)) {
                result.push({ ...data, isFixed: false });
            }
        });

        return result;
    }, [reservations]);

    // ─── Boat groups (for manifests + timeline) ─────────────
    const boatGroups = useMemo(() => {
        const map = new Map<number | 'unassigned', { boat: Boat | null; reservations: Reservation[] }>();
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
        if (unassigned.length > 0) result.push({ boat: null, reservations: unassigned });
        return result;
    }, [reservations, boats]);

    // ─── Guide groups (for flexible print) ──────────────────
    const guideGroups = useMemo(() => {
        const map = new Map<number | 0, { guide: Staff | null; reservations: Reservation[] }>();
        reservations.forEach(res => {
            const gid = res.guide_id || 0;
            const group = map.get(gid) || { guide: res.guide_id ? staffMap.get(res.guide_id) || null : null, reservations: [] };
            group.reservations.push(res);
            map.set(gid, group);
        });
        return Array.from(map.values());
    }, [reservations, staffMap]);

    // ─── Filtered manifests (print mode) ────────────────────
    const filteredManifests = useMemo(() => {
        if (printMode === 'boat' && printFilter) {
            return boatGroups.filter(g => g.boat?.id === printFilter);
        }
        if (printMode === 'guide' && printFilter) {
            const guideRes = reservations.filter(r => r.guide_id === printFilter);
            if (guideRes.length === 0) return [];
            return [{ boat: null as Boat | null, reservations: guideRes }];
        }
        if (printMode === 'reservation' && printFilter) {
            const res = reservations.find(r => r.id === printFilter);
            if (!res) return [];
            return [{ boat: res.boat_id ? boats.find(b => b.id === res.boat_id) || null : null, reservations: [res] }];
        }
        return boatGroups;
    }, [printMode, printFilter, boatGroups, reservations, boats]);

    // ─── Readiness ──────────────────────────────────────────
    const readyCount = useMemo(() =>
        reservations.filter(r => r.boat_id && r.driver_id && r.guide_id).length,
        [reservations]
    );

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

    // ─── Print kitchen receipt (thermal 80mm) ───────────────
    function printKitchenReceipt(restaurant: typeof restaurantGroups[0]) {
        const w = window.open('', '_blank', 'width=350,height=600');
        if (!w) return;

        const allOrders: { passenger: string; order: string; notes?: string; mealType: string }[] = [];
        restaurant.ordersByMealType.forEach((orders, mealType) => {
            orders.forEach(o => allOrders.push({ ...o, mealType }));
        });

        const mealSections = Array.from(restaurant.ordersByMealType.entries())
            .map(([type, orders]) => {
                const label = MEAL_TYPE_LABELS[type as MealType] || type;
                return `<tr><td colspan="3" style="font-weight:bold;padding:6px 0 2px;border-bottom:1px solid #000;font-size:11px;">── ${label} (${orders.length}) ──</td></tr>` +
                    orders.map((o, i) =>
                        `<tr><td>${i + 1}</td><td>${o.passenger}</td><td>${o.order}</td></tr>`
                    ).join('');
            }).join('');

        const allergySection = restaurant.allergies.length > 0
            ? `<div class="allergy">⚠️ ALERGIAS / RESTRICCIONES<br>${restaurant.allergies.map(a => `• ${a.passenger}: ${a.note}`).join('<br>')}</div>`
            : '';

        w.document.write(`<!DOCTYPE html><html><head><title>Cocina — ${restaurant.name}</title>
<style>
@page { size: 80mm auto; margin: 3mm; }
body { font-family: 'Courier New', monospace; font-size: 11px; width: 74mm; margin: 0 auto; color: #000; }
h1 { font-size: 14px; text-align: center; margin: 0 0 4px; }
h2 { font-size: 11px; text-align: center; color: #333; margin: 0 0 8px; border-bottom: 1px dashed #000; padding-bottom: 4px; }
.meta { font-size: 10px; text-align: center; margin-bottom: 6px; }
table { width: 100%; border-collapse: collapse; }
td { padding: 2px 4px; border-bottom: 1px dotted #ccc; font-size: 10px; vertical-align: top; }
.allergy { border: 2px solid #000; padding: 6px; margin-top: 10px; font-size: 10px; font-weight: bold; }
.footer { text-align: center; margin-top: 12px; border-top: 1px dashed #000; padding-top: 6px; font-size: 10px; }
.total { font-weight: bold; font-size: 12px; text-align: center; margin: 8px 0; }
.sig { margin-top: 20px; border-top: 1px solid #000; width: 60%; margin-left: auto; margin-right: auto; padding-top: 4px; text-align: center; font-size: 9px; }
</style></head><body>
<h1>${restaurant.name}</h1>
<h2>${formatDateLong(filterDate)}</h2>
${restaurant.arrivalTimes.length ? `<div class="meta">Llegada: ${restaurant.arrivalTimes.join(', ')}</div>` : ''}
<div class="total">Total Comensales: ${restaurant.totalPax}</div>
<table>${mealSections}</table>
${allergySection}
<div class="footer">
${restaurant.tours.map(t => `${t.tourName} (${t.pax} pax)${t.boatName ? ' — ' + t.boatName : ''}`).join('<br>')}
</div>
<div class="sig">Recibido por: _______________</div>
</body></html>`);
        w.document.close();
        w.print();
    }

    // ─── Print manifest (popup for filtered view) ───────────
    function printManifestPopup() {
        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) return;

        const manifestsHtml = filteredManifests.map((group, gi) => {
            const groupPax = group.reservations.reduce((s, r) => s + (r.pax_count || 0), 0);
            const boatName = group.boat?.name || 'Sin lancha';
            const boatCap = group.boat?.capacity || BOAT_MAX_CAPACITY;

            const toursHtml = group.reservations.map(res => {
                const driver = res.driver_id ? staffMap.get(res.driver_id) : null;
                const guide = res.guide_id ? staffMap.get(res.guide_id) : null;
                const passengers = (res.passengers || []) as any[];
                const emergencyInfo = res.emergency_contact_name
                    ? `${res.emergency_contact_name} ${res.emergency_contact_phone || ''}`
                    : '';

                const paxRows = passengers.map((p: any, pi: number) => {
                    const meals = (p.meals || []) as any[];
                    const food = meals.map((m: any) => m.food_order).filter(Boolean).join(', ');
                    const diet = meals.map((m: any) => m.dietary_notes).filter(Boolean).join(', ') || p.dietary_notes || '';
                    return `<tr><td>${pi + 1}</td><td>${p.full_name}</td><td>${p.age || '—'}</td><td>${food || '—'}</td><td>${diet || '—'}</td><td>${emergencyInfo || '—'}</td></tr>`;
                }).join('');

                // Blank rows for helpers
                const blankRows = Array.from({ length: BLANK_MANIFEST_ROWS }, (_, i) =>
                    `<tr><td>${passengers.length + i + 1}</td><td></td><td></td><td></td><td></td><td></td></tr>`
                ).join('');

                const stops = ((res.custom_stops as any[]) || []).map((s: any) =>
                    typeof s === 'string' ? s : s.location
                ).join(' → ');

                const meals = (res.meal_schedules || []).map((ms: MealSchedule) =>
                    `${ms.restaurant_name}${ms.arrival_time ? ' @ ' + ms.arrival_time.slice(0, 5) : ''}`
                ).join(', ');

                const equipmentHtml = EQUIPMENT_CHECKLIST.map(item =>
                    `<span style="margin-right:16px;">☐ ${item}</span>`
                ).join('');

                return `<div class="tour">
                    <div class="tour-header">
                        <h3>${res.tour_name}</h3>
                        <span>${res.start_time?.slice(0, 5) || '—'} — ${res.pax_count} pax — ${STATUS_CONFIG[res.status as ReservationStatus]?.label || res.status}</span>
                    </div>
                    <div class="crew">Lanchero: ${driver?.name || 'No asignado'}${driver?.phone ? ' (' + driver.phone + ')' : ''} | Guía: ${guide?.name || 'No asignado'}${guide?.phone ? ' (' + guide.phone + ')' : ''}</div>
                    <table><thead><tr><th>#</th><th>Nombre</th><th>Edad</th><th>Comida</th><th>Notas/Alergias</th><th>Contacto Emergencia</th></tr></thead>
                    <tbody>${paxRows}
                    <tr><td colspan="6" style="font-size:9px;font-style:italic;background:#f5f5f5;">Tripulación adicional / Ayudantes:</td></tr>
                    ${blankRows}</tbody></table>
                    ${stops ? `<p class="info"><strong>Paradas:</strong> ${stops}</p>` : ''}
                    ${meals ? `<p class="info"><strong>Restaurante:</strong> ${meals}</p>` : ''}
                    <div class="equipment">${equipmentHtml}</div>
                </div>`;
            }).join('');

            return `<div class="manifest${gi < filteredManifests.length - 1 ? ' page-break' : ''}">
                <div class="header">
                    <div>
                        <h2>⛵ ${boatName}</h2>
                        <p class="date">${formatDateLong(filterDate)}</p>
                        ${dailyNote ? `<p class="daily-note">📋 ${dailyNote}</p>` : ''}
                    </div>
                    <div class="meta">
                        <div>${group.reservations.length} tours</div>
                        <div>${groupPax}/${boatCap} pax</div>
                    </div>
                </div>
                ${toursHtml}
            </div>`;
        }).join('');

        w.document.write(`<!DOCTYPE html><html><head><title>Manifiesto — ${filterDate}</title>
<style>
body { font-family: -apple-system, sans-serif; padding: 1.5rem; color: #000; }
.manifest { margin-bottom: 2rem; }
.page-break { page-break-after: always; }
.header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 0.75rem; margin-bottom: 1rem; }
.header h2 { font-size: 1.25rem; margin: 0; }
.header .date { font-size: 0.875rem; color: #555; margin: 0.25rem 0 0; }
.header .daily-note { font-size: 0.8125rem; color: #333; margin: 0.25rem 0 0; font-style: italic; }
.header .meta { font-size: 0.8125rem; color: #555; text-align: right; }
.tour { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #ccc; }
.tour:last-child { border-bottom: none; }
.tour-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
.tour-header h3 { font-size: 1rem; margin: 0; }
.tour-header span { font-size: 0.8125rem; color: #555; }
.crew { font-size: 0.8125rem; color: #555; margin-bottom: 0.5rem; }
table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
th, td { border: 1px solid #aaa; padding: 0.375rem 0.5rem; text-align: left; font-size: 0.8125rem; }
th { background: #f0f0f0; font-weight: 600; font-size: 0.75rem; }
td:first-child { width: 2rem; text-align: center; }
.info { font-size: 0.8125rem; color: #555; margin: 0.375rem 0 0; }
.equipment { font-size: 0.75rem; margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px dashed #ccc; }
@media print { body { padding: 0; } .page-break { page-break-after: always; } }
</style></head><body>${manifestsHtml}</body></html>`);
        w.document.close();
        w.print();
    }

    // ─── Checklist ──────────────────────────────────────────
    function getChecklist(res: Reservation) {
        return [
            { label: 'Lancha', done: !!res.boat_id },
            { label: 'Lanchero', done: !!res.driver_id },
            { label: 'Guía', done: !!res.guide_id },
            { label: 'Comidas', done: (res.passengers || []).some((p: any) => (p.meals || []).length > 0) },
        ];
    }

    // ─── Capacity bar renderer ──────────────────────────────
    function CapacityBar({ pax, capacity }: { pax: number; capacity: number }) {
        const pct = Math.min((pax / capacity) * 100, 100);
        const color = capacityColor(pax, capacity);
        return (
            <div className="bo-capacity-bar">
                <div className="bo-capacity-bar-track">
                    <div className="bo-capacity-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="bo-capacity-bar-label" style={{ color }}>{pax}/{capacity} pax</span>
            </div>
        );
    }

    // ─── Loading ────────────────────────────────────────────
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

            {/* Daily note */}
            <div className="bo-daily-note">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <FileText size={14} style={{ color: 'var(--bo-text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--bo-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Notas del día
                    </span>
                    {dailyNoteSaving && <span style={{ fontSize: '0.6875rem', color: 'var(--bo-text-muted)' }}>Guardando...</span>}
                </div>
                <textarea
                    className="bo-input"
                    placeholder="Condiciones del lago, avisos operativos, recordatorios..."
                    value={dailyNote}
                    onChange={e => handleDailyNoteChange(e.target.value)}
                    rows={2}
                    style={{ resize: 'vertical', minHeight: '2.5rem', fontSize: '0.8125rem' }}
                />
            </div>

            {/* Stat Cards */}
            <div className="bo-stats-grid">
                <div className="bo-stat-card">
                    <div className="bo-stat-icon"><Users size={18} /></div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Pasajeros</span>
                        <span className="bo-stat-value">{totalPax}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--info"><Ship size={18} /></div>
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
                    <div className="bo-stat-icon bo-stat-icon--success"><Check size={18} /></div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Listos</span>
                        <span className="bo-stat-value">{readyCount}/{reservations.length}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bo-tabs">
                {TABS.map(tab => (
                    <button key={tab.key} className={`bo-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                        {tab.icon}
                        <span style={{ marginLeft: '0.375rem' }}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ═══ TAB: OPERACIONES ═══ */}
            {activeTab === 'operaciones' && (
                <div className="bo-logistica-operations">
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
                                const boatData = res.boat_id ? boats.find(b => b.id === res.boat_id) : null;
                                // Sum all pax on same boat
                                const boatTotalPax = boatData
                                    ? reservations.filter(r => r.boat_id === boatData.id).reduce((s, r) => s + (r.pax_count || 0), 0)
                                    : 0;

                                return (
                                    <div key={res.id} className={`bo-logistica-card ${resConflicts.length > 0 ? 'bo-logistica-card--conflict' : ''}`}>
                                        {/* Header */}
                                        <div className="bo-logistica-card-header">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--bo-text)' }}>{res.tour_name}</span>
                                                    <span className="bo-status-badge" style={{
                                                        background: STATUS_CONFIG[res.status as ReservationStatus]?.bg,
                                                        color: STATUS_CONFIG[res.status as ReservationStatus]?.color,
                                                    }}>
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

                                        {/* Capacity bar (when boat assigned) */}
                                        {boatData && <CapacityBar pax={boatTotalPax} capacity={boatData.capacity || BOAT_MAX_CAPACITY} />}

                                        {/* Conflict warnings */}
                                        {resConflicts.length > 0 && (
                                            <div className="bo-logistica-conflicts">
                                                {resConflicts.map((w, i) => (
                                                    <div key={i} className="bo-alert bo-alert--error" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                        <AlertTriangle size={14} /><span>{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Assignment dropdowns */}
                                        <div className="bo-logistica-assignments">
                                            <div className="bo-form-group" style={{ marginBottom: 0 }}>
                                                <label className="bo-label">Lancha</label>
                                                <select className="bo-select bo-select--sm" value={res.boat_id || ''} onChange={e => handleAssign(res.id, 'boat_id', e.target.value ? Number(e.target.value) : null)} disabled={isSaving}>
                                                    <option value="">Sin asignar</option>
                                                    {boats.map(b => <option key={b.id} value={b.id}>{b.name} ({b.capacity} pax)</option>)}
                                                </select>
                                            </div>
                                            <div className="bo-form-group" style={{ marginBottom: 0 }}>
                                                <label className="bo-label">Lanchero</label>
                                                <select className="bo-select bo-select--sm" value={res.driver_id || ''} onChange={e => handleAssign(res.id, 'driver_id', e.target.value ? Number(e.target.value) : null)} disabled={isSaving}>
                                                    <option value="">Sin asignar</option>
                                                    {drivers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="bo-form-group" style={{ marginBottom: 0 }}>
                                                <label className="bo-label">Guía</label>
                                                <select className="bo-select bo-select--sm" value={res.guide_id || ''} onChange={e => handleAssign(res.id, 'guide_id', e.target.value ? Number(e.target.value) : null)} disabled={isSaving}>
                                                    <option value="">Sin asignar</option>
                                                    {guides.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Crew info */}
                                        {(driver || guide) && (
                                            <div className="bo-logistica-crew">
                                                {driver && (
                                                    <span className="bo-logistica-crew-badge">
                                                        <Ship size={12} /> {driver.name}
                                                        {driver.phone && <a href={`tel:${driver.phone}`} className="bo-logistica-phone">{driver.phone}</a>}
                                                    </span>
                                                )}
                                                {guide && (
                                                    <span className="bo-logistica-crew-badge">
                                                        <Users size={12} /> {guide.name}
                                                        {guide.phone && <a href={`tel:${guide.phone}`} className="bo-logistica-phone">{guide.phone}</a>}
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

                                        {/* Checklist */}
                                        <div className="bo-logistica-checklist">
                                            {checklist.map(item => (
                                                <span key={item.label} className={`bo-logistica-check ${item.done ? 'bo-logistica-check--done' : 'bo-logistica-check--pending'}`}>
                                                    {item.done ? <Check size={10} /> : <X size={10} />}{item.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── Restaurant coordination (fixed locations) ─── */}
                    {reservations.length > 0 && (
                        <section style={{ marginTop: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--bo-text)', marginBottom: '1rem' }}>
                                Coordinación de Cocina
                            </h3>
                            <div className="bo-logistica-restaurants">
                                {restaurantGroups.map((rg, i) => {
                                    const hasOrders = rg.totalPax > 0;
                                    const totalOrders = Array.from(rg.ordersByMealType.values()).reduce((s, arr) => s + arr.length, 0);

                                    return (
                                        <div key={i} className={`bo-logistica-restaurant-card bo-card ${!hasOrders ? 'bo-logistica-restaurant-card--empty' : ''}`}>
                                            <div className="bo-logistica-restaurant-header">
                                                <h3>{rg.name}</h3>
                                                <span className="bo-badge">{rg.totalPax} pax</span>
                                                {rg.arrivalTimes.length > 0 && (
                                                    <span className="bo-logistica-restaurant-times">
                                                        <Clock size={12} style={{ verticalAlign: '-2px' }} /> {rg.arrivalTimes.join(', ')}
                                                    </span>
                                                )}
                                            </div>

                                            {hasOrders ? (
                                                <>
                                                    {/* Tours */}
                                                    <div className="bo-logistica-restaurant-tours">
                                                        {rg.tours.map((t, j) => (
                                                            <div key={j} className="bo-logistica-restaurant-tour">
                                                                <span style={{ flex: 1 }}>{t.tourName}{t.boatName ? ` (${t.boatName})` : ''}</span>
                                                                <span className="bo-badge" style={{ fontSize: '0.6875rem' }}>{t.pax} pax</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Orders grouped by meal type */}
                                                    {rg.ordersByMealType.size > 0 && (
                                                        <div className="bo-logistica-restaurant-orders">
                                                            {Array.from(rg.ordersByMealType.entries()).map(([type, orders]) => (
                                                                <div key={type} style={{ marginBottom: '0.5rem' }}>
                                                                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--bo-text-secondary)' }}>
                                                                        {MEAL_TYPE_LABELS[type as MealType] || type} ({orders.length})
                                                                    </h4>
                                                                    {orders.slice(0, 4).map((o, j) => (
                                                                        <div key={j} style={{ fontSize: '0.8125rem', padding: '0.125rem 0' }}>
                                                                            <span style={{ fontWeight: 500 }}>{o.passenger}</span>: {o.order}
                                                                            {o.notes && <span style={{ color: 'var(--bo-warning)', marginLeft: '0.25rem' }}>({o.notes})</span>}
                                                                        </div>
                                                                    ))}
                                                                    {orders.length > 4 && (
                                                                        <p style={{ fontSize: '0.75rem', color: 'var(--bo-text-muted)', margin: '0.125rem 0 0' }}>+{orders.length - 4} más</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Allergy summary */}
                                                    {rg.allergies.length > 0 && (
                                                        <div className="bo-allergy-summary">
                                                            <strong>⚠️ Alergias / Restricciones:</strong>
                                                            {rg.allergies.map((a, j) => (
                                                                <div key={j} style={{ fontSize: '0.75rem' }}>• {a.passenger}: {a.note}</div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Print kitchen receipt button */}
                                                    <button
                                                        className="bo-btn bo-btn--ghost bo-btn--sm"
                                                        onClick={() => printKitchenReceipt(rg)}
                                                        style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                                                    >
                                                        <Printer size={12} /> Imprimir Pedido ({totalOrders})
                                                    </button>
                                                </>
                                            ) : (
                                                <p style={{ fontSize: '0.8125rem', color: 'var(--bo-text-muted)', margin: 0 }}>Sin pedidos para esta fecha</p>
                                            )}
                                        </div>
                                    );
                                })}
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
                            <span className="bo-empty-state-icon"><Clock size={32} /></span>
                            <p>No hay tours para mostrar en el timeline</p>
                        </div>
                    ) : (
                        <>
                            <div className="bo-timeline-header">
                                <div className="bo-timeline-label-col">Recurso</div>
                                <div style={{ display: 'flex', flex: 1 }}>
                                    {Array.from({ length: TIMELINE_HOURS }, (_, i) => (
                                        <div key={i} className="bo-timeline-hour" style={{ flex: 1 }}>
                                            {String(TIMELINE_START + i).padStart(2, '0')}:00
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {boatGroups.map((group, gi) => {
                                const label = group.boat?.name || 'Sin lancha';
                                const groupPax = group.reservations.reduce((s, r) => s + (r.pax_count || 0), 0);
                                const cap = group.boat?.capacity || BOAT_MAX_CAPACITY;

                                return (
                                    <div key={gi} className="bo-timeline-row">
                                        <div className="bo-timeline-label-col">
                                            <span className="bo-timeline-resource-name">{label}</span>
                                            {group.boat && (
                                                <span style={{ fontSize: '0.6875rem', color: capacityColor(groupPax, cap) }}>
                                                    {groupPax}/{cap} pax
                                                </span>
                                            )}
                                        </div>
                                        <div className="bo-timeline-track">
                                            {Array.from({ length: TIMELINE_HOURS }, (_, i) => (
                                                <div key={i} className="bo-timeline-gridline" style={{ left: `${(i / TIMELINE_HOURS) * 100}%` }} />
                                            ))}
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
                                                    <div key={res.id}
                                                        className={`bo-timeline-block ${hasConflict ? 'bo-timeline-block--conflict' : ''}`}
                                                        style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: cfg?.bg || 'var(--bo-surface-hover)', borderLeft: `3px solid ${cfg?.color || 'var(--bo-border)'}` }}
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
                    {/* Print controls */}
                    <div className="bo-print-controls">
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label className="bo-label" style={{ margin: 0 }}>Imprimir:</label>
                            <select className="bo-select bo-select--sm" style={{ width: 'auto' }} value={printMode} onChange={e => { setPrintMode(e.target.value as PrintMode); setPrintFilter(null); }}>
                                <option value="all">Todos</option>
                                <option value="boat">Por Lancha</option>
                                <option value="guide">Por Guía</option>
                                <option value="reservation">Por Reserva</option>
                            </select>
                            {printMode === 'boat' && (
                                <select className="bo-select bo-select--sm" style={{ width: 'auto' }} value={printFilter || ''} onChange={e => setPrintFilter(e.target.value ? Number(e.target.value) : null)}>
                                    <option value="">Seleccionar lancha...</option>
                                    {boats.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            )}
                            {printMode === 'guide' && (
                                <select className="bo-select bo-select--sm" style={{ width: 'auto' }} value={printFilter || ''} onChange={e => setPrintFilter(e.target.value ? Number(e.target.value) : null)}>
                                    <option value="">Seleccionar guía...</option>
                                    {guides.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            )}
                            {printMode === 'reservation' && (
                                <select className="bo-select bo-select--sm" style={{ width: 'auto' }} value={printFilter || ''} onChange={e => setPrintFilter(e.target.value ? Number(e.target.value) : null)}>
                                    <option value="">Seleccionar reserva...</option>
                                    {reservations.map(r => <option key={r.id} value={r.id}>{r.tour_name} — {r.pax_count} pax</option>)}
                                </select>
                            )}
                        </div>
                        <button className="bo-btn bo-btn--primary" onClick={printManifestPopup} disabled={filteredManifests.length === 0}>
                            <Printer size={14} /> Imprimir {printMode === 'all' ? 'Todo' : 'Selección'}
                        </button>
                    </div>

                    {/* Manifest preview */}
                    {filteredManifests.length === 0 ? (
                        <div className="bo-empty-state">
                            <span className="bo-empty-state-icon"><Ship size={32} /></span>
                            <p>{printMode === 'all' ? 'No hay tours para generar manifiestos' : 'Selecciona un filtro para ver el manifiesto'}</p>
                        </div>
                    ) : (
                        filteredManifests.map((group, gi) => {
                            const groupPax = group.reservations.reduce((s, r) => s + (r.pax_count || 0), 0);
                            const cap = group.boat?.capacity || BOAT_MAX_CAPACITY;

                            return (
                                <div key={gi} className="bo-manifest">
                                    <div className="bo-manifest-header">
                                        <div>
                                            <h2 className="bo-manifest-boat-name">
                                                {group.boat ? `⛵ ${group.boat.name}` : '⚠️ Sin lancha asignada'}
                                            </h2>
                                            <p className="bo-manifest-date">{formatDateLong(filterDate)}</p>
                                            {dailyNote && <p style={{ fontSize: '0.8125rem', color: 'var(--bo-text-secondary)', margin: '0.25rem 0 0', fontStyle: 'italic' }}>📋 {dailyNote}</p>}
                                        </div>
                                        <div className="bo-manifest-meta">
                                            <div>{group.reservations.length} tours</div>
                                            <CapacityBar pax={groupPax} capacity={cap} />
                                        </div>
                                    </div>

                                    {group.reservations.map(res => {
                                        const driver = res.driver_id ? staffMap.get(res.driver_id) : null;
                                        const guide = res.guide_id ? staffMap.get(res.guide_id) : null;
                                        const passengers = (res.passengers || []) as any[];
                                        const emergencyInfo = res.emergency_contact_name
                                            ? `${res.emergency_contact_name}${res.emergency_contact_phone ? ' ' + res.emergency_contact_phone : ''}`
                                            : '';

                                        return (
                                            <div key={res.id} className="bo-manifest-tour">
                                                <div className="bo-manifest-tour-header">
                                                    <h3>{res.tour_name}</h3>
                                                    <span>{res.start_time?.slice(0, 5) || '—'}</span>
                                                    <span>{res.pax_count} pax</span>
                                                    <span className="bo-status-badge" style={{
                                                        background: STATUS_CONFIG[res.status as ReservationStatus]?.bg,
                                                        color: STATUS_CONFIG[res.status as ReservationStatus]?.color,
                                                    }}>
                                                        {STATUS_CONFIG[res.status as ReservationStatus]?.label}
                                                    </span>
                                                </div>

                                                <div className="bo-manifest-crew">
                                                    <span>Lanchero: {driver?.name || 'No asignado'}{driver?.phone ? ` (${driver.phone})` : ''}</span>
                                                    <span>Guía: {guide?.name || 'No asignado'}{guide?.phone ? ` (${guide.phone})` : ''}</span>
                                                </div>

                                                {passengers.length > 0 && (
                                                    <table className="bo-table bo-manifest-pax-table">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '2rem' }}>#</th>
                                                                <th>Nombre</th>
                                                                <th style={{ width: '3rem' }}>Edad</th>
                                                                <th>Comida</th>
                                                                <th>Notas</th>
                                                                <th>Contacto Emergencia</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {passengers.map((p: any, pi: number) => {
                                                                const meals = (p.meals || []) as any[];
                                                                const food = meals.map((m: any) => m.food_order).filter(Boolean).join(', ');
                                                                const diet = meals.map((m: any) => m.dietary_notes).filter(Boolean).join(', ') || p.dietary_notes || '';
                                                                return (
                                                                    <tr key={p.id}>
                                                                        <td>{pi + 1}</td>
                                                                        <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                                                                        <td>{p.age || '—'}</td>
                                                                        <td>{food || '—'}</td>
                                                                        <td>{diet || '—'}</td>
                                                                        <td>{emergencyInfo || '—'}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            {/* Blank rows for additional crew */}
                                                            <tr><td colSpan={6} style={{ fontSize: '0.6875rem', fontStyle: 'italic', background: 'var(--bo-surface-hover)', textAlign: 'center' }}>Tripulación adicional / Ayudantes</td></tr>
                                                            {Array.from({ length: BLANK_MANIFEST_ROWS }, (_, i) => (
                                                                <tr key={`blank-${i}`}>
                                                                    <td>{passengers.length + i + 1}</td>
                                                                    <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}

                                                {((res.custom_stops as any[]) || []).length > 0 && (
                                                    <div className="bo-manifest-stops">
                                                        <strong>Paradas:</strong>{' '}
                                                        {(res.custom_stops as any[]).map((s: any) => typeof s === 'string' ? s : s.location).join(' → ')}
                                                    </div>
                                                )}

                                                {(res.meal_schedules || []).length > 0 && (
                                                    <div className="bo-manifest-meals">
                                                        <strong>Restaurante:</strong>{' '}
                                                        {(res.meal_schedules || []).map((ms: MealSchedule) =>
                                                            `${ms.restaurant_name}${ms.arrival_time ? ` @ ${ms.arrival_time.slice(0, 5)}` : ''}`
                                                        ).join(', ')}
                                                    </div>
                                                )}

                                                {/* Equipment checklist */}
                                                <div className="bo-equipment-checklist">
                                                    {EQUIPMENT_CHECKLIST.map(item => (
                                                        <span key={item}>☐ {item}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Print styles (for browser print from Manifests tab) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .bo-sidebar, .bo-header, .bo-menu-toggle,
                    .bo-stats-grid, .bo-tabs, .bo-page-header,
                    .bo-logistica-operations, .bo-logistica-timeline,
                    .bo-print-controls, .bo-daily-note { display: none !important; }
                    .bo-main { margin-left: 0 !important; padding: 0 !important; }
                    .bo-content { padding: 0 !important; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
                    .bo-logistica { padding: 0 !important; }
                    .bo-logistica-manifests { display: block !important; }
                    .bo-manifest {
                        border: none !important; box-shadow: none !important;
                        background: white !important; border-radius: 0 !important;
                        padding: 1rem 0 !important;
                    }
                    .bo-manifest + .bo-manifest { page-break-before: always; }
                    .bo-manifest-header { border-bottom: 2px solid black !important; }
                    .bo-table, .bo-table th, .bo-table td {
                        border: 1px solid #999 !important; background: white !important; color: black !important;
                    }
                    .bo-table th { background: #f0f0f0 !important; }
                    .bo-manifest-boat-name, .bo-manifest-tour-header h3 { color: black !important; }
                    .bo-manifest-date, .bo-manifest-meta,
                    .bo-manifest-crew, .bo-manifest-stops,
                    .bo-manifest-meals { color: #333 !important; }
                    .bo-capacity-bar-track { background: #eee !important; }
                    .bo-equipment-checklist { border-top-color: #999 !important; color: black !important; }
                }
            `}} />
        </div>
    );
}
