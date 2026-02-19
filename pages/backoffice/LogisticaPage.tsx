import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Reservation, Passenger, MealSchedule, MEAL_TYPE_LABELS } from '../../types/backoffice';

export default function LogisticaPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchLogisticsData();
    }, [filterDate]);

    async function fetchLogisticsData() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reservations')
                .select(`
          *,
          agent:agents(name),
          boat:boats(name),
          passengers(*, meals:passenger_meals(*)),
          meal_schedules(*)
        `)
                .eq('tour_date', filterDate)
                .neq('status', 'cancelled');

            if (error) throw error;
            setReservations(data || []);
        } catch (err) {
            console.error('Error fetching logistics:', err);
        } finally {
            setLoading(false);
        }
    }

    const totalPax = reservations.reduce((sum, res) => sum + (res.pax_count || 0), 0);

    // Build consolidated food orders from passenger_meals (v2 model)
    const allFoodOrders = reservations.flatMap(res =>
        (res.passengers || []).flatMap((p: any) =>
            (p.meals || []).filter((m: any) => m.food_order).map((m: any) => ({
                passenger_name: p.full_name,
                tour: res.tour_name,
                meal_type: m.meal_type,
                food_order: m.food_order,
                dietary_notes: m.dietary_notes,
                id: m.id,
            }))
        )
    );

    // Group by meal_type for better display
    const mealsByType = allFoodOrders.reduce((acc: Record<string, typeof allFoodOrders>, item) => {
        const key = item.meal_type || 'general';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, typeof allFoodOrders>);

    return (
        <div className="bo-logistica">
            <header className="bo-header bo-flex bo-justify-between bo-align-center">
                <div>
                    <h2 className="bo-title">Logística y Operaciones</h2>
                    <p className="bo-subtitle">Control de manifiesto, restauración y rutas para hoy</p>
                </div>
                <div className="bo-flex bo-gap-2">
                    <input
                        type="date"
                        className="bo-input"
                        style={{ width: 'auto' }}
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                    <button className="bo-btn bo-btn--secondary" onClick={() => window.print()}>
                        Imprimir Hoja
                    </button>
                </div>
            </header>

            <div className="bo-stats-grid">
                <div className="bo-stat-card">
                    <div className="bo-stat-icon">👥</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Pasajeros Total</span>
                        <span className="bo-stat-value">{totalPax}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--info">⛵</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Tours</span>
                        <span className="bo-stat-value">{reservations.length}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--warning">🍽️</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Órdenes Comida</span>
                        <span className="bo-stat-value">{allFoodOrders.length}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--success">📍</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Paradas Especiales</span>
                        <span className="bo-stat-value">
                            {reservations.filter(r => (r.custom_stops as any[])?.length > 0).length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bo-logistics-grid">
                {/* Comida Section */}
                {/* Comida Section */}
                <section className="bo-section">
                    <div className="bo-section-header">
                        <h2 className="bo-section-title">
                            🍽️ Consolidado de Comida
                        </h2>
                    </div>

                    {Object.keys(mealsByType).length > 0 ? (
                        <div className="bo-meals-grid">
                            {Object.entries(mealsByType).map(([type, orders]: [string, any[]]) => (
                                <div key={type} className="bo-meal-card bo-glass-card">
                                    <h3 className="bo-meal-title">
                                        {MEAL_TYPE_LABELS[type as keyof typeof MEAL_TYPE_LABELS] || type}
                                        <span className="bo-badge">{orders.length}</span>
                                    </h3>
                                    <div className="bo-meal-list">
                                        {orders.map((order: any) => (
                                            <div key={order.id} className="bo-meal-item">
                                                <div className="bo-meal-header">
                                                    <span className="bo-meal-pax">{order.passenger_name}</span>
                                                    <span className="bo-meal-tour">{order.tour}</span>
                                                </div>
                                                <div className="bo-meal-detail">
                                                    <span className="bo-badge bo-badge--warning">{order.food_order}</span>
                                                    {order.dietary_notes && (
                                                        <span className="bo-meal-notes">⚠️ {order.dietary_notes}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bo-empty-state">
                            <span className="bo-empty-state-icon">🍽️</span>
                            <p>No hay órdenes de comida registradas para esta fecha</p>
                            <span className="bo-empty-state-hint">Las órdenes aparecerán cuando los pasajeros tengan comidas asignadas</span>
                        </div>
                    )}
                </section>

                {/* Paradas & Manifiesto */}
                <section className="bo-section">
                    <div className="bo-section-header">
                        <h2 className="bo-section-title">
                            📍 Itinerarios y Paradas
                        </h2>
                    </div>
                    <div className="bo-itinerary-list">
                        {reservations.length > 0 ? reservations.map(res => (
                            <div key={res.id} className="bo-card bo-glass-card">
                                <div className="bo-card-header">
                                    <div>
                                        <h3 className="bo-card-title">{res.tour_name}</h3>
                                        <p className="bo-card-subtitle">
                                            Barco: {(res.boat as any)?.name || 'No asignado'} • {res.pax_count} Pax
                                        </p>
                                    </div>
                                    <span className="bo-badge bo-badge--neutral">
                                        🕒 {res.start_time?.slice(0, 5)}
                                    </span>
                                </div>

                                {/* Custom Stops */}
                                <div className="bo-card-section">
                                    <h4 className="bo-section-label">Paradas & Logística</h4>
                                    <div className="bo-tags">
                                        {((res.custom_stops as string[]) || []).length > 0 ? (
                                            (res.custom_stops as string[]).map((stop, i) => (
                                                <span key={i} className="bo-tag bo-tag--info">
                                                    📍 {stop}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="bo-text-muted bo-text-sm">Sin paradas especiales</span>
                                        )}
                                    </div>
                                </div>

                                {/* Meal Schedule */}
                                {res.meal_schedules && res.meal_schedules.length > 0 && (
                                    <div className="bo-card-section bo-border-top">
                                        <h4 className="bo-section-label">Restauración</h4>
                                        {res.meal_schedules.map(meal => (
                                            <div key={meal.id} className="bo-meal-row">
                                                <span className="bo-text-bold">{meal.restaurant_name}</span>
                                                <span className="bo-text-sm bo-text-muted">Llegada: {meal.arrival_time?.slice(0, 5)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="bo-empty-state">
                                <span className="bo-empty-state-icon">📍</span>
                                <p>No hay tours programados para esta fecha</p>
                                <span className="bo-empty-state-hint">Seleccioná otra fecha o creá una reserva</span>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          .bo-sidebar, .bo-header, .bo-btn, input[type="date"], .bo-menu-toggle { display: none !important; }
          .bo-main { margin-left: 0 !important; padding: 0 !important; }
          .bo-glass-card, .bo-card { border: 1px solid #ccc !important; box-shadow: none !important; backdrop-filter: none !important; background: white !important; page-break-inside: avoid; }
          body { background: white !important; color: black !important; }
          .bo-logistica { padding: 0 !important; }
          .bo-page-title { font-size: 18pt !important; margin-bottom: 20px !important; }
          .bo-section { margin-top: 20px !important; }
        }
      `}} />
        </div>
    );
}
