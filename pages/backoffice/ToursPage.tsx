import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { invalidateToursCache } from '../../hooks/useTours';
import { Tour, ItineraryStep, TourPrice, Addon } from '../../types/shared';
import { tourFormToDbPayload, validateTourPayload, dbRowToTour } from '../../lib/tour-mapper';
import { Plus, Pencil, Trash2, X, Check, Image as ImageIcon, DollarSign, MapPin, List, Settings, Save, Search } from 'lucide-react';
import { getCloudinaryUrl } from '../../src/utils/cloudinary';
import cloudinaryAssets from '../../src/data/cloudinary-assets.json';

type Tab = 'general' | 'media' | 'prices' | 'logistics' | 'features';

interface CloudinaryAsset {
    public_id: string;
    display_name: string;
    width: number;
    height: number;
    format: string;
    created_at: string;
    url: string;
    resource_type?: string;
}

const VIDEO_FORMATS = ['mp4', 'mov', 'webm', 'avi', 'mkv'];
const isVideoAsset = (asset: CloudinaryAsset) => VIDEO_FORMATS.includes(asset.format);
const isVideoGalleryItem = (item: string) => item.startsWith('video:');
const getGalleryPublicId = (item: string) => isVideoGalleryItem(item) ? item.slice(6) : item;

function getAssetThumbnailUrl(asset: CloudinaryAsset, width: number, height: number): string {
    if (isVideoAsset(asset)) {
        return getCloudinaryUrl(asset.public_id, { width, height, crop: 'fill', quality: 'auto:low', format: 'jpg', resourceType: 'video' });
    }
    return getCloudinaryUrl(asset.public_id, { width, height, crop: 'fill', quality: 'auto:low' });
}

function getGalleryItemThumbnailUrl(publicId: string, width: number, height: number, assetsMap: Map<string, CloudinaryAsset>): string {
    const cleanId = getGalleryPublicId(publicId);
    if (isVideoGalleryItem(publicId)) {
        return getCloudinaryUrl(cleanId, { width, height, crop: 'fill', format: 'jpg', resourceType: 'video' });
    }
    const asset = assetsMap.get(cleanId);
    if (asset && isVideoAsset(asset)) {
        return getCloudinaryUrl(cleanId, { width, height, crop: 'fill', format: 'jpg', resourceType: 'video' });
    }
    return getCloudinaryUrl(cleanId, { width, height, crop: 'fill' });
}

const DEFAULT_CATEGORIES = ['Signature', 'Lago & Momentos', 'Cultura & Pueblos', 'Sabores del Lago', 'Días de Campo'];
const MEAL_TYPES = ['desayuno', 'almuerzo', 'cena', 'snacks', 'coffee_break', 'picnic'] as const;

// ==========================================
// Form Reducer
// ==========================================

interface TourFormState {
    general: Partial<Tour>;
    itinerary: ItineraryStep[];
    prices: TourPrice[];
    addons: Addon[];
    gallery: string[];
    meals: string[];
    features: string[];
    meta: { isDirty: boolean; saving: boolean };
}

type FormAction =
    | { type: 'LOAD_TOUR'; tour: any }
    | { type: 'RESET_NEW' }
    | { type: 'UPDATE_GENERAL'; updates: Partial<Tour> }
    | { type: 'ADD_STEP' }
    | { type: 'REMOVE_STEP'; index: number }
    | { type: 'UPDATE_STEP'; index: number; field: keyof ItineraryStep; value: string }
    | { type: 'ADD_PRICE' }
    | { type: 'REMOVE_PRICE'; index: number }
    | { type: 'UPDATE_PRICE'; index: number; field: keyof TourPrice; value: string }
    | { type: 'ADD_ADDON' }
    | { type: 'REMOVE_ADDON'; index: number }
    | { type: 'UPDATE_ADDON'; index: number; field: keyof Addon; value: string }
    | { type: 'ADD_GALLERY' }
    | { type: 'REMOVE_GALLERY'; index: number }
    | { type: 'UPDATE_GALLERY'; index: number; value: string }
    | { type: 'TOGGLE_MEAL'; meal: string }
    | { type: 'ADD_FEATURE'; feature: string }
    | { type: 'REMOVE_FEATURE'; index: number }
    | { type: 'SET_SAVING'; saving: boolean };

const INITIAL_FORM: TourFormState = {
    general: {},
    itinerary: [],
    prices: [],
    addons: [],
    gallery: [],
    meals: [],
    features: [],
    meta: { isDirty: false, saving: false },
};

function formReducer(state: TourFormState, action: FormAction): TourFormState {
    const dirty = (s: TourFormState): TourFormState => ({ ...s, meta: { ...s.meta, isDirty: true } });

    switch (action.type) {
        case 'LOAD_TOUR': {
            const t = dbRowToTour(action.tour);
            return {
                general: t,
                itinerary: t.itinerary,
                prices: t.prices,
                addons: t.addons,
                gallery: t.gallery,
                meals: (t.meals as string[]) || [],
                features: t.features,
                meta: { isDirty: false, saving: false },
            };
        }
        case 'RESET_NEW':
            return {
                ...INITIAL_FORM,
                general: { category: 'Signature', rating: 5.0, reviews: 0, isNew: false, isBestSeller: false, active: true, format: 'Grupo pequeño', duration: '4-6 h' },
            };
        case 'UPDATE_GENERAL':
            return dirty({ ...state, general: { ...state.general, ...action.updates } });
        case 'ADD_STEP':
            return dirty({ ...state, itinerary: [...state.itinerary, { time: '', activity: '' }] });
        case 'REMOVE_STEP':
            return dirty({ ...state, itinerary: state.itinerary.filter((_, i) => i !== action.index) });
        case 'UPDATE_STEP': {
            const steps = [...state.itinerary];
            steps[action.index] = { ...steps[action.index], [action.field]: action.value };
            return dirty({ ...state, itinerary: steps });
        }
        case 'ADD_PRICE': {
            const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            return dirty({ ...state, prices: [...state.prices, { id, label: 'Por persona', amount: '$0 USD', description: '' }] });
        }
        case 'REMOVE_PRICE':
            return dirty({ ...state, prices: state.prices.filter((_, i) => i !== action.index) });
        case 'UPDATE_PRICE': {
            const prices = [...state.prices];
            prices[action.index] = { ...prices[action.index], [action.field]: action.value };
            return dirty({ ...state, prices });
        }
        case 'ADD_ADDON': {
            const id = `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            return dirty({ ...state, addons: [...state.addons, { id, label: '', price: '$0' }] });
        }
        case 'REMOVE_ADDON':
            return dirty({ ...state, addons: state.addons.filter((_, i) => i !== action.index) });
        case 'UPDATE_ADDON': {
            const addons = [...state.addons];
            addons[action.index] = { ...addons[action.index], [action.field]: action.value };
            return dirty({ ...state, addons });
        }
        case 'ADD_GALLERY':
            return dirty({ ...state, gallery: [...state.gallery, ''] });
        case 'REMOVE_GALLERY':
            return dirty({ ...state, gallery: state.gallery.filter((_, i) => i !== action.index) });
        case 'UPDATE_GALLERY': {
            const gallery = [...state.gallery];
            gallery[action.index] = action.value;
            return dirty({ ...state, gallery });
        }
        case 'TOGGLE_MEAL':
            return dirty({
                ...state,
                meals: state.meals.includes(action.meal)
                    ? state.meals.filter(m => m !== action.meal)
                    : [...state.meals, action.meal],
            });
        case 'ADD_FEATURE':
            return dirty({ ...state, features: [...state.features, action.feature] });
        case 'REMOVE_FEATURE':
            return dirty({ ...state, features: state.features.filter((_, i) => i !== action.index) });
        case 'SET_SAVING':
            return { ...state, meta: { ...state.meta, saving: action.saving } };
        default:
            return state;
    }
}

// ==========================================
// Component
// ==========================================

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('general');

    const [form, dispatch] = useReducer(formReducer, INITIAL_FORM);
    const savingGuardRef = useRef(false);

    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    const [showImagePicker, setShowImagePicker] = useState(false);
    const [imagePickerTarget, setImagePickerTarget] = useState<'main' | number>('main');
    const [imageSearch, setImageSearch] = useState('');

    const categories = useMemo(() => {
        const fromTours = tours.map(t => t.category).filter(Boolean);
        const all = new Set([...DEFAULT_CATEGORIES, ...fromTours, ...customCategories]);
        return Array.from(all).sort();
    }, [tours, customCategories]);

    const assetsMap = useMemo(() => {
        const map = new Map<string, CloudinaryAsset>();
        (cloudinaryAssets as CloudinaryAsset[]).forEach(a => map.set(a.public_id, a));
        return map;
    }, []);

    const filteredAssets = useMemo(() => {
        const assets = cloudinaryAssets as CloudinaryAsset[];
        if (!imageSearch.trim()) return assets;
        const q = imageSearch.toLowerCase();
        return assets.filter(a =>
            a.display_name.toLowerCase().includes(q) ||
            a.public_id.toLowerCase().includes(q)
        );
    }, [imageSearch]);

    useEffect(() => { fetchTours(); }, []);

    async function fetchTours() {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('tours').select('*').order('id', { ascending: true });
            if (error) throw error;
            if (data) setTours(data);
        } catch (err) {
            console.error('[Tours] Error fetching tours:', err);
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(tour: Tour) {
        dispatch({ type: 'LOAD_TOUR', tour });
        setShowNewCategory(false);
        setNewCategoryInput('');
        setActiveTab('general');
        setShowModal(true);
    }

    function handleCreate() {
        dispatch({ type: 'RESET_NEW' });
        setShowNewCategory(false);
        setNewCategoryInput('');
        setActiveTab('general');
        setShowModal(true);
    }

    function handleCloseModal() {
        if (form.meta.isDirty && !form.meta.saving) {
            if (!confirm('Tienes cambios sin guardar. ¿Descartar?')) return;
        }
        setShowModal(false);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this tour?')) return;
        const { error } = await supabase.from('tours').delete().eq('id', id);
        if (error) alert('Error deleting tour');
        else {
            await fetchTours();
            invalidateToursCache();
        }
    }

    // ==========================================
    // handleSubmit — indestructible save with AbortController + fallback
    // ==========================================

    async function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        console.log('[Tours] Step 1: handleSubmit called');

        if (savingGuardRef.current) {
            console.log('[Tours] Blocked: already saving');
            return;
        }

        const payload = tourFormToDbPayload(
            form.general, form.itinerary, form.prices,
            form.addons, form.gallery, form.meals, form.features
        );
        const validation = validateTourPayload(payload);
        if (!validation.valid) {
            setActiveTab('general');
            alert(validation.errors.join('\n'));
            return;
        }

        const isEdit = !!form.general.id;
        const tourId = form.general.id;
        console.log('[Tours] Step 2: Payload validated,', JSON.stringify(payload).length, 'bytes, mode:', isEdit ? `edit #${tourId}` : 'new');

        savingGuardRef.current = true;
        dispatch({ type: 'SET_SAVING', saving: true });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.log('[Tours] Step X: 15s timeout — aborting');
            controller.abort();
        }, 15000);

        try {
            // Step 3: Try supabase-js directly (it injects auth token automatically)
            console.log('[Tours] Step 3: Saving via supabase-js...');
            let saved = false;
            try {
                const query = isEdit
                    ? supabase.from('tours').update(payload).eq('id', tourId!)
                    : supabase.from('tours').insert([payload]);

                const result = await Promise.race([
                    query,
                    new Promise<never>((_, reject) => {
                        controller.signal.addEventListener('abort', () => reject(new Error('TIMEOUT')));
                    }),
                ]);

                if (result.error) throw result.error;
                saved = true;
                console.log('[Tours] Step 3: Success via supabase-js');
            } catch (sbErr: any) {
                if (sbErr.message === 'TIMEOUT' || sbErr.name === 'AbortError') throw sbErr;

                // Step 4: Fallback to native fetch
                console.warn('[Tours] Step 4: supabase-js failed:', sbErr.message, '— fallback to native fetch');

                // Read token synchronously from supabase's internal storage (no async getSession call)
                const storageKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
                let accessToken: string | null = null;
                try {
                    const stored = localStorage.getItem(storageKey);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        accessToken = parsed?.access_token || null;
                    }
                } catch { /* localStorage read failed, proceed with anon key */ }

                const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tours${isEdit ? `?id=eq.${tourId}` : ''}`;
                const res = await fetch(url, {
                    method: isEdit ? 'PATCH' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': anonKey,
                        'Authorization': `Bearer ${accessToken || anonKey}`,
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify(isEdit ? payload : [payload]),
                    signal: controller.signal,
                });

                if (res.status === 401 || res.status === 403) {
                    console.error('[Tours] Step 4: 401/403 — session expired, reloading...');
                    alert('Sesión expirada, recargando...');
                    window.location.reload();
                    return;
                }

                if (!res.ok) {
                    const text = await res.text().catch(() => 'No response body');
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }
                saved = true;
                console.log('[Tours] Step 4: Success via native fetch');
            }

            if (saved) {
                clearTimeout(timeoutId);
                console.log('[Tours] Step 5: Refreshing list...');
                setShowModal(false);
                await fetchTours();
                invalidateToursCache();
            }

        } catch (err: any) {
            clearTimeout(timeoutId);
            console.error('[Tours] Error:', err);

            let msg: string;
            if (err.message === 'TIMEOUT' || err.name === 'AbortError') {
                msg = 'El servidor no respondió en 15 segundos. Verifica tu conexión e intenta de nuevo.';
            } else {
                msg = 'Error al guardar: ' + (err.message || String(err));
            }
            alert(msg);
        } finally {
            clearTimeout(timeoutId);
            savingGuardRef.current = false;
            dispatch({ type: 'SET_SAVING', saving: false });
            console.log('[Tours] Step FINAL: Saving state reset to idle');
        }
    }

    // ==========================================
    // Image Picker
    // ==========================================

    function openImagePicker(target: 'main' | number) {
        setImagePickerTarget(target);
        setImageSearch('');
        setShowImagePicker(true);
    }

    function selectImage(publicId: string) {
        const asset = assetsMap.get(publicId);
        const taggedId = asset && isVideoAsset(asset) ? `video:${publicId}` : publicId;
        if (imagePickerTarget === 'main') {
            dispatch({ type: 'UPDATE_GENERAL', updates: { image: publicId } });
        } else {
            dispatch({ type: 'UPDATE_GALLERY', index: imagePickerTarget as number, value: taggedId });
        }
        setShowImagePicker(false);
    }

    function handleCategoryChange(value: string) {
        if (value === '__new__') {
            setShowNewCategory(true);
            setNewCategoryInput('');
        } else {
            dispatch({ type: 'UPDATE_GENERAL', updates: { category: value } });
            setShowNewCategory(false);
        }
    }

    function confirmNewCategory() {
        const trimmed = newCategoryInput.trim();
        if (trimmed) {
            setCustomCategories(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
            dispatch({ type: 'UPDATE_GENERAL', updates: { category: trimmed } });
            setShowNewCategory(false);
            setNewCategoryInput('');
        }
    }

    function handleFeatureKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = (e.currentTarget as HTMLInputElement).value.trim();
            if (val) {
                dispatch({ type: 'ADD_FEATURE', feature: val });
                (e.currentTarget as HTMLInputElement).value = '';
            }
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando tours...</div>;

    const isEditing = !!form.general.id;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion de Tours</h1>
                    <p className="text-gray-500">Administra el catalogo completo</p>
                </div>
                <button onClick={handleCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus size={18} /> Nuevo Tour
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tour</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Precio Base</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duracion</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tours.map(tour => (
                            <tr key={tour.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{tour.name}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{tour.concept}</div>
                                </td>
                                <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{tour.category}</span></td>
                                <td className="px-6 py-4 font-medium">${tour.price}</td>
                                <td className="px-6 py-4 text-gray-500">{tour.duration}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(tour)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(tour.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar Tour' : 'Nuevo Tour'}</h2>
                                <p className="text-xs text-gray-500">Completa todos los campos requeridos</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2 overflow-y-auto">
                                {([
                                    { id: 'general', label: 'General', icon: Settings },
                                    { id: 'media', label: 'Multimedia', icon: ImageIcon },
                                    { id: 'prices', label: 'Precios y Add-ons', icon: DollarSign },
                                    { id: 'logistics', label: 'Logistica', icon: MapPin },
                                    { id: 'features', label: 'Caracteristicas', icon: List },
                                ] as const).map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <tab.icon size={18} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            <form id="tour-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-8">
                                {activeTab === 'general' && (
                                    <div className="space-y-6 max-w-2xl">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Nombre del Tour</label>
                                                <input type="text" required value={form.general.name || ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { name: e.target.value } })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Categoria</label>
                                                {showNewCategory ? (
                                                    <div className="flex gap-2">
                                                        <input type="text" autoFocus value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewCategory(); } }} placeholder="Nombre de la nueva categoria" className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                                        <button type="button" onClick={confirmNewCategory} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={18} /></button>
                                                        <button type="button" onClick={() => setShowNewCategory(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <select value={form.general.category || 'Signature'} onChange={e => handleCategoryChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                        <option value="__new__">+ Nueva categoria...</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Concepto (Subtitulo corto)</label>
                                            <input type="text" required value={form.general.concept || ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { concept: e.target.value } })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Descripcion detallada</label>
                                            <textarea rows={4} value={form.general.description || ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { description: e.target.value } })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Duracion</label>
                                                <input type="text" placeholder="Ej. 6-8 h" value={form.general.duration || ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { duration: e.target.value } })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Formato</label>
                                                <input type="text" placeholder="Ej. Privado - Todo incluido" value={form.general.format || ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { format: e.target.value } })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div className="flex gap-6 pt-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.general.isBestSeller || false} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { isBestSeller: e.target.checked } })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Best Seller</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.general.isNew || false} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { isNew: e.target.checked } })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Nuevo Tour</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={form.general.active !== false} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { active: e.target.checked } })} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                                                <span className="text-sm text-gray-700">Activo (visible en catálogo)</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'media' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Imagen Principal</label>
                                            <div className="flex gap-3 items-center">
                                                <input type="text" value={form.general.image || ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { image: e.target.value } })} className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. DSC04496_noiz4x" />
                                                <button type="button" onClick={() => openImagePicker('main')} className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                                                    <ImageIcon size={16} /> Seleccionar
                                                </button>
                                                {form.general.image && <img src={getCloudinaryUrl(form.general.image, { width: 80, height: 80, crop: 'fill' })} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-200" />}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700">Galeria (Imagenes y Videos)</label>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => { const idx = form.gallery.length; dispatch({ type: 'ADD_GALLERY' }); setTimeout(() => openImagePicker(idx), 50); }} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Seleccionar Imagen</button>
                                                    <button type="button" onClick={() => dispatch({ type: 'ADD_GALLERY' })} className="text-xs text-gray-500 font-medium hover:text-gray-700">+ ID Manual</button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {form.gallery.map((img, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        {img && (
                                                            <div className="relative flex-shrink-0">
                                                                <img src={getGalleryItemThumbnailUrl(img, 64, 64, assetsMap)} alt="" className="w-8 h-8 rounded object-cover border border-gray-200" />
                                                                {isVideoGalleryItem(img) && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center">
                                                                            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-white ml-0.5" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <input type="text" value={img} onChange={e => dispatch({ type: 'UPDATE_GALLERY', index: idx, value: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Cloudinary ID o video:ID" />
                                                        <button type="button" onClick={() => openImagePicker(idx)} className="text-blue-500 hover:text-blue-700 p-1.5" title="Seleccionar imagen o video"><ImageIcon size={16} /></button>
                                                        <button type="button" onClick={() => dispatch({ type: 'REMOVE_GALLERY', index: idx })} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}
                                                {form.gallery.length === 0 && <p className="text-sm text-gray-400 italic">No hay imagenes o videos en la galeria.</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'prices' && (
                                    <div className="space-y-8">
                                        <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <label className="text-sm font-medium text-blue-900">Precio Base (Referencia)</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">$</span>
                                                <input type="number" value={form.general.price ?? ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { price: Number(e.target.value) } })} className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" min="0" />
                                                <span className="text-sm text-gray-500">USD</span>
                                            </div>
                                            <p className="text-xs text-blue-700">Este es el precio que se muestra en las tarjetas de la lista.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-900">Opciones de Precio</label>
                                                <button type="button" onClick={() => dispatch({ type: 'ADD_PRICE' })} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Agregar Opcion</button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {form.prices.map((p, idx) => (
                                                    <div key={p.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex-1 space-y-2">
                                                            <input type="text" placeholder="Etiqueta (Ej. Por persona)" value={p.label} onChange={e => dispatch({ type: 'UPDATE_PRICE', index: idx, field: 'label', value: e.target.value })} className="w-full px-2 py-1.5 border rounded text-sm font-medium" />
                                                            <input type="text" placeholder="Descripcion (Ej. Grupo 5-10 pax)" value={p.description} onChange={e => dispatch({ type: 'UPDATE_PRICE', index: idx, field: 'description', value: e.target.value })} className="w-full px-2 py-1.5 border rounded text-xs text-gray-500" />
                                                        </div>
                                                        <div className="w-32">
                                                            <input type="text" placeholder="Monto" value={p.amount} onChange={e => dispatch({ type: 'UPDATE_PRICE', index: idx, field: 'amount', value: e.target.value })} className="w-full px-2 py-1.5 border rounded text-sm text-right font-mono" />
                                                        </div>
                                                        <button type="button" onClick={() => dispatch({ type: 'REMOVE_PRICE', index: idx })} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-6 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-900">Add-ons Disponibles</label>
                                                <button type="button" onClick={() => dispatch({ type: 'ADD_ADDON' })} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Agregar Add-on</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {form.addons.map((addon, idx) => (
                                                    <div key={addon.id} className="flex gap-2 items-center p-2 border rounded-lg hover:bg-gray-50">
                                                        <div className="flex-1 space-y-1">
                                                            <input type="text" placeholder="Nombre Add-on" value={addon.label} onChange={e => dispatch({ type: 'UPDATE_ADDON', index: idx, field: 'label', value: e.target.value })} className="w-full px-2 py-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-sm" />
                                                            <input type="text" placeholder="Precio" value={addon.price} onChange={e => dispatch({ type: 'UPDATE_ADDON', index: idx, field: 'price', value: e.target.value })} className="w-full px-2 py-0.5 text-xs text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none" />
                                                        </div>
                                                        <button type="button" onClick={() => dispatch({ type: 'REMOVE_ADDON', index: idx })} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'logistics' && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700">Itinerario</label>
                                                <button type="button" onClick={() => dispatch({ type: 'ADD_STEP' })} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Agregar Paso</button>
                                            </div>
                                            <div className="relative border-l-2 border-gray-100 pl-4 space-y-4">
                                                {form.itinerary.map((step, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <div className="absolute -left-[22px] top-2 w-3 h-3 rounded-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
                                                        <div className="flex gap-3 items-start">
                                                            <input type="text" placeholder="00:00" value={step.time} onChange={e => dispatch({ type: 'UPDATE_STEP', index: idx, field: 'time', value: e.target.value })} className="w-20 px-2 py-1.5 border rounded text-sm font-mono text-center" />
                                                            <textarea rows={2} placeholder="Descripcion de la actividad" value={step.activity} onChange={e => dispatch({ type: 'UPDATE_STEP', index: idx, field: 'activity', value: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm resize-none" />
                                                            <button type="button" onClick={() => dispatch({ type: 'REMOVE_STEP', index: idx })} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Incluye</label>
                                            <textarea rows={3} value={form.general.includes || ''} onChange={e => dispatch({ type: 'UPDATE_GENERAL', updates: { includes: e.target.value } })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Lista lo que incluye..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Comidas Incluidas</label>
                                            <div className="flex flex-wrap gap-2">
                                                {MEAL_TYPES.map(meal => (
                                                    <button key={meal} type="button" onClick={() => dispatch({ type: 'TOGGLE_MEAL', meal })} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.meals.includes(meal) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                        {meal.replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'features' && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Caracteristicas Destacadas</label>
                                            <p className="text-xs text-gray-500 mb-2">Escribe y presiona Enter para agregar.</p>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {form.features.map((feat, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        {feat}
                                                        <button type="button" onClick={() => dispatch({ type: 'REMOVE_FEATURE', index: idx })} className="hover:text-green-900"><X size={12} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input type="text" onKeyDown={handleFeatureKeyDown} placeholder="Agregar caracteristica..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
                            <span className="text-xs text-gray-400 italic">
                                {isEditing ? `Editando ID: ${form.general.id}` : 'Creando nuevo tour'}
                            </span>
                            <div className="flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="button" disabled={form.meta.saving} onClick={() => { console.log('[Tours] Button click!'); handleSubmit(); }} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Save size={18} /> {form.meta.saving ? 'Guardando...' : 'Guardar Tour'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showImagePicker && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Seleccionar Imagen o Video</h3>
                            <button onClick={() => setShowImagePicker(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
                        </div>
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" autoFocus value={imageSearch} onChange={e => setImageSearch(e.target.value)} placeholder="Buscar por nombre o ID..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">{filteredAssets.length} imagen{filteredAssets.length !== 1 ? 'es' : ''} disponible{filteredAssets.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {filteredAssets.map(asset => (
                                    <button key={asset.public_id} type="button" onClick={() => selectImage(asset.public_id)} className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-all">
                                        <img src={getAssetThumbnailUrl(asset, 200, 200)} alt={asset.display_name} className="w-full h-full object-cover" loading="lazy" />
                                        {isVideoAsset(asset) && (
                                            <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Video</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                                            <span className="text-white text-[10px] leading-tight font-medium truncate w-full">{asset.display_name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {filteredAssets.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No se encontraron imagenes para "{imageSearch}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
