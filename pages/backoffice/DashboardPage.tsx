import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Reservation } from '../../types/backoffice';
import { STATUS_CONFIG } from '../../types/backoffice';

export default function DashboardPage() {
    const { agent } = useAuth();
    const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
    const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });
    const [prevStats, setPrevStats] = useState({ total: 0, revenue: 0 });
    const [topTours, setTopTours] = useState<{ name: string, count: number }[]>([]);
    const [missingBoats, setMissingBoats] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    async function fetchDashboard() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        // 1. Today's reservations
        const { data: todayData } = await supabase
            .from('reservations')
            .select('*, agent:agents(name), boat:boats(name), driver:staff!reservations_driver_id_fkey(name), guide:staff!reservations_guide_id_fkey(name)')
            .eq('tour_date', today)
            .neq('status', 'cancelled')
            .order('start_time', { ascending: true });

        // Check for operational issues
        const missing = (todayData || []).filter((r: any) => !r.boat_id && r.status !== 'cancelled').length;
        setMissingBoats(missing);

        // 2. Upcoming
        const { data: upcomingData } = await supabase
            .from('reservations')
            .select('*, agent:agents(name)')
            .gt('tour_date', today)
            .lte('tour_date', nextWeek)
            .neq('status', 'cancelled')
            .order('tour_date', { ascending: true })
            .limit(10);

        // 3. Current Month Stats
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const { data: monthData } = await supabase
            .from('reservations')
            .select('status, total_amount, paid_amount, tour_name')
            .gte('tour_date', monthStart)
            .neq('status', 'cancelled');

        const total = monthData?.length || 0;
        const pending = monthData?.filter(r => r.status === 'offered' || r.status === 'reserved').length || 0;
        const confirmed = monthData?.filter(r => r.status === 'paid' || r.status === 'in_progress' || r.status === 'completed').length || 0;
        const revenue = monthData?.reduce((sum, r) => sum + (r.paid_amount || 0), 0) || 0;

        // Calculate Top Tours
        const tourCounts: Record<string, number> = {};
        monthData?.forEach(r => {
            tourCounts[r.tour_name] = (tourCounts[r.tour_name] || 0) + 1;
        });
        const top = Object.entries(tourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));

        // 4. Previous Month Stats (for comparison)
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

        const { data: prevData } = await supabase
            .from('reservations')
            .select('total_amount, paid_amount')
            .gte('tour_date', prevMonthStart)
            .lte('tour_date', prevMonthEnd)
            .neq('status', 'cancelled');

        const prevTotal = prevData?.length || 0;
        const prevRevenue = prevData?.reduce((sum, r) => sum + (r.paid_amount || 0), 0) || 0;

        setTodayReservations((todayData as Reservation[]) || []);
        setUpcomingReservations((upcomingData as Reservation[]) || []);
        setStats({ total, pending, confirmed, revenue });
        setPrevStats({ total: prevTotal, revenue: prevRevenue });
        setTopTours(top);
        setLoading(false);
    }

    if (loading) {
        return <div className="bo-loading"><div className="bo-loading-spinner" /></div>;
    }

    // Helper for trend calculation
    const getTrend = (current: number, previous: number) => {
        if (previous === 0) return { val: '+100%', up: true };
        const change = ((current - previous) / previous) * 100;
        return {
            val: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
            up: change >= 0
        };
    };

    const tourTrend = getTrend(stats.total, prevStats.total);
    const revTrend = getTrend(stats.revenue, prevStats.revenue);

    return (
        <div className="bo-dashboard">
            {/* Greeting & Alerts */}
            <header className="bo-header">
                <h2 className="bo-title">Resumen Operativo</h2>
                <p className="bo-subtitle">Hola, {agent?.name?.split(' ')[0] || 'Agent'}. Bienvenido de vuelta.</p>
                {missingBoats > 0 && (
                    <div className="bo-alert-banner" style={{ marginTop: '16px' }}>
                        Atención: Hay <strong>{missingBoats}</strong> tours hoy sin lancha asignada.
                    </div>
                )}
            </header>

            {/* Stats cards */}
            <div className="bo-stats-grid">
                <div className="bo-stat-card">
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Tours Mes</span>
                        <span className="bo-stat-value">{stats.total}</span>
                        <span className={`bo-stat-trend ${tourTrend.up ? 'bo-trend-up' : 'bo-trend-down'}`}>
                            {tourTrend.val} vs mes anterior
                        </span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Pendientes</span>
                        <span className="bo-stat-value">{stats.pending}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Confirmados</span>
                        <span className="bo-stat-value">{stats.confirmed}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Ingresos Mes</span>
                        <span className="bo-stat-value">${stats.revenue.toLocaleString()}</span>
                        <span className={`bo-stat-trend ${revTrend.up ? 'bo-trend-up' : 'bo-trend-down'}`}>
                            {revTrend.val} vs mes anterior
                        </span>
                    </div>
                </div>
            </div>

            <div className="bo-dashboard-layout">
                <div className="bo-dashboard-main">
                    {/* Today's tours */}
                    <section className="bo-section">
                        <div className="bo-section-header">
                            <h3 className="bo-section-title">Tours de Hoy <span className="bo-count">{todayReservations.length}</span></h3>
                        </div>
                        {todayReservations.length === 0 ? (
                            <div className="bo-empty-state"><p>No hay tours programados para hoy</p></div>
                        ) : (
                            <div className="bo-table-container">
                                <table className="bo-table">
                                    <thead>
                                        <tr>
                                            <th>Tour</th>
                                            <th>Hora</th>
                                            <th>Pax</th>
                                            <th>Lancha</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayReservations.map((res) => (
                                            <tr key={res.id}>
                                                <td className="bo-cell-bold">{res.tour_name}</td>
                                                <td>{res.start_time?.slice(0, 5) || '—'}</td>
                                                <td>{res.pax_count}</td>
                                                <td style={{ color: !res.boat_id ? '#d44020' : 'inherit' }}>
                                                    {(res.boat as any)?.name || '⚠ Sin Asignar'}
                                                </td>
                                                <td>
                                                    <span className="bo-status-badge" style={{ backgroundColor: STATUS_CONFIG[res.status]?.bg, color: STATUS_CONFIG[res.status]?.color }}>
                                                        {STATUS_CONFIG[res.status]?.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                <div className="bo-dashboard-side">
                    {/* Top Tours */}
                    <section className="bo-section">
                        <div className="bo-section-header">
                            <h3 className="bo-section-title">Ranking de Tours (Mes)</h3>
                        </div>
                        <div className="bo-top-tours">
                            {topTours.map((t, i) => (
                                <div key={t.name} className="bo-top-tour-item">
                                    <span className="bo-top-tour-rank">#{i + 1}</span>
                                    <span className="bo-top-tour-name">{t.name}</span>
                                    <span className="bo-top-tour-count">{t.count}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Upcoming tours (Compact) */}
                    <section className="bo-section">
                        <h3 className="bo-section-title">📆 Próximos</h3>
                        <div className="bo-mini-list">
                            {upcomingReservations.map((res) => (
                                <div key={res.id} className="bo-mini-item">
                                    <div className="bo-mini-date">
                                        {new Date(res.tour_date + 'T12:00:00').getDate()}
                                    </div>
                                    <div className="bo-mini-content">
                                        <div className="bo-mini-title">{res.tour_name}</div>
                                        <div className="bo-mini-meta">{res.pax_count} pax • {(res.agent as any)?.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
