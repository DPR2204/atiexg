import React, { useState, useEffect, useRef } from 'react';
import '../../styles/backoffice.css';
import { Outlet, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import { Toaster } from 'sonner';
import CommandPalette from './CommandPalette';
import ErrorBoundary from '../ErrorBoundary';

const NAV_ITEMS = [
    { path: '/backoffice', label: 'Dashboard', icon: '▣', end: true },
    { path: '/backoffice/reservas', label: 'Reservas', icon: '≡', end: false },
    { path: '/backoffice/tours', label: 'Tours', icon: '★', end: false },
    { path: '/backoffice/kanban', label: 'Tablero', icon: '⊞', end: false },
    { path: '/backoffice/calendario', label: 'Calendario', icon: '◫', end: false },
    { path: '/backoffice/logistica', label: 'Logística', icon: '⊡', end: false },
    { path: '/backoffice/recursos', label: 'Recursos', icon: '◈', end: false },
];

export default function BackofficeLayout() {
    const { agent, signOut, loading, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [badges, setBadges] = useState({ offered: 0, missingBoats: 0, pendingRequests: 0 });
    const badgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [collapsed, setCollapsed] = useState(false);

    // Real-time badges
    useEffect(() => {
        fetchBadges();

        const channel = supabase
            .channel('badges')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
                if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
                badgeTimerRef.current = setTimeout(() => fetchBadges(), 10000);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservation_requests' }, () => {
                if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
                badgeTimerRef.current = setTimeout(() => fetchBadges(), 3000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
        };
    }, []);

    async function fetchBadges() {
        const today = new Date().toISOString().split('T')[0];

        // Count offered (pending confirmation)
        const { count: offeredCount } = await supabase
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'offered');

        // Count missing boats today
        const { data: missingData } = await supabase
            .from('reservations')
            .select('id')
            .eq('tour_date', today)
            .is('boat_id', null)
            .neq('status', 'cancelled');

        // Count pending requests on reservations owned by the current agent
        let pendingReqs = 0;
        if (agent) {
            const { count } = await supabase
                .from('reservation_requests')
                .select('id, reservations!inner(agent_id)', { count: 'exact', head: true })
                .eq('status', 'pending')
                .eq('reservations.agent_id', agent.id);
            pendingReqs = count || 0;
        }

        setBadges(prev => {
            const newOffered = offeredCount || 0;
            const newMissing = missingData?.length || 0;
            if (prev.offered === newOffered && prev.missingBoats === newMissing && prev.pendingRequests === pendingReqs) return prev;
            return { offered: newOffered, missingBoats: newMissing, pendingRequests: pendingReqs };
        });
    }

    // Refresh badges when tab regains visibility (stale-tab fix)
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchBadges();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // Keyboard shortcut for palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Hide Elfsight translation widget in back-office
    useEffect(() => {
        const SELECTORS = '[class*="elfsight"], #__EAAPS_PORTAL, [class*="eapps"], [class*="es-portal"]';
        const hideElfsight = () => {
            document.querySelectorAll(SELECTORS).forEach((el) => {
                (el as HTMLElement).style.setProperty('display', 'none', 'important');
                (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
            });
        };
        hideElfsight();
        const t1 = setTimeout(hideElfsight, 500);
        const t2 = setTimeout(hideElfsight, 1500);
        const t3 = setTimeout(hideElfsight, 3000);
        let rafId: number;
        const observer = new MutationObserver(() => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(hideElfsight);
        });
        observer.observe(document.body, { childList: true, subtree: false });
        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
            cancelAnimationFrame(rafId);
            observer.disconnect();
            document.querySelectorAll(SELECTORS).forEach((el) => {
                (el as HTMLElement).style.removeProperty('display');
                (el as HTMLElement).style.removeProperty('visibility');
            });
        };
    }, []);

    if (loading) {
        return (
            <div className="bo-loading-screen">
                <div className="bo-loading-spinner" />
                <p style={{ color: '#9496A1', fontSize: '0.875rem' }}>Cargando...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/backoffice/login" state={{ from: location }} replace />;
    }

    const currentPage = location.pathname.startsWith('/backoffice/perfil')
        ? 'Mi Perfil'
        : NAV_ITEMS.find(
            (item) => item.end
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path) && item.path !== '/backoffice'
        )?.label || 'Dashboard';

    return (
        <div className="bo-layout notranslate" translate="no" lang="es">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="bo-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`bo-sidebar ${sidebarOpen ? 'bo-sidebar--open' : ''} ${collapsed ? 'bo-sidebar--collapsed' : ''}`}>
                {/* Logo */}
                <div className="bo-logo">
                    <span className="bo-logo-icon">⛵</span>
                    <div>
                        <h1 className="bo-logo-title">Atitlán EXG</h1>
                        <span className="bo-logo-subtitle">Back Office</span>
                    </div>
                    <button className="bo-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>

                {/* Navigation */}
                <nav className="bo-nav">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `bo-nav-item ${isActive ? 'bo-nav-item--active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                            title={collapsed ? item.label : ''}
                        >
                            <span className="bo-nav-icon">{item.icon}</span>
                            <span className="bo-nav-label">{item.label}</span>
                            {item.path === '/backoffice/reservas' && (badges.offered + badges.pendingRequests) > 0 && (
                                <span className="bo-nav-badge">{badges.offered + badges.pendingRequests}</span>
                            )}
                            {item.path === '/backoffice' && item.end && badges.missingBoats > 0 && (
                                <span className="bo-nav-badge">{badges.missingBoats}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Collapse toggle (inside sidebar) */}
                <div className="bo-sidebar-collapse">
                    <button
                        className="bo-sidebar-collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
                    >
                        {collapsed ? '▶' : '◀'}
                    </button>
                </div>

                {/* User footer */}
                <div className="bo-sidebar-footer">
                    <div className="bo-user-card" onClick={() => navigate('/backoffice/perfil')} style={{ cursor: 'pointer' }}>
                        <div className="bo-user-avatar">
                            {agent?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }} className="bo-user-info">
                            <div className="bo-user-name">{agent?.name || 'Agente'}</div>
                            <div className="bo-user-role">
                                {agent?.role === 'admin' ? 'Admin' : 'Agente'}
                            </div>
                        </div>
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                await signOut();
                                // Force hard redirect to clear all contexts
                                window.location.href = '/backoffice/login';
                            }}
                            title="Cerrar sesión"
                            className="bo-logout-btn"
                            style={{
                                background: 'rgba(33, 35, 42, 0.05)',
                                border: '1px solid rgba(33, 35, 42, 0.08)',
                                cursor: 'pointer',
                                color: '#9496A1',
                                fontSize: '1rem',
                                padding: '0.4rem',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 150ms ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#D32F2F';
                                e.currentTarget.style.background = '#FFEBEE';
                                e.currentTarget.style.borderColor = '#FFCDD2';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = '#9496A1';
                                e.currentTarget.style.background = 'rgba(33, 35, 42, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(33, 35, 42, 0.08)';
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, marginRight: '4px' }} className="bo-logout-text">Salir</span>
                            ⎋
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className={`bo-main ${collapsed ? 'bo-main--expanded' : ''}`}>
                <header className="bo-header">
                    <div className="bo-header-left">
                        <button
                            className="bo-menu-toggle"
                            onClick={() => setSidebarOpen(true)}
                        >
                            ☰
                        </button>
                        <div className="bo-breadcrumb">
                            <span className="bo-breadcrumb-sep">Atitlán EXG</span>
                            <span className="bo-breadcrumb-sep">/</span>
                            <span className="bo-breadcrumb-current">{currentPage}</span>
                        </div>
                    </div>
                    <div className="bo-header-right">
                        <div className="bo-header-search" onClick={() => setPaletteOpen(true)}>
                            <Search size={14} />
                            <span>Buscar...</span>
                            <kbd>⌘K</kbd>
                        </div>
                        <span className="bo-header-date">
                            {new Date().toLocaleDateString('es-GT', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                </header>

                <div className="bo-content">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>

            <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
            <Toaster position="top-right" richColors closeButton duration={3000} />
        </div>
    );
}
