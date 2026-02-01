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
    setHeader: (name: string, value: string) => VercelResponse;
    end: () => void;
}

const RECURRENTE_API_URL = 'https://app.recurrente.com/api';

interface CheckoutRequestBody {
    tourId: string;
    tourName: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    selectedItems: string[];
    depositAmount?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            tourId,
            tourName,
            customerEmail,
            customerName,
            customerPhone,
            selectedItems,
            depositAmount = 50,
        } = req.body as CheckoutRequestBody;

        // Validate required fields
        if (!tourId || !tourName || !customerEmail || !customerName) {
            return res.status(400).json({
                error: 'Missing required fields: tourId, tourName, customerEmail, customerName'
            });
        }

        const publicKey = process.env.RECURRENTE_PUBLIC_KEY;
        const secretKey = process.env.RECURRENTE_SECRET_KEY;

        if (!publicKey || !secretKey) {
            console.error('Missing Recurrente API keys');
            return res.status(500).json({ error: 'Payment service not configured' });
        }

        // Build description for the checkout
        const description = selectedItems && selectedItems.length > 0
            ? `Anticipo: ${tourName} + ${selectedItems.length} add-ons`
            : `Anticipo: ${tourName}`;

        // Create checkout session with Recurrente
        const checkoutResponse = await fetch(`${RECURRENTE_API_URL}/checkouts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PUBLIC-KEY': publicKey,
                'X-SECRET-KEY': secretKey,
            },
            body: JSON.stringify({
                items: [
                    {
                        name: description,
                        currency: 'USD',
                        amount_in_cents: depositAmount * 100, // Convert to cents
                        quantity: 1,
                        image_url: 'https://atitlanexperiences.com/logo.png',
                    },
                ],
                success_url: `${process.env.SITE_URL || 'https://atitlanexperiences.com'}/pago-exitoso?session_id={CHECKOUT_ID}`,
                cancel_url: `${process.env.SITE_URL || 'https://atitlanexperiences.com'}/catalogo`,
                user_email: customerEmail,
                metadata: {
                    tourId,
                    tourName,
                    customerName,
                    customerPhone: customerPhone || '',
                    selectedItems: JSON.stringify(selectedItems || []),
                },
            }),
        });

        if (!checkoutResponse.ok) {
            const errorData = await checkoutResponse.text();
            console.error('Recurrente API error:', errorData);
            return res.status(500).json({ error: 'Failed to create checkout session' });
        }

        const checkoutData = await checkoutResponse.json();

        return res.status(200).json({
            success: true,
            checkoutUrl: checkoutData.checkout_url,
            checkoutId: checkoutData.id,
        });

    } catch (error) {
        console.error('Checkout error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
