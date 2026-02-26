export interface ItineraryStep {
    time: string;
    activity: string;
}

export interface TourPrice {
    id: string;
    label: string;
    amount: string;
    description?: string;
    // English variants
    label_en?: string;
    description_en?: string;
}

export interface Addon {
    id: string;
    label: string;
    price: string;
    // English variant
    label_en?: string;
}

export interface Tour {
    id: number;
    name: string;
    category: string;
    concept: string;
    description: string;
    price: number; // Display base price USD
    duration: string;
    image: string;
    gallery: string[]; // Array of Cloudinary public_ids
    isBestSeller?: boolean;
    isNew?: boolean;
    active?: boolean;
    rating: number;
    reviews: number;
    features: string[];
    includes?: string; // What's included text
    itinerary: ItineraryStep[];
    prices: TourPrice[];
    addons: Addon[];
    format: string;
    meals?: ('desayuno' | 'almuerzo' | 'coffee_break' | 'snacks' | 'picnic' | 'cena')[];
    // English variants
    name_en?: string;
    concept_en?: string;
    description_en?: string;
    features_en?: string[];
    includes_en?: string;
    itinerary_en?: ItineraryStep[];
    format_en?: string;
}

export interface SelectedTourConfig {
    tourId: number;
    selectedPriceId: string;
    selectedAddonIds: string[];
    customItinerary: ItineraryStep[];
}

export interface CustomTourData {
    tour_name?: string;
    itinerary?: ItineraryStep[];
    includes?: string;
}
