import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TOURS } from '../../data';
import { generateReservationPDF } from '../../lib/generatePDF';
import { updateReservation } from '../../lib/reservation-logic';
import type { Reservation, Passenger, AuditLogEntry, PassengerMeal } from '../../types/backoffice';
import type { CustomTourData } from '../../types/shared';
import { STATUS_CONFIG, MEAL_TYPE_LABELS, AUDIT_ACTION_LABELS } from '../../types/backoffice';
import type { ReservationStatus, MealType } from '../../types/backoffice';

// ==========================================
// Helper Components
// ==========================================

function StatusBadge({ status }: { status: ReservationStatus }) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            className="px-2 py-0.5 rounded text-xs font-medium inline-block whitespace-nowrap"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.label}
        </span>
    );
}

function AuditLogView({ logs }: { logs: AuditLogEntry[] }) {
    if (!logs || logs.length === 0) return (
        <div className="text-gray-500 text-sm italic p-4 text-center bg-gray-50 rounded-lg border border-gray-100">
            No hay historial registrado para esta reserva.
        </div>
    );

    return (
        <div className="space-y-4 pl-2 text-sm">
            {logs.map((log) => {
                const date = new Date(log.created_at);
                const day = date.getDate();
                const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                return (
                    <div key={log.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center min-w-[3rem] pt-0.5">
                            <span className="text-xl font-bold text-gray-900 leading-none">{day}</span>
                            <span className="text-[10px] uppercase text-gray-500 font-bold">{month}</span>
                        </div>
                        <div className="flex-1 pb-4 border-b border-gray-100 group-last:border-0">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <span className="font-medium text-gray-900 mr-2">{log.agent_name}</span>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{AUDIT_ACTION_LABELS[log.action] || log.action}</span>
                                </div>
                                <span className="text-xs text-gray-400">{time}</span>
                            </div>
                            <div className="text-gray-600 mt-1">
                                {log.field_changed ? (
                                    <>
                                        Modificó <strong className="font-medium text-gray-800">{log.field_changed}</strong>
                                        {(log.old_value || log.new_value) && (
                                            <div className="mt-2 bg-gray-50 p-2 rounded text-xs font-mono grid gap-1 border border-gray-100">
                                                {log.old_value && <div className="text-red-700 line-through opacity-70">-{log.old_value}</div>}
                                                {log.new_value && <div className="text-green-700 font-medium">+{log.new_value}</div>}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span>Realizó una acción general.</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ==========================================
// Main Page Component
// ==========================================

export default function ReservasPage() {
    const { agent } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Data lists
    const [boats, setBoats] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    // Expanded View State
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [expandedTab, setExpandedTab] = useState<'passengers' | 'audit' | 'menu'>('passengers');
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    // Menu Config for Expanded View (Quick Edit)
    const [quickMenu, setQuickMenu] = useState<{ type: string; options: string[] }[]>([]);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState<Reservation | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Main Form State
    const [form, setForm] = useState({
        tour_id: 1,
        tour_name: TOURS[0]?.name || '',
        tour_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '08:00',
        boat_id: '',
        driver_id: '',
        guide_id: '',
        pax_count: 1,
        total_amount: TOURS[0]?.price || 0,
        deposit_amount: 50,
        notes: '',
        status: 'offered' as ReservationStatus,
        emergency_contact_name: '',
        emergency_contact_phone: ''
    });

    // Passenger Form State (V2 with dynamic meals)
    const [passengerForm, setPassengerForm] = useState({
        full_name: '',
        age: '',
        id_document: '',
        email: '',
        phone: '',
        meals: {} as Record<MealType, { food: string; notes: string }>
    });

    // Menu Config State (V5)
    const [menuConfig, setMenuConfig] = useState<{ type: string; options: string[] }[]>([]);

    // Custom Tour Data State (V7)
    const [customTourForm, setCustomTourForm] = useState<any>({ itinerary: [], includes: '' });

    useEffect(() => {
        fetchAll();
    }, [filterStatus]);

    async function fetchAll() {
        setLoading(true);
        let query = supabase
            .from('reservations')
            .select(`
                *,
                custom_tour_data,
                tour:tours(
                    name,
                    includes,
                    itinerary
                ),
                public_token,
                agent:agents(name),
                boat:boats(name),
                driver:staff!reservations_driver_id_fkey(name),
                guide:staff!reservations_guide_id_fkey(name)
            `)
            .order('tour_date', { ascending: false });

        if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
        }

        const { data } = await query;

        setReservations((data as Reservation[]) || []);

        // Handle deep link editing
        const editId = searchParams.get('editId');
        if (editId && data) {
            const res = (data as Reservation[]).find(r => r.id === Number(editId));
            if (res) {
                startEdit(res);
                // Clear param so it doesn't reopen on refresh/navigation
                setSearchParams({}, { replace: true });
            }
        }

        // Load resources
        const [boatsRes, staffRes] = await Promise.all([
            supabase.from('boats').select('*').eq('status', 'active'),
            supabase.from('staff').select('*').eq('active', true)
        ]);

        setBoats(boatsRes.data || []);
        setStaffList(staffRes.data || []);
        setLoading(false);
    }

    // ==========================================
    // Actions & Handlers
    // ==========================================

    async function logAudit(resId: number, action: string, details: Partial<AuditLogEntry>) {
        if (!agent) return;

        await supabase.from('reservation_audit_log').insert([{
            reservation_id: resId,
            agent_id: agent.id,
            agent_name: agent.name || 'Agente',
            action,
            ...details
        }]);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!agent) {
            alert("Error: Sesión no válida");
            return;
        }

        const payload = {
            tour_id: form.tour_id,
            tour_name: form.tour_name,
            tour_date: form.tour_date,
            end_date: form.end_date || null,
            start_time: form.start_time || null,
            boat_id: form.boat_id ? Number(form.boat_id) : null,
            driver_id: form.driver_id ? Number(form.driver_id) : null,
            guide_id: form.guide_id ? Number(form.guide_id) : null,
            pax_count: form.pax_count,
            total_amount: form.total_amount,
            deposit_amount: form.deposit_amount,
            notes: form.notes || null,
            status: form.status,
            agent_id: agent.id
        };

        if (editingId) {
            // Check diffs for audit log (simplified)
            const oldRes = reservations.find(r => r.id === editingId);
            const { error } = await supabase.from('reservations').update(payload).eq('id', editingId);

            if (!error) {
                // Log significant changes
                // REMOVED: Custom audit logging here, handled by updateReservation below
            }
        } else {
            const { data, error } = await supabase.from('reservations').insert([payload]).select().single();
            if (!error && data) {
                // Log creation
                await supabase.from('reservation_audit_log').insert([{
                    reservation_id: data.id,
                    agent_id: agent.id,
                    agent_name: agent.name,
                    action: 'created',
                    new_value: `Nueva reserva: ${data.tour_name} `
                }]);
            }
        }

        if (editingId) {
            // Use unified logic for updates
            const result = await updateReservation(editingId, payload, agent);
            if (!result.success) {
                alert('Error al actualizar: ' + JSON.stringify(result.error));
                return;
            }
        }

        resetForm();
        fetchAll();
    }

    async function updateStatus(id: number, newStatus: ReservationStatus) {
        if (!agent) return;

        const result = await updateReservation(id, { status: newStatus }, agent);
        if (!result.success) {
            alert('Error al actualizar estado');
        }

        fetchAll();
    }

    // Add error state
    const [paymentError, setPaymentError] = useState<string | null>(null);

    async function generatePaymentLink() {
        if (!showPaymentModal || !agent) return;
        setPaymentLoading(true);
        setPaymentError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: showPaymentModal.tour_id.toString(),
                    tourName: showPaymentModal.tour_name,
                    customerEmail: 'cliente@ejemplo.com', // In V3 add customer email field
                    customerName: showPaymentModal.passengers?.[0]?.full_name || 'Cliente',
                    depositAmount: paymentAmount,
                    selectedItems: []
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                // If text is HTML, it's likely a 404 or 500 from Vercel/Next
                console.error("Non-JSON response:", text);
                throw new Error(`Respuesta inválida del servidor(${res.status}).Posiblemente la API no está disponible.`);
            }

            const data = await res.json();

            if (data.success) {
                // Update reservation with payment link
                await supabase.from('reservations').update({
                    payment_url: data.checkoutUrl,
                    payment_id: data.checkoutId
                }).eq('id', showPaymentModal.id);

                await logAudit(showPaymentModal.id, 'updated', {
                    field_changed: 'payment_link_generated',
                    new_value: `$${paymentAmount} `
                });

                alert(`Link generado: ${data.checkoutUrl} \n(Copiado al portapapeles)`);
                navigator.clipboard.writeText(data.checkoutUrl);

                setShowPaymentModal(null);
                fetchAll();
            } else {
                setPaymentError(data.error || 'Error desconocido al generar el link.');
            }
        } catch (err: any) {
            console.error(err);
            if (err.name === 'AbortError') {
                setPaymentError('Tiempo de espera agotado. El servicio de pagos no responde.');
            } else {
                setPaymentError(err.message || 'Error al conectar con el servicio de pagos.');
            }
        } finally {
            setPaymentLoading(false);
        }
    }

    function handlePrint(res: Reservation) {
        // Need to fetch full details including passengers/meals if not already loaded
        // For now, we assume expanded view has loaded them or we fetch on demand?
        // Let's just fetch fresh data to be safe
        supabase
            .from('reservations')
            .select(`
            *,
            agent: agents(*),
                boat: boats(*),
                    driver: staff!reservations_driver_id_fkey(*),
                        guide: staff!reservations_guide_id_fkey(*),
                            passengers(*, meals: passenger_meals(*))
                                `)
            .eq('id', res.id)
            .single()
            .then(({ data }) => {
                if (data) generateReservationPDF(data as any);
            });
    }

    // ==========================================
    // Expanded View Handlers
    // ==========================================

    async function toggleExpanded(id: number) {
        if (expandedId === id) {
            setExpandedId(null);
            setPassengers([]);
            setAuditLogs([]);
            setQuickMenu([]); // Clear quick menu when collapsing
        } else {
            setExpandedId(id);
            setExpandedTab('passengers'); // Default to passengers tab
            // Load details
            const res = reservations.find(r => r.id === id);
            if (res) {
                // Load passengers
                const { data: pax } = await supabase.from('passengers').select('*, meals:passenger_meals(*)').eq('reservation_id', id);
                setPassengers((pax as any[]) || []);

                // Load audit
                const { data: audits } = await supabase.from('reservation_audit_log').select('*').eq('reservation_id', id).order('created_at', { ascending: false });
                setAuditLogs((audits as AuditLogEntry[]) || []);

                // Load Menu
                setQuickMenu(res.meal_options?.available_meals || []);

                // Load Custom Tour Data (V7)
                // Use custom data if it HAS content, otherwise fallback to tour defaults
                if (res.custom_tour_data && (res.custom_tour_data.itinerary?.length || res.custom_tour_data.includes)) {
                    setCustomTourForm(res.custom_tour_data);
                } else {
                    // Pre-fill with default tour data if available
                    // Handle case where Supabase returns join as an array
                    const tourData = Array.isArray(res.tour) ? res.tour[0] : res.tour;

                    if (tourData) {
                        setCustomTourForm({
                            tour_name: tourData.name || res.tour_name,
                            includes: tourData.includes || '',
                            itinerary: tourData.itinerary || []
                        });
                    } else {
                        // Fallback if no tour data linked yet
                        setCustomTourForm({
                            tour_name: res.tour_name,
                            itinerary: [],
                            includes: ''
                        });
                    }
                }
            }
        }
    }

    async function saveQuickMenu(id: number) {
        const { error } = await supabase
            .from('reservations')
            .update({ meal_options: { available_meals: quickMenu } })
            .eq('id', id);

        if (error) alert('Error al guardar menú');
        else {
            alert('Menú actualizado correctamente');
            fetchAll();
        }
    }

    async function saveCustomTour(id: number) {
        const { error } = await supabase
            .from('reservations')
            .update({ custom_tour_data: customTourForm })
            .eq('id', id);

        if (error) alert('Error al guardar info del tour');
        else {
            alert('Info del tour actualizada correctamente');
            fetchAll();
        }
    }

    function importFromOriginal(tourId: number) {
        const original = TOURS.find(t => t.id === tourId);
        if (original) {
            setCustomTourForm({
                tour_name: original.name,
                itinerary: original.itinerary,
                includes: original.includes
            });
        }
    }
    // ... (skip other handlers) ...

    // RENDER SECTION - Expanded Row Content
    // This needs to be inside the render block, but I am replacing the chunk causing issues.
    // Let's target the toggleExpanded function specifically first to fix the logic bug.


    async function addPassenger(resId: number) {
        if (!passengerForm.full_name.trim()) return;

        // 1. Create passenger
        const { data: pax, error } = await supabase.from('passengers').insert([{
            reservation_id: resId,
            full_name: passengerForm.full_name,
            age: passengerForm.age ? Number(passengerForm.age) : null,
            id_document: passengerForm.id_document || null,
            email: passengerForm.email || null,
            phone: passengerForm.phone || null,
        }]).select().single();

        if (error || !pax) return;

        // 2. Create meals
        const mealInserts = Object.entries(passengerForm.meals).map(([type, data]) => ({
            passenger_id: pax.id,
            meal_type: type,
            food_order: (data as any).food || '',
            dietary_notes: (data as any).notes || ''
        })).filter(m => m.food_order || m.dietary_notes); // Only insert if has data

        if (mealInserts.length > 0) {
            await supabase.from('passenger_meals').insert(mealInserts);
        }

        // Reset and refresh
        setPassengerForm({ full_name: '', age: '', id_document: '', email: '', phone: '', meals: {} as any });
        // Re-fetch expanded data to include new passenger and meals
        const res = reservations.find(r => r.id === resId);
        if (res) {
            const { data: paxRes } = await supabase.from('passengers').select('*, meals:passenger_meals(*)').eq('reservation_id', resId).order('created_at');
            setPassengers((paxRes as any[]) || []);
        }

        // We use unified log for main reservation, but here we can add a custom log if needed, though updateReservation logic is cleaner for main updates.
        // For now, let's just log this specific action manually as it's a sub-resource
        supabase.from('reservation_audit_log').insert([{
            reservation_id: resId,
            agent_id: agent!.id,
            agent_name: agent!.name,
            action: 'updated',
            field_changed: 'passenger_added',
            new_value: pax.full_name
        }]);
    }

    async function removePassenger(passId: number, resId: number) {
        await supabase.from('passengers').delete().eq('id', passId);
        // Re-fetch expanded data to reflect removal
        const res = reservations.find(r => r.id === resId);
        if (res) {
            const { data: paxRes } = await supabase.from('passengers').select('*, meals:passenger_meals(*)').eq('reservation_id', resId).order('created_at');
            setPassengers((paxRes as any[]) || []);
        }
    }

    async function deleteReservation(id: number) {
        if (!confirm('¿Estás seguro de ELIMINAR esta reserva? Esta acción no se puede deshacer.')) return;

        const { error } = await supabase.from('reservations').delete().eq('id', id);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            fetchAll();
        }
    }

    // ==========================================
    // Helper Functions
    // ==========================================

    function resetForm() {
        setShowForm(false);
        setEditingId(null);
        setForm({
            tour_id: 1,
            tour_name: TOURS[0]?.name || '',
            tour_date: new Date().toISOString().split('T')[0],
            end_date: '',
            start_time: '08:00',
            boat_id: '',
            driver_id: '',
            guide_id: '',
            pax_count: 1,
            total_amount: TOURS[0]?.price || 0,
            deposit_amount: 50,
            notes: '',
            status: 'offered',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            meal_options: { available_meals: [] } // Initialize meal_options
        });
        setMenuConfig([]); // Clear menu config when resetting form
    }

    function handleTourChange(tourId: number) {
        const tour = TOURS.find(t => t.id === tourId);
        if (tour) {
            // Auto-populate meal configuration based on tour
            const defaultMenu = tour.meals?.map(m => ({ type: m, options: [] })) || [];

            setForm(prev => ({
                ...prev,
                tour_id: tourId,
                tour_name: tour.name,
                total_amount: tour.price,
                meal_options: { available_meals: defaultMenu }
            }));
            setMenuConfig(defaultMenu);
        }
    }

    function startEdit(res: Reservation) {
        setForm({
            tour_id: res.tour_id,
            tour_name: res.tour_name,
            tour_date: res.tour_date,
            end_date: res.end_date || '',
            start_time: res.start_time.substring(0, 5),
            boat_id: res.boat_id?.toString() || '',
            driver_id: res.driver_id?.toString() || '',
            guide_id: res.guide_id?.toString() || '',
            pax_count: res.pax_count,
            total_amount: res.total_amount,
            deposit_amount: res.deposit_amount || 0,
            notes: res.notes || '',
            status: res.status,
            emergency_contact_name: res.emergency_contact_name || '',
            emergency_contact_phone: res.emergency_contact_phone || '',
            meal_options: res.meal_options?.available_meals ? res.meal_options : { available_meals: TOURS.find(t => t.id === res.tour_id)?.meals?.map(m => ({ type: m, options: [] })) || [] }
        });

        // Also set menu config state
        setMenuConfig(res.meal_options?.available_meals || TOURS.find(t => t.id === res.tour_id)?.meals?.map(m => ({ type: m, options: [] })) || []);
        setQuickMenu(res.meal_options?.available_meals || []); // For valid existing logic

        setEditingId(res.id);
        setShowForm(true);
    }

    const currentTourMeals = TOURS.find(t => t.id === (editingId ? form.tour_id : (expandedId ? reservations.find(r => r.id === expandedId)?.tour_id : 1)))?.meals || [];

    if (loading) return <div className="bo-loading"><div className="bo-loading-spinner" /></div>;

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reservas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {reservations.length} servicios registrados • Comisión estimada: <span className="font-mono text-gray-700">${reservations.reduce((acc, curr) => acc + (curr.total_amount * (agent?.commission_rate || 5) / 100), 0).toFixed(2)}</span>
                    </p>
                </div>
                <button
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
                    onClick={() => { resetForm(); setShowForm(true); }}
                >
                    + Nueva Reserva
                </button>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${filterStatus === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setFilterStatus('all')}
                >
                    Todas
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const isActive = filterStatus === key;
                    return (
                        <button
                            key={key}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isActive ? '' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            style={isActive ? { backgroundColor: config.bg, color: config.color, borderColor: config.color } : {}}
                            onClick={() => setFilterStatus(key)}
                        >
                            {config.label}
                        </button>
                    )
                })}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="bo-modal-overlay">
                    <div className="bo-modal bo-modal--sm">
                        <div className="bo-modal-header">
                            <h3>Generar Link de Pago</h3>
                            <button className="bo-modal-close" onClick={() => setShowPaymentModal(null)}>✕</button>
                        </div>
                        <div className="bo-modal-body">
                            <p>Tour: <strong>{showPaymentModal.tour_name}</strong></p>
                            <p>Total reserva: ${showPaymentModal.total_amount}</p>
                            <div className="bo-form-group">
                                <label className="bo-label">Monto a cobrar ahora ($USD)</label>
                                <input
                                    className="bo-input"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                />
                                <p className="bo-hint">Sugerido: 50% anticipo (${(showPaymentModal.total_amount / 2).toFixed(2)})</p>
                            </div>

                            {paymentError && (
                                <div className="bo-alert bo-alert--error mb-4" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    {paymentError}
                                </div>
                            )}

                            <button
                                className="bo-btn bo-btn--primary bo-btn--block"
                                onClick={generatePaymentLink}
                                disabled={paymentLoading}
                            >
                                {paymentLoading ? 'Generando...' : 'Crear Link (Recurrente)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reservation Form Modal */}
            {showForm && (
                <div className="bo-modal-overlay" onClick={resetForm}>
                    <div className="bo-modal" onClick={e => e.stopPropagation()}>
                        <div className="bo-modal-header">
                            <h3>{editingId ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                            <button className="bo-modal-close" onClick={resetForm}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="bo-modal-body">
                            <div className="bo-form-grid">
                                <div className="bo-form-group">
                                    <label className="bo-label">Tour</label>
                                    <select className="bo-input" value={form.tour_id} onChange={e => handleTourChange(Number(e.target.value))}>
                                        {TOURS.map(t => <option key={t.id} value={t.id}>{t.name} — ${t.price}</option>)}
                                    </select>
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Estado</label>
                                    <select className="bo-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                                        {Object.entries(STATUS_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Fecha Inicio</label>
                                    <input className="bo-input" type="date" value={form.tour_date} onChange={e => setForm({ ...form, tour_date: e.target.value })} required />
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Fecha Fin (opcional)</label>
                                    <input className="bo-input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Hora</label>
                                    <input className="bo-input" type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Pax</label>
                                    <input className="bo-input" type="number" min="1" value={form.pax_count} onChange={e => setForm({ ...form, pax_count: Number(e.target.value) })} />
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Contacto Emergencia</label>
                                    <input
                                        className="bo-input"
                                        placeholder="Nombre"
                                        value={form.emergency_contact_name}
                                        onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })}
                                    />
                                    <input
                                        className="bo-input mt-1"
                                        placeholder="Teléfono"
                                        value={form.emergency_contact_phone}
                                        onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })}
                                    />
                                </div>
                                {/* Staff assignment fields */}
                                <div className="bo-form-group">
                                    <label className="bo-label">Lancha</label>
                                    <select className="bo-input" value={form.boat_id} onChange={e => setForm({ ...form, boat_id: e.target.value })}>
                                        <option value="">Sin asignar</option>
                                        {boats.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Capitán</label>
                                    <select className="bo-input" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                                        <option value="">Sin asignar</option>
                                        {staffList.filter(s => s.role === 'lanchero').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Guía</label>
                                    <select className="bo-input" value={form.guide_id} onChange={e => setForm({ ...form, guide_id: e.target.value })}>
                                        <option value="">Sin asignar</option>
                                        {staffList.filter(s => s.role === 'guia').map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="bo-modal-actions">
                                <button type="button" className="bo-btn bo-btn--ghost" onClick={resetForm}>Cancelar</button>
                                <button type="submit" className="bo-btn bo-btn--primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="p-3 w-10 text-center"></th>
                                <th className="p-3">ID</th>
                                <th className="p-3">Tour / Fecha</th>
                                <th className="p-3">Cliente / Pax</th>
                                <th className="p-3">Pagos</th>
                                <th className="p-3">Staff</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reservations.map(res => {
                                const commission = (res.total_amount * (agent?.commission_rate || 5) / 100).toFixed(2);
                                const isExpanded = expandedId === res.id;
                                const pending = res.total_amount - res.paid_amount;

                                return (
                                    <React.Fragment key={res.id}>
                                        <tr className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                                            <td className="p-3 text-center">
                                                <button
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    onClick={() => toggleExpanded(res.id)}
                                                >
                                                    {isExpanded ? '▼' : '▶'}
                                                </button>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-mono text-xs text-gray-500">#{res.id}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900">{res.tour_name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(res.tour_date + 'T12:00:00').toLocaleDateString()} • {res.start_time.substring(0, 5)}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-gray-900">{res.passengers?.[0]?.full_name || 'Sin nombre'}</div>
                                                <div className="text-xs text-gray-500">{res.pax_count} pax</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900">${res.total_amount}</div>
                                                <div className="flex flex-col gap-1 items-start mt-1">
                                                    {pending > 0 ? (
                                                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Debe: ${pending}</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Pagado</span>
                                                    )}
                                                    <div className="text-[10px] text-gray-400">Com: ${commission}</div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-xs text-gray-600">
                                                    <div title="Lancha">🚤 {res.boat?.name || 'S/A'}</div>
                                                    <div title="Capitán">⚓ {res.driver?.name?.split(' ')[0] || '?'}</div>
                                                </div>
                                            </td>
                                            <td className="p-3"><StatusBadge status={res.status} /></td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors" title="Editar" onClick={() => startEdit(res)}>✏️</button>
                                                    <button className="p-1 text-gray-400 hover:text-purple-600 rounded hover:bg-purple-50 transition-colors" title="PDF" onClick={() => handlePrint(res)}>📄</button>
                                                    <button className="p-1 text-gray-400 hover:text-green-600 rounded hover:bg-green-50 transition-colors" title="Cobrar" onClick={() => { setShowPaymentModal(res); setPaymentAmount(res.total_amount - res.paid_amount); }}>💳</button>
                                                    <button className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Eliminar" onClick={() => deleteReservation(res.id)}>🗑️</button>
                                                </div>
                                                {res.payment_url && (
                                                    <div className="text-xs mt-1">
                                                        <a href={res.payment_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Link Pago 🔗</a>
                                                    </div>
                                                )}
                                                {res.public_token && (
                                                    <div className="text-xs mt-1 flex justify-end gap-2 items-center">
                                                        <a href={`/reservas/checkin/${res.public_token}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                            Guest 🔗
                                                        </a>
                                                        <button
                                                            className="text-gray-400 hover:text-gray-600"
                                                            title="Copiar Link"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const url = `${window.location.origin}/reservas/checkin/${res.public_token}`;
                                                                navigator.clipboard.writeText(url);
                                                                alert('Link copiado al portapapeles');
                                                            }}
                                                        >
                                                            📋
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan={8} className="p-0 border-b border-gray-100">
                                                    <div className="bg-white m-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                                        {/* Tabs */}
                                                        <div className="flex border-b border-gray-200 bg-gray-50">
                                                            <button
                                                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${expandedTab === 'passengers' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                                                                onClick={() => setExpandedTab('passengers')}
                                                            >
                                                                Pasajeros
                                                            </button>
                                                            <button
                                                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${expandedTab === 'menu' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                                                                onClick={() => setExpandedTab('menu')}
                                                            >
                                                                Menú y Dieta
                                                            </button>
                                                            <button
                                                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${expandedTab === 'tour' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                                                                onClick={() => setExpandedTab('tour')}
                                                            >
                                                                Itinerario & Info
                                                            </button>
                                                            <button
                                                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${expandedTab === 'audit' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                                                                onClick={() => setExpandedTab('audit')}
                                                            >
                                                                Historial
                                                            </button>
                                                        </div>

                                                        <div className="p-6">
                                                            {expandedTab === 'passengers' && (
                                                                <div className="space-y-6">
                                                                    {res.public_token && (
                                                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center text-sm">
                                                                            <div>
                                                                                <span className="font-bold text-blue-800">Link para Invitados:</span>
                                                                                <span className="text-blue-600 ml-2 font-mono">/reservas/checkin/{res.public_token.slice(0, 8)}...</span>
                                                                            </div>
                                                                            <div className="flex gap-3">
                                                                                <a
                                                                                    href={`/reservas/checkin/${res.public_token}`}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="text-blue-700 underline hover:text-blue-900 font-medium"
                                                                                >
                                                                                    Abrir Vista
                                                                                </a>
                                                                                <button
                                                                                    className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                                                                                    onClick={() => {
                                                                                        const url = `${window.location.origin}/reservas/checkin/${res.public_token}`;
                                                                                        navigator.clipboard.writeText(url);
                                                                                        alert('Link copiado!');
                                                                                    }}
                                                                                >
                                                                                    <span>📋</span> Copiar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="space-y-2">
                                                                        {passengers.map(p => (
                                                                            <div key={p.id} className="bg-white border rounded-lg p-4 flex justify-between items-center hover:border-gray-300 transition-colors">
                                                                                <div>
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="font-bold text-gray-900 text-base">{p.full_name}</span>
                                                                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                                            {p.age ? `${p.age} años` : 'Edad N/A'}
                                                                                            {p.id_document ? ` • ${p.id_document}` : ''}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                                                        {p.email && <span>✉️ {p.email}</span>}
                                                                                        {p.phone && <span>📞 {p.phone}</span>}
                                                                                    </div>
                                                                                    {/* Meals display */}
                                                                                    {p.meals && p.meals.length > 0 && (
                                                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                                                            {p.meals.map(m => (
                                                                                                <div key={m.id} className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                                                                                    <span className="font-medium text-gray-700">{MEAL_TYPE_LABELS[m.meal_type]}:</span>
                                                                                                    <span className="text-gray-600">{m.food_order}</span>
                                                                                                    {m.dietary_notes && <span className="text-amber-600 bg-amber-50 px-1 rounded font-bold ml-1" title={m.dietary_notes}>⚠️ {m.dietary_notes}</span>}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <button className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors" title="Eliminar Pasajero" onClick={() => removePassenger(p.id, res.id)}>✕</button>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Add Passenger Form */}
                                                                    <div className="pt-6 border-t border-gray-100">
                                                                        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Agregar Pasajero</h4>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                            <input
                                                                                placeholder="Nombre completo"
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                                                value={passengerForm.full_name}
                                                                                onChange={e => setPassengerForm({ ...passengerForm, full_name: e.target.value })}
                                                                            />
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    placeholder="Edad"
                                                                                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                                                    value={passengerForm.age}
                                                                                    onChange={e => setPassengerForm({ ...passengerForm, age: e.target.value })}
                                                                                />
                                                                                <input
                                                                                    placeholder="DPI / Pasaporte"
                                                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                                                    value={passengerForm.id_document}
                                                                                    onChange={e => setPassengerForm({ ...passengerForm, id_document: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <input
                                                                                placeholder="Email (opcional)"
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                                                value={passengerForm.email}
                                                                                onChange={e => setPassengerForm({ ...passengerForm, email: e.target.value })}
                                                                            />
                                                                            <input
                                                                                placeholder="Teléfono (opcional)"
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                                                value={passengerForm.phone}
                                                                                onChange={e => setPassengerForm({ ...passengerForm, phone: e.target.value })}
                                                                            />
                                                                        </div>

                                                                        {/* Dynamic Meal Fields */}
                                                                        {currentTourMeals.length > 0 && (
                                                                            <div className="mb-4 bg-gray-50/80 p-4 rounded border border-gray-200/60">
                                                                                <p className="text-xs font-bold text-gray-500 mb-3 uppercase">Preferencias Alimenticias</p>
                                                                                <div className="grid grid-cols-1 gap-3">
                                                                                    {currentTourMeals.map(mealType => (
                                                                                        <div key={mealType} className="flex gap-2 items-center">
                                                                                            <label className="text-xs w-24 text-gray-600 font-medium">{MEAL_TYPE_LABELS[mealType]}</label>
                                                                                            <input
                                                                                                placeholder="Selección (ej. Pollo)"
                                                                                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-blue-500 outline-none"
                                                                                                value={passengerForm.meals[mealType]?.food || ''}
                                                                                                onChange={e => setPassengerForm({
                                                                                                    ...passengerForm,
                                                                                                    meals: {
                                                                                                        ...passengerForm.meals,
                                                                                                        [mealType]: { ...passengerForm.meals[mealType], food: e.target.value }
                                                                                                    }
                                                                                                })}
                                                                                            />
                                                                                            <input
                                                                                                placeholder="Alergias / Notas"
                                                                                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-blue-500 outline-none"
                                                                                                value={passengerForm.meals[mealType]?.notes || ''}
                                                                                                onChange={e => setPassengerForm({
                                                                                                    ...passengerForm,
                                                                                                    meals: {
                                                                                                        ...passengerForm.meals,
                                                                                                        [mealType]: { ...passengerForm.meals[mealType], notes: e.target.value }
                                                                                                    }
                                                                                                })}
                                                                                            />
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black text-sm font-medium transition-colors" onClick={() => addPassenger(res.id)}>
                                                                            + Agregar Pasajero
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {expandedTab === 'menu' && (
                                                                <div className="bg-white max-w-3xl">
                                                                    <h4 className="font-bold mb-1 text-gray-900">Configuración de Menú</h4>
                                                                    <p className="text-sm text-gray-500 mb-6">Define las opciones que verán los invitados al hacer check-in.</p>

                                                                    <div className="space-y-3 mb-6">
                                                                        {quickMenu.map((meal, idx) => (
                                                                            <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-start gap-3">
                                                                                <div className="flex-1 space-y-2">
                                                                                    <input
                                                                                        className="w-1/3 px-2 py-1 border-b border-gray-300 font-medium text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                                                                                        placeholder="Tipo de Comida (ej. Almuerzo)"
                                                                                        value={meal.type}
                                                                                        onChange={e => {
                                                                                            const newMenu = [...quickMenu];
                                                                                            newMenu[idx].type = e.target.value;
                                                                                            setQuickMenu(newMenu);
                                                                                        }}
                                                                                    />
                                                                                    <input
                                                                                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                                                                        placeholder="Opciones (ej. Pollo, Carne, Vegetariano)"
                                                                                        value={meal.options?.join(', ')}
                                                                                        onChange={e => {
                                                                                            const newMenu = [...quickMenu];
                                                                                            newMenu[idx].options = e.target.value.split(',').map(s => s.trim());
                                                                                            setQuickMenu(newMenu);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <button className="text-gray-400 hover:text-red-500 p-1" onClick={() => {
                                                                                    const newMenu = quickMenu.filter((_, i) => i !== idx);
                                                                                    setQuickMenu(newMenu);
                                                                                }}>✕</button>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <button
                                                                        className="px-4 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors w-full text-center mb-6"
                                                                        onClick={() => setQuickMenu([...quickMenu, { type: '', options: [] }])}
                                                                    >
                                                                        + Agregar Tiempo de Comida
                                                                    </button>

                                                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                                                        <button
                                                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                                                                            onClick={() => saveQuickMenu(res.id)}
                                                                        >
                                                                            Guardar Configuración
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {expandedTab === 'tour' && (
                                                                <div className="bg-white max-w-4xl">
                                                                    <div className="flex justify-between items-center mb-6">
                                                                        <h4 className="font-bold text-gray-900">Personalizar Itinerario</h4>
                                                                        <button
                                                                            className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                                                                            onClick={() => importFromOriginal(res.tour_id)}
                                                                        >
                                                                            Restaurar Original
                                                                        </button>
                                                                    </div>

                                                                    <div className="mb-6">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tour (Vista Cliente)</label>
                                                                        <input
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                                                            value={customTourForm.tour_name || ''}
                                                                            onChange={e => setCustomTourForm({ ...customTourForm, tour_name: e.target.value })}
                                                                            placeholder={res.tour_name}
                                                                        />
                                                                    </div>

                                                                    <div className="mb-6">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Qué Incluye</label>
                                                                        <textarea
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                                                                            rows={4}
                                                                            value={customTourForm.includes || ''}
                                                                            onChange={e => setCustomTourForm({ ...customTourForm, includes: e.target.value })}
                                                                        />
                                                                    </div>

                                                                    <div className="mb-6">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-3">Itinerario</label>
                                                                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                            {customTourForm.itinerary?.map((step: any, idx: number) => (
                                                                                <div key={idx} className="flex gap-3 items-center group">
                                                                                    <input
                                                                                        className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none"
                                                                                        value={step.time}
                                                                                        onChange={e => {
                                                                                            const newItinerary = [...(customTourForm.itinerary || [])];
                                                                                            newItinerary[idx] = { ...step, time: e.target.value };
                                                                                            setCustomTourForm({ ...customTourForm, itinerary: newItinerary });
                                                                                        }}
                                                                                        placeholder="Hora"
                                                                                    />
                                                                                    <input
                                                                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none"
                                                                                        value={step.activity}
                                                                                        onChange={e => {
                                                                                            const newItinerary = [...(customTourForm.itinerary || [])];
                                                                                            newItinerary[idx] = { ...step, activity: e.target.value };
                                                                                            setCustomTourForm({ ...customTourForm, itinerary: newItinerary });
                                                                                        }}
                                                                                        placeholder="Actividad"
                                                                                    />
                                                                                    <button
                                                                                        className="text-gray-400 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        onClick={() => {
                                                                                            const newItinerary = customTourForm.itinerary.filter((_: any, i: number) => i !== idx);
                                                                                            setCustomTourForm({ ...customTourForm, itinerary: newItinerary });
                                                                                        }}
                                                                                    >
                                                                                        <span className="sr-only">Eliminar</span>
                                                                                        🗑️
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            <button
                                                                                className="text-sm text-blue-600 font-medium hover:text-blue-800 mt-2"
                                                                                onClick={() => setCustomTourForm({ ...customTourForm, itinerary: [...(customTourForm.itinerary || []), { time: '', activity: '' }] })}
                                                                            >
                                                                                + Agregar Paso
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                                                        <button
                                                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                                                                            onClick={() => saveCustomTour(res.id)}
                                                                        >
                                                                            Guardar Cambios
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {expandedTab === 'audit' && (
                                                                <AuditLogView logs={auditLogs} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
