import { STATUS_CONFIG } from '../types/backoffice';

interface ReportRow {
    id: number;
    tour_name: string;
    tour_date: string;
    start_time?: string;
    pax_count: number;
    status: string;
    agent_name: string;
    total_amount: number;
    paid_amount: number;
}

interface ReportStats {
    total: number;
    pending: number;
    confirmed: number;
    revenue: number;
}

interface RankingItem {
    name: string;
    count: number;
    amount?: number;
}

export function generateReportPDF(
    rows: ReportRow[],
    stats: ReportStats,
    topTours: RankingItem[],
    agentRanking: RankingItem[],
    dateFrom: string,
    dateTo: string,
) {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const fmtDate = (d: string) => {
        const dt = new Date(d + 'T12:00:00');
        return dt.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const totalAmount = rows.reduce((s, r) => s + r.total_amount, 0);
    const totalPaid = rows.reduce((s, r) => s + r.paid_amount, 0);
    const totalPending = totalAmount - totalPaid;

    const tableRows = rows.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.tour_name}</td>
            <td>${r.tour_date}</td>
            <td>${r.start_time?.slice(0, 5) || '—'}</td>
            <td style="text-align:center">${r.pax_count}</td>
            <td><span class="badge" style="background:${STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]?.bg};color:${STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]?.color}">${STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]?.label || r.status}</span></td>
            <td>${r.agent_name}</td>
            <td style="text-align:right">$${r.total_amount.toLocaleString()}</td>
            <td style="text-align:right">$${r.paid_amount.toLocaleString()}</td>
        </tr>
    `).join('');

    const tourRankingRows = topTours.map((t, i) => `
        <tr><td>${i + 1}</td><td>${t.name}</td><td style="text-align:center">${t.count}</td></tr>
    `).join('');

    const agentRankingRows = agentRanking.map((a, i) => `
        <tr><td>${i + 1}</td><td>${a.name}</td><td style="text-align:center">${a.count}</td><td style="text-align:right">$${(a.amount || 0).toLocaleString()}</td></tr>
    `).join('');

    const content = `<!DOCTYPE html>
<html>
<head>
    <title>Reporte ${dateFrom} a ${dateTo} - Atitlán EXG</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; color: #21232A; line-height: 1.5; padding: 32px; max-width: 1100px; margin: 0 auto; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; border-bottom: 2px solid #E0E2EB; padding-bottom: 16px; }
        .logo { font-size: 22px; font-weight: 700; } .logo span { color: #8427E0; }
        .meta { text-align: right; font-size: 12px; color: #6B6F7B; }
        .period { font-size: 16px; font-weight: 600; margin-bottom: 24px; color: #21232A; }
        .period span { color: #8427E0; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .kpi { background: #F8FAFF; border: 1px solid #E0E2EB; border-radius: 8px; padding: 16px; text-align: center; }
        .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B6F7B; margin-bottom: 4px; }
        .kpi-value { font-size: 24px; font-weight: 700; color: #21232A; }
        .kpi-value.money { color: #2E7D32; }
        .kpi-value.warn { color: #E65100; }
        h2 { font-size: 14px; font-weight: 600; margin: 24px 0 12px; color: #21232A; border-bottom: 1px solid #E0E2EB; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
        th { text-align: left; padding: 8px 6px; border-bottom: 2px solid #E0E2EB; color: #6B6F7B; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
        td { padding: 7px 6px; border-bottom: 1px solid #F0F2F8; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 500; }
        .totals-row { font-weight: 700; background: #F8FAFF; }
        .rankings { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9496A1; border-top: 1px solid #E0E2EB; padding-top: 16px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Atitlán<span>EXG</span></div>
        <div class="meta">Reporte generado<br>${new Date().toLocaleString('es-GT')}</div>
    </div>

    <div class="period">Periodo: <span>${fmtDate(dateFrom)}</span> — <span>${fmtDate(dateTo)}</span></div>

    <div class="kpi-grid">
        <div class="kpi">
            <div class="kpi-label">Total Reservas</div>
            <div class="kpi-value">${stats.total}</div>
        </div>
        <div class="kpi">
            <div class="kpi-label">Confirmadas</div>
            <div class="kpi-value">${stats.confirmed}</div>
        </div>
        <div class="kpi">
            <div class="kpi-label">Pendientes</div>
            <div class="kpi-value warn">${stats.pending}</div>
        </div>
        <div class="kpi">
            <div class="kpi-label">Ingresos Cobrados</div>
            <div class="kpi-value money">$${stats.revenue.toLocaleString()}</div>
        </div>
    </div>

    <h2>Detalle de Reservas (${rows.length})</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th><th>Tour</th><th>Fecha</th><th>Hora</th><th style="text-align:center">Pax</th><th>Estado</th><th>Agente</th><th style="text-align:right">Total</th><th style="text-align:right">Pagado</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
            <tr class="totals-row">
                <td colspan="4">TOTALES</td>
                <td style="text-align:center">${rows.reduce((s, r) => s + r.pax_count, 0)}</td>
                <td>${rows.length} reservas</td>
                <td></td>
                <td style="text-align:right">$${totalAmount.toLocaleString()}</td>
                <td style="text-align:right">$${totalPaid.toLocaleString()}</td>
            </tr>
        </tbody>
    </table>
    <div style="text-align:right;font-size:13px;font-weight:600;color:${totalPending > 0 ? '#D32F2F' : '#2E7D32'};margin-top:8px;">
        Saldo pendiente: $${totalPending.toLocaleString()}
    </div>

    <div class="rankings">
        <div>
            <h2>Ranking Tours</h2>
            <table>
                <thead><tr><th>#</th><th>Tour</th><th style="text-align:center">Reservas</th></tr></thead>
                <tbody>${tourRankingRows || '<tr><td colspan="3" style="text-align:center;color:#9496A1">Sin datos</td></tr>'}</tbody>
            </table>
        </div>
        <div>
            <h2>Ranking Agentes</h2>
            <table>
                <thead><tr><th>#</th><th>Agente</th><th style="text-align:center">Ventas</th><th style="text-align:right">Monto</th></tr></thead>
                <tbody>${agentRankingRows || '<tr><td colspan="4" style="text-align:center;color:#9496A1">Sin datos</td></tr>'}</tbody>
            </table>
        </div>
    </div>

    <div class="footer">
        <p>Atitlán Experiences &bull; Panajachel, Sololá, Guatemala &bull; atitlanexperiences.com</p>
    </div>

    <script>window.onload = function() { window.print(); window.close(); };</script>
</body>
</html>`;

    doc.open();
    doc.write(content);
    doc.close();

    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
}
