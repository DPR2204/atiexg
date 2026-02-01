import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { TOURS } from '../data';

const DEPOSIT_AMOUNT = 50;

const CheckoutPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tourId = searchParams.get('tour');
    const itemsParam = searchParams.get('items');

    const tour = tourId ? TOURS.find((t) => t.id === tourId) : null;
    const selectedItems = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        passengers: 1,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tourId: tour?.id || 'custom',
                    tourName: tour?.name || 'Experiencia Personalizada',
                    customerEmail: formData.email,
                    customerName: formData.name,
                    customerPhone: formData.phone,
                    passengers: formData.passengers,
                    selectedItems,
                    depositAmount: DEPOSIT_AMOUNT,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear la sesión de pago');
            }

            // Redirect to Recurrente checkout
            window.location.href = data.checkoutUrl;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar el pago');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Seo
                title="Checkout | Atitlán Experiences"
                description="Completa tu reserva con un anticipo seguro"
                canonicalPath="/checkout"
            />
            <GlassNav />

            <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <Link to="/" className="hover:text-red-500 transition-colors">Inicio</Link>
                    <span>/</span>
                    <Link to="/catalogo" className="hover:text-red-500 transition-colors">Catálogo</Link>
                    <span>/</span>
                    <span className="text-gray-900">Checkout</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Form Section */}
                    <div className="animate-fade-in-up">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Reservar con Anticipo</h1>
                        <p className="text-gray-500 mb-8">
                            Asegura tu lugar con ${DEPOSIT_AMOUNT} USD. El resto se coordina por WhatsApp.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                                    WhatsApp (opcional)
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                                    placeholder="+502 0000 0000"
                                />
                            </div>

                            <div>
                                <label htmlFor="passengers" className="block text-sm font-bold text-gray-700 mb-2">
                                    Número de pasajeros *
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, passengers: Math.max(1, formData.passengers - 1) })}
                                        className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        −
                                    </button>
                                    <input
                                        id="passengers"
                                        type="number"
                                        min="1"
                                        max="20"
                                        required
                                        value={formData.passengers}
                                        onChange={(e) => setFormData({ ...formData, passengers: Math.max(1, parseInt(e.target.value) || 1) })}
                                        className="w-20 text-center px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-lg font-bold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, passengers: Math.min(20, formData.passengers + 1) })}
                                        className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Pagar ${DEPOSIT_AMOUNT} USD de Anticipo</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                🔒 Pago seguro procesado por Recurrente
                            </p>
                        </form>
                    </div>

                    {/* Summary Section */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="glass-card rounded-3xl p-6 sm:p-8 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Resumen de Reserva</h2>

                            {tour ? (
                                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        <img
                                            src={tour.image.replace(/\/\d+\/\d+$/, '/200/200')}
                                            alt={tour.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{tour.name}</h3>
                                        <p className="text-sm text-gray-500">{tour.category}</p>
                                        <p className="text-sm font-bold text-red-500 mt-1">Desde ${tour.price}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900">Experiencia Personalizada</h3>
                                    <p className="text-sm text-gray-500">Detalles a coordinar por WhatsApp</p>
                                </div>
                            )}

                            {selectedItems.length > 0 && (
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Items seleccionados
                                    </p>
                                    <div className="space-y-2">
                                        {selectedItems.slice(0, 5).map((item: string, i: number) => (
                                            <p key={i} className="text-sm text-gray-600 truncate">• {item}</p>
                                        ))}
                                        {selectedItems.length > 5 && (
                                            <p className="text-xs text-gray-400">+{selectedItems.length - 5} más...</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Anticipo a pagar hoy</span>
                                    <span className="font-bold text-gray-900">${DEPOSIT_AMOUNT} USD</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Resto a coordinar</span>
                                    <span className="text-gray-400">Vía WhatsApp</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-green-50 rounded-xl">
                                <p className="text-xs text-green-700">
                                    <span className="font-bold">✓ Reserva asegurada</span> — Te contactaremos para confirmar detalles y coordinar el pago restante.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <GlassFooter />
        </div>
    );
};

export default CheckoutPage;
