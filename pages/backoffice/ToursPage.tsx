import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tour, ItineraryStep } from '../../types/shared';
import { Plus, Pencil, Trash2, X, Check, ArrowLeft } from 'lucide-react';

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTour, setEditingTour] = useState<Partial<Tour> | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<Tour>>({});
    const [itinerarySteps, setItinerarySteps] = useState<ItineraryStep[]>([]);

    useEffect(() => {
        fetchTours();
    }, []);

    async function fetchTours() {
        setLoading(true);
        const { data, error } = await supabase
            .from('tours')
            .select('*')
            .order('id', { ascending: true });

        if (data) setTours(data);
        setLoading(false);
    }

    function handleEdit(tour: Tour) {
        setEditingTour(tour);
        setFormData(tour);
        setItinerarySteps(tour.itinerary || []);
        setShowModal(true);
    }

    function handleCreate() {
        setEditingTour(null);
        setFormData({
            category: 'Signature',
            rating: 5.0,
            reviews: 0,
            isNew: false,
            isBestSeller: false,
            gallery: [],
            features: [],
            meals: [],
            prices: [],
            addons: []
        });
        setItinerarySteps([]);
        setShowModal(true);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this tour?')) return;

        const { error } = await supabase.from('tours').delete().eq('id', id);
        if (error) alert('Error deleting tour');
        else fetchTours();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            ...formData,
            itinerary: itinerarySteps,
            // Ensure numeric price
            price: Number(formData.price)
        };

        let error;
        if (editingTour?.id) {
            const res = await supabase.from('tours').update(payload).eq('id', editingTour.id);
            error = res.error;
        } else {
            const res = await supabase.from('tours').insert([payload]);
            error = res.error;
        }

        if (error) {
            alert('Error saving tour: ' + error.message);
        } else {
            setShowModal(false);
            fetchTours();
        }
    }

    // Helper for itinerary
    function updateStep(index: number, field: keyof ItineraryStep, value: string) {
        const newSteps = [...itinerarySteps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setItinerarySteps(newSteps);
    }

    function addStep() {
        setItinerarySteps([...itinerarySteps, { time: '', activity: '' }]);
    }

    function removeStep(index: number) {
        setItinerarySteps(itinerarySteps.filter((_, i) => i !== index));
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando tours...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Tours</h1>
                    <p className="text-gray-500">Administra el catálogo de experiencias</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} /> Nuevo Tour
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tour</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duración</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tours.map(tour => (
                            <tr key={tour.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{tour.name}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{tour.concept}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        {tour.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-medium">${tour.price}</td>
                                <td className="px-6 py-4 text-gray-500">{tour.duration}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(tour)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tour.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">{editingTour ? 'Editar Tour' : 'Nuevo Tour'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Categoría</label>
                                    <select
                                        value={formData.category || 'Signature'}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Signature">Signature</option>
                                        <option value="Lago & Momentos">Lago & Momentos</option>
                                        <option value="Cultura & Pueblos">Cultura & Pueblos</option>
                                        <option value="Sabores del Lago">Sabores del Lago</option>
                                        <option value="Días de Campo">Días de Campo</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Precio Base ($USD)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price || ''}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Duración</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 6-7 h"
                                        value={formData.duration || ''}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Concepto (Subtítulo)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.concept || ''}
                                    onChange={e => setFormData({ ...formData, concept: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Incluye</label>
                                <textarea
                                    rows={3}
                                    value={formData.includes || ''}
                                    onChange={e => setFormData({ ...formData, includes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                                />
                            </div>

                            {/* Itinerary Builder */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Itinerario</label>
                                    <button
                                        type="button"
                                        onClick={addStep}
                                        className="text-xs text-blue-600 font-medium hover:text-blue-800"
                                    >
                                        + Agregar Paso
                                    </button>
                                </div>
                                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    {itinerarySteps.length === 0 && <p className="text-sm text-gray-400 text-center italic">Sin itinerario definido</p>}
                                    {itinerarySteps.map((step, idx) => (
                                        <div key={idx} className="flex gap-3 items-start group">
                                            <input
                                                type="text"
                                                placeholder="Hora"
                                                className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                value={step.time}
                                                onChange={e => updateStep(idx, 'time', e.target.value)}
                                            />
                                            <textarea
                                                rows={1}
                                                placeholder="Actividad"
                                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm resize-none overflow-hidden"
                                                value={step.activity}
                                                onChange={e => updateStep(idx, 'activity', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeStep(idx)}
                                                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Advanced Fields (collapsed or simplified) */}
                            <div className="pt-4 border-t border-gray-100">
                                <details>
                                    <summary className="text-sm font-medium text-gray-600 cursor-pointer mb-2">Avanzado (Features, Images)</summary>
                                    <div className="space-y-4 pl-4 border-l-2 border-gray-100 mt-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Features (separado por comas)</label>
                                            <input
                                                type="text"
                                                value={formData.features ? formData.features.join(', ') : ''}
                                                onChange={e => setFormData({ ...formData, features: e.target.value.split(',').map(s => s.trim()) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Cloudinary Image ID</label>
                                            <input
                                                type="text"
                                                value={formData.image || ''}
                                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
