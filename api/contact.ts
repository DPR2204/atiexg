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

const ALLOWED_ORIGINS = [
    'https://atitlanexperience.com',
    'https://www.atitlanexperience.com',
    'https://en.atitlanexperience.com',
    'https://atitlanexperiences.com',
];

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
    const origin = (req.headers.origin as string) || '';
    if (ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

interface ContactRequestBody {
    name: string;
    email: string;
    phone: string;
    tourInterest: string;
    travelDate?: string;
    pax?: number;
    message?: string;
}

function buildNotificationEmail(data: ContactRequestBody): string {
    const {
        name,
        email,
        phone,
        tourInterest,
        travelDate,
        pax,
        message,
    } = data;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a3d 100%); padding:28px 32px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">Nueva Consulta de Contacto</h1>
                            <p style="margin:8px 0 0; color:#d1e7dd; font-size:14px;">Atitl&aacute;n Experiences</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:12px 16px; background-color:#f8fafc; border-radius:8px; margin-bottom:8px;">
                                        <p style="margin:0 0 4px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Nombre</p>
                                        <p style="margin:0; font-size:16px; color:#1e293b; font-weight:500;">${escapeHtml(name)}</p>
                                    </td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px; background-color:#f8fafc; border-radius:8px;">
                                        <p style="margin:0 0 4px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Correo electr&oacute;nico</p>
                                        <p style="margin:0; font-size:16px; color:#1e293b; font-weight:500;">
                                            <a href="mailto:${escapeHtml(email)}" style="color:#2563eb; text-decoration:none;">${escapeHtml(email)}</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px; background-color:#f8fafc; border-radius:8px;">
                                        <p style="margin:0 0 4px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Tel&eacute;fono</p>
                                        <p style="margin:0; font-size:16px; color:#1e293b; font-weight:500;">${escapeHtml(phone)}</p>
                                    </td>
                                </tr>
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px; background-color:#e0f2fe; border-radius:8px; border-left:4px solid #0284c7;">
                                        <p style="margin:0 0 4px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Tour de inter&eacute;s</p>
                                        <p style="margin:0; font-size:16px; color:#1e293b; font-weight:600;">${escapeHtml(tourInterest)}</p>
                                    </td>
                                </tr>
                                ${travelDate ? `
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px; background-color:#f8fafc; border-radius:8px;">
                                        <p style="margin:0 0 4px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Fecha de viaje</p>
                                        <p style="margin:0; font-size:16px; color:#1e293b; font-weight:500;">${escapeHtml(travelDate)}</p>
                                    </td>
                                </tr>
                                ` : ''}
                                ${pax ? `
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px; background-color:#f8fafc; border-radius:8px;">
                                        <p style="margin:0 0 4px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">N&uacute;mero de personas</p>
                                        <p style="margin:0; font-size:16px; color:#1e293b; font-weight:500;">${pax}</p>
                                    </td>
                                </tr>
                                ` : ''}
                                ${message ? `
                                <tr><td style="height:8px;"></td></tr>
                                <tr>
                                    <td style="padding:12px 16px; background-color:#f8fafc; border-radius:8px;">
                                        <p style="margin:0 0 4px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Mensaje</p>
                                        <p style="margin:0; font-size:15px; color:#1e293b; line-height:1.6;">${escapeHtml(message)}</p>
                                    </td>
                                </tr>
                                ` : ''}
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:20px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
                            <p style="margin:0; font-size:13px; color:#94a3b8;">Este correo fue generado autom&aacute;ticamente desde el formulario de contacto de atitlanexperiences.com</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

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
            name,
            email,
            phone,
            tourInterest,
            travelDate,
            pax,
            message,
        } = req.body as ContactRequestBody;

        // Validate required fields
        if (!name || !email || !phone || !tourInterest) {
            return res.status(400).json({
                error: 'Missing required fields: name, email, phone, tourInterest'
            });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const warnings: string[] = [];
        let supabaseSaved = false;
        let emailSent = false;

        // --- Step 1: Save to Supabase ---
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
            try {
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseServiceKey,
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'Prefer': 'return=minimal',
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        tour_interest: tourInterest,
                        travel_date: travelDate || null,
                        pax: pax || null,
                        message: message || null,
                    }),
                });

                if (!insertResponse.ok) {
                    const errorText = await insertResponse.text();
                    console.error('Supabase insert error:', errorText);
                    warnings.push('Failed to save submission to database');
                } else {
                    supabaseSaved = true;
                }
            } catch (dbError) {
                console.error('Supabase connection error:', dbError);
                warnings.push('Failed to connect to database');
            }
        } else {
            console.warn('Supabase environment variables not configured');
            warnings.push('Database not configured');
        }

        // --- Step 2: Send notification email via Resend ---
        const resendApiKey = process.env.RESEND_API_KEY;

        if (resendApiKey) {
            try {
                const emailHtml = buildNotificationEmail({
                    name,
                    email,
                    phone,
                    tourInterest,
                    travelDate,
                    pax,
                    message,
                });

                const resendResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${resendApiKey}`,
                    },
                    body: JSON.stringify({
                        from: 'Atitlán Experiences <noreply@atitlanexperience.com>',
                        to: ['hola@atitlancafe.com'],
                        subject: `Nueva consulta: ${tourInterest} - ${name}`,
                        reply_to: email,
                        html: emailHtml,
                    }),
                });

                if (!resendResponse.ok) {
                    const errorText = await resendResponse.text();
                    console.error('Resend API error:', errorText);
                    warnings.push('Failed to send notification email');
                } else {
                    emailSent = true;
                }
            } catch (emailError) {
                console.error('Resend connection error:', emailError);
                warnings.push('Failed to connect to email service');
            }
        } else {
            console.warn('RESEND_API_KEY not configured');
            warnings.push('Email service not configured');
        }

        // If neither service worked, return an error
        if (!supabaseSaved && !emailSent) {
            return res.status(500).json({
                error: 'Failed to process contact submission',
                warnings,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Contact submission received successfully',
            ...(warnings.length > 0 && { warnings }),
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
