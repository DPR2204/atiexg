import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import CommandPalette from './CommandPalette';

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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [badges, setBadges] = useState({ offered: 0, missingBoats: 0 });

    // Real-time badges
    useEffect(() => {
        fetchBadges();

        const channel = supabase
            .channel('badges')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
                fetchBadges();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
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

        setBadges({
            offered: offeredCount || 0,
            missingBoats: missingData?.length || 0
        });
    }

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
        const observer = new MutationObserver(hideElfsight);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
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
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cargando...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/backoffice/login" state={{ from: location }} replace />;
    }

    const currentPage = NAV_ITEMS.find(
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
            <aside className={`bo-sidebar ${sidebarOpen ? 'bo-sidebar--open' : ''}`}>
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
                        >
                            <span className="bo-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.path === '/backoffice/reservas' && badges.offered > 0 && (
                                <span className="bo-nav-badge">{badges.offered}</span>
                            )}
                            {item.path === '/backoffice' && item.end && badges.missingBoats > 0 && (
                                <span className="bo-nav-badge">{badges.missingBoats}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User footer */}
                <div className="bo-sidebar-footer">
                    <div className="bo-user-card">
                        <div className="bo-user-avatar">
                            {agent?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="bo-user-name">{agent?.name || 'Agente'}</div>
                            <div className="bo-user-role">
                                {agent?.role === 'admin' ? 'Admin' : 'Agente'}
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                await signOut();
                                // Force hard redirect to clear all contexts
                                window.location.href = '/backoffice/login';
                            }}
                            title="Cerrar sesión"
                            className="bo-logout-btn"
                            style={{
                                background: 'rgba(55, 53, 47, 0.05)',
                                border: '1px solid rgba(55, 53, 47, 0.1)',
                                cursor: 'pointer',
                                color: '#64748b',
                                fontSize: '1rem',
                                padding: '0.4rem',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 150ms ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#d44020';
                                e.currentTarget.style.background = '#fbe4e4';
                                e.currentTarget.style.borderColor = '#f7caca';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = '#64748b';
                                e.currentTarget.style.background = 'rgba(55, 53, 47, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.1)';
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, marginRight: '4px' }}>Salir</span>
                            ⎋
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="bo-main">
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
                    <Outlet />
                </div>
            </main>

            <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </div>
    );
}
