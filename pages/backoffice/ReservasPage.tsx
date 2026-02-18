import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TOURS } from '../../data';
import { generateReservationPDF } from '../../lib/generatePDF';
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
    const [expandedTab, setExpandedTab] = useState<'passengers' | 'audit'>('passengers');
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

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
    });

    // Passenger Form State (V2 with dynamic meals)
    const [passengerForm, setPassengerForm] = useState({
        full_name: '',
        age: '',
        id_document: '',
        meals: {} as Record<MealType, { food: string; notes: string }>
    });

    useEffect(() => {
        fetchAll();
    }, [filterStatus]);

    async function fetchAll() {
        setLoading(true);
        let query = supabase
            .from('reservations')
            .select(`
                *,
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
                if (oldRes?.status !== payload.status) {
                    logAudit(editingId, 'status_changed', {
                        field_changed: 'status',
                        old_value: oldRes?.status,
                        new_value: payload.status
                    });
                }
                if (oldRes?.total_amount !== payload.total_amount) {
                    logAudit(editingId, 'updated', {
                        field_changed: 'total_amount',
                        old_value: oldRes?.total_amount.toString(),
                        new_value: payload.total_amount.toString()
                    });
                }
                await logAudit(editingId, 'updated', { field_changed: 'general_update' });
            }
        } else {
            const { data, error } = await supabase.from('reservations').insert([payload]).select().single();
            if (!error && data) {
                await logAudit(data.id, 'created', { new_value: `Nueva reserva: ${data.tour_name}` });
            }
        }

        resetForm();
        fetchAll();
    }

    async function updateStatus(id: number, newStatus: ReservationStatus) {
        const oldRes = reservations.find(r => r.id === id);
        if (!oldRes) return;

        await supabase.from('reservations').update({ status: newStatus }).eq('id', id);
        await logAudit(id, 'status_changed', {
            field_changed: 'status',
            old_value: oldRes.status,
            new_value: newStatus
        });

        fetchAll();
    }

    async function generatePaymentLink() {
        if (!showPaymentModal || !agent) return;
        setPaymentLoading(true);

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
                })
            });

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
                alert('Error al generar link: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error al conectar con el servicio de pagos');
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

    async function toggleExpanded(resId: number) {
        if (expandedId === resId) {
            setExpandedId(null);
            setPassengers([]);
            setAuditLogs([]);
        } else {
            setExpandedId(resId);
            setExpandedTab('passengers');
            fetchExpandedData(resId);
        }
    }

    async function fetchExpandedData(resId: number) {
        const [paxRes, auditRes] = await Promise.all([
            supabase.from('passengers').select('*, meals:passenger_meals(*)').eq('reservation_id', resId).order('created_at'),
            supabase.from('reservation_audit_log').select('*').eq('reservation_id', resId).order('created_at', { ascending: false })
        ]);

        setPassengers((paxRes.data as any[]) || []);
        setAuditLogs((auditRes.data as AuditLogEntry[]) || []);
    }

    async function addPassenger(resId: number) {
        if (!passengerForm.full_name.trim()) return;

        // 1. Create passenger
        const { data: pax, error } = await supabase.from('passengers').insert([{
            reservation_id: resId,
            full_name: passengerForm.full_name,
            age: passengerForm.age ? Number(passengerForm.age) : null,
            id_document: passengerForm.id_document || null,
        }]).select().single();

        if (error || !pax) return;

        // 2. Create meals
        const mealInserts = Object.entries(passengerForm.meals).map(([type, data]) => ({
            passenger_id: pax.id,
            meal_type: type,
            food_order: data.food || '',
            dietary_notes: data.notes || ''
        })).filter(m => m.food_order || m.dietary_notes); // Only insert if has data

        if (mealInserts.length > 0) {
            await supabase.from('passenger_meals').insert(mealInserts);
        }

        // Reset and refresh
        setPassengerForm({ full_name: '', age: '', id_document: '', meals: {} as any });
        fetchExpandedData(resId);
        logAudit(resId, 'updated', { field_changed: 'passenger_added', new_value: pax.full_name });
    }

    async function removePassenger(passId: number, resId: number) {
        await supabase.from('passengers').delete().eq('id', passId);
        fetchExpandedData(resId);
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
        });
    }

    function handleTourChange(tourId: number) {
        const tour = TOURS.find(t => t.id === tourId);
        if (tour) {
            setForm(prev => ({
                ...prev,
                tour_id: tourId,
                tour_name: tour.name,
                total_amount: tour.price
            }));
        }
    }

    function startEdit(res: Reservation) {
        setForm({
            tour_id: res.tour_id,
            tour_name: res.tour_name,
            tour_date: res.tour_date,
            end_date: res.end_date || '',
            start_time: res.start_time || '08:00',
            boat_id: res.boat_id?.toString() || '',
            driver_id: res.driver_id?.toString() || '',
            guide_id: res.guide_id?.toString() || '',
            pax_count: res.pax_count,
            total_amount: res.total_amount,
            deposit_amount: res.deposit_amount,
            notes: res.notes || '',
            status: res.status,
        });
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
                                                {new Date(res.tour_date).toLocaleDateString()} • {res.start_time}
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
                                            </div>
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
                                                    </div>

                                                    {expandedTab === 'passengers' ? (
                                                        <div className="bo-passenger-manage">
                                                            <div className="bo-pax-list">
                                                                {passengers.map(p => (
                                                                    <div key={p.id} className="bo-pax-card">
                                                                        <div className="bo-pax-header">
                                                                            <strong>{p.full_name}</strong>
                                                                            <span>{p.age ? `${p.age} años` : ''}</span>
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
                                                                    <input
                                                                        placeholder="Edad"
                                                                        className="bo-input"
                                                                        style={{ width: 80 }}
                                                                        value={passengerForm.age}
                                                                        onChange={e => setPassengerForm({ ...passengerForm, age: e.target.value })}
                                                                    />
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
