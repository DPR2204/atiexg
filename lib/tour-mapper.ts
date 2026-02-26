import type { Tour, ItineraryStep, TourPrice, Addon } from '../types/shared';

/** Convert a Supabase DB row (snake_case) to the frontend Tour type (camelCase) */
export function dbRowToTour(row: any): Tour {
    return {
        id: row.id,
        name: row.name,
        name_en: row.name_en,
        category: row.category,
        concept: row.concept,
        concept_en: row.concept_en,
        description: row.description,
        description_en: row.description_en,
        price: row.price ?? 0,
        duration: row.duration,
        image: row.image,
        gallery: row.gallery || [],
        isBestSeller: row.is_best_seller ?? false,
        isNew: row.is_new ?? false,
        active: row.active ?? true,
        rating: row.rating ?? 5.0,
        reviews: row.reviews ?? 0,
        features: row.features || [],
        features_en: row.features_en,
        includes: row.includes,
        includes_en: row.includes_en,
        itinerary: row.itinerary || [],
        itinerary_en: row.itinerary_en,
        prices: row.prices || [],
        addons: row.addons || [],
        format: row.format,
        format_en: row.format_en,
        meals: row.meals || [],
    };
}

/** Convert form state to a clean Supabase DB payload (no undefined, no stale fields) */
export function tourFormToDbPayload(
    formData: Partial<Tour>,
    itinerary: ItineraryStep[],
    prices: TourPrice[],
    addons: Addon[],
    gallery: string[],
    meals: string[],
    features: string[]
): Record<string, any> {
    const cleanGallery = gallery.filter(g => g.trim() !== '');

    const payload = {
        name: formData.name,
        category: formData.category || null,
        concept: formData.concept || null,
        description: formData.description || null,
        price: formData.price != null ? Number(formData.price) : 0,
        duration: formData.duration || null,
        image: formData.image || null,
        format: formData.format || null,
        includes: formData.includes || null,
        is_best_seller: formData.isBestSeller ?? false,
        is_new: formData.isNew ?? false,
        active: formData.active ?? true,
        rating: Number(formData.rating) || 5.0,
        reviews: Number(formData.reviews) || 0,
        itinerary: itinerary.length > 0 ? itinerary : null,
        prices: prices.length > 0 ? prices : null,
        addons: addons.length > 0 ? addons : null,
        gallery: cleanGallery.length > 0 ? cleanGallery : null,
        meals: meals.length > 0 ? (meals as any) : null,
        features: features.length > 0 ? features : null,
    };

    // JSON round-trip strips undefined values — prevents supabase-js from hanging on undefined fields
    return JSON.parse(JSON.stringify(payload));
}

/** Validate a tour payload before sending to DB */
export function validateTourPayload(payload: Record<string, any>): { valid: boolean; errors: string[]; warnings: string[]; errorTabs: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const errorTabs: string[] = [];

    if (!payload.name?.trim()) {
        errors.push('El nombre del tour es requerido.');
        if (!errorTabs.includes('general')) errorTabs.push('general');
    }

    if (!payload.category?.trim()) {
        errors.push('La categoría es requerida.');
        if (!errorTabs.includes('general')) errorTabs.push('general');
    }

    if (payload.price == null || isNaN(Number(payload.price)) || Number(payload.price) < 0) {
        errors.push('El precio debe ser un número mayor o igual a 0.');
        if (!errorTabs.includes('prices')) errorTabs.push('prices');
    }

    if (!payload.image) {
        warnings.push('No se ha seleccionado una imagen principal.');
    }

    return { valid: errors.length === 0, errors, warnings, errorTabs };
}
