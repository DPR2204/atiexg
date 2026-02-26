import React, { useState } from 'react';

interface MealItem {
    type: string;
    options: string[];
}

interface QuickMenuEditorProps {
    initialMenu: MealItem[];
    onSave: (menu: MealItem[]) => void;
}

const QuickMenuEditor: React.FC<QuickMenuEditorProps> = ({ initialMenu, onSave }) => {
    const [menu, setMenu] = useState<MealItem[]>(
        () => initialMenu.map(m => ({ type: m.type, options: [...m.options] }))
    );

    const updateType = (idx: number, value: string) => {
        setMenu(prev => prev.map((m, i) => i === idx ? { ...m, type: value } : m));
    };

    const updateOptions = (idx: number, value: string) => {
        setMenu(prev => prev.map((m, i) => i === idx ? { ...m, options: value.split(',') } : m));
    };

    const removeItem = (idx: number) => {
        setMenu(prev => prev.filter((_, i) => i !== idx));
    };

    const addItem = () => {
        setMenu(prev => [...prev, { type: '', options: [] }]);
    };

    const handleSave = () => {
        const cleaned = menu.map(meal => ({
            ...meal,
            options: meal.options.map(s => s.trim()).filter(Boolean)
        }));
        onSave(cleaned);
    };

    return (
        <div className="bg-white max-w-3xl">
            <h4 className="font-bold mb-1 text-gray-900">Configuración de Menú</h4>
            <p className="text-sm text-gray-500 mb-6">Define las opciones que verán los invitados al hacer check-in.</p>

            <div className="space-y-3 mb-6">
                {menu.map((meal, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                            <input
                                className="w-1/3 px-2 py-1 border-b border-gray-300 font-medium text-sm focus:border-blue-500 outline-none placeholder-gray-400"
                                placeholder="Tipo de Comida (ej. Almuerzo)"
                                value={meal.type}
                                onChange={e => updateType(idx, e.target.value)}
                            />
                            <input
                                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="Opciones (ej. Pollo, Carne, Vegetariano)"
                                value={meal.options.join(', ')}
                                onChange={e => updateOptions(idx, e.target.value)}
                            />
                        </div>
                        <button className="text-gray-400 hover:text-red-500 p-1" onClick={() => removeItem(idx)}>✕</button>
                    </div>
                ))}
            </div>

            <button
                className="px-4 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors w-full text-center mb-6"
                onClick={addItem}
            >
                + Agregar Tiempo de Comida
            </button>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                    onClick={handleSave}
                >
                    Guardar Configuración
                </button>
            </div>
        </div>
    );
};

export default QuickMenuEditor;
