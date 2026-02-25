import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tour, ItineraryStep, TourPrice, Addon } from '../../types/shared';
import { Plus, Pencil, Trash2, X, Check, ArrowLeft, Image as ImageIcon, DollarSign, Clock, MapPin, List, Settings, Save, Search } from 'lucide-react';
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

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTour, setEditingTour] = useState<Partial<Tour> | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('general');

    // Form states
    const [formData, setFormData] = useState<Partial<Tour>>({});
    const [itinerarySteps, setItinerarySteps] = useState<ItineraryStep[]>([]);
    const [prices, setPrices] = useState<TourPrice[]>([]);
    const [addons, setAddons] = useState<Addon[]>([]);
    const [gallery, setGallery] = useState<string[]>([]);
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    // Category management
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');

    // Saving state – ref avoids stale-closure issues across re-renders
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);

    // Image picker
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [imagePickerTarget, setImagePickerTarget] = useState<'main' | number>('main');
    const [imageSearch, setImageSearch] = useState('');

    // Derive unique categories from existing tours + defaults + custom
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const categories = useMemo(() => {
        const fromTours = tours.map(t => t.category).filter(Boolean);
        const all = new Set([...DEFAULT_CATEGORIES, ...fromTours, ...customCategories]);
        return Array.from(all).sort();
    }, [tours, customCategories]);

    // Build lookup map for asset type detection
    const assetsMap = useMemo(() => {
        const map = new Map<string, CloudinaryAsset>();
        (cloudinaryAssets as CloudinaryAsset[]).forEach(a => map.set(a.public_id, a));
        return map;
    }, []);

    // Filter cloudinary assets by search
    const filteredAssets = useMemo(() => {
        const assets = cloudinaryAssets as CloudinaryAsset[];
        if (!imageSearch.trim()) return assets;
        const q = imageSearch.toLowerCase();
        return assets.filter(a =>
            a.display_name.toLowerCase().includes(q) ||
            a.public_id.toLowerCase().includes(q)
        );
    }, [imageSearch]);

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
        // Map snake_case DB columns to camelCase form fields
        const dbTour = tour as any;
        setFormData({
            ...tour,
            isBestSeller: dbTour.is_best_seller ?? tour.isBestSeller ?? false,
            isNew: dbTour.is_new ?? tour.isNew ?? false,
        });
        setItinerarySteps(tour.itinerary || []);
        setPrices(tour.prices || []);
        setAddons(tour.addons || []);
        setGallery(tour.gallery || []);
        setSelectedMeals((dbTour.meals as string[]) || []);
        setFeatures(tour.features || []);
        setShowNewCategory(false);
        setNewCategoryInput('');
        setActiveTab('general');
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
            format: 'Grupo pequeño',
            duration: '4-6 h'
        });
        setItinerarySteps([]);
        setPrices([]);
        setAddons([]);
        setGallery([]);
        setSelectedMeals([]);
        setFeatures([]);
        setShowNewCategory(false);
        setNewCategoryInput('');
        setActiveTab('general');
        setShowModal(true);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this tour?')) return;

        const { error } = await supabase.from('tours').delete().eq('id', id);
        if (error) alert('Error deleting tour');
        else fetchTours();
    }

    // Refs to always read the latest values (avoids stale closures)
    const formDataRef = useRef(formData);
    formDataRef.current = formData;
    const editingTourRef = useRef(editingTour);
    editingTourRef.current = editingTour;
    const galleryRef = useRef(gallery);
    galleryRef.current = gallery;
    const itineraryRef = useRef(itinerarySteps);
    itineraryRef.current = itinerarySteps;
    const pricesRef = useRef(prices);
    pricesRef.current = prices;
    const addonsRef = useRef(addons);
    addonsRef.current = addons;
    const mealsRef = useRef(selectedMeals);
    mealsRef.current = selectedMeals;
    const featuresRef = useRef(features);
    featuresRef.current = features;

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log('[Tours] handleSubmit called, savingRef:', savingRef.current);

        if (savingRef.current) {
            console.log('[Tours] Blocked: already saving');
            return;
        }

        const fd = formDataRef.current;
        if (!fd.name?.trim()) {
            setActiveTab('general');
            alert('El nombre del tour es requerido.');
            return;
        }

        // Show feedback IMMEDIATELY, before any async work
        savingRef.current = true;
        setSaving(true);
        console.log('[Tours] Saving started');

        try {
            // Verify auth session (with 5s timeout so it never hangs)
            let currentSession;
            try {
                const sessionResult = await Promise.race([
                    supabase.auth.getSession(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('SESSION_TIMEOUT')), 5000)
                    ),
                ]);
                currentSession = sessionResult.data.session;
            } catch {
                alert('No se pudo verificar tu sesión. Intenta recargar la página.');
                return;
            }

            if (!currentSession) {
                alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
                window.location.href = '/backoffice/login';
                return;
            }

            // Read latest values from refs (never stale)
            const curGallery = galleryRef.current;
            const curItinerary = itineraryRef.current;
            const curPrices = pricesRef.current;
            const curAddons = addonsRef.current;
            const curMeals = mealsRef.current;
            const curFeatures = featuresRef.current;
            const curEditing = editingTourRef.current;

            // Clean gallery: remove empty slots the user never filled
            const cleanGallery = curGallery.filter(g => g.trim() !== '');

            const payload = {
                name: fd.name,
                category: fd.category || null,
                concept: fd.concept || null,
                description: fd.description || null,
                price: fd.price != null ? Number(fd.price) : 0,
                duration: fd.duration || null,
                image: fd.image || null,
                format: fd.format || null,
                includes: fd.includes || null,
                is_best_seller: fd.isBestSeller ?? false,
                is_new: fd.isNew ?? false,
                rating: Number(fd.rating) || 5.0,
                reviews: Number(fd.reviews) || 0,
                active: fd.active ?? true,
                itinerary: curItinerary.length > 0 ? curItinerary : null,
                prices: curPrices.length > 0 ? curPrices : null,
                addons: curAddons.length > 0 ? curAddons : null,
                gallery: cleanGallery.length > 0 ? cleanGallery : null,
                meals: curMeals.length > 0 ? (curMeals as any) : null,
                features: curFeatures.length > 0 ? curFeatures : null,
            };

            console.log('[Tours] Payload ready:', JSON.stringify(payload).length, 'bytes, editing:', curEditing?.id ?? 'new');

            const saveQuery = curEditing?.id
                ? supabase.from('tours').update(payload).eq('id', curEditing.id)
                : supabase.from('tours').insert([payload]);

            // Race against a 15s timeout so the UI never hangs
            let timeoutId: ReturnType<typeof setTimeout>;
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), 15000);
            });
            try {
                const res = await Promise.race([saveQuery, timeoutPromise]);
                clearTimeout(timeoutId!);

                if (res.error) {
                    console.error('[Tours] Save error:', res.error);
                    alert('Error guardando tour: ' + res.error.message + (res.error.code ? ` (código: ${res.error.code})` : ''));
                } else {
                    console.log('[Tours] Saved successfully');
                    setShowModal(false);
                    fetchTours();
                }
            } catch (err) {
                clearTimeout(timeoutId!);
                throw err; // re-throw to be caught by outer try/catch
            }
        } catch (err) {
            console.error('[Tours] Unexpected error:', err);
            if (err instanceof Error && err.message === 'TIMEOUT') {
                alert('El servidor no respondió en 15 segundos. Verifica tu conexión e intenta de nuevo.');
            } else {
                alert('Error inesperado al guardar: ' + (err instanceof Error ? err.message : String(err)));
            }
        } finally {
            savingRef.current = false;
            setSaving(false);
            console.log('[Tours] Saving finished');
        }
    }, []);

    // Image picker handlers
    function openImagePicker(target: 'main' | number) {
        setImagePickerTarget(target);
        setImageSearch('');
        setShowImagePicker(true);
    }

    function selectImage(publicId: string) {
        const asset = assetsMap.get(publicId);
        const taggedId = asset && isVideoAsset(asset) ? `video:${publicId}` : publicId;
        if (imagePickerTarget === 'main') {
            setFormData(prev => ({ ...prev, image: publicId }));
        } else {
            setGallery(prev => {
                const newGallery = [...prev];
                newGallery[imagePickerTarget] = taggedId;
                return newGallery;
            });
        }
        setShowImagePicker(false);
    }

    // Category handlers
    function handleCategoryChange(value: string) {
        if (value === '__new__') {
            setShowNewCategory(true);
            setNewCategoryInput('');
        } else {
            setFormData(prev => ({ ...prev, category: value as any }));
            setShowNewCategory(false);
        }
    }

    function confirmNewCategory() {
        const trimmed = newCategoryInput.trim();
        if (trimmed) {
            setCustomCategories(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
            setFormData(prev => ({ ...prev, category: trimmed as any }));
            setShowNewCategory(false);
            setNewCategoryInput('');
        }
    }

    // Helper Functions
    // Itinerary
    function updateStep(index: number, field: keyof ItineraryStep, value: string) {
        setItinerarySteps(prev => {
            const newSteps = [...prev];
            newSteps[index] = { ...newSteps[index], [field]: value };
            return newSteps;
        });
    }
    function addStep() { setItinerarySteps(prev => [...prev, { time: '', activity: '' }]); }
    function removeStep(index: number) { setItinerarySteps(prev => prev.filter((_, i) => i !== index)); }

    // Prices
    function updatePrice(index: number, field: keyof TourPrice, value: string) {
        setPrices(prev => {
            const newPrices = [...prev];
            newPrices[index] = { ...newPrices[index], [field]: value };
            return newPrices;
        });
    }
    function addPrice() {
        setPrices(prev => {
            const id = (prev.length + 1).toString();
            return [...prev, { id, label: 'Por persona', amount: '$0 USD', description: '' }];
        });
    }
    function removePrice(index: number) { setPrices(prev => prev.filter((_, i) => i !== index)); }

    // Addons
    function updateAddon(index: number, field: keyof Addon, value: string) {
        setAddons(prev => {
            const newAddons = [...prev];
            newAddons[index] = { ...newAddons[index], [field]: value };
            return newAddons;
        });
    }
    function addAddon() {
        setAddons(prev => {
            const id = `a${prev.length + 1}`;
            return [...prev, { id, label: '', price: '$0' }];
        });
    }
    function removeAddon(index: number) { setAddons(prev => prev.filter((_, i) => i !== index)); }

    // Gallery
    function addGalleryImage() { setGallery(prev => [...prev, '']); }
    function updateGalleryImage(index: number, value: string) {
        setGallery(prev => {
            const newGallery = [...prev];
            newGallery[index] = value;
            return newGallery;
        });
    }
    function removeGalleryImage(index: number) { setGallery(prev => prev.filter((_, i) => i !== index)); }

    // Array Inputs (Features)
    function handleKeyDown(e: React.KeyboardEvent, list: string[], setList: (l: string[]) => void) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = (e.currentTarget as HTMLInputElement).value.trim();
            if (val) {
                setList([...list, val]);
                (e.currentTarget as HTMLInputElement).value = '';
            }
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando tours...</div>;

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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{editingTour ? 'Editar Tour' : 'Nuevo Tour'}</h2>
                                <p className="text-xs text-gray-500">Completa todos los campos requeridos</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar Tabs */}
                            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2 overflow-y-auto">
                                {[
                                    { id: 'general', label: 'General', icon: Settings },
                                    { id: 'media', label: 'Multimedia', icon: ImageIcon },
                                    { id: 'prices', label: 'Precios y Add-ons', icon: DollarSign },
                                    { id: 'logistics', label: 'Logistica', icon: MapPin },
                                    { id: 'features', label: 'Caracteristicas', icon: List },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <tab.icon size={18} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <form id="tour-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-8">

                                {activeTab === 'general' && (
                                    <div className="space-y-6 max-w-2xl">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Nombre del Tour</label>
                                                <input type="text" required value={formData.name || ''} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Categoria</label>
                                                {showNewCategory ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            value={newCategoryInput}
                                                            onChange={e => setNewCategoryInput(e.target.value)}
                                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewCategory(); } }}
                                                            placeholder="Nombre de la nueva categoria"
                                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        />
                                                        <button type="button" onClick={confirmNewCategory} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={18} /></button>
                                                        <button type="button" onClick={() => setShowNewCategory(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <select value={formData.category || 'Signature'} onChange={e => handleCategoryChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                        <option value="__new__">+ Nueva categoria...</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Concepto (Subtitulo corto)</label>
                                            <input type="text" required value={formData.concept || ''} onChange={e => setFormData(prev => ({ ...prev, concept: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Descripcion detallada</label>
                                            <textarea rows={4} value={formData.description || ''} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Duracion</label>
                                                <input type="text" placeholder="Ej. 6-8 h" value={formData.duration || ''} onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Formato</label>
                                                <input type="text" placeholder="Ej. Privado - Todo incluido" value={formData.format || ''} onChange={e => setFormData(prev => ({ ...prev, format: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div className="flex gap-6 pt-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={formData.isBestSeller || false} onChange={e => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Best Seller</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={formData.isNew || false} onChange={e => setFormData(prev => ({ ...prev, isNew: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Nuevo Tour</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'media' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Imagen Principal</label>
                                            <div className="flex gap-3 items-center">
                                                <input type="text" value={formData.image || ''} onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))} className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. DSC04496_noiz4x" />
                                                <button type="button" onClick={() => openImagePicker('main')} className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                                                    <ImageIcon size={16} /> Seleccionar
                                                </button>
                                                {formData.image && <img src={getCloudinaryUrl(formData.image, { width: 80, height: 80, crop: 'fill' })} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-200" />}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700">Galeria (Imagenes y Videos)</label>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => { addGalleryImage(); setTimeout(() => openImagePicker(gallery.length), 50); }} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Seleccionar Imagen</button>
                                                    <button type="button" onClick={addGalleryImage} className="text-xs text-gray-500 font-medium hover:text-gray-700">+ ID Manual</button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {gallery.map((img, idx) => (
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
                                                        <input type="text" value={img} onChange={e => updateGalleryImage(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Cloudinary ID o video:ID" />
                                                        <button type="button" onClick={() => openImagePicker(idx)} className="text-blue-500 hover:text-blue-700 p-1.5" title="Seleccionar imagen o video"><ImageIcon size={16} /></button>
                                                        <button type="button" onClick={() => removeGalleryImage(idx)} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}
                                                {gallery.length === 0 && <p className="text-sm text-gray-400 italic">No hay imagenes o videos en la galeria.</p>}
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
                                                <input type="number" value={formData.price ?? ''} onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" min="0" />
                                                <span className="text-sm text-gray-500">USD</span>
                                            </div>
                                            <p className="text-xs text-blue-700">Este es el precio que se muestra en las tarjetas de la lista.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-900">Opciones de Precio</label>
                                                <button type="button" onClick={addPrice} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Agregar Opcion</button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {prices.map((p, idx) => (
                                                    <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex-1 space-y-2">
                                                            <input type="text" placeholder="Etiqueta (Ej. Por persona)" value={p.label} onChange={e => updatePrice(idx, 'label', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm font-medium" />
                                                            <input type="text" placeholder="Descripcion (Ej. Grupo 5-10 pax)" value={p.description} onChange={e => updatePrice(idx, 'description', e.target.value)} className="w-full px-2 py-1.5 border rounded text-xs text-gray-500" />
                                                        </div>
                                                        <div className="w-32">
                                                            <input type="text" placeholder="Monto" value={p.amount} onChange={e => updatePrice(idx, 'amount', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm text-right font-mono" />
                                                        </div>
                                                        <button type="button" onClick={() => removePrice(idx)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-900">Add-ons Disponibles</label>
                                                <button type="button" onClick={addAddon} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Agregar Add-on</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {addons.map((addon, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center p-2 border rounded-lg hover:bg-gray-50">
                                                        <div className="flex-1 space-y-1">
                                                            <input type="text" placeholder="Nombre Add-on" value={addon.label} onChange={e => updateAddon(idx, 'label', e.target.value)} className="w-full px-2 py-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-sm" />
                                                            <input type="text" placeholder="Precio" value={addon.price} onChange={e => updateAddon(idx, 'price', e.target.value)} className="w-full px-2 py-0.5 text-xs text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none" />
                                                        </div>
                                                        <button type="button" onClick={() => removeAddon(idx)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={14} /></button>
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
                                                <button type="button" onClick={addStep} className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Agregar Paso</button>
                                            </div>
                                            <div className="relative border-l-2 border-gray-100 pl-4 space-y-4">
                                                {itinerarySteps.map((step, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <div className="absolute -left-[22px] top-2 w-3 h-3 rounded-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
                                                        <div className="flex gap-3 items-start">
                                                            <input type="text" placeholder="00:00" value={step.time} onChange={e => updateStep(idx, 'time', e.target.value)} className="w-20 px-2 py-1.5 border rounded text-sm font-mono text-center" />
                                                            <textarea rows={2} placeholder="Descripcion de la actividad" value={step.activity} onChange={e => updateStep(idx, 'activity', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm resize-none" />
                                                            <button type="button" onClick={() => removeStep(idx)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Incluye</label>
                                            <textarea rows={3} value={formData.includes || ''} onChange={e => setFormData(prev => ({ ...prev, includes: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Lista lo que incluye..." />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Comidas Incluidas</label>
                                            <div className="flex flex-wrap gap-2">
                                                {MEAL_TYPES.map(meal => (
                                                    <button
                                                        key={meal}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedMeals.includes(meal) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                    >
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
                                                {features.map((feat, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        {feat}
                                                        <button type="button" onClick={() => setFeatures(prev => prev.filter((_, i) => i !== idx))} className="hover:text-green-900"><X size={12} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                            <input type="text" onKeyDown={e => handleKeyDown(e, features, setFeatures)} placeholder="Agregar caracteristica..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
                            <span className="text-xs text-gray-400 italic">
                                {editingTour ? `Editando ID: ${editingTour.id}` : 'Creando nuevo tour'}
                            </span>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                                <button type="button" disabled={saving} onClick={() => { console.log('[Tours] Button click!'); handleSubmit(); }} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Tour'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Picker Modal */}
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
                                <input
                                    type="text"
                                    autoFocus
                                    value={imageSearch}
                                    onChange={e => setImageSearch(e.target.value)}
                                    placeholder="Buscar por nombre o ID..."
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">{filteredAssets.length} imagen{filteredAssets.length !== 1 ? 'es' : ''} disponible{filteredAssets.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {filteredAssets.map(asset => (
                                    <button
                                        key={asset.public_id}
                                        type="button"
                                        onClick={() => selectImage(asset.public_id)}
                                        className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                                    >
                                        <img
                                            src={getAssetThumbnailUrl(asset, 200, 200)}
                                            alt={asset.display_name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
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
