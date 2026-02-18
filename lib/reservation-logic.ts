import { supabase } from './supabase';
import type { Reservation, Agent } from '../types/backoffice';

/**
 * Helper to update a reservation and automatically generate granular audit logs.
 * @param reservationId - ID of the reservation to update
 * @param updates - Object containing the fields to update
 * @param actor - The agent performing the action
 * @returns { success: boolean, error?: any }
 */
export async function updateReservation(
    reservationId: number,
    updates: Partial<Reservation>,
    actor: Agent
) {
    // 1. Fetch current state for diffing
    const { data: current, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

    if (fetchError || !current) {
        return { success: false, error: fetchError || 'Reservation not found' };
    }

    // 2. Calculate diffs
    const auditEntries: any[] = [];
    const fieldsToCheck: (keyof Reservation)[] = [
        'tour_date', 'start_time', 'pax_count', 'status', 'total_amount',
        'boat_id', 'driver_id', 'guide_id', 'notes',
        'emergency_contact_name', 'emergency_contact_phone'
    ];

    fieldsToCheck.forEach(field => {
        if (updates[field] !== undefined && updates[field] != current[field]) {
            // Handle null/undefined gracefully
            const oldVal = current[field] === null || current[field] === undefined ? '' : String(current[field]);
            const newVal = updates[field] === null || updates[field] === undefined ? '' : String(updates[field]);

            if (oldVal !== newVal) {
                auditEntries.push({
                    reservation_id: reservationId,
                    agent_id: actor.id,
                    agent_name: actor.name,
                    action: field === 'status' ? 'status_changed' : 'updated',
                    field_changed: field,
                    old_value: oldVal,
                    new_value: newVal
                });
            }
        }
    });

    if (auditEntries.length === 0) {
        // No actual changes
        return { success: true };
    }

    // 3. Perform Update
    const { error: updateError } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', reservationId);

    if (updateError) {
        return { success: false, error: updateError };
    }

    // 4. Insert Audit Logs
    const { error: auditError } = await supabase
        .from('reservation_audit_log')
        .insert(auditEntries);

    if (auditError) {
        console.error('Error writing audit logs:', auditError);
    }

    return { success: true };
}

/**
 * Helper to log a custom action (like "PDF Generated" or "Payment Link Created")
 */
export async function logReservationAction(
    reservationId: number,
    action: string,
    details: string,
    actor: Agent
) {
    await supabase.from('reservation_audit_log').insert([{
        reservation_id: reservationId,
        agent_id: actor.id,
        agent_name: actor.name,
        action: 'updated',
        field_changed: action,
        new_value: details
    }]);
}
