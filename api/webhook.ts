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
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body as RecurrenteWebhookPayload;

        // Log the webhook for debugging (remove in production)
        console.log('Webhook received:', JSON.stringify(payload, null, 2));

        // Handle different event types
        switch (payload.event) {
            case 'checkout.completed':
                // Payment was successful
                console.log('Payment completed:', {
                    id: payload.data.id,
                    amount: payload.data.amount_in_cents / 100,
                    email: payload.data.user_email,
                    metadata: payload.data.metadata,
                });

                // TODO: In the future, you could:
                // - Send confirmation email
                // - Save to database (Firebase)
                // - Notify via WhatsApp API
                break;

            case 'checkout.expired':
                console.log('Checkout expired:', payload.data.id);
                break;

            case 'checkout.failed':
                console.log('Payment failed:', payload.data.id);
                break;

            default:
                console.log('Unhandled event:', payload.event);
        }

        // Always return 200 to acknowledge receipt
        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        // Still return 200 to prevent retries
        return res.status(200).json({ received: true, error: 'Processing error' });
    }
}
