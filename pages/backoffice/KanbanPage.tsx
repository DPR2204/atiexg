import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../lib/supabase';
import { updateReservation, formatReservationCode } from '../../lib/reservation-logic';
import { Reservation, ReservationStatus, STATUS_CONFIG } from '../../types/backoffice';
import { LayoutGrid, Loader2, Calendar, User, Ship } from 'lucide-react';

// --- Kanban Components ---

interface KanbanCardProps {
    key?: React.Key;
    reservation: Reservation;
    isDragging?: boolean;
    onEdit?: (id: number) => void;
}

const KanbanCard = ({ reservation, isDragging, onEdit }: KanbanCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: reservation.id,
        data: {
            type: 'Reservation',
            reservation,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const config = STATUS_CONFIG[reservation.status];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bo-kanban-card ${isDragging ? 'is-dragging' : ''}`}
            onDoubleClick={() => onEdit?.(reservation.id)}
        >
            <div className="bo-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="bo-text-mono bo-text-xs bo-text-muted">
                    {formatReservationCode(reservation.id, reservation.tour_date)}
                </span>
                <span className="bo-badge" style={{ backgroundColor: config.color + '10', color: config.color }}>
                    {config.label}
                </span>
            </div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem', color: 'var(--bo-text)' }}>
                {reservation.tour_name}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--bo-text-secondary)' }}>
                    <Calendar size={12} />
                    {new Date(reservation.tour_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--bo-text-secondary)' }}>
                    <User size={12} />
                    {reservation.pax_count} Pax
                </div>
            </div>
            {(reservation.boat_id || reservation.agent_id) && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bo-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {reservation.boat?.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--bo-text-muted)', background: 'var(--bo-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                            <Ship size={10} />
                            {reservation.boat.name}
                        </div>
                    )}
                    <div style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 500, color: 'var(--bo-text-muted)' }}>
                        {reservation.agent?.name}
                    </div>
                </div>
            )}
        </div>
    );
};

interface KanbanColumnProps {
    key?: React.Key;
    status: ReservationStatus;
    reservations: Reservation[];
    id: string;
    onEdit?: (id: number) => void;
}

const KanbanColumn = ({ status, reservations, id, onEdit }: KanbanColumnProps) => {
    const { setNodeRef } = useSortable({
        id,
        data: {
            type: 'Column',
            status,
        },
    });

    const config = STATUS_CONFIG[status];

    return (
        <div className="bo-kanban-column">
            <div className="bo-kanban-header">
                <div className="bo-kanban-title">
                    <div className="bo-status-dot" style={{ backgroundColor: config.color }}></div>
                    {config.label}
                </div>
                <span className="bo-kanban-count">
                    {reservations.length}
                </span>
            </div>

            <div ref={setNodeRef} className="bo-kanban-body">
                <SortableContext items={reservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    {reservations.map((res) => (
                        <KanbanCard key={res.id} reservation={res} onEdit={onEdit} />
                    ))}
                </SortableContext>
                {reservations.length === 0 && (
                    <div className="bo-empty-state bo-empty-state--sm">
                        <p>No hay reservas</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Kanban Page ---

const COLUMNS: ReservationStatus[] = ['offered', 'reserved', 'paid', 'in_progress', 'completed', 'cancelled'];

export default function KanbanPage() {
    const { agent } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<number | null>(null);

    function handleEditReservation(id: number) {
        navigate(`/backoffice/reservas?editId=${id}`);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchReservations();
    }, []);

    async function fetchReservations() {
        try {
            const { data, error } = await supabase
                .from('reservations')
                .select(`
          *,
          agent:agents(name),
          boat:boats(name)
        `)
                .order('tour_date', { ascending: true });

            if (error) throw error;
            setReservations((data || []) as Reservation[]);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Check if dragging over a column
        const isOverAColumn = over.data.current?.type === 'Column';

        if (isOverAColumn) {
            const newStatus = over.data.current?.status as ReservationStatus;
            setReservations((prev) => {
                const activeIndex = prev.findIndex((t) => t.id === activeId);
                if (activeIndex !== -1 && prev[activeIndex].status !== newStatus) {
                    const updated = [...prev];
                    updated[activeIndex] = { ...updated[activeIndex], status: newStatus };
                    return updated;
                }
                return prev;
            });
            return;
        }

        // Check if dragging over another card
        const overIndex = reservations.findIndex((t) => t.id === overId);
        if (overIndex !== -1) {
            const overStatus = reservations[overIndex].status;
            setReservations((prev) => {
                const activeIndex = prev.findIndex((t) => t.id === activeId);
                if (activeIndex !== -1 && prev[activeIndex].status !== overStatus) {
                    const updated = [...prev];
                    updated[activeIndex] = { ...updated[activeIndex], status: overStatus };
                    return arrayMove(updated, activeIndex, overIndex);
                }
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const resId = active.id as number;
        const res = reservations.find(r => r.id === resId);
        const newStatus = res?.status; // This seems wrong in original code, it should be the status of the column we dropped in, but logic was:
        // logic was: "handleDragOver" already updated local state "reservations". So "res" here has the NEW status. 
        // So we just need to persist "res.status".

        if (newStatus && agent) {
            try {
                // Use unified update logic
                const result = await updateReservation(resId, { status: newStatus }, agent);
                if (!result.success) {
                    console.error('Error updating status:', result.error);
                    fetchReservations(); // Rollback
                }
            } catch (err) {
                console.error('Error updating status:', err);
                fetchReservations(); // Rollback
            }
        }
    };

    if (loading) {
        return (
            <div className="bo-loading">
                <div className="bo-loading-spinner" />
            </div>
        );
    }

    const activeReservation = activeId ? reservations.find(r => r.id === activeId) : null;

    return (
        <div className="bo-kanban-page">
            <div className="bo-page-header">
                <div>
                    <h1 className="bo-page-title">
                        Tablero de Tour
                    </h1>
                    <p className="bo-page-subtitle">Gestiona el flujo de reservas y coordinaciones</p>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <p style={{ fontSize: '0.75rem', color: 'var(--bo-text-muted)', marginBottom: '0.5rem' }}>Doble clic en una tarjeta para editarla</p>
                <div className="bo-kanban-board">
                    {COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col}
                            id={col}
                            status={col}
                            reservations={reservations.filter((r) => r.status === col)}
                            onEdit={handleEditReservation}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.5',
                            },
                        },
                    }),
                }}>
                    {activeReservation ? (
                        <KanbanCard reservation={activeReservation} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
