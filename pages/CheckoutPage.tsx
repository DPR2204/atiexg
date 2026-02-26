import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { GlassNav, GlassFooter, LoadingSpinner } from '../components/shared';
import { Calendar, CreditCard, Shield, Clock, Info } from 'lucide-react';
import { useTours } from '../hooks/useTours';
import { getCloudinaryUrl } from '../src/utils/cloudinary';
import { useLanguage } from '../contexts/LanguageContext';
import { L } from '../lib/localize';

export default function CheckoutPage() {
    const { t, language } = useLanguage();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tourId = Number(searchParams.get('tour') || 0);
    const { tours, loading: toursLoading } = useTours();

    const tour = tourId ? tours.find((t) => t.id === tourId) : null;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '08:00',
        pax: 1,
        notes: ''
    });

    useEffect(() => {
        if (!toursLoading && !tour) {
            // Optional: Redirect to catalog if tour not found, or show error
        }
    }, [tour, toursLoading]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!tour) return;

        try {
            // 1. Create pending reservation in Supabase
            const { data: reservation, error: resError } = await supabase
                .from('reservations')
                .insert([
                    {
                        tour_id: tour.id,
                        tour_name: tour.name,
                        tour_date: form.date,
                        start_time: form.time,
                        pax_count: form.pax,
                        total_amount: tour.price * form.pax,
                        deposit_amount: 50,
                        status: 'offered',
                        notes: `Checkout Web | ${form.name} | ${form.email} | Tel: ${form.phone}${form.notes ? ' | ' + form.notes : ''}`,
                    }
                ])
                .select()
                .single();

            if (resError) throw resError;

            // 2. Generate Recurrente Checkout Link (Server-side desirable, but here client-side for now via our API)
            // CALLING OUR API ROUTE
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: tour.id.toString(),
                    tourName: tour.name,
                    customerEmail: form.email,
                    customerName: form.name,
                    depositAmount: 50, // Fixed deposit
                    selectedItems: [`Reserva: ${tour.name}`]
                })
            });

            const data = await res.json();

            if (data.success) {
                // Update reservation with payment ID/Link
                await supabase.from('reservations').update({
                    payment_id: data.checkoutId,
                    payment_url: data.checkoutUrl
                }).eq('id', reservation.id);

                // Redirect user to Recurrente
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error(data.error || (language === 'en' ? 'Error generating payment' : 'Error al generar pago'));
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || (language === 'en' ? 'Error processing reservation. Try again or contact us.' : 'Error al procesar la reserva. Intenta de nuevo o contáctanos.'));
        } finally {
            setLoading(false);
        }
    }

    if (toursLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><LoadingSpinner /></div>;

    if (!tour) return (
        <div className="min-h-screen bg-white">
            <GlassNav />
            <div className="max-w-md mx-auto mt-20 p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">{t('tour.notFoundTitle')}</h2>
                <button onClick={() => navigate('/catalogo')} className="text-red-500 hover:underline">{t('tour.backToCatalog')}</button>
            </div>
            <GlassFooter />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            <GlassNav />

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-[1fr_400px] gap-12">

                    {/* Left Column - Form */}
                    <div className="space-y-8 animate-fade-in-up">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">{language === 'en' ? 'Complete Reservation' : 'Finalizar Reserva'}</h1>
                            <p className="text-gray-500">{language === 'en' ? 'Fill in your details to secure your date.' : 'Completa tus datos para asegurar tu fecha.'}</p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">1</span>
                                {language === 'en' ? 'Experience Details' : 'Detalles de la Experiencia'}
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label htmlFor="checkout-date" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{language === 'en' ? 'Date' : 'Fecha'}</label>
                                    <input
                                        id="checkout-date"
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkout-time" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{language === 'en' ? 'Start Time' : 'Hora de Inicio'}</label>
                                    <select
                                        id="checkout-time"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium appearance-none"
                                        value={form.time}
                                        onChange={e => setForm({ ...form, time: e.target.value })}
                                    >
                                        <option value="05:00">05:00 AM</option>
                                        <option value="06:00">06:00 AM</option>
                                        <option value="07:00">07:00 AM</option>
                                        <option value="08:00">08:00 AM</option>
                                        <option value="09:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="13:00">01:00 PM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="16:00">04:00 PM</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="checkout-pax" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{language === 'en' ? 'People' : 'Personas'}</label>
                                    <input
                                        id="checkout-pax"
                                        type="number"
                                        min="1"
                                        max="15"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                        value={form.pax}
                                        onChange={e => setForm({ ...form, pax: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pt-6 border-t border-gray-100">
                                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">2</span>
                                {language === 'en' ? 'Your Details' : 'Tus Datos'}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="checkout-name" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{t('contact.fieldName')}</label>
                                    <input
                                        id="checkout-name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        placeholder={language === 'en' ? 'Your name' : 'Tu nombre'}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="checkout-email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{t('contact.fieldEmail')}</label>
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder={language === 'en' ? 'your@email.com' : 'tucorreo@ejemplo.com'}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-phone" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{language === 'en' ? 'WhatsApp / Phone' : 'WhatsApp / Telefono'}</label>
                                        <input
                                            id="checkout-phone"
                                            type="tel"
                                            required
                                            autoComplete="tel"
                                            placeholder="+502 0000 0000"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="checkout-notes" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{language === 'en' ? 'Special Notes (Optional)' : 'Notas Especiales (Opcional)'}</label>
                                    <textarea
                                        id="checkout-notes"
                                        rows={3}
                                        placeholder={language === 'en' ? 'Allergies, restrictions, special occasions...' : 'Alergias, restricciones, ocasiones especiales...'}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:sticky lg:top-32 h-fit space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                            <div className="flex gap-4 mb-6">
                                <img
                                    src={getCloudinaryUrl(tour.image, { width: 160, height: 160 })}
                                    alt={tour.name}
                                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{L(tour, 'name', language)}</h3>
                                    <p className="text-xs text-gray-500">{tour.duration}</p>
                                </div>
                            </div>

                            <div className="space-y-3 py-6 border-t border-b border-gray-100 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{language === 'en' ? 'Base experience' : 'Experiencia base'}</span>
                                    <span className="font-medium">${tour.price} x {form.pax}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 pt-2">
                                    <span>{language === 'en' ? 'Estimated Total' : 'Total Estimado'}</span>
                                    <span>${tour.price * form.pax}</span>
                                </div>
                            </div>

                            <div className="mt-6 mb-8 bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-blue-900">{language === 'en' ? 'Deposit to pay today' : 'Anticipo a pagar hoy'}</span>
                                    <span className="text-xl font-black text-blue-600">$50.00</span>
                                </div>
                                <p className="text-xs text-blue-600/80">
                                    {language === 'en' ? 'The remaining balance is paid on the day of the tour or via transfer.' : 'El saldo restante se paga el dia del tour o via transfer.'}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>{language === 'en' ? 'Processing...' : 'Procesando...'}</>
                                ) : (
                                    <>
                                        {language === 'en' ? 'Pay Deposit - Card' : 'Pagar Anticipo - Tarjeta'}
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex justify-center gap-3 opacity-50">
                                <CreditCard className="w-6 h-6" />
                                <Shield className="w-6 h-6" />
                            </div>
                            <p className="text-center text-[10px] text-gray-400 mt-2">
                                {language === 'en' ? 'Secure encrypted payments via Recurrente.' : 'Pagos seguros encriptados via Recurrente.'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <GlassFooter />
        </div>
    );
}
