import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

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
 * Verify the webhook signature using HMAC-SHA256.
 * If WEBHOOK_SECRET is not set, verification is skipped with a warning
 * (allows gradual rollout — set the secret to enforce).
 */
function verifyWebhookSignature(
    body: string,
    signatureHeader: string | undefined,
    secret: string | undefined
): { valid: boolean; reason?: string } {
    if (!secret) {
        return { valid: true, reason: 'WEBHOOK_SECRET not configured — skipping verification' };
    }
    if (!signatureHeader) {
        return { valid: false, reason: 'Missing signature header' };
    }

    try {
        const expected = createHmac('sha256', secret)
            .update(body, 'utf8')
            .digest('hex');

        // Support "sha256=<hex>" or raw "<hex>" formats
        const provided = signatureHeader.replace(/^sha256=/, '');

        const expectedBuf = Buffer.from(expected, 'hex');
        const providedBuf = Buffer.from(provided, 'hex');

        if (expectedBuf.length !== providedBuf.length) {
            return { valid: false, reason: 'Signature length mismatch' };
        }

        if (!timingSafeEqual(expectedBuf, providedBuf)) {
            return { valid: false, reason: 'Signature mismatch' };
        }

        return { valid: true };
    } catch {
        return { valid: false, reason: 'Signature verification error' };
    }
}

// Types for Vercel Serverless Functions
interface VercelRequest {
    method?: string;
    body: any;
    rawBody?: string | Buffer;
    query: Record<string, string | string[]>;
    headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
    status: (code: number) => VercelResponse;
    json: (data: any) => void;
    end: () => void;
}

interface RecurrenteWebhookPayload {
    event: string;
    data: {
        id: string;
        status: string;
        amount_in_cents: number;
        currency: string;
        user_email: string;
        metadata?: Record<string, string>;
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // --- Signature verification ---
        const rawBody = typeof req.rawBody === 'string'
            ? req.rawBody
            : req.rawBody instanceof Buffer
                ? req.rawBody.toString('utf8')
                : JSON.stringify(req.body);

        const signatureHeader = req.headers['x-webhook-signature'] as string | undefined
            ?? req.headers['x-signature'] as string | undefined;

        const { valid, reason } = verifyWebhookSignature(
            rawBody,
            signatureHeader,
            process.env.WEBHOOK_SECRET
        );

        if (!valid) {
            console.error('Webhook signature rejected:', reason);
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        if (reason) {
            // Warn once per invocation when running without secret
            console.warn('Webhook security:', reason);
        }

        // --- Process payload ---
        const payload = req.body as RecurrenteWebhookPayload;

        switch (payload.event) {
            case 'checkout.completed': {
                const checkoutId = payload.data.id;
                if (checkoutId) {
                    const supabase = getSupabaseAdmin();
                    const { error: updateError } = await supabase
                        .from('reservations')
                        .update({ status: 'paid' })
                        .eq('payment_id', checkoutId);
                    if (updateError) {
                        console.error('Error updating reservation status:', updateError.message);
                    }
                }
                break;
            }

            case 'checkout.expired':
            case 'checkout.failed':
                // Acknowledged — no action needed for now
                break;

            default:
                console.warn('Unhandled webhook event:', payload.event);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error instanceof Error ? error.message : error);
        return res.status(200).json({ received: true });
    }
}
