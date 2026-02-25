import React, { useState, useEffect, useMemo } from 'react';
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
    useDroppable,
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
import { LayoutGrid, Loader2, Calendar, User, Ship, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Valid status transitions: which statuses can move to which
const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
    offered: ['reserved', 'cancelled'],
    reserved: ['offered', 'paid', 'cancelled'],
    paid: ['reserved', 'in_progress', 'cancelled'],
    in_progress: ['paid', 'completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

// Statuses that should not be draggable
const NON_DRAGGABLE_STATUSES: ReservationStatus[] = ['completed', 'cancelled'];

// --- Kanban Components ---

interface KanbanCardProps {
    key?: React.Key;
    reservation: Reservation;
    isDragging?: boolean;
    onEdit?: (id: number) => void;
}

const KanbanCard = React.memo(function KanbanCard({ reservation, isDragging, onEdit }: KanbanCardProps) {
    const isNonDraggable = NON_DRAGGABLE_STATUSES.includes(reservation.status);

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
        disabled: isNonDraggable,
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isNonDraggable ? 'default' : undefined,
    };

    const config = STATUS_CONFIG[reservation.status];

    // Client name: first passenger's full_name
    const clientName = reservation.passengers?.[0]?.full_name;

    // Missing info alerts
    const missingBoat = !reservation.boat_id;
    const missingAgent = !reservation.agent_id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bo-kanban-card ${isDragging ? 'is-dragging' : ''}`}
            aria-label={`Reserva ${formatReservationCode(reservation.id, reservation.tour_date)} - ${reservation.tour_name} - ${clientName || 'Sin pasajero'}`}
            onClick={() => onEdit?.(reservation.id)}
        >
            <div className="bo-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="bo-text-mono bo-text-xs bo-text-muted">
                    {formatReservationCode(reservation.id, reservation.tour_date)}
                </span>
                <span className="bo-badge" style={{ backgroundColor: config.color + '10', color: config.color }}>
                    {config.label}
                </span>
            </div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: 'var(--bo-text)' }}>
                {reservation.tour_name}
            </h4>

            {/* Client name and total amount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--bo-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {clientName || 'Sin pasajero'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--bo-text)', fontFamily: 'var(--bo-font-mono)', whiteSpace: 'nowrap' }}>
                    ${reservation.total_amount?.toFixed(2) ?? '0.00'}
                </span>
            </div>

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

            {/* Alert badges for missing info */}
            {(missingBoat || missingAgent) && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bo-border)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {missingBoat && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            fontSize: '10px', color: '#E65100', background: '#FFF3E0',
                            padding: '2px 6px', borderRadius: '4px', fontWeight: 500,
                        }}>
                            <AlertTriangle size={10} /> Sin lancha
                        </span>
                    )}
                    {missingAgent && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            fontSize: '10px', color: '#E65100', background: '#FFF3E0',
                            padding: '2px 6px', borderRadius: '4px', fontWeight: 500,
                        }}>
                            <AlertTriangle size={10} /> Sin agente
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

interface KanbanColumnProps {
    key?: React.Key;
    status: ReservationStatus;
    reservations: Reservation[];
    id: string;
    onEdit?: (id: number) => void;
}

const KanbanColumn = ({ status, reservations, id, onEdit }: KanbanColumnProps) => {
    const { setNodeRef: setSortableRef } = useSortable({
        id,
        data: {
            type: 'Column',
            status,
        },
    });

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: `droppable-${id}`,
        data: {
            type: 'Column',
            status,
        },
    });

    const config = STATUS_CONFIG[status];

    // Combine refs for the body element
    const bodyRef = (node: HTMLElement | null) => {
        setSortableRef(node);
        setDroppableRef(node);
    };

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

            <div
                ref={bodyRef}
                className="bo-kanban-body"
                style={isOver ? {
                    border: '2px dashed ' + config.color,
                    backgroundColor: config.bg,
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                } : {
                    border: '2px dashed transparent',
                    transition: 'all 0.2s ease',
                }}
            >
                <SortableContext items={reservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    {reservations.map((res) => (
                        <KanbanCard key={res.id} reservation={res} onEdit={onEdit} />
                    ))}
                </SortableContext>
                {isOver && (
                    <div style={{
                        textAlign: 'center',
                        padding: '0.75rem',
                        fontSize: '12px',
                        color: config.color,
                        fontWeight: 500,
                        opacity: 0.8,
                    }}>
                        Soltar aqui
                    </div>
                )}
                {reservations.length === 0 && !isOver && (
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
    const [searchQuery, setSearchQuery] = useState('');

    const filteredReservations = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return reservations;
        return reservations.filter((r) => {
            const code = formatReservationCode(r.id, r.tour_date).toLowerCase();
            const tourName = (r.tour_name || '').toLowerCase();
            const agentName = (r.agent?.name || '').toLowerCase();
            const boatName = (r.boat?.name || '').toLowerCase();
            return (
                tourName.includes(q) ||
                code.includes(q) ||
                agentName.includes(q) ||
                boatName.includes(q)
            );
        });
    }, [reservations, searchQuery]);

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
          boat:boats(name),
          passengers(full_name)
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
        const draggedId = event.active.id as number;
        const draggedRes = reservations.find(r => r.id === draggedId);

        // Prevent dragging completed/cancelled reservations
        if (draggedRes && NON_DRAGGABLE_STATUSES.includes(draggedRes.status)) {
            toast.warning(`Las reservas ${STATUS_CONFIG[draggedRes.status].label.toLowerCase()}s no se pueden mover`);
            return;
        }

        setActiveId(draggedId);
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

        // Save previous state for granular rollback
        const previousReservations = [...reservations];
        const originalRes = previousReservations.find(r => r.id === resId);
        const originalStatus = originalRes?.status;

        // handleDragOver already updated local state, so read the new status from current state
        // Use functional read to get the latest value and avoid stale closure
        let newStatus: ReservationStatus | undefined;
        setReservations(prev => {
            const found = prev.find(r => r.id === resId);
            newStatus = found?.status;
            return prev; // no-op, just reading
        });

        // If the status hasn't changed, nothing to do
        if (!newStatus || newStatus === originalStatus || !agent) return;

        // Check if the original status is non-draggable (completed/cancelled)
        if (originalStatus && NON_DRAGGABLE_STATUSES.includes(originalStatus)) {
            toast.warning(`Las reservas ${STATUS_CONFIG[originalStatus].label.toLowerCase()}s no se pueden mover`);
            setReservations(previousReservations);
            return;
        }

        // Check for non-recommended transition
        if (originalStatus && !VALID_TRANSITIONS[originalStatus]?.includes(newStatus)) {
            toast.warning('Transicion no recomendada');
            // Still allow it — don't return
        }

        const statusLabel = STATUS_CONFIG[newStatus].label;
        try {
            const result = await updateReservation(resId, { status: newStatus }, agent);
            if (result.success) {
                toast.success(`Reserva movida a ${statusLabel}`);
            } else {
                console.error('Error updating status:', result.error);
                toast.error('Error al mover reserva');
                // Granular rollback: restore only the affected item
                const oldRes = previousReservations.find(r => r.id === resId);
                if (oldRes) {
                    setReservations(prev => prev.map(r => r.id === resId ? oldRes : r));
                } else {
                    await fetchReservations();
                }
            }
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Error al mover reserva');
            setReservations(previousReservations);
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

            <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--bo-text-muted)' }} />
                <input
                    type="text"
                    placeholder="Buscar por tour, código, agente o lancha..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Buscar reservas"
                    className="bo-input"
                    style={{ paddingLeft: '36px', width: '100%' }}
                />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <p style={{ fontSize: '0.75rem', color: 'var(--bo-text-muted)', marginBottom: '0.5rem' }}>Clic en una tarjeta para editarla</p>
                <div className="bo-kanban-board">
                    {COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col}
                            id={col}
                            status={col}
                            reservations={filteredReservations.filter((r) => r.status === col)}
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
