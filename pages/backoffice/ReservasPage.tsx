import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TOURS } from '../../data';
import { generateReservationPDF } from '../../lib/generatePDF';
import { updateReservation } from '../../lib/reservation-logic';
import type { Reservation, Passenger, AuditLogEntry, PassengerMeal } from '../../types/backoffice';
import { STATUS_CONFIG, MEAL_TYPE_LABELS, AUDIT_ACTION_LABELS } from '../../types/backoffice';
import type { ReservationStatus, MealType } from '../../types/backoffice';

// ==========================================
// Helper Components
// ==========================================

function StatusBadge({ status }: { status: ReservationStatus }) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            className="bo-status-badge"
            style={{ backgroundColor: config.bg, color: config.color }}
        >
            {config.label}
        </span>
    );
}

function AuditLogView({ logs }: { logs: AuditLogEntry[] }) {
    if (!logs || logs.length === 0) return (
        <div className="bo-empty-state">
            <p>No hay historial registrado para esta reserva.</p>
        </div>
    );

    return (
        <div className="bo-audit-timeline">
            {logs.map((log) => {
                const date = new Date(log.created_at);
                const day = date.getDate();
                const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                return (
                    <div key={log.id} className="bo-audit-item">
                        <div className="bo-audit-marker">
                            <span className="day">{day}</span>
                            <span className="month">{month}</span>
                        </div>
                        <div className="bo-audit-content">
                            <div className="bo-audit-header">
                                <span className="bo-audit-agent">{log.agent_name}</span>
                                <span className="bo-audit-action">{AUDIT_ACTION_LABELS[log.action] || log.action}</span>
                                <span className="text-xs text-muted ml-auto">{time}</span>
                            </div>
                            <div className="bo-audit-details">
                                {log.field_changed ? (
                                    <>
                                        Modificó <strong>{log.field_changed}</strong>
                                        {(log.old_value || log.new_value) && (
                                            <div className="bo-audit-diff">
                                                {log.old_value && <div className="old"><code>{log.old_value}</code></div>}
                                                {log.new_value && <div className="new"><code>{log.new_value}</code></div>}
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

    useEffect(() => {
        fetchAll();
    }, [filterStatus]);

    async function fetchAll() {
        setLoading(true);
        let query = supabase
            .from('reservations')
            .select(`
                *,
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
                    new_value: `Nueva reserva: ${data.tour_name}`
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
                throw new Error(`Respuesta inválida del servidor (${res.status}). Posiblemente la API no está disponible.`);
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
                    new_value: `$${paymentAmount}`
                });

                alert(`Link generado: ${data.checkoutUrl}\n(Copiado al portapapeles)`);
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
                agent:agents(*),
                boat:boats(*),
                driver:staff!reservations_driver_id_fkey(*),
                guide:staff!reservations_guide_id_fkey(*),
                passengers(*, meals:passenger_meals(*))
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
        <div className="bo-reservas">
            {/* Header */}
            <header className="bo-header bo-flex bo-justify-between bo-align-center">
                <div>
                    <h2 className="bo-title">Reservas</h2>
                    <p className="bo-subtitle">{reservations.length} servicios registrados • Comisión estimada: ${reservations.reduce((acc, curr) => acc + (curr.total_amount * (agent?.commission_rate || 5) / 100), 0).toFixed(2)}</p>
                </div>
                <button className="bo-btn bo-btn--primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    + Nueva Reserva
                </button>
            </header>

            {/* Filters */}
            <div className="bo-filters">
                <button className={`bo-filter-chip ${filterStatus === 'all' ? 'bo-filter-chip--active' : ''}`} onClick={() => setFilterStatus('all')}>Todas</button>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button key={key} className={`bo-filter-chip ${filterStatus === key ? 'bo-filter-chip--active' : ''}`} style={filterStatus === key ? { borderColor: config.color, color: config.color } : {}} onClick={() => setFilterStatus(key)}>
                        {config.label}
                    </button>
                ))}
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
            <div className="bo-table-container">
                <table className="bo-table">
                    <thead>
                        <tr>
                            <th style={{ width: 50 }}></th>
                            <th>ID</th>
                            <th>Tour / Fecha</th>
                            <th>Cliente / Pax</th>
                            <th>Pagos</th>
                            <th>Staff</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map(res => {
                            const commission = (res.total_amount * (agent?.commission_rate || 5) / 100).toFixed(2);
                            const isExpanded = expandedId === res.id;
                            const pending = res.total_amount - res.paid_amount;

                            return (
                                <React.Fragment key={res.id}>
                                    <tr>
                                        <td>
                                            <button className="bo-icon-btn" onClick={() => toggleExpanded(res.id)}>
                                                {isExpanded ? '▼' : '▶'}
                                            </button>
                                        </td>
                                        <td className="font-mono text-xs text-muted">#{res.id}</td>
                                        <td>
                                            <div className="font-medium">{res.tour_name}</div>
                                            <div className="text-sm text-muted">
                                                {/* Append T12:00:00 to prevent timezone shift */}
                                                {new Date(res.tour_date + 'T12:00:00').toLocaleDateString()} • {res.start_time.substring(0, 5)}
                                            </div>
                                        </td>
                                        <td>
                                            <div>{res.passengers?.[0]?.full_name || 'Sin nombre'}</div>
                                            <div className="text-sm text-muted">{res.pax_count} pax</div>
                                        </td>
                                        <td>
                                            <div className="font-medium">${res.total_amount}</div>
                                            {pending > 0 ? (
                                                <span className="bo-badge-red">Debe: ${pending}</span>
                                            ) : (
                                                <span className="bo-badge-green">Pagado</span>
                                            )}
                                            <div className="text-xs text-muted mt-1">Com: ${commission}</div>
                                        </td>
                                        <td>
                                            <div className="text-xs">
                                                {res.boat?.name || 'S/A'} • {res.driver?.name?.split(' ')[0] || '?'}
                                            </div>
                                        </td>
                                        <td><StatusBadge status={res.status} /></td>
                                        <td>
                                            <div className="bo-actions">
                                                <button className="bo-icon-btn" title="Editar" onClick={() => startEdit(res)}>✏️</button>
                                                <button className="bo-icon-btn" title="PDF" onClick={() => handlePrint(res)}>📄</button>
                                                <button className="bo-icon-btn" title="Cobrar" onClick={() => { setShowPaymentModal(res); setPaymentAmount(res.total_amount - res.paid_amount); }}>💳</button>
                                                <button className="bo-icon-btn bo-text-red" title="Eliminar" onClick={() => deleteReservation(res.id)}>🗑️</button>
                                            </div>
                                            {res.payment_url && (
                                                <div className="text-xs mt-1">
                                                    <a href={res.payment_url} target="_blank" rel="noreferrer" className="bo-link">Link Pago 🔗</a>
                                                </div>
                                            )}
                                            {res.public_token && (
                                                <div className="text-xs mt-1">
                                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                        <a href={`/reservas/checkin/${res.public_token}`} target="_blank" rel="noreferrer" className="bo-link text-blue-600">
                                                            Link Guest 🔗
                                                        </a>
                                                        <button
                                                            className="bo-icon-btn bo-icon-btn--xs"
                                                            title="Copiar"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // prevent row toggle
                                                                const url = `${window.location.origin}/reservas/checkin/${res.public_token}`;
                                                                navigator.clipboard.writeText(url);
                                                                alert('Link copiado al portapapeles');
                                                            }}
                                                        >
                                                            📋
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bo-expanded-row">
                                            <td colSpan={8}>
                                                <div className="bo-expanded-content">
                                                    <div className="bo-tabs">
                                                        <button
                                                            className={`bo-tab ${expandedTab === 'passengers' ? 'active' : ''}`}
                                                            onClick={() => setExpandedTab('passengers')}
                                                        >
                                                            Pasajeros & Comidas
                                                        </button>
                                                        <button
                                                            className={`bo-tab ${expandedTab === 'audit' ? 'active' : ''}`}
                                                            onClick={() => setExpandedTab('audit')}
                                                        >
                                                            Historial ({auditLogs.length})
                                                        </button>
                                                        <button
                                                            className={`bo-tab ${expandedTab === 'menu' ? 'active' : ''}`}
                                                            onClick={() => setExpandedTab('menu')}
                                                        >
                                                            Configurar Menú 🍽️
                                                        </button>
                                                    </div>

                                                    {expandedTab === 'menu' ? (
                                                        <div className="p-4 bg-gray-50 rounded border border-gray-200">
                                                            <h4 className="font-bold mb-4 text-blue-900">Configuración de Menú para Invitados</h4>
                                                            <p className="text-sm text-gray-600 mb-4">Define las opciones que verán los invitados al hacer check-in. Si está vacío, verán un campo de texto libre.</p>

                                                            {quickMenu.map((meal, idx) => (
                                                                <div key={idx} className="bg-white p-3 rounded shadow-sm mb-3 border bo-menu-item">
                                                                    <div className="flex justify-between mb-2">
                                                                        <input
                                                                            className="bo-input font-bold"
                                                                            placeholder="Tipo de Comida (Ej. Almuerzo)"
                                                                            value={meal.type}
                                                                            onChange={e => {
                                                                                const newMenu = [...quickMenu];
                                                                                newMenu[idx].type = e.target.value;
                                                                                setQuickMenu(newMenu);
                                                                            }}
                                                                        />
                                                                        <button className="text-red-500 hover:text-red-700 font-bold px-2" onClick={() => {
                                                                            const newMenu = quickMenu.filter((_, i) => i !== idx);
                                                                            setQuickMenu(newMenu);
                                                                        }}>Eliminar</button>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Opciones (separadas por coma)</label>
                                                                        <input
                                                                            className="bo-input"
                                                                            placeholder="Ej. Pollo, Carne, Vegetariano"
                                                                            value={meal.options?.join(', ')}
                                                                            onChange={e => {
                                                                                const newMenu = [...quickMenu];
                                                                                newMenu[idx].options = e.target.value.split(',').map(s => s.trim());
                                                                                setQuickMenu(newMenu);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            <button
                                                                className="bo-btn bo-btn--outline bo-btn--sm mb-4"
                                                                onClick={() => setQuickMenu([...quickMenu, { type: '', options: [] }])}
                                                            >
                                                                + Agregar Tiempo de Comida
                                                            </button>

                                                            <div className="flex justify-end pt-4 border-t">
                                                                <button
                                                                    className="bo-btn bo-btn--primary"
                                                                    onClick={() => saveQuickMenu(res.id)}
                                                                >
                                                                    Guardar Menú
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : expandedTab === 'passengers' ? (
                                                        <div className="bo-passenger-manage">
                                                            {res.public_token && (
                                                                <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-100 flex justify-between items-center text-sm">
                                                                    <div>
                                                                        <span className="font-bold text-blue-800">Link para Invitados:</span>
                                                                        <span className="text-blue-600 ml-2">/reservas/checkin/{res.public_token.slice(0, 8)}...</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <a
                                                                            href={`/reservas/checkin/${res.public_token}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-blue-700 underline hover:text-blue-900"
                                                                        >
                                                                            Abrir
                                                                        </a>
                                                                        <button
                                                                            className="text-blue-700 hover:text-blue-900 font-medium"
                                                                            onClick={() => {
                                                                                const url = `${window.location.origin}/reservas/checkin/${res.public_token}`;
                                                                                navigator.clipboard.writeText(url);
                                                                                alert('Link copiado!');
                                                                            }}
                                                                        >
                                                                            Copiar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="bo-pax-list">
                                                                {passengers.map(p => (
                                                                    <div key={p.id} className="bo-pax-card">
                                                                        <div className="bo-pax-header">
                                                                            <strong>{p.full_name}</strong>
                                                                            <span className="text-xs text-muted">
                                                                                {p.age ? `${p.age} años` : ''}
                                                                                {p.id_document ? ` • ID: ${p.id_document}` : ''}
                                                                            </span>
                                                                            {p.email && <span className="text-xs text-muted">✉️ {p.email}</span>}
                                                                            {p.phone && <span className="text-xs text-muted">📞 {p.phone}</span>}
                                                                            <button className="bo-delete-btn" onClick={() => removePassenger(p.id, res.id)}>×</button>
                                                                        </div>
                                                                        <div className="bo-pax-meals">
                                                                            {p.meals?.map(m => (
                                                                                <div key={m.id} className="bo-meal-tag">
                                                                                    <span className="bo-meal-icon">🍽️</span>
                                                                                    <span>{MEAL_TYPE_LABELS[m.meal_type]}: {m.food_order}</span>
                                                                                    {m.dietary_notes && <span className="bo-diet-warning">⚠️ {m.dietary_notes}</span>}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Add Passenger Form */}
                                                            <div className="bo-add-pax-form">
                                                                <h4>Agregar Pasajero</h4>
                                                                <div className="bo-form-row">
                                                                    <input
                                                                        placeholder="Nombre completo"
                                                                        className="bo-input"
                                                                        value={passengerForm.full_name}
                                                                        onChange={e => setPassengerForm({ ...passengerForm, full_name: e.target.value })}
                                                                    />
                                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                                        <input
                                                                            placeholder="Edad"
                                                                            className="bo-input"
                                                                            style={{ width: 80 }}
                                                                            value={passengerForm.age}
                                                                            onChange={e => setPassengerForm({ ...passengerForm, age: e.target.value })}
                                                                        />
                                                                        <input
                                                                            placeholder="DPI / Pasaporte"
                                                                            className="bo-input"
                                                                            style={{ flex: 1 }}
                                                                            value={passengerForm.id_document}
                                                                            onChange={e => setPassengerForm({ ...passengerForm, id_document: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="bo-form-row mt-2">
                                                                        <input
                                                                            placeholder="Email (opcional)"
                                                                            className="bo-input"
                                                                            value={passengerForm.email}
                                                                            onChange={e => setPassengerForm({ ...passengerForm, email: e.target.value })}
                                                                        />
                                                                        <input
                                                                            placeholder="Teléfono (opcional)"
                                                                            className="bo-input"
                                                                            value={passengerForm.phone}
                                                                            onChange={e => setPassengerForm({ ...passengerForm, phone: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Dynamic Meal Fields */}
                                                                {currentTourMeals.length > 0 && (
                                                                    <div className="bo-meals-form">
                                                                        <p className="text-xs font-bold text-muted mb-2">Preferencias Alimenticias</p>
                                                                        {currentTourMeals.map(mealType => (
                                                                            <div key={mealType} className="bo-meal-input-group">
                                                                                <label>{MEAL_TYPE_LABELS[mealType]}</label>
                                                                                <input
                                                                                    placeholder="Selección (ej. Pollo, Vegetariano)"
                                                                                    className="bo-input bo-input--sm"
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
                                                                                    className="bo-input bo-input--sm"
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
                                                                )}

                                                                <button className="bo-btn bo-btn--outline bo-btn--sm mt-3" onClick={() => addPassenger(res.id)}>
                                                                    + Agregar Pasajero
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <AuditLogView logs={auditLogs} />
                                                    )}
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
    );
}
