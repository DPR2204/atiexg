
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    Loader2, User, Mail, Phone, ChevronRight, Check, Calendar, Users,
    MapPin, Clock, Info, ArrowLeft, Edit2, MessageSquare, PhoneCall,
    Anchor, Waves, Compass, CreditCard, Sparkles, Utensils, X
} from 'lucide-react';

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

    if (loading && !reservation) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-['Poppins',sans-serif]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Cargando tu experiencia...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 font-['Poppins',sans-serif]">
            <div className="glass-card p-10 rounded-[2rem] max-w-md w-full text-center animate-scale-in-smooth">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10">
                    <Info className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Oops! Enlace no válido</h1>
                <p className="text-gray-500 leading-relaxed mb-8">{error}</p>
                <div className="pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Atitlán Experiences</p>
                </div>
            </div>
        </div>
    );

    const whatsappLink = `https://wa.me/50222681264?text=${encodeURIComponent(`¡Hola! Tengo una duda sobre mi reserva para "${reservation.custom_tour_data?.tour_name || reservation.tour_name}" el día ${reservation.tour_date}.`)}`;

    return (
        <div className="min-h-screen bg-white font-['Poppins',sans-serif] text-gray-900 pb-20 selection:bg-red-500/10 transition-colors duration-500">
            {/* Immersive Header */}
            <header className="glass-nav sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-tighter uppercase leading-none">Guest Portal</h1>
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-[0.2em] mt-0.5">Atitlán Experiences</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 pt-8 space-y-8">
                {/* Hero / Trip Headline */}
                <section className="animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 mb-4">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Tu Próxima Aventura</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-[0.95] mb-4">
                        {reservation.custom_tour_data?.tour_name || reservation.tour_name}
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            <Calendar className="w-4 h-4 text-red-500" />
                            <span>{formatSpanishDate(reservation.tour_date)}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span>{formatTime(reservation.start_time)}</span>
                        </div>
                        {reservation.payment_url && reservation.status !== 'paid' && (
                            <>
                                <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />
                                <a
                                    href={reservation.payment_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-sm font-black text-red-600 hover:text-red-700 transition-colors group"
                                >
                                    <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>Pagar Ahora</span>
                                </a>
                            </>
                        )}
                    </div>
                </section>

                {/* Tour Highlights & Details */}
                <section className="glass-card rounded-[2rem] p-6 sm:p-8 animate-fade-in-up bg-gradient-to-br from-white to-red-50/30">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agente Guía</p>
                            <p className="text-sm font-bold text-gray-900">{reservation.agent_name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registro</p>
                            <p className="text-sm font-bold text-gray-900">
                                {reservation.passengers?.length || 0} <span className="text-gray-400">/</span> {reservation.pax_count} pax
                            </p>
                        </div>
                    </div>

                    {/* Add-ons Display */}
                    {reservation.selected_addons && reservation.selected_addons.length > 0 && (
                        <div className="mb-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Extras Incluidos
                            </h3>
                            <div className="space-y-2">
                                {reservation.selected_addons.map((addon: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between gap-3 text-sm font-bold p-3 bg-white/60 rounded-xl border border-blue-200/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-gray-800">{addon.label}</span>
                                        </div>
                                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-xs font-black">
                                            ${addon.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Summary / Action */}
                    {/* Price Breakdown & Payment */}
                    {reservation.total_amount && (
                        <div className={`mb-8 p-6 rounded-3xl border transition-all ${reservation.status === 'paid'
                            ? 'bg-emerald-50/50 border-emerald-100'
                            : 'bg-red-50/50 border-red-100'
                            }`}>

                            {/* Breakdown */}
                            <div className="space-y-3 border-b border-gray-200/50 pb-4 mb-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 font-medium">
                                        Tour Base ({reservation.pax_count} pax x ${Number(reservation.tour_price || 0).toFixed(2)})
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        ${(Number(reservation.tour_price || 0) * reservation.pax_count).toFixed(2)}
                                    </span>
                                </div>
                                {reservation.selected_addons && reservation.selected_addons.length > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-medium">Extras Selectos</span>
                                        <span className="font-bold text-gray-900">
                                            ${reservation.selected_addons.reduce((acc: number, curr: any) => acc + Number(curr.price || 0), 0).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs">Total</span>
                                    <span className="font-black text-xl text-gray-900">
                                        ${reservation.total_amount}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Estado del Pago</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${reservation.status === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <p className="font-black text-lg">
                                            {reservation.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                                        </p>
                                    </div>
                                    {Number(reservation.paid_amount) > 0 && (
                                        <p className="text-xs font-bold text-gray-500 mt-1">
                                            Abonado: ${reservation.paid_amount}
                                        </p>
                                    )}
                                </div>

                                {reservation.payment_url && reservation.status !== 'paid' && (
                                    <a
                                        href={reservation.payment_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full sm:w-auto px-8 h-12 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Pagar Reserva Ahora
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {(reservation.custom_tour_data?.includes || reservation.tour_includes) && (
                        <div className="mb-8 p-5 bg-white/50 rounded-2xl border border-white/80">
                            <h3 className="text-xs font-black text-red-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Check className="w-4 h-4" /> Qué incluye
                            </h3>
                            <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed italic">
                                "{reservation.custom_tour_data?.includes || reservation.tour_includes}"
                            </div>
                        </div>
                    )}

                    {/* Logistics Section */}
                    {(reservation.boat_name || reservation.driver_name || reservation.guide_name) && (
                        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {reservation.boat_name && (
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Waves className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lancha</p>
                                        <p className="text-xs font-bold text-gray-900">{reservation.boat_name}</p>
                                    </div>
                                </div>
                            )}
                            {reservation.driver_name && (
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <Anchor className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Capitán</p>
                                        <p className="text-xs font-bold text-gray-900">{reservation.driver_name}</p>
                                    </div>
                                </div>
                            )}
                            {reservation.guide_name && (
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Compass className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Guía</p>
                                        <p className="text-xs font-bold text-gray-900">{reservation.guide_name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Safety Warning - Life Vest */}
                    {(reservation.boat_name || reservation.boat_id) && (
                        <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-200 flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
                            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-yellow-800 uppercase tracking-wide mb-1">
                                    Uso Obligatorio de Chaleco
                                </h3>
                                <p className="text-xs text-yellow-700 font-medium leading-relaxed">
                                    Por tu seguridad y regulación local, el uso del chaleco salvavidas es <span className="font-black">obligatorio</span> durante todo el traslado en lancha. ¡Gracias por tu colaboración!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    {(reservation.custom_tour_data?.itinerary || reservation.tour_itinerary) && (
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Plan del Día</h3>
                            <div className="space-y-8 relative ml-4">
                                <div className="absolute left-[-17px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-red-200 via-red-100 to-transparent"></div>
                                {(reservation.custom_tour_data?.itinerary || reservation.tour_itinerary).map((step: any, idx: number) => (
                                    <div key={idx} className="relative group">
                                        <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-red-500 shadow-lg shadow-red-500/40 group-last:bg-red-300"></div>
                                        <div className="flex flex-col gap-1.5 transition-transform group-hover:translate-x-1 duration-300">
                                            <span className="text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit tracking-tighter">{step.time}</span>
                                            <p className="text-sm text-gray-900 font-bold leading-tight">{step.activity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Main Action: Registration Form */}
                <section id="passenger-form" className="scroll-mt-24">
                    {submitted ? (
                        <div className="glass-card rounded-[2.5rem] p-10 text-center animate-bounce-in bg-gradient-to-br from-emerald-50 to-white">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                                <Check className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">¡Registro Exitoso!</h3>
                            <p className="text-gray-500 mb-10 text-sm font-medium">Hemos guardado la información de tu llegada.</p>
                            <button
                                onClick={resetForm}
                                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-gray-900/10 uppercase tracking-widest text-xs"
                            >
                                Registrar otro acompañante
                            </button>
                        </div>
                    ) : (
                        <div className="glass-card rounded-[2.5rem] overflow-hidden animate-fade-in-up border-red-100 shadow-2xl shadow-red-500/5">
                            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-red-50/50 to-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">
                                        {editingId ? 'Editar información' : 'Check-in de lancha'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Completa los datos de seguridad</p>
                                </div>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        aria-label="Cancelar edición"
                                        className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {formError && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in-up">
                                        <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                                            <Info className="w-4 h-4 text-red-600" />
                                        </div>
                                        <p className="text-sm font-bold text-red-700 flex-1">{formError}</p>
                                        <button type="button" onClick={() => setFormError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="pax-name" className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Nombre Completo *</label>
                                        <input
                                            id="pax-name"
                                            required
                                            className="w-full h-14 px-5 rounded-2xl border border-gray-200 focus:border-red-500 outline-none transition-all text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 placeholder:font-medium placeholder:text-gray-300"
                                            placeholder="Ej. Juan Pérez"
                                            value={form.full_name}
                                            onChange={e => setForm({ ...form, full_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="pax-age" className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Edad</label>
                                            <input
                                                id="pax-age"
                                                type="number"
                                                inputMode="numeric"
                                                className="w-full h-14 px-5 rounded-2xl border border-gray-200 focus:border-red-500 outline-none transition-all text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 placeholder:font-medium"
                                                placeholder="30"
                                                value={form.age}
                                                onChange={e => setForm({ ...form, age: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="pax-doc" className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">DPI / Pasaporte</label>
                                            <input
                                                id="pax-doc"
                                                className="w-full h-14 px-5 rounded-2xl border border-gray-200 focus:border-red-500 outline-none transition-all text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 placeholder:font-medium"
                                                placeholder="No. Documento"
                                                value={form.id_document}
                                                onChange={e => setForm({ ...form, id_document: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="pax-email" className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Email</label>
                                            <input
                                                id="pax-email"
                                                type="email"
                                                className="w-full h-14 px-5 rounded-2xl border border-gray-200 focus:border-red-500 outline-none transition-all text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 placeholder:font-medium"
                                                placeholder="correo@ejemplo.com"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="pax-phone" className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Teléfono</label>
                                            <input
                                                id="pax-phone"
                                                type="tel"
                                                className="w-full h-14 px-5 rounded-2xl border border-gray-200 focus:border-red-500 outline-none transition-all text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-red-500/5 placeholder:font-medium"
                                                placeholder="+502"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Food Preferences Section */}
                                <div className="pt-8 border-t border-gray-100">
                                    <h4 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">🍽️</div>
                                        Preferencias
                                    </h4>

                                    <div className="space-y-6">
                                        <div className="space-y-6">
                                            {reservation.meal_per_group ? (
                                                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 text-center">
                                                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                        <Utensils className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-xs font-black text-orange-800 uppercase tracking-widest mb-1">Servicio de Comida Grupal</p>
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        La comida/bebida para este tour está organizada por grupo (ej. botella de vino, snacks compartidos). No es necesario elegir menú individual.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {reservation.meal_options?.available_meals && reservation.meal_options.available_meals.length > 0 ? (
                                                        reservation.meal_options.available_meals.map((meal: any, idx: number) => (
                                                            <div key={idx} className="space-y-3 p-5 bg-orange-50/30 rounded-3xl border border-orange-100/50">
                                                                <label className="block text-[11px] font-black text-orange-800 uppercase tracking-[0.1em]">
                                                                    {meal.type}
                                                                </label>
                                                                <div className="space-y-3">
                                                                    {meal.options && meal.options.length > 0 ? (
                                                                        <select
                                                                            className="w-full h-12 px-4 rounded-xl border border-orange-200 text-sm font-bold bg-white focus:border-orange-500 outline-none"
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
                                                                            className="w-full h-12 px-4 rounded-xl border border-orange-200 text-sm font-bold bg-white focus:border-orange-500 outline-none placeholder:font-medium"
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
                                                                        className="w-full h-10 px-4 rounded-xl border border-orange-100 text-xs font-medium text-gray-500 bg-white/50 focus:border-orange-500 outline-none"
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
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400 font-medium italic text-center py-2">
                                                            No se requiere selección de menú para este tour.
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full h-16 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black rounded-2xl shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-xs ${loading ? 'opacity-70 grayscale' : ''}`}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? 'Actualizar mi información' : 'Confirmar Registro'}
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    )}
                </section>

                {/* Guest List Section */}
                <section className="animate-fade-in-up delay-[200ms]">
                    {/* Progress bar */}
                    {reservation.pax_count > 0 && (
                        <div className="mb-6 px-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Progreso de registro</span>
                                <span className="text-xs font-black text-gray-900">
                                    {reservation.passengers?.length || 0} <span className="text-gray-400">de</span> {reservation.pax_count}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${Math.min(((reservation.passengers?.length || 0) / reservation.pax_count) * 100, 100)}%`,
                                        background: (reservation.passengers?.length || 0) >= reservation.pax_count
                                            ? 'linear-gradient(90deg, #10b981, #059669)'
                                            : 'linear-gradient(90deg, #ef4444, #f97316)',
                                    }}
                                />
                            </div>
                            {(reservation.passengers?.length || 0) >= reservation.pax_count && (
                                <p className="text-[10px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Todos los pasajeros registrados
                                </p>
                            )}
                        </div>
                    )}

                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center justify-between px-2">
                        <span>Pasajeros en lista</span>
                        {reservation.passengers && reservation.passengers.length > 0 && (
                            <span className="text-red-500 font-black">{reservation.passengers.length} Confirmados</span>
                        )}
                    </h3>

                    {reservation.passengers && reservation.passengers.length > 0 ? (
                        <div className="grid gap-3">
                            {reservation.passengers.map((pax: any) => (
                                <div key={pax.id} className="glass-card hover:border-red-200 transition-all p-5 rounded-3xl flex justify-between items-center group active:scale-[0.98]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-black text-sm">
                                            {pax.full_name.charAt(0)}
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-black text-gray-900">{pax.full_name}</div>
                                            <div className="text-[11px] font-bold text-gray-400">
                                                {pax.age ? `${pax.age} años` : 'Pax'} {pax.id_document ? ` • ID: ${pax.id_document}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(pax)}
                                        aria-label={`Editar ${pax.full_name}`}
                                        className="h-10 w-10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-3xl p-8 text-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-400 mb-1">Aún no hay pasajeros registrados</p>
                            <p className="text-xs text-gray-300 font-medium">Completa el formulario arriba para ser el primero</p>
                        </div>
                    )}
                </section>

                {/* Custom Help / Reach Us Section */}
                <section className="glass-card rounded-[2.5rem] p-8 sm:p-10 text-center bg-gradient-to-br from-red-50/50 to-orange-50/50 animate-fade-in-up delay-[300ms]">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">¿Necesitas ayuda con tu check-in?</h3>
                    <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                        Si tienes problemas con el formulario o quieres cambiar algo de última hora, escríbenos.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-3 bg-green-500 text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-green-400 transition-all shadow-lg shadow-green-500/20"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                        </a>
                        <a
                            href="tel:+50222681264"
                            className="flex items-center justify-center gap-3 bg-gray-900 text-white h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                        >
                            <PhoneCall className="w-5 h-5" />
                            Llamar
                        </a>
                    </div>
                </section>

                {/* Global Footer Minimal */}
                <footer className="pt-8 pb-12 text-center border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Atitlán Experiences Premium</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2">© 2026 Lake Atitlán, Guatemala</p>
                </footer>
            </main>
        </div>
    );
}
