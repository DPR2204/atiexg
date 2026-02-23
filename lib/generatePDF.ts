import { Reservation, MEAL_TYPE_LABELS } from '../types/backoffice';
import { TOURS } from '../data';

export function generateReservationPDF(reservation: Reservation) {
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
        console.error('generateReservationPDF: could not access iframe document');
        document.body.removeChild(iframe);
        return;
    }

    const tour = TOURS.find(t => t.id === reservation.tour_id);
    const total = reservation.total_amount;
    const paid = reservation.paid_amount;
    const pending = total - paid;

    // Get formatted date
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(reservation.tour_date).toLocaleDateString('es-GT', dateOptions);

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reserva #${reservation.id} - Atitlán Experiences</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
                
                body {
                    font-family: 'Poppins', sans-serif;
                    color: #0f172a;
                    line-height: 1.5;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 20px;
                }
                
                .logo {
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                }
                
                .logo span { color: #ef4444; }
                
                .meta {
                    text-align: right;
                    font-size: 14px;
                    color: #64748b;
                }
                
                .title-section {
                    margin-bottom: 30px;
                }
                
                h1 {
                    font-size: 28px;
                    font-weight: 600;
                    margin: 0 0 10px 0;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                    background: #f1f5f9;
                    color: #475569;
                }
                
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }
                
                .info-group h3 {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #94a3b8;
                    margin: 0 0 5px 0;
                }
                
                .info-group p {
                    font-size: 16px;
                    font-weight: 500;
                    margin: 0;
                }
                
                .passengers-section {
                    margin-bottom: 40px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                
                th {
                    text-align: left;
                    padding: 12px 0;
                    border-bottom: 1px solid #e2e8f0;
                    color: #64748b;
                    font-weight: 500;
                }
                
                td {
                    padding: 16px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .meals-tag {
                    display: inline-block;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    margin-right: 5px;
                    margin-bottom: 2px;
                }

                .totals {
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 16px;
                    width: 300px;
                    margin-left: auto;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                
                .total-row.final {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    font-weight: 700;
                    font-size: 18px;
                }
                
                .footer {
                    margin-top: 60px;
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 20px;
                }
                
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">⛵ Atitlán<span>EXG</span></div>
                <div class="meta">
                    Reserva #${reservation.id}<br>
                    Generado: ${new Date().toLocaleString('es-GT')}
                </div>
            </div>
            
            <div class="title-section">
                <span class="status-badge">${reservation.status}</span>
                <h1>${reservation.tour_name}</h1>
                <p>${formattedDate} • ${reservation.start_time}</p>
            </div>
            
            <div class="grid">
                <div class="info-group">
                    <h3>Cliente Principal</h3>
                    <p>${reservation.passengers?.[0]?.full_name || 'Sin nombre'}</p>
                </div>
                <div class="info-group">
                    <h3>Agente</h3>
                    <p>${reservation.agent?.name || 'Sistema'}</p>
                </div>
                <div class="info-group">
                    <h3>Lancha / Capitán</h3>
                    <p>${reservation.boat?.name || 'Pendiente'} / ${reservation.driver?.name || 'Pendiente'}</p>
                </div>
                <div class="info-group">
                    <h3>Guía</h3>
                    <p>${reservation.guide?.name || 'No asignado'}</p>
                </div>
            </div>
            
            <div class="passengers-section">
                <h3>Pasajeros (${reservation.pax_count})</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Edad</th>
                            <th>Documento</th>
                            <th>Alimentación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reservation.passengers?.map(p => `
                            <tr>
                                <td><strong>${p.full_name}</strong></td>
                                <td>${p.age || '-'}</td>
                                <td>${p.id_document || '-'}</td>
                                <td>
                                    ${p.meals?.map(m => `
                                        <div class="meals-tag">
                                            <strong>${MEAL_TYPE_LABELS[m.meal_type]}:</strong> ${m.food_order || 'Estándar'}
                                            ${m.dietary_notes ? `<br><em style="color:#ef4444;font-size:11px">⚠️ ${m.dietary_notes}</em>` : ''}
                                        </div>
                                    `).join('') || (p.food_order || '-')}
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="4">Sin lista de pasajeros</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <div class="totals">
                <div class="total-row">
                    <span>Total</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Pagado / Anticipo</span>
                    <span>$${paid.toFixed(2)}</span>
                </div>
                <div class="total-row final" style="color: ${pending > 0 ? '#ef4444' : '#10b981'}">
                    <span>Pendiente</span>
                    <span>$${pending.toFixed(2)}</span>
                </div>
                ${reservation.payment_url ? `
                    <div style="margin-top: 20px; text-align: center; font-size: 12px; word-break: break-all;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(reservation.payment_url)}" style="width: 100px; margin-bottom: 10px;">
                        <br>
                        Link de pago activo
                    </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>Atitlán Experiences • Panajachel, Sololá, Guatemala • atitlanexperiences.com</p>
                <p>${reservation.notes || ''}</p>
            </div>
        </body>
        </html>
    `;

    doc.open();
    doc.write(content);
    doc.close();

    // Use a reliable delay + afterprint for cleanup instead of window.onload
    // window.onload is unreliable in iframes across browsers
    const printWindow = iframe.contentWindow;
    if (!printWindow) {
        document.body.removeChild(iframe);
        return;
    }

    // Clean up iframe after print dialog closes (or after a generous timeout)
    const cleanup = () => {
        try {
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        } catch (_) { /* already removed */ }
    };

    // Listen for afterprint to clean up gracefully
    printWindow.addEventListener('afterprint', cleanup);

    // Fallback cleanup after 60 seconds in case afterprint never fires
    const fallbackTimer = setTimeout(cleanup, 60000);

    // Give the browser time to render the content and load fonts, then print
    setTimeout(() => {
        try {
            printWindow.focus();
            printWindow.print();
        } catch (e) {
            console.error('generateReservationPDF: print failed', e);
            clearTimeout(fallbackTimer);
            cleanup();
        }
    }, 800);
}
