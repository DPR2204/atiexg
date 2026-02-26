import React, { useState } from 'react';

interface MealItem {
    type: string;
    options: string[];
}

interface MealDraft {
    type: string;
    optionsRaw: string; // plain string during editing, split only on save
}

interface QuickMenuEditorProps {
    initialMenu: MealItem[];
    onSave: (menu: MealItem[]) => void;
}

const MEAL_ICONS: Record<string, string> = {
    desayuno: '🌅', almuerzo: '🍽️', cena: '🌙', coffee_break: '☕',
    snacks: '🧃', picnic: '🧺',
};

function guessIcon(type: string): string {
    const lower = type.toLowerCase();
    for (const [key, icon] of Object.entries(MEAL_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    if (lower.includes('breakfast')) return '🌅';
    if (lower.includes('lunch')) return '🍽️';
    if (lower.includes('dinner')) return '🌙';
    if (lower.includes('coffee')) return '☕';
    return '🍴';
}

const QuickMenuEditor: React.FC<QuickMenuEditorProps> = ({ initialMenu, onSave }) => {
    const [meals, setMeals] = useState<MealDraft[]>(
        () => initialMenu.map(m => ({
            type: m.type,
            optionsRaw: m.options.join(', '),
        }))
    );
    const [saving, setSaving] = useState(false);

    const updateType = (idx: number, value: string) => {
        setMeals(prev => prev.map((m, i) => i === idx ? { ...m, type: value } : m));
    };

    const updateOptions = (idx: number, value: string) => {
        setMeals(prev => prev.map((m, i) => i === idx ? { ...m, optionsRaw: value } : m));
    };

    const removeItem = (idx: number) => {
        setMeals(prev => prev.filter((_, i) => i !== idx));
    };

    const addItem = () => {
        setMeals(prev => [...prev, { type: '', optionsRaw: '' }]);
    };

    const handleSave = () => {
        setSaving(true);
        const cleaned: MealItem[] = meals
            .filter(m => m.type.trim())
            .map(m => ({
                type: m.type.trim(),
                options: m.optionsRaw.split(',').map(s => s.trim()).filter(Boolean),
            }));
        onSave(cleaned);
        setTimeout(() => setSaving(false), 1000);
    };

    const optionCount = (raw: string) => raw.split(',').map(s => s.trim()).filter(Boolean).length;

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="font-bold text-gray-900">Configuración de Menú</h4>
                    <p className="text-sm text-gray-500 mt-1">Define las opciones que verán los invitados al hacer check-in.</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {meals.length} {meals.length === 1 ? 'tiempo' : 'tiempos'}
                </span>
            </div>

            <div className="space-y-3 mb-6">
                {meals.map((meal, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                    >
                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="text-lg">{guessIcon(meal.type)}</span>
                            <input
                                className="flex-1 font-semibold text-sm text-gray-900 bg-transparent border-none outline-none placeholder-gray-300"
                                placeholder="Tipo de comida (ej. Almuerzo)"
                                value={meal.type}
                                onChange={e => updateType(idx, e.target.value)}
                            />
                            <button
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                onClick={() => removeItem(idx)}
                                title="Eliminar"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-4 pb-3">
                            <div className="relative">
                                <input
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="Opciones separadas por coma (ej. Pollo, Carne, Vegetariano)"
                                    value={meal.optionsRaw}
                                    onChange={e => updateOptions(idx, e.target.value)}
                                />
                                {meal.optionsRaw && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">
                                        {optionCount(meal.optionsRaw)} {optionCount(meal.optionsRaw) === 1 ? 'opción' : 'opciones'}
                                    </span>
                                )}
                            </div>
                            {meal.optionsRaw && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {meal.optionsRaw.split(',').map(s => s.trim()).filter(Boolean).map((opt, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md">
                                            {opt}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {meals.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <span className="text-2xl block mb-2">🍽️</span>
                        <p className="text-sm">No hay tiempos de comida configurados</p>
                    </div>
                )}
            </div>

            <button
                className="w-full px-4 py-2.5 text-sm border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all mb-6"
                onClick={addItem}
            >
                + Agregar Tiempo de Comida
            </button>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-black transition-colors disabled:opacity-50"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>
        </div>
    );
};

export default QuickMenuEditor;
