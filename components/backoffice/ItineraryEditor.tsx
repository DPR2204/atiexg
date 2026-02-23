import React, { useState, useEffect } from 'react';
import type { ItineraryStep, CustomTourData, Tour } from '../../types/shared';

interface ItineraryEditorProps {
    /** Initial data to populate the form (from custom_tour_data or tour defaults) */
    initialData: CustomTourData;
    /** The original tour for "Restaurar Original" */
    originalTour?: Tour | null;
    /** Default tour name shown as placeholder */
    defaultTourName: string;
    /** Called when user clicks "Guardar Cambios" */
    onSave: (data: CustomTourData) => void;
}

/**
 * Self-contained itinerary editor with local state.
 * Wrapped in React.memo so parent re-renders don't affect typing performance.
 */
const ItineraryEditor = React.memo(function ItineraryEditor({
    initialData,
    originalTour,
    defaultTourName,
    onSave,
}: ItineraryEditorProps) {
    const [formData, setFormData] = useState<CustomTourData>({
        tour_name: initialData.tour_name || '',
        includes: initialData.includes || '',
        itinerary: initialData.itinerary || [],
    });

    // Sync when the parent switches to a different reservation
    useEffect(() => {
        setFormData({
            tour_name: initialData.tour_name || '',
            includes: initialData.includes || '',
            itinerary: initialData.itinerary || [],
        });
    }, [initialData]);

    function updateStep(index: number, field: keyof ItineraryStep, value: string) {
        setFormData(prev => {
            const newItinerary = [...(prev.itinerary || [])];
            newItinerary[index] = { ...newItinerary[index], [field]: value };
            return { ...prev, itinerary: newItinerary };
        });
    }

    function removeStep(index: number) {
        setFormData(prev => ({
            ...prev,
            itinerary: (prev.itinerary || []).filter((_, i) => i !== index),
        }));
    }

    function addStep() {
        setFormData(prev => ({
            ...prev,
            itinerary: [...(prev.itinerary || []), { time: '', activity: '' }],
        }));
    }

    function restoreOriginal() {
        if (originalTour) {
            setFormData({
                tour_name: originalTour.name,
                includes: originalTour.includes || '',
                itinerary: originalTour.itinerary || [],
            });
        }
    }

    return (
        <div className="bg-white max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-gray-900">Personalizar Itinerario</h4>
                <button
                    className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                    onClick={restoreOriginal}
                >
                    Restaurar Original
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tour (Vista Cliente)</label>
                <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                    value={formData.tour_name || ''}
                    onChange={e => setFormData(prev => ({ ...prev, tour_name: e.target.value }))}
                    placeholder={defaultTourName}
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Qué Incluye</label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                    rows={4}
                    value={formData.includes || ''}
                    onChange={e => setFormData(prev => ({ ...prev, includes: e.target.value }))}
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Itinerario</label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {formData.itinerary?.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-center group">
                            <input
                                className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none"
                                value={step.time}
                                onChange={e => updateStep(idx, 'time', e.target.value)}
                                placeholder="Hora"
                            />
                            <input
                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none"
                                value={step.activity}
                                onChange={e => updateStep(idx, 'activity', e.target.value)}
                                placeholder="Actividad"
                            />
                            <button
                                className="text-gray-400 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeStep(idx)}
                            >
                                <span className="sr-only">Eliminar</span>
                                🗑️
                            </button>
                        </div>
                    ))}
                    <button
                        className="text-sm text-blue-600 font-medium hover:text-blue-800 mt-2"
                        onClick={addStep}
                    >
                        + Agregar Paso
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                    onClick={() => onSave(formData)}
                >
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
});

export default ItineraryEditor;
