
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
  category: 'Aventura' | 'Cultural' | 'Privado' | 'Gastronomía' | 'Premium';
  concept: string;
  description: string;
  price: number; // Display base price
  duration: string;
  image: string;
  isBestSeller?: boolean;
  rating: number;
  reviews: number;
  features: string[];
  itinerary: ItineraryStep[];
  prices: TourPrice[];
  addons: Addon[];
  format: string;
}

export interface SelectedTourConfig {
  tourId: number;
  selectedPriceId: string;
  selectedAddonIds: string[];
  customItinerary: ItineraryStep[];
}
