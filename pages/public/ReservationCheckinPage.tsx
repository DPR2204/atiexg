
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatReservationCode } from '../../lib/reservation-logic';
import { downloadICS, googleCalendarUrl, outlookCalendarUrl } from '../../lib/calendar';
import { buildRouteFromItinerary } from '../../lib/lake-coordinates';
import {
    Loader2, User, Mail, Phone, ChevronRight, Check, Calendar, Users,
    MapPin, Clock, Info, ArrowLeft, Edit2, MessageSquare, PhoneCall,
    Anchor, Waves, Compass, CreditCard, Sparkles, Utensils, X,
    Shield, ChevronDown, AlertTriangle, CalendarPlus, Download
} from 'lucide-react';

const TourRouteMap = lazy(() => import('../../components/TourRouteMap'));

function formatSpanishDate(dateStr: string): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${days[date.getDay()]} ${d} de ${months[date.getMonth()]}, ${y}`;
}

function formatTime(timeStr: string | undefined): string {
    if (!timeStr) return '08:00 AM';
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Extract the end time from itinerary (last step's time).
 * Itinerary steps have a `time` field like "12:00 PM" or "4:00 PM".
 */
function getEndTimeFromItinerary(reservation: any): string | null {
    const itinerary = reservation.custom_tour_data?.itinerary || reservation.tour_itinerary;
    if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) return null;
    const lastStep = itinerary[itinerary.length - 1];
    return lastStep?.time || null;
}


function AddToCalendarSection({ reservation }: { reservation: any }) {
    const [open, setOpen] = useState(false);

    const tourName = reservation.custom_tour_data?.tour_name || reservation.tour_name;
    // Estimate duration from itinerary if possible
    const endTimeStr = getEndTimeFromItinerary(reservation);
    let durationHours = 4; // default
    if (endTimeStr && reservation.start_time) {
        // Try to parse end time (could be "12:00 PM" or "16:00")
        const parseHour = (t: string): number => {
            const match12 = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match12) {
                let h = parseInt(match12[1]);
                const m = parseInt(match12[2]);
                if (match12[3].toUpperCase() === 'PM' && h !== 12) h += 12;
                if (match12[3].toUpperCase() === 'AM' && h === 12) h = 0;
                return h + m / 60;
            }
            const match24 = t.match(/(\d{1,2}):(\d{2})/);
            if (match24) return parseInt(match24[1]) + parseInt(match24[2]) / 60;
            return 0;
        };
        const startH = parseHour(reservation.start_time);
        const endH = parseHour(endTimeStr);
        if (endH > startH) durationHours = Math.ceil(endH - startH);
    }
    const calendarParams = {
        title: `${tourName} — Atitlán Experiences`,
        date: reservation.tour_date,
        startTime: reservation.start_time,
        durationHours,
        description: [
            `Tour: ${tourName}`,
            `Pasajeros: ${reservation.pax_count}`,
            `Reserva ${formatReservationCode(reservation.id, reservation.tour_date)}`,
            reservation.agent_name ? `Agente: ${reservation.agent_name}` : '',
            '',
            'Atitlán Experiences — Lake Atitlán, Guatemala',
        ].filter(Boolean).join('\n'),
        location: 'Lake Atitlán, Guatemala',
    };

    return (
        <div className="animate-fade-in-up">
            <button
                onClick={() => setOpen(!open)}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:border-gray-200 transition-all active:scale-[0.99] group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <CalendarPlus className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-900">Agregar al Calendario</p>
                        <p className="text-[11px] text-gray-400">Google, Apple, Outlook y más</p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="mt-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-2 animate-fade-in-up">
                    {/* Google Calendar */}
                    <a
                        href={googleCalendarUrl(calendarParams)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <path d="M18.316 5.684H5.684v12.632h12.632V5.684z" fill="#fff"/>
                                <path d="M18.316 23.368l4.632-4.632h-4.632v4.632z" fill="#EA4335"/>
                                <path d="M23 18.684V5.684l-4.684 4.632v8.368H23z" fill="#FBBC04"/>
                                <path d="M18.316 18.684H5.684l-4.632 4.684h22.264l-4.632-4.684h-.368z" fill="#34A853"/>
                                <path d="M1.052 23.368l4.632-4.684V5.684L1.052 1.052v22.316z" fill="#188038"/>
                                <path d="M5.684 5.684h12.632L23 1.052H1.052l4.632 4.632z" fill="#1967D2"/>
                                <path d="M8.5 16.5v-1.1l2.8-2.5c.3-.25.5-.5.5-.85 0-.5-.35-.85-.95-.85-.55 0-.9.3-1.05.75l-1.1-.45c.25-.8 1-1.4 2.15-1.4 1.2 0 2.05.7 2.05 1.75 0 .6-.25 1.1-.75 1.55l-2 1.75h2.85v1.1H8.5z" fill="#1967D2"/>
                                <path d="M15.2 16.5v-1.1l1.4-1.4c.25-.25.4-.5.4-.8 0-.45-.3-.75-.8-.75-.45 0-.75.25-.9.6l-1-.45c.3-.7.95-1.2 1.9-1.2 1.1 0 1.8.65 1.8 1.55 0 .55-.2.95-.6 1.35l-1.05 1.05h1.75v1.1H15.2z" fill="#1967D2"/>
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">Google Calendar</p>
                            <p className="text-[11px] text-gray-400">Abrir en Google Calendar</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:text-gray-500 transition-colors" />
                    </a>

                    {/* Outlook */}
                    <a
                        href={outlookCalendarUrl(calendarParams)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <path d="M24 7.387v10.478c0 .23-.08.424-.238.58a.795.795 0 01-.582.233h-8.304v-12.1h8.304c.224 0 .416.078.578.234A.79.79 0 0124 7.387z" fill="#0364B8"/>
                                <path d="M14.876 6.578v12.1l-1.24.62-5.528 2.76c-.16.08-.308.12-.444.12a.73.73 0 01-.356-.088.705.705 0 01-.356-.632V5.79c0-.16.04-.308.12-.444a.82.82 0 01.356-.312l5.828-2.912c.192-.096.372-.128.54-.096.168.032.312.112.432.24.12.128.2.272.24.432.04.16.04.316 0 .468v3.412z" fill="#0A2767"/>
                                <path d="M14.876 6.578H7.692v10.616h7.184V6.578z" fill="#28A8EA"/>
                                <path d="M11.74 9.43a3.486 3.486 0 00-1.776-.452c-2.0 0-3.296 1.548-3.296 3.3 0 1.848 1.34 3.344 3.34 3.344.68 0 1.268-.164 1.76-.472v-1.42a2.049 2.049 0 01-1.588.716c-1.2 0-2.008-.9-2.008-2.14 0-1.272.856-2.18 2.04-2.18.596 0 1.08.212 1.528.648V9.43z" fill="#0078D4"/>
                                <path d="M14.876 6.578v12.1H7.692l7.184-12.1z" fill="url(#outlook_grad)" fillOpacity="0.2"/>
                                <defs>
                                    <linearGradient id="outlook_grad" x1="7.692" y1="12.628" x2="14.876" y2="12.628">
                                        <stop stopColor="#000" stopOpacity="0"/>
                                        <stop offset="1" stopColor="#000" stopOpacity=".5"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">Outlook</p>
                            <p className="text-[11px] text-gray-400">Abrir en Outlook Calendar</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:text-gray-500 transition-colors" />
                    </a>

                    {/* Download .ics (Apple Calendar / any app) */}
                    <button
                        onClick={() => downloadICS(calendarParams)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group/item text-left"
                    >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Download className="w-4.5 h-4.5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">Descargar .ics</p>
                            <p className="text-[11px] text-gray-400">Apple Calendar, Outlook Desktop y otros</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:text-gray-500 transition-colors" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ReservationCheckinPage() {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Form State
    const [form, setForm] = useState({
        full_name: '',
        age: '',
        id_document: '',
        email: '',
        phone: '',
        meals: {} as any
    });

    useEffect(() => {
        if (token) fetchReservation();
    }, [token]);

    async function fetchReservation() {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_public_reservation', { token_input: token });

        if (error || !data || data.length === 0) {
            setError('Reserva no encontrada o enlace inválido.');
        } else {
            setReservation(data[0]);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.full_name) return;
        setLoading(true);
        setFormError(null);

        const { data: result, error: rpcError } = await supabase.rpc('register_public_passenger', {
            p_token: token,
            p_full_name: form.full_name,
            p_age: form.age ? Number(form.age) : null,
            p_id_document: form.id_document || null,
            p_email: form.email || null,
            p_phone: form.phone || null,
            p_meals: form.meals,
            p_passenger_id: editingId
        });

        if (rpcError) {
            setFormError('Error al guardar: ' + (rpcError?.message || 'Intenta de nuevo'));
            setLoading(false);
            return;
        }

        setSubmitted(true);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetForm() {
        setForm({
            full_name: '',
            age: '',
            id_document: '',
            email: '',
            phone: '',
            meals: {}
        });
        setSubmitted(false);
        setEditingId(null);
        setFormError(null);
        fetchReservation();
    }

    function handleEdit(pax: any) {
        setEditingId(pax.id);
        const mealsObj: any = {};
        if (pax.meals && Array.isArray(pax.meals)) {
            pax.meals.forEach((m: any) => {
                mealsObj[m.meal_type] = {
                    food: m.food,
                    notes: m.notes
                };
            });
        }

        setForm({
            full_name: pax.full_name,
            age: pax.age?.toString() || '',
            id_document: pax.id_document || '',
            email: pax.email || '',
            phone: pax.phone || '',
            meals: mealsObj
        });
        setSubmitted(false);
        const formElement = document.getElementById('passenger-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const registered = reservation?.passengers?.length || 0;
    const total = reservation?.pax_count || 0;
    const progressPct = total > 0 ? Math.min((registered / total) * 100, 100) : 0;
    const allRegistered = registered >= total && total > 0;

    if (loading && !reservation) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white font-['Poppins',sans-serif]">
            <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/20">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-800 mb-1">Preparando tu experiencia</p>
                    <p className="text-xs text-gray-400">Un momento por favor...</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-6 font-['Poppins',sans-serif]">
            <div className="glass-card p-10 rounded-3xl max-w-md w-full text-center animate-scale-in-smooth">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Info className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Enlace no válido</h1>
                <p className="text-gray-500 leading-relaxed text-sm mb-8">{error}</p>
                <div className="pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Atitlán Experiences</p>
                </div>
            </div>
        </div>
    );

    const statusLabels: Record<string, string> = {
        paid: 'Pagado', reserved: 'Reservado', offered: 'Ofrecido',
        completed: 'Completado', in_progress: 'En Curso', pending: 'Pendiente'
    };

    const whatsappLines = [
        `¡Hola! Escribo sobre mi reserva:`,
        ``,
        `*Reserva ${formatReservationCode(reservation.id, reservation.tour_date)}*`,
        `*Tour:* ${reservation.custom_tour_data?.tour_name || reservation.tour_name}`,
        `*Fecha:* ${formatSpanishDate(reservation.tour_date)}`,
        `*Hora:* ${formatTime(reservation.start_time)}`,
        `*Pasajeros:* ${reservation.pax_count}`,
        `*Estado:* ${statusLabels[reservation.status] || reservation.status}`,
        `*Agente:* ${reservation.agent_name || 'No asignado'}`,
        ...(reservation.boat_name ? [`*Lancha:* ${reservation.boat_name}`] : []),
        ...(reservation.driver_name ? [`*Capitán:* ${reservation.driver_name}`] : []),
        ...(reservation.guide_name ? [`*Guía:* ${reservation.guide_name}`] : []),
        ...(reservation.total_amount ? [
            ``,
            `*Total:* $${reservation.total_amount}`,
            ...(Number(reservation.paid_amount) > 0 ? [`*Pagado:* $${reservation.paid_amount}`] : []),
            ...(Number(reservation.total_amount) - Number(reservation.paid_amount || 0) > 0 && reservation.status !== 'paid'
                ? [`*Pendiente:* $${(Number(reservation.total_amount) - Number(reservation.paid_amount || 0)).toFixed(2)}`]
                : []),
        ] : []),
        ``,
        `*Check-in:* ${registered}/${total} registrados`,
        ``,
        `¿Podrían ayudarme?`
    ];

    const whatsappLink = `https://wa.me/50222681264?text=${encodeURIComponent(whatsappLines.join('\n'))}`;

    return (
        <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif] text-gray-900 selection:bg-red-500/10">

            {/* ── Hero Banner ── */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 rounded-full blur-2xl" />

                {/* Header bar */}
                <div className="relative z-10 max-w-2xl mx-auto px-5 pt-5 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                            <Compass className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em]">Guest Portal</p>
                            <p className="text-xs font-bold text-white/80">Atitlán Experiences</p>
                        </div>
                    </div>
                    {reservation.payment_url && reservation.status !== 'paid' && (
                        <a
                            href={reservation.payment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-500/30"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pagar
                        </a>
                    )}
                </div>

                {/* Hero content */}
                <div className="relative z-10 max-w-2xl mx-auto px-5 pt-6 pb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-4">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-red-300 uppercase tracking-[0.15em]">Tu Próxima Aventura</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05] mb-5">
                        {reservation.custom_tour_data?.tour_name || reservation.tour_name}
                    </h1>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5">
                            <Calendar className="w-4 h-4 text-red-400" />
                            <span className="text-xs sm:text-sm font-semibold text-white/90">{formatSpanishDate(reservation.tour_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5">
                            <Clock className="w-4 h-4 text-red-400" />
                            <span className="text-xs sm:text-sm font-semibold text-white/90">
                                {formatTime(reservation.start_time)}
                                {getEndTimeFromItinerary(reservation) && (
                                    <> — {getEndTimeFromItinerary(reservation)}</>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5">
                            <Users className="w-4 h-4 text-red-400" />
                            <span className="text-xs sm:text-sm font-semibold text-white/90">{reservation.pax_count} Pasajeros</span>
                        </div>
                    </div>

                    {/* Progress bar inline */}
                    {total > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">Check-in</span>
                                <span className="text-xs font-bold text-white/70">{registered} / {total} registrados</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${progressPct}%`,
                                        background: allRegistered
                                            ? 'linear-gradient(90deg, #34d399, #10b981)'
                                            : 'linear-gradient(90deg, #f87171, #ef4444)',
                                    }}
                                />
                            </div>
                            {allRegistered && (
                                <p className="text-[10px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Todos registrados
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Content ── */}
            <main className="relative z-10 max-w-2xl mx-auto px-5 -mt-4 pb-20 space-y-5">

                {/* ── Quick Info Cards Row ── */}
                <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Agente</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{reservation.agent_name}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Estado</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${reservation.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                    <p className="text-sm font-bold text-gray-900">
                                        {reservation.status === 'paid' ? 'Pagado' : reservation.status === 'reserved' ? 'Reservado' : reservation.status === 'offered' ? 'Ofrecido' : reservation.status === 'completed' ? 'Completado' : reservation.status === 'in_progress' ? 'En Curso' : 'Pendiente'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Add to Calendar ── */}
                <AddToCalendarSection reservation={reservation} />

                {/* ── Logistics Cards ── */}
                {(reservation.boat_name || reservation.driver_name || reservation.guide_name) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up">
                        {reservation.boat_name && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Waves className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Lancha</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{reservation.boat_name}</p>
                                </div>
                            </div>
                        )}
                        {reservation.driver_name && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                    <Anchor className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Capitán</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{reservation.driver_name}</p>
                                </div>
                            </div>
                        )}
                        {reservation.guide_name && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Compass className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Guía</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{reservation.guide_name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Safety Warning ── */}
                {(reservation.boat_name || reservation.boat_id) && (
                    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex gap-3 items-start animate-fade-in-up">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-0.5">Uso Obligatorio de Chaleco</p>
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                Por tu seguridad, el chaleco salvavidas es <strong>obligatorio</strong> durante todo el traslado en lancha.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Add-ons ── */}
                {reservation.selected_addons && reservation.selected_addons.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-[0.1em]">Extras Incluidos</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {reservation.selected_addons.map((addon: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-violet-50/50 rounded-xl border border-violet-100/50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                        <span className="text-sm font-semibold text-gray-800">{addon.label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-lg">
                                        ${addon.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Payment Card ── */}
                {reservation.total_amount && (
                    <div className={`rounded-2xl shadow-sm border overflow-hidden animate-fade-in-up ${
                        reservation.status === 'paid'
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-white border-gray-100'
                    }`}>
                        <div className={`px-5 py-3.5 border-b flex items-center gap-2 ${
                            reservation.status === 'paid'
                                ? 'border-emerald-200'
                                : 'border-gray-100'
                        }`}>
                            <CreditCard className={`w-4 h-4 ${reservation.status === 'paid' ? 'text-emerald-600' : 'text-gray-500'}`} />
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-[0.1em]">Resumen de Pago</h3>
                        </div>

                        <div className="p-5">
                            {/* Breakdown rows */}
                            <div className="space-y-2.5 pb-4 mb-4 border-b border-gray-200/60">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Tour Base ({reservation.pax_count} pax x ${Number(reservation.tour_price || 0).toFixed(2)})</span>
                                    <span className="font-bold text-gray-900">${(Number(reservation.tour_price || 0) * reservation.pax_count).toFixed(2)}</span>
                                </div>
                                {reservation.selected_addons && reservation.selected_addons.length > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Extras</span>
                                        <span className="font-bold text-gray-900">
                                            ${reservation.selected_addons.reduce((acc: number, curr: any) => acc + Number(curr.price || 0), 0).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-wide">Total</span>
                                    <span className="text-xl font-black text-gray-900">${reservation.total_amount}</span>
                                </div>
                            </div>

                            {/* Payment status */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        reservation.status === 'paid'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-red-50 text-red-500'
                                    }`}>
                                        {reservation.status === 'paid' ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">
                                            {reservation.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </p>
                                        {Number(reservation.paid_amount) > 0 && reservation.status !== 'paid' && (
                                            <p className="text-xs text-gray-500">Abonado: ${reservation.paid_amount}</p>
                                        )}
                                    </div>
                                </div>

                                {reservation.payment_url && reservation.status !== 'paid' && (
                                    <a
                                        href={reservation.payment_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-sm"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Pagar Ahora
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── What's Included ── */}
                {(reservation.custom_tour_data?.includes || reservation.tour_includes) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-[0.1em]">Qué Incluye</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                {reservation.custom_tour_data?.includes || reservation.tour_includes}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Itinerary / Timeline ── */}
                {(reservation.custom_tour_data?.itinerary || reservation.tour_itinerary) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-[0.1em]">Plan del Día</h3>
                        </div>
                        <div className="p-5">
                            <div className="space-y-0 relative ml-3">
                                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-red-300 via-red-200 to-transparent" />
                                {(reservation.custom_tour_data?.itinerary || reservation.tour_itinerary).map((step: any, idx: number) => (
                                    <div key={idx} className="relative flex gap-4 pb-5 last:pb-0 group">
                                        <div className="relative z-10 mt-1.5">
                                            <div className="w-[15px] h-[15px] rounded-full bg-white border-[3px] border-red-400 group-last:border-red-200 shadow-sm" />
                                        </div>
                                        <div className="flex-1 pt-0">
                                            <span className="inline-block text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md mb-1">{step.time}</span>
                                            <p className="text-sm text-gray-800 font-semibold leading-snug">{step.activity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Route Map ── */}
                {(() => {
                    const itinerary = reservation.custom_tour_data?.itinerary || reservation.tour_itinerary;
                    if (!itinerary || !Array.isArray(itinerary) || buildRouteFromItinerary(itinerary).length < 2) return null;
                    const route = buildRouteFromItinerary(itinerary);
                    return (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-[0.1em]">Ruta del Tour</h3>
                            </div>
                            <div className="p-3">
                                <Suspense fallback={<div className="h-[260px] rounded-xl bg-gray-100 animate-pulse" />}>
                                    <TourRouteMap
                                        itinerary={itinerary}
                                        className="h-[260px] rounded-xl overflow-hidden"
                                    />
                                </Suspense>
                                <div className="mt-3 flex flex-wrap gap-2 px-1">
                                    {route.map((stop, idx) => (
                                        <div key={`${stop.name}-${idx}`} className="flex items-center gap-1 text-[11px] text-gray-500">
                                            <span
                                                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                                style={{ background: idx === 0 ? '#dc2626' : idx === route.length - 1 ? '#16a34a' : '#1d4ed8' }}
                                            >
                                                {idx + 1}
                                            </span>
                                            <span className="font-semibold">
                                                {stop.isReturn ? `${stop.name} (regreso)` : stop.name}
                                            </span>
                                            {idx < route.length - 1 && (
                                                <ChevronRight className="w-3 h-3 text-gray-300" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ── Registration Form ── */}
                <section id="passenger-form" className="scroll-mt-8">
                    {submitted ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-8 text-center animate-fade-in-up">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Registro Exitoso</h3>
                            <p className="text-sm text-gray-500 mb-8">Hemos guardado la información correctamente.</p>
                            <button
                                onClick={resetForm}
                                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all active:scale-[0.98] text-sm"
                            >
                                Registrar otro pasajero
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                        <User className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            {editingId ? 'Editar Pasajero' : 'Registro de Pasajero'}
                                        </h3>
                                        <p className="text-[11px] text-gray-400">Datos requeridos para el check-in</p>
                                    </div>
                                </div>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        aria-label="Cancelar edición"
                                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                                {formError && (
                                    <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl animate-fade-in-up">
                                        <Info className="w-4 h-4 text-red-500 shrink-0" />
                                        <p className="text-sm font-medium text-red-700 flex-1">{formError}</p>
                                        <button type="button" onClick={() => setFormError(null)} className="text-red-300 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Name */}
                                <div>
                                    <label htmlFor="pax-name" className="block text-xs font-bold text-gray-700 mb-1.5 ml-0.5">
                                        Nombre Completo <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                        <input
                                            id="pax-name"
                                            required
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-red-400 outline-none transition-all text-sm font-semibold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/10 placeholder:text-gray-300 placeholder:font-normal"
                                            placeholder="Ej. Juan Pérez"
                                            value={form.full_name}
                                            onChange={e => setForm({ ...form, full_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Age + Document */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="pax-age" className="block text-xs font-bold text-gray-700 mb-1.5 ml-0.5">Edad</label>
                                        <input
                                            id="pax-age"
                                            type="number"
                                            inputMode="numeric"
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-red-400 outline-none transition-all text-sm font-semibold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/10 placeholder:text-gray-300 placeholder:font-normal"
                                            placeholder="30"
                                            value={form.age}
                                            onChange={e => setForm({ ...form, age: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="pax-doc" className="block text-xs font-bold text-gray-700 mb-1.5 ml-0.5">DPI / Pasaporte</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                            <input
                                                id="pax-doc"
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-red-400 outline-none transition-all text-sm font-semibold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/10 placeholder:text-gray-300 placeholder:font-normal"
                                                placeholder="No. Documento"
                                                value={form.id_document}
                                                onChange={e => setForm({ ...form, id_document: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email + Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="pax-email" className="block text-xs font-bold text-gray-700 mb-1.5 ml-0.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                            <input
                                                id="pax-email"
                                                type="email"
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-red-400 outline-none transition-all text-sm font-semibold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/10 placeholder:text-gray-300 placeholder:font-normal"
                                                placeholder="correo@ejemplo.com"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="pax-phone" className="block text-xs font-bold text-gray-700 mb-1.5 ml-0.5">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                            <input
                                                id="pax-phone"
                                                type="tel"
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 focus:border-red-400 outline-none transition-all text-sm font-semibold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500/10 placeholder:text-gray-300 placeholder:font-normal"
                                                placeholder="+502 1234 5678"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Meal Preferences ── */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                                            <Utensils className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-[0.1em]">Preferencias de Comida</h4>
                                    </div>

                                    {reservation.meal_per_group ? (
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                                            <p className="text-xs font-bold text-orange-800 mb-0.5">Servicio Grupal</p>
                                            <p className="text-xs text-orange-700/80">
                                                La comida está organizada por grupo. No es necesario elegir menú individual.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {reservation.meal_options?.available_meals && reservation.meal_options.available_meals.length > 0 ? (
                                                <div className="space-y-3">
                                                    {reservation.meal_options.available_meals.map((meal: any, idx: number) => (
                                                        <div key={idx} className="p-4 bg-orange-50/40 rounded-xl border border-orange-100/60">
                                                            <label className="block text-xs font-bold text-orange-800 mb-2">
                                                                {meal.type}
                                                            </label>
                                                            <div className="space-y-2.5">
                                                                {meal.options && meal.options.length > 0 ? (
                                                                    <select
                                                                        className="w-full h-11 px-3 rounded-lg border border-orange-200 text-sm font-semibold bg-white focus:border-orange-400 outline-none focus:ring-2 focus:ring-orange-500/10"
                                                                        value={form.meals[meal.type]?.food || ''}
                                                                        onChange={e => setForm({
                                                                            ...form,
                                                                            meals: {
                                                                                ...form.meals,
                                                                                [meal.type]: { ...form.meals[meal.type], food: e.target.value }
                                                                            }
                                                                        })}
                                                                    >
                                                                        <option value="">Seleccionar menú...</option>
                                                                        {meal.options.map((opt: string) => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <input
                                                                        className="w-full h-11 px-3 rounded-lg border border-orange-200 text-sm font-semibold bg-white focus:border-orange-400 outline-none focus:ring-2 focus:ring-orange-500/10 placeholder:font-normal placeholder:text-gray-300"
                                                                        placeholder={`Selección de ${meal.type}`}
                                                                        value={form.meals[meal.type]?.food || ''}
                                                                        onChange={e => setForm({
                                                                            ...form,
                                                                            meals: {
                                                                                ...form.meals,
                                                                                [meal.type]: { ...form.meals[meal.type], food: e.target.value }
                                                                            }
                                                                        })}
                                                                    />
                                                                )}
                                                                <input
                                                                    className="w-full h-10 px-3 rounded-lg border border-orange-100 text-xs text-gray-500 bg-white/60 focus:border-orange-400 outline-none placeholder:text-gray-300"
                                                                    placeholder="Alergias o notas especiales"
                                                                    value={form.meals[meal.type]?.notes || ''}
                                                                    onChange={e => setForm({
                                                                        ...form,
                                                                        meals: {
                                                                            ...form.meals,
                                                                            [meal.type]: { ...form.meals[meal.type], notes: e.target.value }
                                                                        }
                                                                    })}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic text-center py-1">
                                                    No se requiere selección de menú para este tour.
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] text-sm ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                    ) : (
                                        <>
                                            {editingId ? 'Actualizar Información' : 'Confirmar Registro'}
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </section>

                {/* ── Passenger List ── */}
                <section className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em]">Pasajeros Registrados</h3>
                        {registered > 0 && (
                            <span className="text-xs font-bold text-red-500">{registered} confirmado{registered !== 1 ? 's' : ''}</span>
                        )}
                    </div>

                    {registered > 0 ? (
                        <div className="space-y-2.5">
                            {reservation.passengers.map((pax: any) => (
                                <div key={pax.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center group hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center text-red-600 font-black text-sm shrink-0">
                                            {pax.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{pax.full_name}</p>
                                            <p className="text-[11px] text-gray-400">
                                                {pax.age ? `${pax.age} años` : 'Pasajero'}{pax.id_document ? ` · ID: ${pax.id_document}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(pax)}
                                        aria-label={`Editar ${pax.full_name}`}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-8 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400 mb-0.5">Sin pasajeros registrados</p>
                            <p className="text-xs text-gray-300">Completa el formulario para ser el primero</p>
                        </div>
                    )}
                </section>

                {/* ── Help / Support ── */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center animate-fade-in-up">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">¿Necesitas ayuda?</h3>
                    <p className="text-xs text-gray-400 mb-5 leading-relaxed max-w-xs mx-auto">
                        Si tienes problemas con el formulario o quieres cambiar algo de última hora, contáctanos.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs hover:bg-emerald-400 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                        </a>
                        <a
                            href="tel:+50222681264"
                            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <PhoneCall className="w-4 h-4" />
                            Llamar
                        </a>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="pt-6 pb-8 text-center">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Atitlán Experiences</p>
                    <p className="text-[10px] text-gray-300 mt-1">© 2026 Lake Atitlán, Guatemala</p>
                </footer>
            </main>
        </div>
    );
}
