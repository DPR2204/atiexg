// ============================================
// Back-Office Types — V2
// ============================================

import { CustomTourData } from './shared';

export type ReservationStatus = 'offered' | 'reserved' | 'paid' | 'in_progress' | 'completed' | 'cancelled';
export type StaffRole = 'lanchero' | 'guia';
export type AgentRole = 'admin' | 'agent';
export type BoatStatus = 'active' | 'maintenance' | 'inactive';
export type MealType = 'desayuno' | 'almuerzo' | 'coffee_break' | 'snacks' | 'picnic' | 'cena';
export type AuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface Agent {
    id: string;
    name: string;
    email: string;
    role: AgentRole;
    avatar_url?: string;
    commission_rate: number; // default 5.00
    created_at: string;
}

export interface Boat {
    id: number;
    name: string;
    capacity: number;
    status: BoatStatus;
    notes?: string;
    created_at: string;
}

export interface Staff {
    id: number;
    name: string;
    role: StaffRole;
    phone?: string;
    active: boolean;
    notes?: string;
    created_at: string;
}

export interface Reservation {
    id: number;
    tour_id: number;
    tour_name: string;
    agent_id: string;
    status: ReservationStatus;
    tour_date: string;
    end_date?: string;
    start_time?: string;
    boat_id?: number;
    driver_id?: number;
    guide_id?: number;
    pax_count: number;
    deposit_amount: number;
    total_amount: number;
    paid_amount: number;
    payment_url?: string;
    payment_id?: string;
    custom_stops: CustomStop[];
    notes?: string;
    updated_at: string;
    // Joined relations (optional)
    agent?: Agent;
    boat?: Boat;
    driver?: Staff;
    guide?: Staff;
    passengers?: Passenger[];
    meal_schedules?: MealSchedule[];
    audit_log?: AuditLogEntry[];
    // V3 Fields
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    // V4 Fields
    public_token?: string;
    // V5 Fields
    meal_options?: {
        available_meals: {
            type: string;
            options: string[];
        }[];
    };
    // V7 Fields
    custom_tour_data?: CustomTourData;
    // V9 Fields
    selected_addons?: { id?: string; label: string; price: number }[];
    meal_per_group?: boolean;
    price_manual?: boolean;
    tour?: {
        name: string;
        includes: string;
        itinerary: any[];
    };
}

export interface CustomStop {
    time: string;
    location: string;
    notes?: string;
}

export interface Passenger {
    id: number;
    reservation_id: number;
    full_name: string;
    age?: number;
    id_document?: string;
    email?: string; // V3
    phone?: string; // V3
    food_order?: string;      // legacy single field
    dietary_notes?: string;   // legacy single field
    notes?: string;
    created_at: string;
    meals?: PassengerMeal[];  // V2: per-meal orders
}

export interface PassengerMeal {
    id: number;
    passenger_id: number;
    meal_type: MealType;
    food_order?: string;
    dietary_notes?: string;
    created_at: string;
}

export interface MealSchedule {
    id: number;
    reservation_id: number;
    restaurant_name: string;
    arrival_time?: string;
    pax_count?: number;
    special_requests?: string;
    created_at: string;
}

export interface AuditLogEntry {
    id: number;
    reservation_id: number;
    agent_id: string;
    agent_name: string;
    action: AuditAction;
    field_changed?: string;
    old_value?: string;
    new_value?: string;
    created_at: string;
}

// Meal type display labels
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    coffee_break: 'Coffee Break',
    snacks: 'Snacks',
    picnic: 'Picnic',
    cena: 'Cena',
};

// Status labels and colors for UI (AppFlowy palette)
export const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
    offered: { label: 'Ofrecido', color: '#6B6F7B', bg: '#E8EAF0' },
    reserved: { label: 'Reservado', color: '#E65100', bg: '#FFF3E0' },
    paid: { label: 'Pagado', color: '#2E7D32', bg: '#E8F5E9' },
    in_progress: { label: 'En Curso', color: '#1565C0', bg: '#E3F2FD' },
    completed: { label: 'Completado', color: '#21232A', bg: '#E8EAF0' },
    cancelled: { label: 'Cancelado', color: '#D32F2F', bg: '#FFEBEE' },
};

// Audit action labels
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
    created: 'Creado',
    updated: 'Actualizado',
    status_changed: 'Estado cambiado',
    deleted: 'Eliminado',
};
