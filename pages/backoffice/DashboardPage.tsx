import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Reservation } from '../../types/backoffice';
import { STATUS_CONFIG } from '../../types/backoffice';
import { generateReportCSV } from '../../lib/generateReportCSV';
import { generateReportPDF } from '../../lib/generateReportPDF';

type DatePreset = 'today' | 'week' | 'month' | 'year' | 'custom';

function getPresetRange(preset: DatePreset): { from: string; to: string } {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (preset) {
        case 'today':
            return { from: today, to: today };
        case 'week': {
            const day = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return { from: monday.toISOString().split('T')[0], to: sunday.toISOString().split('T')[0] };
        }
        case 'month': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { from: monthStart.toISOString().split('T')[0], to: monthEnd.toISOString().split('T')[0] };
        }
        case 'year': {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return { from: yearStart.toISOString().split('T')[0], to: today };
        }
        default:
            return { from: today, to: today };
    }
}

function getPreviousPeriod(from: string, to: string): { from: string; to: string } {
    const d1 = new Date(from + 'T12:00:00');
    const d2 = new Date(to + 'T12:00:00');
    const days = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
    const prevEnd = new Date(d1);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - days + 1);
    return { from: prevStart.toISOString().split('T')[0], to: prevEnd.toISOString().split('T')[0] };
}

const PRESET_LABELS: Record<DatePreset, string> = {
    today: 'Hoy',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
    custom: 'Personalizado',
};

export default function DashboardPage() {
    const { agent } = useAuth();

    // Date filter state
    const defaultRange = getPresetRange('month');
    const [activePreset, setActivePreset] = useState<DatePreset>('month');
    const [dateFrom, setDateFrom] = useState(defaultRange.from);
    const [dateTo, setDateTo] = useState(defaultRange.to);
    const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
    const [appliedTo, setAppliedTo] = useState(defaultRange.to);

    // Report dropdown
    const [showReportMenu, setShowReportMenu] = useState(false);
    const reportMenuRef = useRef<HTMLDivElement>(null);

    // Dashboard data
    const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
    const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
    const [periodReservations, setPeriodReservations] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });
    const [prevStats, setPrevStats] = useState({ total: 0, revenue: 0 });
    const [topTours, setTopTours] = useState<{ name: string; count: number }[]>([]);
    const [agentRanking, setAgentRanking] = useState<{ name: string; amount: number; count: number }[]>([]);
    const [missingBoats, setMissingBoats] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Close report dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (reportMenuRef.current && !reportMenuRef.current.contains(e.target as Node)) {
                setShowReportMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        fetchDashboard(appliedFrom, appliedTo);
    }, [appliedFrom, appliedTo]);

    function handlePresetClick(preset: DatePreset) {
        setActivePreset(preset);
        if (preset !== 'custom') {
            const range = getPresetRange(preset);
            setDateFrom(range.from);
            setDateTo(range.to);
            setAppliedFrom(range.from);
            setAppliedTo(range.to);
        }
    }

    function handleApplyCustom() {
        if (dateFrom && dateTo && dateFrom <= dateTo) {
            setAppliedFrom(dateFrom);
            setAppliedTo(dateTo);
        }
    }

    async function fetchDashboard(rangeFrom: string, rangeTo: string) {
        setLoading(true);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        // 1. Today's reservations (always today, independent of filter)
        const { data: todayData } = await supabase
            .from('reservations')
            .select('*, agent:agents(name), boat:boats(name), driver:staff!reservations_driver_id_fkey(name), guide:staff!reservations_guide_id_fkey(name)')
            .eq('tour_date', today)
            .neq('status', 'cancelled')
            .order('start_time', { ascending: true });

        const missing = (todayData || []).filter((r: any) => !r.boat_id && r.status !== 'cancelled').length;
        setMissingBoats(missing);

        // 2. Upcoming (always next 7 days, independent of filter)
        const { data: upcomingData } = await supabase
            .from('reservations')
            .select('*, agent:agents(name)')
            .gt('tour_date', today)
            .lte('tour_date', nextWeek)
            .neq('status', 'cancelled')
            .order('tour_date', { ascending: true })
            .limit(10);

        // 3. Period Stats (filtered by date range)
        const { data: periodData } = await supabase
            .from('reservations')
            .select('id, status, total_amount, paid_amount, tour_name, tour_date, start_time, pax_count, agent:agents(name)')
            .gte('tour_date', rangeFrom)
            .lte('tour_date', rangeTo)
            .neq('status', 'cancelled')
            .order('tour_date', { ascending: true });

        const rows = periodData || [];
        setPeriodReservations(rows);

        const total = rows.length;
        const pending = rows.filter(r => r.status === 'offered' || r.status === 'reserved').length;
        const confirmed = rows.filter(r => r.status === 'paid' || r.status === 'in_progress' || r.status === 'completed').length;
        const revenue = rows.reduce((sum, r) => sum + (r.paid_amount || 0), 0);

        // Agent Ranking
        const agentSales: Record<string, { amount: number; count: number }> = {};
        rows.forEach((r: any) => {
            const name = r.agent?.name || 'Desconocido';
            if (!agentSales[name]) agentSales[name] = { amount: 0, count: 0 };
            agentSales[name].amount += r.total_amount || 0;
            agentSales[name].count += 1;
        });
        const ranking = Object.entries(agentSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Top Tours
        const tourCounts: Record<string, number> = {};
        rows.forEach(r => {
            tourCounts[r.tour_name] = (tourCounts[r.tour_name] || 0) + 1;
        });
        const top = Object.entries(tourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // 4. Previous Period Stats (for comparison)
        const prev = getPreviousPeriod(rangeFrom, rangeTo);
        const { data: prevData } = await supabase
            .from('reservations')
            .select('total_amount, paid_amount')
            .gte('tour_date', prev.from)
            .lte('tour_date', prev.to)
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

    // Report handlers
    function handleDownloadCSV() {
        setShowReportMenu(false);
        const rows = periodReservations.map((r: any) => ({
            id: r.id,
            tour_name: r.tour_name,
            tour_date: r.tour_date,
            start_time: r.start_time,
            pax_count: r.pax_count,
            status: r.status,
            agent_name: r.agent?.name || 'Desconocido',
            total_amount: r.total_amount || 0,
            paid_amount: r.paid_amount || 0,
        }));
        generateReportCSV(rows, appliedFrom, appliedTo);
    }

    function handleDownloadPDF() {
        setShowReportMenu(false);
        const rows = periodReservations.map((r: any) => ({
            id: r.id,
            tour_name: r.tour_name,
            tour_date: r.tour_date,
            start_time: r.start_time,
            pax_count: r.pax_count,
            status: r.status,
            agent_name: r.agent?.name || 'Desconocido',
            total_amount: r.total_amount || 0,
            paid_amount: r.paid_amount || 0,
        }));
        const tourRanking = topTours.map(t => ({ name: t.name, count: t.count }));
        const agentRank = agentRanking.map(a => ({ name: a.name, count: a.count, amount: a.amount }));
        generateReportPDF(rows, stats, tourRanking, agentRank, appliedFrom, appliedTo);
    }

    // Trend helper
    const getTrend = (current: number, previous: number) => {
        if (previous === 0) return { val: current > 0 ? '+100%' : '0%', up: current > 0 };
        const change = ((current - previous) / previous) * 100;
        return {
            val: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
            up: change >= 0,
        };
    };

    const tourTrend = getTrend(stats.total, prevStats.total);
    const revTrend = getTrend(stats.revenue, prevStats.revenue);

    // Period label
    const fmtShortDate = (d: string) => {
        const dt = new Date(d + 'T12:00:00');
        return dt.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
    };
    const periodLabel = appliedFrom === appliedTo
        ? fmtShortDate(appliedFrom)
        : `${fmtShortDate(appliedFrom)} – ${fmtShortDate(appliedTo)}`;

    if (loading) {
        return <div className="bo-loading"><div className="bo-loading-spinner" /></div>;
    }

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

            {/* Date Filter Bar */}
            <div className="bo-date-filter-bar">
                <div className="bo-date-filter-presets">
                    {(Object.keys(PRESET_LABELS) as DatePreset[]).map(preset => (
                        <button
                            key={preset}
                            className={`bo-date-preset-btn ${activePreset === preset ? 'bo-date-preset-btn--active' : ''}`}
                            onClick={() => handlePresetClick(preset)}
                        >
                            {PRESET_LABELS[preset]}
                        </button>
                    ))}
                </div>

                <div className="bo-date-filter-inputs">
                    <label className="bo-date-input-group">
                        <span className="bo-date-input-label">Desde</span>
                        <input
                            type="date"
                            className="bo-input bo-date-input"
                            value={dateFrom}
                            onChange={e => {
                                setDateFrom(e.target.value);
                                setActivePreset('custom');
                            }}
                        />
                    </label>
                    <label className="bo-date-input-group">
                        <span className="bo-date-input-label">Hasta</span>
                        <input
                            type="date"
                            className="bo-input bo-date-input"
                            value={dateTo}
                            onChange={e => {
                                setDateTo(e.target.value);
                                setActivePreset('custom');
                            }}
                        />
                    </label>
                    {activePreset === 'custom' && (
                        <button className="bo-btn bo-btn--primary bo-date-apply-btn" onClick={handleApplyCustom}>
                            Aplicar
                        </button>
                    )}
                </div>

                {/* Report Download */}
                <div className="bo-report-dropdown" ref={reportMenuRef}>
                    <button
                        className="bo-btn bo-btn--outline bo-report-btn"
                        onClick={() => setShowReportMenu(!showReportMenu)}
                    >
                        <span className="bo-report-btn-icon">↓</span>
                        Descargar Reporte
                    </button>
                    {showReportMenu && (
                        <div className="bo-report-menu">
                            <button className="bo-report-menu-item" onClick={handleDownloadCSV}>
                                <span className="bo-report-menu-icon">📊</span>
                                <div>
                                    <div className="bo-report-menu-title">CSV / Excel</div>
                                    <div className="bo-report-menu-desc">Datos tabulares para hojas de cálculo</div>
                                </div>
                            </button>
                            <button className="bo-report-menu-item" onClick={handleDownloadPDF}>
                                <span className="bo-report-menu-icon">📄</span>
                                <div>
                                    <div className="bo-report-menu-title">PDF</div>
                                    <div className="bo-report-menu-desc">Reporte visual para imprimir</div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats cards */}
            <div className="bo-stats-grid">
                <div className="bo-stat-card">
                    <div className="bo-stat-icon">⛵</div>
                    <div className="bo-stat-info">
                        <span className="bo-stat-label">Tours ({periodLabel})</span>
                        <span className="bo-stat-value">{stats.total}</span>
                        <span className={`bo-stat-trend ${tourTrend.up ? 'bo-trend-up' : 'bo-trend-down'}`}>
                            {tourTrend.val} vs periodo anterior
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
                        <span className="bo-stat-label">Ingresos ({periodLabel})</span>
                        <span className="bo-stat-value">${stats.revenue.toLocaleString()}</span>
                        <span className={`bo-stat-trend ${revTrend.up ? 'bo-trend-up' : 'bo-trend-down'}`}>
                            {revTrend.val} vs periodo anterior
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
                                <p>Sin datos en este periodo</p>
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
