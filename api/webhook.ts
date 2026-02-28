import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error(
            'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
            'These must be set as environment variables in Vercel.'
        );
    }
    return createClient(url, key);
}

/**
 * Recurrente does NOT support HMAC webhook signatures.
 * Instead we use a secret token in the query string as authentication.
 * The webhook URL registered in Recurrente should be:
 *   https://yourdomain.com/api/webhook?token=YOUR_WEBHOOK_SECRET
 *
 * If WEBHOOK_SECRET is not set, verification is skipped (gradual rollout).
 */
function verifyWebhookToken(
    providedToken: string | undefined,
    secret: string | undefined
): { valid: boolean; reason?: string } {
    if (!secret) {
        return { valid: true, reason: 'WEBHOOK_SECRET not configured — skipping verification' };
    }
    if (!providedToken) {
        return { valid: false, reason: 'Missing token query parameter' };
    }

    try {
        const expected = Buffer.from(secret, 'utf8');
        const provided = Buffer.from(providedToken, 'utf8');

        if (expected.length !== provided.length) {
            return { valid: false, reason: 'Invalid token' };
        }

        if (!timingSafeEqual(expected, provided)) {
            return { valid: false, reason: 'Invalid token' };
        }

        return { valid: true };
    } catch {
        return { valid: false, reason: 'Token verification error' };
    }
}

// Types for Vercel Serverless Functions
interface VercelRequest {
    method?: string;
    body: any;
    query: Record<string, string | string[]>;
    headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
    status: (code: number) => VercelResponse;
    json: (data: any) => void;
    end: () => void;
}

// Recurrente actual webhook payload structure (from their API docs)
interface RecurrenteWebhookPayload {
    id: string;
    event_type: string;
    api_version: string;
    created_at: string;
    amount_in_cents: number;
    currency: string;
    failure_reason: string | null;
    checkout: {
        id: string;
        status: string;
        metadata?: Record<string, string>;
    };
    customer?: {
        email: string;
        full_name: string;
        id: string;
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // --- Token verification ---
        const token = req.query.token as string | undefined;
        const { valid, reason } = verifyWebhookToken(token, process.env.WEBHOOK_SECRET);

        if (!valid) {
            console.error('Webhook rejected:', reason);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (reason) {
            console.warn('Webhook security:', reason);
        }

        // --- Process payload ---
        const payload = req.body as RecurrenteWebhookPayload;
        const eventType = payload.event_type;
        const checkoutId = payload.checkout?.id;

        switch (eventType) {
            case 'payment_intent.succeeded': {
                if (checkoutId) {
                    const supabase = getSupabaseAdmin();
                    const { error: updateError } = await supabase
                        .from('reservations')
                        .update({ status: 'paid' })
                        .eq('payment_id', checkoutId);
                    if (updateError) {
                        console.error('Error updating reservation:', updateError.message);
                    }
                }
                break;
            }

            case 'payment_intent.failed':
                // Payment failed — log for monitoring, no status change
                if (checkoutId) {
                    console.warn('Payment failed for checkout:', checkoutId);
                }
                break;

            case 'bank_transfer_intent.succeeded': {
                // Bank transfer completed — same as card payment
                if (checkoutId) {
                    const supabase = getSupabaseAdmin();
                    const { error: updateError } = await supabase
                        .from('reservations')
                        .update({ status: 'paid' })
                        .eq('payment_id', checkoutId);
                    if (updateError) {
                        console.error('Error updating reservation:', updateError.message);
                    }
                }
                break;
            }

            case 'bank_transfer_intent.pending':
            case 'bank_transfer_intent.failed':
            case 'subscription.create':
            case 'subscription.cancel':
            case 'subscription.past_due':
            case 'subscription.paused':
            case 'setup_intent.succeeded':
            case 'setup_intent.cancelled':
                // Acknowledged — no action needed
                break;

            default:
                console.warn('Unhandled webhook event:', eventType);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error instanceof Error ? error.message : error);
        return res.status(200).json({ received: true });
    }
}
