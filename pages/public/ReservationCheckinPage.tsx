
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, User, Mail, Phone, ChevronRight, Check } from 'lucide-react';
import { MEAL_TYPE_LABELS } from '../../types/backoffice';

export default function ReservationCheckinPage() {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [reservation, setReservation] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

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
        // Use RPC to bypass RLS securely
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

        // Use RPC to insert passenger and meals transactionally
        const { data: result, error: rpcError } = await supabase.rpc('register_public_passenger', {
            p_token: token,
            p_full_name: form.full_name,
            p_age: form.age ? Number(form.age) : null,
            p_id_document: form.id_document || null,
            p_email: form.email || null,
            p_phone: form.phone || null,
            p_meals: form.meals,
            p_passenger_id: editingId // Pass ID for updates
        });

        if (rpcError) {
            alert('Error al guardar: ' + (rpcError?.message || 'Unknown'));
            setLoading(false);
            return;
        }

        setSubmitted(true);
        setLoading(false);
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
        setSubmitted(false);
        setEditingId(null);
        fetchReservation(); // Refresh list to update count
    }

    function handleEdit(pax: any) {
        setEditingId(pax.id);

        // Map meals array to object
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (loading && !reservation) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h1 className="text-xl font-bold mb-2">Enlace Inválido</h1>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    );

    const MEAL_OPTIONS = ['desayuno', 'almuerzo', 'cena', 'snack'];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-blue-900">Check-in de Pasajeros</h1>
                        <p className="text-xs text-gray-500">Atitlán Experiences Premium</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Trip Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{reservation.tour_name}</h2>
                            <p className="text-blue-600 font-medium">{reservation.tour_date}</p>
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            {reservation.status === 'confirmed' || reservation.status === 'paid' ? 'CONFIRMADO' : 'PENDIENTE'}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>👤 Agente: {reservation.agent_name}</p>
                        <p>👥 Pasajeros registrados: <strong>{reservation.passengers?.length || 0}</strong> / {reservation.pax_count}</p>
                    </div>
                </div>

                {submitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-800 mb-2">¡Registro Exitoso!</h3>
                        <p className="text-green-700 mb-6">La información del pasajero ha sido guardada correctamente.</p>
                        <button
                            onClick={resetForm}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-full transition-all transform hover:scale-[1.02] shadow-lg"
                        >
                            Registrar Otro Pasajero
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <div className="border-b pb-4 mb-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                {editingId ? 'Editar Pasajero' : 'Registrar Pasajero'}
                            </h3>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Cancelar Edición
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ej. Juan Pérez"
                                    value={form.full_name}
                                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ej. 30"
                                        value={form.age}
                                        onChange={e => setForm({ ...form, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DPI / Pasaporte</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Documento ID"
                                        value={form.id_document}
                                        onChange={e => setForm({ ...form, id_document: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Contacto (Opcional)</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="correo@ejemplo.com"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="+502 1234 5678"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    🍽️ Preferencias Alimenticias
                                </h3>

                                <div className="space-y-6">
                                    {/* Dynamic Menu Logic */}
                                    {reservation.meal_options?.available_meals && reservation.meal_options.available_meals.length > 0 ? (
                                        reservation.meal_options.available_meals.map((meal: any, idx: number) => (
                                            <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex flex-col gap-2">
                                                    <label className="block text-sm font-bold text-gray-900 capitalize flex items-center gap-2">
                                                        {meal.type}
                                                    </label>
                                                    <div className="space-y-3">
                                                        {meal.options && meal.options.length > 0 ? (
                                                            <select
                                                                className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                                                value={form.meals[meal.type]?.food || ''}
                                                                onChange={e => setForm({
                                                                    ...form,
                                                                    meals: {
                                                                        ...form.meals,
                                                                        [meal.type]: { ...form.meals[meal.type], food: e.target.value }
                                                                    }
                                                                })}
                                                            >
                                                                <option value="">Seleccionar opción...</option>
                                                                {meal.options.map((opt: string) => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                                placeholder={`Opción de ${meal.type} (ej. preferencia)`}
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
                                                            className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-4 italic">
                                            No se requiere selección de menú para este tour.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>{editingId ? 'Actualizar Pasajero' : 'Guardar Pasajero'} <ChevronRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                )}

                {/* Guest List */}
                {reservation.passengers && reservation.passengers.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Pasajeros Registrados ({reservation.passengers.length})</h3>
                        <div className="space-y-3">
                            {reservation.passengers.map((pax: any) => (
                                <div key={pax.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <div className="font-medium text-gray-900">{pax.full_name}</div>
                                        <div className="text-xs text-gray-500">
                                            {pax.age ? `${pax.age} años` : ''}
                                            {pax.id_document ? ` • ID: ${pax.id_document}` : ''}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(pax)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
