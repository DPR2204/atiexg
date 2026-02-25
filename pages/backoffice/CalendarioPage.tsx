import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../lib/supabase';
import { updateReservation, formatReservationCode } from '../../lib/reservation-logic';
import type { Reservation } from '../../types/backoffice';
import { STATUS_CONFIG, type ReservationStatus } from '../../types/backoffice';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Normalize any date string to YYYY-MM-DD (fixes timezone offset issues from Supabase)
function toDateStr(date: string | null | undefined): string {
    if (!date) return '';
    return date.split('T')[0];
}

// ==========================================
// Draggable Components
// ==========================================

function DraggableReservation({ res, isOverlay = false }: { res: Reservation; isOverlay?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `res-${res.id}`,
        data: res
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
        backgroundColor: STATUS_CONFIG[res.status]?.bg,
        borderLeft: `3px solid ${STATUS_CONFIG[res.status]?.color}`,
        cursor: 'grab',
        touchAction: 'none',
        zIndex: isOverlay ? 999 : 'auto',
    };

    const tooltipText = `${res.tour_name} — ${res.start_time?.slice(0, 5) || 'Sin hora'} • ${res.pax_count} pax`;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`bo-cal-card ${isOverlay ? 'bo-cal-card--overlay' : ''}`} title={tooltipText}>
            <div className="bo-cal-card-title">{res.tour_name}</div>
            <div className="bo-cal-card-meta">
                {res.start_time?.slice(0, 5)} • {res.pax_count} pax
            </div>
            {res.end_date && res.end_date !== res.tour_date && (
                <div className="bo-cal-card-span">
                    Multi-dia
                </div>
            )}
        </div>
    );
}

function DroppableDay({ dateStr, dayNumber, isToday, isSelected, isOtherMonth, children, onSelect }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: dateStr,
    });

    return (
        <div
            ref={setNodeRef}
            className={`bo-cal-cell ${!dayNumber ? 'bo-cal-cell--empty' : ''} ${isToday ? 'bo-cal-cell--today' : ''} ${isSelected ? 'bo-cal-cell--selected' : ''} ${isOver ? 'bo-cal-cell--over' : ''} ${isOtherMonth ? 'bo-cal-cell--other-month' : ''}`}
            onClick={onSelect}
        >
            {dayNumber && <span className="bo-cal-date">{dayNumber}</span>}
            <div className="bo-cal-cell-content">
                {children}
            </div>
        </div>
    );
}

// ==========================================
// Main Component
// ==========================================

export default function CalendarioPage() {
    const { agent } = useAuth();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [activeDragId, setActiveDragId] = useState<number | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        fetchReservations();
    }, [year, month, viewMode]);

    async function fetchReservations() {
        setLoading(true);
        try {
            let startStr, endStr;

            if (viewMode === 'month') {
                startStr = new Date(year, month, 1).toISOString().split('T')[0];
                endStr = new Date(year, month + 1, 0).toISOString().split('T')[0];
            } else {
                // Week view: start of current week (Sunday)
                const curr = new Date(currentDate);
                const dayOfWeek = curr.getDay();
                const sunday = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - dayOfWeek);
                const saturday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 6);
                startStr = sunday.toISOString().split('T')[0];
                endStr = saturday.toISOString().split('T')[0];
            }

            const { data, error } = await supabase
                .from('reservations')
                .select('*, agent:agents(name), boat:boats(name)')
                .gte('tour_date', startStr)
                .lte('tour_date', endStr)
                .neq('status', 'cancelled')
                .order('start_time', { ascending: true });

            if (error) throw error;

            // Normalize tour_date to YYYY-MM-DD to avoid timezone comparison issues
            const normalized = (data || []).map((r: any) => ({
                ...r,
                tour_date: toDateStr(r.tour_date),
                end_date: toDateStr(r.end_date),
            }));
            setReservations(normalized as Reservation[]);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        } finally {
            setLoading(false);
        }
    }

    // Drag End Handler
    async function handleDragEnd(event: any) {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over || active.id === over.id) return;

        const resId = Number(active.id.replace('res-', ''));
        const newDate = over.id; // The droppable id is the date string

        // Read BEFORE optimistic update to avoid stale state
        const res = reservations.find(r => r.id === resId);
        if (!res) return;

        let updatePayload: any = { tour_date: newDate };

        if (res.end_date && res.tour_date) {
            const oldStart = new Date(res.tour_date);
            const oldEnd = new Date(res.end_date);
            const diffTime = Math.abs(oldEnd.getTime() - oldStart.getTime());
            const newStart = new Date(newDate);
            const newEnd = new Date(newStart.getTime() + diffTime);
            updatePayload.end_date = newEnd.toISOString().split('T')[0];
        }

        // Optimistic Update (after reading old values)
        setReservations(prev => prev.map(r =>
            r.id === resId ? { ...r, tour_date: newDate, ...(updatePayload.end_date ? { end_date: updatePayload.end_date } : {}) } : r
        ));

        // Persist to DB
        if (agent) {
            const result = await updateReservation(resId, updatePayload, agent);
            if (!result.success) {
                alert('Error update: ' + JSON.stringify(result.error));
                await fetchReservations(); // Revert
            }
        }
    }

    /* Placeholder - realized I need to add useAuth first */


    // Clear selection when navigating to a different month or week
    useEffect(() => {
        setSelectedDay(null);
    }, [year, month, viewMode]);

    const calendarGrid = useMemo(() => {
        if (viewMode === 'week') return []; // Handled separately

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid: Array<{ date: number; dateStr: string; isOtherMonth?: boolean } | null> = [];

        // Fill leading cells with previous month's days
        if (firstDayOfMonth > 0) {
            const prevMonthDays = new Date(year, month, 0).getDate();
            for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                const d = prevMonthDays - i;
                const prevMonth = month === 0 ? 12 : month;
                const prevYear = month === 0 ? year - 1 : year;
                grid.push({
                    date: d,
                    dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    isOtherMonth: true,
                });
            }
        }
        for (let d = 1; d <= daysInMonth; d++) {
            grid.push({
                date: d,
                dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            });
        }
        // Fill trailing cells with next month's days
        const remaining = grid.length % 7;
        if (remaining > 0) {
            const nextMonth = month + 2 > 12 ? 1 : month + 2;
            const nextYear = month + 2 > 12 ? year + 1 : year;
            for (let d = 1; d <= 7 - remaining; d++) {
                grid.push({
                    date: d,
                    dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                    isOtherMonth: true,
                });
            }
        }
        return grid;
    }, [year, month, viewMode]);

    const activeRes = activeDragId ? reservations.find(r => r.id === Number(activeDragId.toString().replace('res-', ''))) : null;

    return (
        <DndContext onDragStart={(e) => setActiveDragId(e.active.id as number)} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="bo-calendario">
                <header className="bo-header bo-flex bo-justify-between bo-align-center">
                    <div>
                        <h2 className="bo-title">Calendario</h2>
                        <p className="bo-subtitle">Visualización y planificación de tours</p>
                    </div>
                    <div className="bo-view-toggle">
                        <button className={`bo-btn ${viewMode === 'month' ? 'bo-btn--primary' : 'bo-btn--ghost'}`} onClick={() => setViewMode('month')}>Mes</button>
                        <button className={`bo-btn ${viewMode === 'week' ? 'bo-btn--primary' : 'bo-btn--ghost'}`} onClick={() => setViewMode('week')}>Semana</button>
                    </div>
                </header>

                <div className="bo-cal-nav">
                    <div className="bo-cal-nav-group">
                        <button className="bo-btn bo-btn--ghost" onClick={() => {
                            const d = new Date(currentDate);
                            viewMode === 'month' ? d.setMonth(d.getMonth() - 1) : d.setDate(d.getDate() - 7);
                            setCurrentDate(d);
                        }}>← Anterior</button>
                        <button className="bo-btn bo-btn--ghost bo-btn--today" onClick={() => setCurrentDate(new Date())}>Hoy</button>
                        <button className="bo-btn bo-btn--ghost" onClick={() => {
                            const d = new Date(currentDate);
                            viewMode === 'month' ? d.setMonth(d.getMonth() + 1) : d.setDate(d.getDate() + 7);
                            setCurrentDate(d);
                        }}>Siguiente →</button>
                    </div>
                    <h3 className="bo-cal-month">{viewMode === 'month' ? `${MONTHS_ES[month]} ${year}` : `Semana del ${currentDate.toLocaleDateString()}`}</h3>
                </div>

                {loading ? <div className="bo-loading"><div className="bo-loading-spinner" /></div> : (
                    <div className="bo-cal-layout">
                        {viewMode === 'month' ? (
                            <div className="bo-cal-grid-wrapper">
                                <div className="bo-cal-header-row">
                                    {DAYS_ES.map(d => <div key={d} className="bo-cal-header-cell">{d}</div>)}
                                </div>
                                <div className="bo-cal-grid">
                                    {calendarGrid.map((day, i) => {
                                        const dayRes = day ? reservations.filter(r => r.tour_date === day.dateStr) : [];
                                        const MAX_VISIBLE = 3;
                                        const visibleRes = dayRes.slice(0, MAX_VISIBLE);
                                        const overflowCount = dayRes.length - MAX_VISIBLE;
                                        return (                                                // @ts-ignore
                                            <DroppableDay
                                                key={day?.dateStr || `empty-${i}`}
                                                dateStr={day?.dateStr || `empty-${i}`}
                                                dayNumber={day?.date}
                                                isToday={day?.dateStr === new Date().toISOString().split('T')[0]}
                                                isSelected={day?.dateStr === selectedDay}
                                                isOtherMonth={day?.isOtherMonth}
                                                onSelect={() => day && setSelectedDay(day.dateStr)}
                                            >
                                                {/* @ts-ignore */}
                                                {visibleRes.map(res => <DraggableReservation key={res.id} res={res} />)}
                                                {overflowCount > 0 && (
                                                    <button
                                                        className="bo-cal-overflow-badge"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (day) setSelectedDay(day.dateStr);
                                                        }}
                                                    >
                                                        +{overflowCount} mas
                                                    </button>
                                                )}
                                            </DroppableDay>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bo-week-view">
                                {/* Week View Implementation */}
                                <div className="bo-week-header">
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const base = new Date(currentDate);
                                        const dayOfWeek = base.getDay();
                                        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - dayOfWeek + i);
                                        const weekDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                        return (
                                            <div key={weekDateStr} className="bo-week-col-header">
                                                <span>{DAYS_ES[i]}</span>
                                                <strong>{d.getDate()}</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bo-week-grid">
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const base = new Date(currentDate);
                                        const dayOfWeek = base.getDay();
                                        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - dayOfWeek + i);
                                        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                        const dayRes = reservations.filter(r => r.tour_date === dateStr);
                                        const todayStr = new Date().toISOString().split('T')[0];

                                        return (
                                            // @ts-ignore
                                            <DroppableDay key={dateStr} dateStr={dateStr} dayNumber={null} isToday={dateStr === todayStr}>
                                                {/* @ts-ignore */}
                                                {dayRes.map(res => (
                                                    <div key={res.id} className="bo-week-card" style={{
                                                        backgroundColor: STATUS_CONFIG[res.status]?.bg,
                                                        borderLeft: `3px solid ${STATUS_CONFIG[res.status]?.color}`,
                                                    }} onClick={() => navigate(`/backoffice/reservas?editId=${res.id}`)}
                                                    title={`${res.tour_name} — ${res.start_time?.slice(0, 5) || 'Sin hora'} • ${res.pax_count} pax`}>
                                                        <div className="bo-week-card-time">
                                                            {res.start_time?.slice(0, 5) || '—'}
                                                        </div>
                                                        <div className="bo-week-card-title">{res.tour_name}</div>
                                                        <div className="bo-week-card-meta">{res.pax_count} pax</div>
                                                    </div>
                                                ))}
                                                {dayRes.length === 0 && <div className="bo-empty-slot">Sin tours</div>}
                                            </DroppableDay>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {selectedDay && viewMode === 'month' && (
                            <div className="bo-cal-detail">
                                <h4 className="bo-cal-detail-title">
                                    {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h4>
                                {reservations.filter(r => r.tour_date === selectedDay).length === 0 ? (
                                    <div className="bo-cal-detail-list">
                                        <div className="bo-empty-state">
                                            <span className="bo-empty-state-icon">📅</span>
                                            <p>Sin tours este día</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bo-cal-detail-list">
                                        {reservations.filter(r => r.tour_date === selectedDay).map(res => (
                                            <div key={res.id} className="bo-cal-detail-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/backoffice/reservas?editId=${res.id}`)}>
                                                <div className="bo-cal-detail-time">{res.start_time?.slice(0, 5) || '—'}</div>
                                                <div className="bo-cal-detail-info">
                                                    <div className="bo-cal-detail-tour">{res.tour_name}</div>
                                                    <div className="bo-cal-detail-meta">{res.pax_count} pax • {(res.boat as any)?.name || 'Sin lancha'}</div>
                                                </div>
                                                <span
                                                    className="bo-status-badge"
                                                    style={{ backgroundColor: STATUS_CONFIG[res.status]?.bg, color: STATUS_CONFIG[res.status]?.color }}
                                                >
                                                    {STATUS_CONFIG[res.status]?.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <DragOverlay>
                    {activeRes ? <DraggableReservation res={activeRes} isOverlay /> : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
