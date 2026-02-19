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
    const [agentRanking, setAgentRanking] = useState<{ name: string, amount: number, count: number }[]>([]);
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

        // Calculate Agent Ranking (Total Sales)
        // We use total_amount for ranking sales volume
        const agentSales: Record<string, { amount: number, count: number }> = {};
        // We need to fetch agent names for this, let's grab them from a separate query or join if possible
        // Actually, let's fetch montData with agent names
        const { data: monthDataWithAgents } = await supabase
            .from('reservations')
            .select('total_amount, agent:agents(name)')
            .gte('tour_date', monthStart)
            .neq('status', 'cancelled');

        if (monthDataWithAgents) {
            monthDataWithAgents.forEach((r: any) => {
                const name = r.agent?.name || 'Desconocido';
                if (!agentSales[name]) agentSales[name] = { amount: 0, count: 0 };
                agentSales[name].amount += (r.total_amount || 0);
                agentSales[name].count += 1;
            });
        }

        const ranking = Object.entries(agentSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

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
        setAgentRanking(ranking);
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
                    <div className="bo-stat-icon">⛵</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Tours Mes</span>
                        <span className="bo-stat-value">{stats.total}</span>
                        <span className={`bo-stat-trend ${tourTrend.up ? 'bo-trend-up' : 'bo-trend-down'}`}>
                            {tourTrend.val} vs mes anterior
                        </span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--warning">⏳</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Pendientes</span>
                        <span className="bo-stat-value">{stats.pending}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--success">✓</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Confirmados</span>
                        <span className="bo-stat-value">{stats.confirmed}</span>
                    </div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-icon bo-stat-icon--info">$</div>
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
                    <div className="bo-section-card">
                        <div className="bo-section-header">
                            <h3 className="bo-section-title">☀️ Tours de Hoy <span className="bo-count">{todayReservations.length}</span></h3>
                        </div>
                        {todayReservations.length === 0 ? (
                            <div className="bo-empty-state">
                                <span className="bo-empty-state-icon">📋</span>
                                <p>No hay tours programados para hoy</p>
                                <span className="bo-empty-state-hint">Los tours aparecerán aquí cuando se agenden</span>
                            </div>
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
                                                <td style={{ color: !res.boat_id ? 'var(--bo-danger)' : 'inherit' }}>
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
                    </div>
                </div>

                <div className="bo-dashboard-side">
                    {/* Top Tours */}
                    <div className="bo-section-card">
                        <div className="bo-section-header">
                            <h3 className="bo-section-title">🏆 Ranking Tours</h3>
                        </div>
                        {topTours.length === 0 ? (
                            <div className="bo-empty-state">
                                <span className="bo-empty-state-icon">📊</span>
                                <p>Sin datos este mes</p>
                            </div>
                        ) : (
                            <div className="bo-top-tours">
                                {topTours.map((t, i) => (
                                    <div key={t.name} className="bo-top-tour-item">
                                        <span className="bo-top-tour-rank">#{i + 1}</span>
                                        <span className="bo-top-tour-name">{t.name}</span>
                                        <span className="bo-top-tour-count">{t.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Agent Ranking */}
                    <div className="bo-section-card">
                        <div className="bo-section-header">
                            <h3 className="bo-section-title">👤 Ranking Agentes</h3>
                        </div>
                        {agentRanking.length === 0 ? (
                            <div className="bo-empty-state">
                                <span className="bo-empty-state-icon">📈</span>
                                <p>Sin ventas registradas</p>
                            </div>
                        ) : (
                            <div className="bo-ranking-list">
                                {agentRanking.map((a, i) => (
                                    <div key={a.name} className="bo-ranking-item">
                                        <div className="bo-ranking-item-left">
                                            <span className="bo-ranking-item-rank">#{i + 1}</span>
                                            <span className="bo-ranking-item-name">{a.name}</span>
                                        </div>
                                        <div className="bo-ranking-item-right">
                                            <div className="bo-ranking-item-amount">${a.amount.toLocaleString()}</div>
                                            <div className="bo-ranking-item-meta">{a.count} ventas</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming tours (Compact) */}
                    <div className="bo-section-card">
                        <div className="bo-section-header">
                            <h3 className="bo-section-title">📆 Próximos</h3>
                        </div>
                        {upcomingReservations.length === 0 ? (
                            <div className="bo-empty-state">
                                <span className="bo-empty-state-icon">🗓️</span>
                                <p>Sin tours próximos</p>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
