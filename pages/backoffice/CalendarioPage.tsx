import React, { useEffect, useState, useMemo } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../lib/supabase';
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

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`bo-cal-card ${isOverlay ? 'bo-cal-card--overlay' : ''}`}>
            <div className="bo-cal-card-title">{res.tour_name}</div>
            <div className="bo-cal-card-meta">
                {res.start_time?.slice(0, 5)} • {res.pax_count} pax
            </div>
            {res.end_date && res.end_date !== res.tour_date && (
                <div className="bo-cal-card-span">
                    🔄 Multi-día
                </div>
            )}
        </div>
    );
}

function DroppableDay({ dateStr, dayNumber, isToday, isSelected, children, onSelect }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: dateStr,
    });

    return (
        <div
            ref={setNodeRef}
            className={`bo-cal-cell ${!dayNumber ? 'bo-cal-cell--empty' : ''} ${isToday ? 'bo-cal-cell--today' : ''} ${isSelected ? 'bo-cal-cell--selected' : ''} ${isOver ? 'bo-cal-cell--over' : ''}`}
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
        let startStr, endStr;

        if (viewMode === 'month') {
            startStr = new Date(year, month, 1).toISOString().split('T')[0];
            endStr = new Date(year, month + 1, 0).toISOString().split('T')[0];
        } else {
            // Week view: start of current week
            const curr = new Date(currentDate);
            const first = curr.getDate() - curr.getDay();
            const firstDay = new Date(curr.setDate(first));
            const lastDay = new Date(curr.setDate(curr.getDate() + 6));
            startStr = firstDay.toISOString().split('T')[0];
            endStr = lastDay.toISOString().split('T')[0];
        }

        const { data } = await supabase
            .from('reservations')
            .select('*, agent:agents(name), boat:boats(name)')
            .gte('tour_date', startStr)
            .lte('tour_date', endStr)
            .neq('status', 'cancelled')
            .order('start_time', { ascending: true });

        // Normalize tour_date to YYYY-MM-DD to avoid timezone comparison issues
        const normalized = (data || []).map((r: any) => ({
            ...r,
            tour_date: toDateStr(r.tour_date),
            end_date: toDateStr(r.end_date),
        }));
        setReservations(normalized as Reservation[]);
        setLoading(false);
    }

    // Drag End Handler
    async function handleDragEnd(event: any) {
        const { active, over } = event;
        setActiveDragId(null);

        if (over && active.id !== over.id) {
            const resId = Number(active.id.replace('res-', ''));
            const newDate = over.id; // The droppable id is the date string

            // Update local state optimistic
            setReservations(prev => prev.map(r =>
                r.id === resId ? { ...r, tour_date: newDate } : r
            ));

            // Determine if multi-day shift needed
            const res = reservations.find(r => r.id === resId);
            let updatePayload: any = { tour_date: newDate };

            if (res?.end_date && res.tour_date) {
                const oldStart = new Date(res.tour_date);
                const oldEnd = new Date(res.end_date);
                const diffTime = Math.abs(oldEnd.getTime() - oldStart.getTime());
                const newStart = new Date(newDate);
                const newEnd = new Date(newStart.getTime() + diffTime);
                updatePayload.end_date = newEnd.toISOString().split('T')[0];
            }

            // Update DB
            const { error } = await supabase.from('reservations').update(updatePayload).eq('id', resId);

            if (error) {
                alert('Error al mover reserva: ' + error.message);
                fetchReservations(); // Revert
            } else {
                // Log audit
                await supabase.from('reservation_audit_log').insert([{
                    reservation_id: resId,
                    action: 'updated',
                    field_changed: 'tour_date (drag)',
                    old_value: res?.tour_date,
                    new_value: newDate,
                    agent_name: 'Sistema (Drag)'
                }]);
            }
        }
    }

    const calendarGrid = useMemo(() => {
        if (viewMode === 'week') return []; // Handled separately

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid: Array<{ date: number; dateStr: string } | null> = [];

        for (let i = 0; i < firstDayOfMonth; i++) grid.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            grid.push({
                date: d,
                dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            });
        }
        return grid;
    }, [year, month, viewMode]);

    const activeRes = activeDragId ? reservations.find(r => r.id === Number(activeDragId.toString().replace('res-', ''))) : null;

    return (
        <DndContext onDragStart={(e) => setActiveDragId(e.active.id as number)} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="bo-calendario">
                <div className="bo-page-header">
                    <h2 className="bo-page-title">Calendario</h2>
                    <div className="bo-view-toggle">
                        <button className={`bo-btn ${viewMode === 'month' ? 'bo-btn--primary' : 'bo-btn--ghost'}`} onClick={() => setViewMode('month')}>Mes</button>
                        <button className={`bo-btn ${viewMode === 'week' ? 'bo-btn--primary' : 'bo-btn--ghost'}`} onClick={() => setViewMode('week')}>Semana (Horas)</button>
                    </div>
                </div>

                <div className="bo-cal-nav">
                    <button className="bo-btn bo-btn--ghost" onClick={() => {
                        const d = new Date(currentDate);
                        viewMode === 'month' ? d.setMonth(d.getMonth() - 1) : d.setDate(d.getDate() - 7);
                        setCurrentDate(d);
                    }}>← Anterior</button>
                    <h3 className="bo-cal-month">{viewMode === 'month' ? `${MONTHS_ES[month]} ${year}` : `Semana del ${currentDate.toLocaleDateString()}`}</h3>
                    <button className="bo-btn bo-btn--ghost" onClick={() => {
                        const d = new Date(currentDate);
                        viewMode === 'month' ? d.setMonth(d.getMonth() + 1) : d.setDate(d.getDate() + 7);
                        setCurrentDate(d);
                    }}>Siguiente →</button>
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
                                        return (
                                            <DroppableDay
                                                key={i}
                                                dateStr={day?.dateStr || `empty-${i}`}
                                                dayNumber={day?.date}
                                                isToday={day?.dateStr === new Date().toISOString().split('T')[0]}
                                                isSelected={day?.dateStr === selectedDay}
                                                onSelect={() => day && setSelectedDay(day.dateStr)}
                                            >
                                                {dayRes.map(res => <DraggableReservation key={res.id} res={res} />)}
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
                                        const date = new Date(currentDate);
                                        const day = date.getDate() - date.getDay() + i;
                                        const d = new Date(date.setDate(day));
                                        return (
                                            <div key={i} className="bo-week-col-header">
                                                <span>{DAYS_ES[i]}</span>
                                                <strong>{d.getDate()}</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bo-week-grid">
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const date = new Date(currentDate);
                                        const day = date.getDate() - date.getDay() + i;
                                        const dateStr = new Date(date.setDate(day)).toISOString().split('T')[0];
                                        const dayRes = reservations.filter(r => r.tour_date === dateStr);

                                        return (
                                            <DroppableDay key={i} dateStr={dateStr} dayNumber={null} isToday={dateStr === new Date().toISOString().split('T')[0]}>
                                                {dayRes.map(res => <DraggableReservation key={res.id} res={res} />)}
                                                {dayRes.length === 0 && <div className="bo-empty-slot">-</div>}
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
                                    <div className="bo-empty-state" style={{ padding: '1rem 0' }}>
                                        <p>Sin tours este día</p>
                                    </div>
                                ) : (
                                    reservations.filter(r => r.tour_date === selectedDay).map(res => (
                                        <div key={res.id} className="bo-cal-detail-card">
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
                                    ))
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
