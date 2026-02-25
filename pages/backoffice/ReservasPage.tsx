import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateReservationPDF } from '../../lib/generatePDF';
import { updateReservation, formatReservationCode } from '../../lib/reservation-logic';
import ItineraryEditor from '../../components/backoffice/ItineraryEditor';
import { toast } from 'sonner';
import type { Reservation, Passenger, AuditLogEntry, PassengerMeal } from '../../types/backoffice';
import type { CustomTourData, Tour } from '../../types/shared';
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
            <span className="bo-empty-state-icon">📝</span>
            <p>No hay historial registrado para esta reserva.</p>
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
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    // Data lists
    const [boats, setBoats] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [toursList, setToursList] = useState<Tour[]>([]);

    // Expanded View State
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [expandedTab, setExpandedTab] = useState<'passengers' | 'audit' | 'menu' | 'tour'>('passengers');
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
        tour_id: 0,
        tour_name: '',
        tour_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '08:00',
        boat_id: '',
        driver_id: '',
        guide_id: '',
        pax_count: 1,
        total_amount: 0,
        deposit_amount: 50,
        notes: '',
        status: 'offered' as ReservationStatus,
        emergency_contact_name: '',
        emergency_contact_phone: '',
        // V9 Fields
        selected_addons: [] as { id?: string; label: string; price: number }[],
        meal_per_group: false,
        price_manual: false
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

    async function fetchAll(silent = false) {
        if (!silent) setLoading(true);
        try {
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

            const { data, error } = await query;
            if (error) throw error;

            setReservations((data as Reservation[]) || []);

            // Handle deep link editing
            const editId = searchParams.get('editId');
            if (editId && data) {
                const res = (data as Reservation[]).find(r => r.id === Number(editId));
                if (res) {
                    startEdit(res);
                    setSearchParams({}, { replace: true });
                }
            }

            // Load resources
            const [boatsRes, staffRes, toursRes] = await Promise.all([
                supabase.from('boats').select('*').eq('status', 'active'),
                supabase.from('staff').select('*').eq('active', true),
                supabase.from('tours').select('*').eq('active', true).order('id')
            ]);

            setBoats(boatsRes.data || []);
            setStaffList(staffRes.data || []);

            const mappedTours = (toursRes.data || []).map((t: any) => ({
                ...t,
                gallery: t.gallery || [],
                features: t.features || [],
                meals: t.meals || [],
                prices: t.prices || [],
                addons: t.addons || [],
                itinerary: t.itinerary || []
            }));
            setToursList(mappedTours);
        } catch (err) {
            console.error('Error fetching reservations data:', err);
        } finally {
            setLoading(false);
        }
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
            toast.error("Error: Sesión no válida");
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
            agent_id: agent.id,
            // V9 Fields
            selected_addons: form.selected_addons,
            meal_per_group: form.meal_per_group,
            price_manual: form.price_manual
        };

        if (editingId) {
            // Use unified logic for updates (single update call)
            const result = await updateReservation(editingId, payload, agent);
            if (!result.success) {
                toast.error('Error al actualizar: ' + JSON.stringify(result.error));
                return;
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

        resetForm();
        await fetchAll();
    }

    async function updateStatus(id: number, newStatus: ReservationStatus) {
        if (!agent) return;

        const result = await updateReservation(id, { status: newStatus }, agent);
        if (!result.success) {
            toast.error('Error al actualizar estado');
        } else {
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        }
    }

    // Add error state
    const [paymentError, setPaymentError] = useState<string | null>(null);

    async function generatePaymentLink() {
        if (!showPaymentModal || !agent) return;
        setPaymentLoading(true);
        setPaymentError(null);

        // Abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            console.log("Generating payment link for:", showPaymentModal.id);

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: showPaymentModal.tour_id?.toString() || '0',
                    tourName: showPaymentModal.tour_name,
                    customerEmail: 'cliente@ejemplo.com', // TODO: Add email field to reservation
                    customerName: showPaymentModal.passengers?.[0]?.full_name || 'Cliente',
                    depositAmount: paymentAmount,
                    selectedItems: []
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const text = await res.text();
                console.error("API Error:", res.status, text);
                throw new Error(`Error del servidor (${res.status}). Verifique la conexión o las credenciales.`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error("La respuesta del servidor no es válida (no es JSON).");
            }

            const data = await res.json();

            if (data.success) {
                // Update reservation with payment link
                const { error: updateError } = await supabase.from('reservations').update({
                    payment_url: data.checkoutUrl,
                    payment_id: data.checkoutId
                }).eq('id', showPaymentModal.id);

                if (updateError) {
                    console.error("Supabase update error:", updateError);
                    toast.warning("El link se generó pero hubo un error al guardarlo. Link: " + data.checkoutUrl);
                } else {
                    await logAudit(showPaymentModal.id, 'updated', {
                        field_changed: 'payment_link_generated',
                        new_value: `$${paymentAmount} `
                    });

                    // Force copy to clipboard
                    try {
                        await navigator.clipboard.writeText(data.checkoutUrl);
                        toast.success('Link generado y copiado al portapapeles');
                    } catch (clipErr) {
                        toast.success('Link generado: ' + data.checkoutUrl);
                    }

                    setShowPaymentModal(null);
                    await fetchAll();
                }
            } else {
                setPaymentError(data.error || 'Error desconocido al generar el link.');
            }
        } catch (err: any) {
            console.error(err);
            if (err.name === 'AbortError') {
                setPaymentError('Tiempo de espera agotado. El servicio de pagos está tardando demasiado.');
            } else {
                setPaymentError(err.message || 'Error al conectar con el servicio de pagos.');
            }
        } finally {
            setPaymentLoading(false);
        }
    }

    async function saveManualPaymentLink(url: string) {
        if (!showPaymentModal) return;
        const { error } = await supabase.from('reservations').update({
            payment_url: url
        }).eq('id', showPaymentModal.id);

        if (error) {
            toast.error("Error al guardar link: " + error.message);
        } else {
            await logAudit(showPaymentModal.id, 'updated', {
                field_changed: 'payment_link_manual',
                new_value: 'Link manual agregado'
            });
            setShowPaymentModal(null);
            await fetchAll();
        }
    }

    async function handlePrint(res: Reservation) {
        try {
            const { data, error } = await supabase
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
                .single();

            if (error) {
                console.error('handlePrint query error:', error);
                toast.error('Error al cargar datos para el PDF: ' + error.message);
                return;
            }

            if (!data) {
                toast.error('No se encontró la reserva para generar el PDF.');
                return;
            }

            generateReservationPDF(data as any);
        } catch (e) {
            console.error('handlePrint unexpected error:', e);
            toast.error('Error inesperado al generar PDF. Intenta de nuevo.');
        }
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
                // Load passengers and audit in parallel
                const [{ data: pax }, { data: audits }] = await Promise.all([
                    supabase.from('passengers').select('*, meals:passenger_meals(*)').eq('reservation_id', id),
                    supabase.from('reservation_audit_log').select('*').eq('reservation_id', id).order('created_at', { ascending: false }),
                ]);
                setPassengers((pax as any[]) || []);
                setAuditLogs((audits as AuditLogEntry[]) || []);

                // Load Menu
                setQuickMenu(res.meal_options?.available_meals || []);

                // Load Custom Tour Data (V7)
                // Use saved custom data if it exists, otherwise fallback to tour defaults
                if (res.custom_tour_data) {
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
        // Trim option names on save (not during typing, to allow spaces)
        const cleanedMenu = quickMenu.map(meal => ({
            ...meal,
            options: meal.options.map(s => s.trim()).filter(Boolean)
        }));
        const { error } = await supabase
            .from('reservations')
            .update({ meal_options: { available_meals: cleanedMenu } })
            .eq('id', id);

        if (error) toast.error('Error al guardar menú');
        else {
            toast.success('Menú actualizado correctamente');
            await fetchAll();
        }
    }

    async function saveCustomTour(id: number, data: CustomTourData) {
        try {
            const { error } = await supabase
                .from('reservations')
                .update({ custom_tour_data: data })
                .eq('id', id);

            if (error) {
                toast.error('Error al guardar info del tour: ' + error.message);
                return;
            }

            // Update local state immediately so the saved data persists
            // even before fetchAll completes
            setReservations(prev => prev.map(r =>
                r.id === id ? { ...r, custom_tour_data: { ...data } } : r
            ));

            // Also update customTourForm so re-expanding shows saved data
            setCustomTourForm({ ...data });

            toast.success('Info del tour actualizada correctamente');
            await fetchAll(true); // Silent refresh — no loading spinner flash
        } catch (e) {
            toast.error('Error inesperado al guardar: ' + (e as Error).message);
        }
    }

    async function addPassenger(resId: number) {
        if (!passengerForm.full_name.trim()) return;

        try {
            // 1. Create passenger
            const { data: pax, error } = await supabase.from('passengers').insert([{
                reservation_id: resId,
                full_name: passengerForm.full_name,
                age: passengerForm.age ? Number(passengerForm.age) : null,
                id_document: passengerForm.id_document || null,
                email: passengerForm.email || null,
                phone: passengerForm.phone || null,
            }]).select().single();

            if (error || !pax) {
                toast.error('Error al agregar pasajero: ' + (error?.message || 'Sin datos'));
                return;
            }

            // 2. Create meals
            const mealInserts = Object.entries(passengerForm.meals).map(([type, data]) => ({
                passenger_id: pax.id,
                meal_type: type,
                food_order: (data as any).food || '',
                dietary_notes: (data as any).notes || ''
            })).filter(m => m.food_order || m.dietary_notes);

            if (mealInserts.length > 0) {
                const { error: mealError } = await supabase.from('passenger_meals').insert(mealInserts);
                if (mealError) console.error('Error creating meals:', mealError);
            }

            // Reset form
            setPassengerForm({ full_name: '', age: '', id_document: '', email: '', phone: '', meals: {} as any });

            // Re-fetch passengers directly (no stale closure dependency)
            const { data: paxRes } = await supabase.from('passengers').select('*, meals:passenger_meals(*)').eq('reservation_id', resId).order('created_at');
            setPassengers((paxRes as any[]) || []);

            // Audit log (fire-and-forget is OK for audit)
            await supabase.from('reservation_audit_log').insert([{
                reservation_id: resId,
                agent_id: agent!.id,
                agent_name: agent!.name,
                action: 'updated',
                field_changed: 'passenger_added',
                new_value: pax.full_name
            }]);
        } catch (err) {
            toast.error('Error inesperado: ' + (err as Error).message);
        }
    }

    async function removePassenger(passId: number, resId: number, passengerName?: string) {
        if (!confirm(`¿Eliminar pasajero ${passengerName || ''}? No se puede deshacer.`)) return;
        const { error } = await supabase.from('passengers').delete().eq('id', passId);
        if (error) {
            toast.error('Error al eliminar pasajero: ' + error.message);
            return;
        }
        // Re-fetch passengers directly
        const { data: paxRes } = await supabase.from('passengers').select('*, meals:passenger_meals(*)').eq('reservation_id', resId).order('created_at');
        setPassengers((paxRes as any[]) || []);
    }

    async function deleteReservation(id: number) {
        if (!confirm('¿Estás seguro de ELIMINAR esta reserva? Esta acción no se puede deshacer.')) return;

        const { error } = await supabase.from('reservations').delete().eq('id', id);
        if (error) {
            toast.error('Error al eliminar: ' + error.message);
        } else {
            await fetchAll();
        }
    }

    // ==========================================
    // Helper Functions
    // ==========================================

    function resetForm() {
        setShowForm(false);
        setEditingId(null);
        const defaultTour = toursList[0];
        setForm({
            tour_id: defaultTour?.id || 0,
            tour_name: defaultTour?.name || '',
            tour_date: new Date().toISOString().split('T')[0],
            end_date: '',
            start_time: '08:00',
            boat_id: '',
            driver_id: '',
            guide_id: '',
            pax_count: 1,
            total_amount: defaultTour?.price || 0,
            deposit_amount: 50,
            notes: '',
            status: 'offered',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            meal_options: { available_meals: [] }, // Initialize meal_options
            selected_addons: [],
            meal_per_group: false,
            price_manual: false
        });
        setMenuConfig([]); // Clear menu config when resetting form
    }

    function handleTourChange(tourId: number) {
        const tour = toursList.find(t => t.id === tourId);
        if (tour) {
            const defaultMenu = tour.meals?.map(m => ({ type: m, options: [] })) || [];

            setForm(prev => {
                const addonsTotal = prev.selected_addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
                const newPrice = prev.price_manual ? prev.total_amount : (tour.price * prev.pax_count) + addonsTotal;

                return {
                    ...prev,
                    tour_id: tourId,
                    tour_name: tour.name,
                    total_amount: newPrice,
                    meal_options: { available_meals: defaultMenu }
                };
            });
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
            emergency_contact_phone: res.emergency_contact_phone || '',
            meal_options: res.meal_options?.available_meals ? res.meal_options : { available_meals: toursList.find(t => t.id === res.tour_id)?.meals?.map(m => ({ type: m, options: [] })) || [] },
            selected_addons: res.selected_addons || [],
            meal_per_group: res.meal_per_group || false,
            price_manual: res.price_manual || false
        });

        setMenuConfig(res.meal_options?.available_meals || toursList.find(t => t.id === res.tour_id)?.meals?.map(m => ({ type: m, options: [] })) || []);
        setQuickMenu(res.meal_options?.available_meals || []);

        setEditingId(res.id);
        setShowForm(true);
    }

    // Debounce search query by 300ms
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Reset page when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterStatus]);

    // Client-side search filtering + pagination
    const filteredReservations = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return reservations;
        const q = debouncedSearchQuery.toLowerCase().trim();
        return reservations.filter(res => {
            // Match by reservation ID
            if (String(res.id).includes(q)) return true;
            // Match by formatted reservation code
            if (formatReservationCode(res.id, res.tour_date).toLowerCase().includes(q)) return true;
            // Match by tour name
            if (res.tour_name?.toLowerCase().includes(q)) return true;
            // Match by passenger name, email, or phone
            if (res.passengers?.some(p =>
                p.full_name?.toLowerCase().includes(q) ||
                p.email?.toLowerCase().includes(q) ||
                p.phone?.toLowerCase().includes(q)
            )) return true;
            return false;
        });
    }, [reservations, debouncedSearchQuery]);

    const totalFiltered = filteredReservations.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
    const paginatedReservations = filteredReservations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const showingFrom = totalFiltered === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered);

    const currentTourMeals = toursList.find(t => t.id === (editingId ? form.tour_id : (expandedId ? reservations.find(r => r.id === expandedId)?.tour_id : toursList[0]?.id)))?.meals || [];

    if (loading) return <div className="bo-loading"><div className="bo-loading-spinner" /></div>;

    return (
        <div className="bo-reservas">
            {/* Header */}
            <header className="bo-header bo-flex bo-justify-between bo-align-center">
                <div>
                    <h2 className="bo-title">Reservas</h2>
                    <p className="bo-subtitle">
                        {reservations.length} servicios registrados • Comisión estimada: <span style={{ fontFamily: 'var(--bo-font-mono)' }}>${reservations.reduce((acc, curr) => acc + (curr.total_amount * (agent?.commission_rate || 5) / 100), 0).toFixed(2)}</span>
                    </p>
                </div>
                <button
                    className="bo-btn bo-btn--primary"
                    onClick={() => { resetForm(); setShowForm(true); }}
                >
                    + Nueva Reserva
                </button>
            </header>

            {/* Filters */}
            <div className="bo-filter-tabs">
                <button
                    className={`bo-filter-tab ${filterStatus === 'all' ? 'bo-filter-tab--active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    Todas
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const isActive = filterStatus === key;
                    return (
                        <button
                            key={key}
                            className={`bo-filter-tab ${isActive ? 'bo-filter-tab--active' : ''}`}
                            style={isActive ? { backgroundColor: config.bg, color: config.color, borderColor: config.color } : {}}
                            onClick={() => setFilterStatus(key)}
                        >
                            {config.label}
                        </button>
                    )
                })}
            </div>

            {/* Search Bar */}
            <div className="bo-section-card" style={{ marginBottom: 0, paddingBottom: '0.75rem', paddingTop: '0.75rem' }}>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                        🔍
                    </span>
                    <input
                        type="text"
                        className="bo-input w-full pl-9"
                        placeholder="Buscar por ID, cliente, tour, email o teléfono..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Buscar reservas"
                    />
                    {searchQuery && (
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                            onClick={() => setSearchQuery('')}
                            aria-label="Limpiar busqueda"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {
                showPaymentModal && (
                    <div className="bo-modal-overlay">
                        <div className="bo-modal bo-modal--sm">
                            <div className="bo-modal-header">
                                <h3>Generar Link de Pago</h3>
                                <button className="bo-modal-close" onClick={() => setShowPaymentModal(null)} aria-label="Cerrar">✕</button>
                            </div>
                            <div className="bo-modal-body">
                                <p className="mb-2">Tour: <strong>{showPaymentModal.tour_name}</strong></p>
                                <p className="mb-4">Total reserva: ${showPaymentModal.total_amount}</p>
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
                                    <div className="bo-alert bo-alert--error" style={{ marginBottom: '1rem' }}>
                                        {paymentError}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 mt-4">
                                    <button
                                        className="bo-btn bo-btn--primary bo-btn--block"
                                        onClick={generatePaymentLink}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? 'Generando...' : 'Crear Link (Recurrente)'}
                                    </button>

                                    <div className="text-center text-xs text-gray-400 my-2">- O -</div>

                                    <div className="bo-form-group">
                                        <label className="bo-label">Ingresar Link Manualmente</label>
                                        <input
                                            className="bo-input bo-input--sm"
                                            placeholder="https://..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    saveManualPaymentLink((e.target as HTMLInputElement).value);
                                                }
                                            }}
                                        />
                                        <p className="bo-hint">Presiona Enter para guardar</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Reservation Form Modal */}
            {
                showForm && (
                    <div className="bo-modal-overlay" onClick={resetForm}>
                        <div className="bo-modal" onClick={e => e.stopPropagation()}>
                            <div className="bo-modal-header">
                                <h3>{editingId ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                                <button className="bo-modal-close" onClick={resetForm} aria-label="Cerrar">✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="bo-modal-body">
                                <div className="bo-form-grid">
                                    <div className="bo-form-group">
                                        <label className="bo-label">Tour</label>
                                        <select className="bo-input" value={form.tour_id} onChange={e => handleTourChange(Number(e.target.value))}>
                                            <option value={0}>Seleccionar Tour...</option>
                                            {toursList.map(t => <option key={t.id} value={t.id}>{t.name} — ${t.price}</option>)}
                                        </select>
                                    </div>
                                    <div className="bo-form-group">
                                        <label className="bo-label">Estado</label>
                                        <select className="bo-input" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as any }))}>
                                            {Object.entries(STATUS_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="bo-form-group">
                                        <label className="bo-label">Fecha Inicio</label>
                                        <input className="bo-input" type="date" value={form.tour_date} onChange={e => setForm(prev => ({ ...prev, tour_date: e.target.value }))} required />
                                    </div>
                                    <div className="bo-form-group">
                                        <label className="bo-label">Fecha Fin (opcional)</label>
                                        <input className="bo-input" type="date" value={form.end_date} onChange={e => setForm(prev => ({ ...prev, end_date: e.target.value }))} />
                                    </div>
                                    <div className="bo-form-group">
                                        <label className="bo-label">Hora</label>
                                        <input className="bo-input" type="time" value={form.start_time} onChange={e => setForm(prev => ({ ...prev, start_time: e.target.value }))} />
                                    </div>
                                    <div className="bo-form-group">
                                        <label className="bo-label">Pax</label>
                                        <input className="bo-input" type="number" min="1" value={form.pax_count} onChange={e => setForm(prev => ({ ...prev, pax_count: Number(e.target.value) }))} />
                                    </div>
                                    <div className="bo-form-group">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="bo-label">Precio Total ($)</label>
                                            <label className="text-[10px] flex items-center gap-1 cursor-pointer select-none text-gray-500 hover:text-blue-600">
                                                <input
                                                    type="checkbox"
                                                    className="accent-blue-600"
                                                    checked={form.price_manual}
                                                    onChange={e => setForm(prev => ({ ...prev, price_manual: e.target.checked }))}
                                                />
                                                Manual
                                            </label>
                                        </div>
                                        <input
                                            className={`bo-input ${form.price_manual ? 'border-blue-500 bg-blue-50/10' : 'bg-gray-50 text-gray-500'}`}
                                            type="number"
                                            value={form.total_amount}
                                            readOnly={!form.price_manual}
                                            onChange={e => setForm(prev => ({ ...prev, total_amount: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="bo-form-group col-span-2">
                                        <label className="bo-label mb-2 block">Opciones de Comida</label>
                                        <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-blue-600"
                                                checked={form.meal_per_group}
                                                onChange={e => setForm(prev => ({ ...prev, meal_per_group: e.target.checked }))}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">Comida por Grupo (ej. 1 Botella para todos)</span>
                                                <span className="text-xs text-gray-500">Si se activa, no se pedirá selección individual de comida a los invitados.</span>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="bo-form-group col-span-2">
                                        <label className="bo-label mb-2 block">Add-ons y Extras</label>
                                        <div className="space-y-3">
                                            {/* Selected Add-ons List */}
                                            {form.selected_addons.map((addon, idx) => (
                                                <div key={idx} className="flex gap-2 items-center p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                                                    <input
                                                        className="bo-input h-8 text-xs font-bold"
                                                        value={addon.label}
                                                        onChange={e => {
                                                            const newAddons = [...form.selected_addons];
                                                            newAddons[idx].label = e.target.value;
                                                            setForm(prev => ({ ...prev, selected_addons: newAddons }));
                                                        }}
                                                        placeholder="Nombre del servicio"
                                                    />
                                                    <div className="relative w-24">
                                                        <span className="absolute left-2 top-1.5 text-xs text-gray-500">$</span>
                                                        <input
                                                            type="number"
                                                            className="bo-input h-8 pl-5 text-xs font-bold text-right"
                                                            value={addon.price}
                                                            onChange={e => {
                                                                const val = Number(e.target.value);
                                                                const newAddons = [...form.selected_addons];
                                                                newAddons[idx].price = val;

                                                                // Auto-update total if not manual
                                                                // We need to calculate diff or just recalc everything.
                                                                // Recalc is safer.
                                                                // Base Tour Price? We need to know it.
                                                                // form.total_amount currently holds the total.
                                                                // If we change addon price, we should update total IF !price_manual.
                                                                // BUT retrieving base tour price is tricky here without `tour` object scope.
                                                                // Strategy: Update state, and use `useEffect` or similar to update total?
                                                                // Or just update total here incrementally.
                                                                const oldPrice = Number(newAddons[idx].price) || 0;
                                                                // Wait, I just assigned `val` to `newAddons[idx].price`.
                                                                // The `addon` object in map is a reference? No, I copied array but valid obj refs?
                                                                // `const newAddons = [...form.selected_addons]` copies array, but objects are same refs.
                                                                // So `newAddons[idx].price = val` modifies original if not careful?
                                                                // Actually yes, shallow copy of array.
                                                                // Let's do deep copy for safety.
                                                                const safeAddons = form.selected_addons.map((a, i) => i === idx ? { ...a, price: val } : a);

                                                                setForm(prev => {
                                                                    if (prev.price_manual) return { ...prev, selected_addons: safeAddons };

                                                                    // Recalculate Total
                                                                    // Base = Total - OldAddonsSum
                                                                    const oldAddonsSum = prev.selected_addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
                                                                    const basePrice = prev.total_amount - oldAddonsSum;
                                                                    const newAddonsSum = safeAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

                                                                    return {
                                                                        ...prev,
                                                                        selected_addons: safeAddons,
                                                                        total_amount: basePrice + newAddonsSum
                                                                    };
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newAddons = form.selected_addons.filter((_, i) => i !== idx);
                                                            setForm(prev => {
                                                                if (prev.price_manual) return { ...prev, selected_addons: newAddons };
                                                                const removedPrice = Number(addon.price) || 0;
                                                                return { ...prev, selected_addons: newAddons, total_amount: prev.total_amount - removedPrice };
                                                            });
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Master List & Custom Add */}
                                            <div className="flex gap-2">
                                                <select
                                                    className="bo-input text-xs"
                                                    onChange={e => {
                                                        if (!e.target.value) return;
                                                        const [label, priceStr] = e.target.value.split('|');
                                                        // Parse price range simple average or min? "80-120" -> 100?
                                                        // Or just 0 and let user edit.
                                                        // Let's try to parse first number.
                                                        const price = parseInt(priceStr) || 0;
                                                        const newAddon = { label, price };

                                                        setForm(prev => {
                                                            const newAddons = [...prev.selected_addons, newAddon];
                                                            if (prev.price_manual) return { ...prev, selected_addons: newAddons };
                                                            return { ...prev, selected_addons: newAddons, total_amount: prev.total_amount + price };
                                                        });
                                                        e.target.value = ''; // reset
                                                    }}
                                                >
                                                    <option value="">+ Agregar del Catálogo...</option>
                                                    {/* Unique Addons from all tours */}
                                                    {Array.from(new Set(toursList.flatMap(t => t.addons || []).map(a => JSON.stringify({ label: a.label, price: a.price }))))
                                                        .map((s: string) => JSON.parse(s))
                                                        .map((a, i) => (
                                                            <option key={i} value={`${a.label}|${a.price}`}>
                                                                {a.label} ({a.price})
                                                            </option>
                                                        ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newAddon = { label: 'Nuevo Extra', price: 0 };
                                                        setForm(prev => ({ ...prev, selected_addons: [...prev.selected_addons, newAddon] }));
                                                    }}
                                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg whitespace-nowrap"
                                                >
                                                    + Custom
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bo-form-group">
                                        <label className="bo-label">Contacto Emergencia</label>
                                        <input
                                            className="bo-input"
                                            placeholder="Nombre"
                                            value={form.emergency_contact_name}
                                            onChange={e => setForm(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                                        />
                                        <input
                                            className="bo-input mt-1"
                                            placeholder="Teléfono"
                                            value={form.emergency_contact_phone}
                                            onChange={e => setForm(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                                        />
                                    </div>
                                    {/* Staff assignment fields */}
                                    <div className="bo-form-group">
                                        <label className="bo-label">Lancha</label>
                                        <select className="bo-input" value={form.boat_id} onChange={e => setForm(prev => ({ ...prev, boat_id: e.target.value }))}>
                                            <option value="">Sin asignar</option>
                                            {boats.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="bo-form-group">
                                        <label className="bo-label">Capitán</label>
                                        <select className="bo-input" value={form.driver_id} onChange={e => setForm(prev => ({ ...prev, driver_id: e.target.value }))}>
                                            <option value="">Sin asignar</option>
                                            {staffList.filter(s => s.role === 'lanchero').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="bo-form-group">
                                        <label className="bo-label">Guía</label>
                                        <select className="bo-input" value={form.guide_id} onChange={e => setForm(prev => ({ ...prev, guide_id: e.target.value }))}>
                                            <option value="">Sin asignar</option>
                                            {staffList.filter(s => s.role === 'guia').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="bo-modal-actions">
                                    <button type="button" className="bo-btn bo-btn--ghost" onClick={resetForm}>Cancelar</button>
                                    <button type="submit" className="bo-btn bo-btn--primary">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }

            {/* List */}
            <div className="bo-section-card">
                <div className="bo-table-responsive">
                    <table className="bo-table bo-table--reservas">
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}></th>
                                <th>ID</th>
                                <th>Tour / Fecha</th>
                                <th>Cliente / Pax</th>
                                <th>Pagos</th>
                                <th>Staff</th>
                                <th>Estado</th>
                                <th className="bo-text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReservations.map(res => {
                                const commission = (res.total_amount * (agent?.commission_rate || 5) / 100).toFixed(2);
                                const isExpanded = expandedId === res.id;
                                const pending = res.total_amount - res.paid_amount;

                                return (
                                    <React.Fragment key={res.id}>
                                        <tr className={isExpanded ? 'bo-row-expanded' : ''}>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="bo-expand-btn"
                                                    onClick={() => toggleExpanded(res.id)}
                                                    aria-label={isExpanded ? 'Contraer detalles' : 'Expandir detalles'}
                                                >
                                                    {isExpanded ? '▼' : '▶'}
                                                </button>
                                            </td>
                                            <td>
                                                <span className="bo-cell-mono" title={`ID: ${res.id}`}>{formatReservationCode(res.id, res.tour_date)}</span>
                                            </td>
                                            <td>
                                                <div className="bo-cell-bold">{res.tour_name}</div>
                                                <div className="bo-cell-sub">
                                                    {new Date(res.tour_date + 'T12:00:00').toLocaleDateString()} • {res.start_time.substring(0, 5)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="bo-cell-bold">{res.passengers?.[0]?.full_name || 'Sin nombre'}</div>
                                                <div className="bo-cell-sub">{res.pax_count} pax</div>
                                            </td>
                                            <td>
                                                <div className="bo-cell-bold">${res.total_amount}</div>
                                                <div className="bo-cell-badges">
                                                    {pending > 0 ? (
                                                        <span className="bo-badge bo-badge--danger">Debe: ${pending}</span>
                                                    ) : (
                                                        <span className="bo-badge bo-badge--success">Pagado</span>
                                                    )}
                                                    <span className="bo-cell-sub">Com: ${commission}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="bo-cell-sub">
                                                    <div title="Lancha">🚤 {res.boat?.name || 'S/A'}</div>
                                                    <div title="Capitán">⚓ {res.driver?.name?.split(' ')[0] || '?'}</div>
                                                </div>
                                            </td>
                                            <td><StatusBadge status={res.status} /></td>
                                            <td className="bo-text-right">
                                                <div className="bo-action-btns">
                                                    <button className="bo-action-btn bo-action-btn--edit" title="Editar" aria-label="Editar reserva" onClick={() => startEdit(res)}>✏️</button>
                                                    <button className="bo-action-btn bo-action-btn--pdf" title="PDF" aria-label="Generar PDF" onClick={() => handlePrint(res)}>📄</button>
                                                    <button className="bo-action-btn bo-action-btn--pay" title="Cobrar" aria-label="Generar link de pago" onClick={() => { setShowPaymentModal(res); setPaymentAmount(res.total_amount - res.paid_amount); }}>💳</button>
                                                    <button className="bo-action-btn bo-action-btn--delete" title="Eliminar" aria-label="Eliminar reserva" onClick={() => deleteReservation(res.id)}>🗑️</button>
                                                </div>
                                                {res.payment_url && (
                                                    <div className="bo-cell-link">
                                                        <a href={res.payment_url} target="_blank" rel="noreferrer">Link Pago 🔗</a>
                                                    </div>
                                                )}
                                                {res.public_token && (
                                                    <div className="bo-cell-link">
                                                        <a href={`/reservas/checkin/${res.public_token}`} target="_blank" rel="noreferrer">
                                                            Guest 🔗
                                                        </a>
                                                        <button
                                                            className="bo-action-btn"
                                                            title="Copiar Link"
                                                            aria-label="Copiar link de check-in"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const url = `${window.location.origin}/reservas/checkin/${res.public_token}`;
                                                                navigator.clipboard.writeText(url);
                                                                toast.success('Link copiado al portapapeles');
                                                            }}
                                                        >
                                                            📋
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bo-expanded-row">
                                                <td colSpan={8} className="bo-expanded-cell">
                                                    <div className="bo-expanded-content">
                                                        {/* Tabs */}
                                                        <div className="bo-expanded-tabs">
                                                            <button
                                                                className={`bo-expanded-tab ${expandedTab === 'passengers' ? 'bo-expanded-tab--active' : ''}`}
                                                                onClick={() => setExpandedTab('passengers')}
                                                            >
                                                                Pasajeros
                                                            </button>
                                                            <button
                                                                className={`bo-expanded-tab ${expandedTab === 'menu' ? 'bo-expanded-tab--active' : ''}`}
                                                                onClick={() => setExpandedTab('menu')}
                                                            >
                                                                Menú y Dieta
                                                            </button>
                                                            <button
                                                                className={`bo-expanded-tab ${expandedTab === 'tour' ? 'bo-expanded-tab--active' : ''}`}
                                                                onClick={() => setExpandedTab('tour')}
                                                            >
                                                                Itinerario & Info
                                                            </button>
                                                            <button
                                                                className={`bo-expanded-tab ${expandedTab === 'audit' ? 'bo-expanded-tab--active' : ''}`}
                                                                onClick={() => setExpandedTab('audit')}
                                                            >
                                                                Historial
                                                            </button>
                                                        </div>

                                                        <div className="bo-expanded-body">
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
                                                                                        toast.success('Link copiado!');
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
                                                                                <button className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors" title="Eliminar Pasajero" aria-label="Eliminar pasajero" onClick={() => removePassenger(p.id, res.id, p.full_name)}>✕</button>
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
                                                                                            newMenu[idx].options = e.target.value.split(',');
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
                                                                <ItineraryEditor
                                                                    initialData={customTourForm}
                                                                    originalTour={toursList.find(t => t.id === res.tour_id) || null}
                                                                    defaultTourName={res.tour_name}
                                                                    onSave={(data) => saveCustomTour(res.id, data)}
                                                                />
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

            {/* Pagination Controls */}
            {totalFiltered > ITEMS_PER_PAGE && (
                <div className="bo-section-card" style={{ marginTop: 0, paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            Mostrando {showingFrom}-{showingTo} de {totalFiltered}
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="bo-btn bo-btn--ghost"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Anterior
                            </button>
                            <span className="flex items-center text-sm text-gray-600 px-2">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                className="bo-btn bo-btn--ghost"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {totalFiltered <= ITEMS_PER_PAGE && totalFiltered > 0 && (
                <div className="text-center text-sm text-gray-400 py-2">
                    Mostrando {totalFiltered} reserva{totalFiltered !== 1 ? 's' : ''}
                </div>
            )}
        </div >
    );
}
