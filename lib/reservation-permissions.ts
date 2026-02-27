import type { Reservation, Agent } from '../types/backoffice';

/** Returns true if the agent owns the reservation */
export function isOwner(reservation: Reservation, agent: Agent | null): boolean {
    return !!agent && reservation.agent_id === agent.id;
}

/** Returns true if the agent can directly edit the reservation (owner or admin) */
export function canEditReservation(reservation: Reservation, agent: Agent | null): boolean {
    if (!agent) return false;
    if (agent.role === 'admin') return true;
    return reservation.agent_id === agent.id;
}
