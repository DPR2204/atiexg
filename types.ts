
export interface ItineraryStep {
  time: string;
  activity: string;
}

export interface TourPrice {
  id: string;
  label: string;
  amount: string;
  description?: string;
}

export interface Addon {
  id: string;
  label: string;
  price: string;
}

export interface Tour {
  id: number;
  name: string;
  category: 'Signature' | 'Lago & Momentos' | 'Cultura & Pueblos' | 'Sabores del Lago' | 'Días de Campo';
  concept: string;
  description: string;
  price: number; // Display base price USD
  duration: string;
  image: string;
  gallery: string[]; // Array of Cloudinary public_ids
  isBestSeller?: boolean;
  isNew?: boolean;
  rating: number;
  reviews: number;
  features: string[];
  includes?: string; // What's included text
  itinerary: ItineraryStep[];
  prices: TourPrice[];
  addons: Addon[];
  format: string;
  meals?: ('desayuno' | 'almuerzo' | 'coffee_break' | 'snacks' | 'picnic' | 'cena')[];
}

export interface SelectedTourConfig {
  tourId: number;
  selectedPriceId: string;
  selectedAddonIds: string[];
  customItinerary: ItineraryStep[];
}
