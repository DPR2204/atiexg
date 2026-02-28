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

// Prevent CSV formula injection: prefix dangerous leading chars with a single quote
function safeCsvText(val: string): string {
    const escaped = val.replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(escaped)) {
        return `"'${escaped}"`;
    }
    return `"${escaped}"`;
}

export function generateReportCSV(rows: ReportRow[], dateFrom: string, dateTo: string) {
    const header = ['ID', 'Tour', 'Fecha', 'Hora', 'Pax', 'Estado', 'Agente', 'Total ($)', 'Pagado ($)', 'Pendiente ($)'];

    const csvRows = rows.map(r => [
        r.id,
        safeCsvText(r.tour_name || ''),
        r.tour_date,
        r.start_time?.slice(0, 5) || '',
        r.pax_count,
        STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]?.label || r.status,
        safeCsvText(r.agent_name || ''),
        r.total_amount.toFixed(2),
        r.paid_amount.toFixed(2),
        (r.total_amount - r.paid_amount).toFixed(2),
    ]);

    const totalAmount = rows.reduce((s, r) => s + r.total_amount, 0);
    const totalPaid = rows.reduce((s, r) => s + r.paid_amount, 0);
    const totalPax = rows.reduce((s, r) => s + r.pax_count, 0);

    csvRows.push([]);
    csvRows.push(['', '', '', '', totalPax, `${rows.length} reservas`, '', totalAmount.toFixed(2), totalPaid.toFixed(2), (totalAmount - totalPaid).toFixed(2)]);

    const bom = '\uFEFF';
    const csv = bom + [header.join(','), ...csvRows.map(r => r.join(','))].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${dateFrom}_${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
