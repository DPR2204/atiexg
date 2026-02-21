/**
 * Calendar integration utilities for guest portal.
 * Generates .ics files and links for Google Calendar / Outlook.
 */

interface CalendarEventParams {
    title: string;
    date: string;       // YYYY-MM-DD
    startTime?: string; // HH:MM or HH:MM:SS
    durationHours?: number;
    description?: string;
    location?: string;
}

/** Convert date + time to ICS-compatible UTC-ish timestamp (YYYYMMDDTHHMMSS) */
function toICSDate(date: string, time?: string): string {
    const [y, m, d] = date.split('-');
    if (!time) return `${y}${m}${d}`;
    const [h, min] = time.split(':');
    return `${y}${m}${d}T${h.padStart(2, '0')}${min.padStart(2, '0')}00`;
}

/** Pad hours to a time offset for end-time calculation */
function addHours(date: string, time: string, hours: number): string {
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time.split(':').map(Number);
    const dt = new Date(y, m - 1, d, h + hours, min);
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, '0');
    const nd = String(dt.getDate()).padStart(2, '0');
    const nh = String(dt.getHours()).padStart(2, '0');
    const nmin = String(dt.getMinutes()).padStart(2, '0');
    return `${ny}${nm}${nd}T${nh}${nmin}00`;
}

/**
 * Generate a downloadable .ics file content string.
 */
export function generateICS(params: CalendarEventParams): string {
    const { title, date, startTime, durationHours = 4, description, location } = params;

    const dtStart = toICSDate(date, startTime || '08:00');
    const dtEnd = addHours(date, startTime || '08:00', durationHours);
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@atitlanexperiences.com`;

    // Escape special ICS characters
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Atitlan Experiences//Guest Portal//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${esc(title)}`,
        ...(description ? [`DESCRIPTION:${esc(description)}`] : []),
        ...(location ? [`LOCATION:${esc(location)}`] : []),
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ];

    return lines.join('\r\n');
}

/**
 * Download an .ics file in the browser.
 */
export function downloadICS(params: CalendarEventParams): void {
    const icsContent = generateICS(params);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reserva-atitlan.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Generate a Google Calendar "add event" URL.
 */
export function googleCalendarUrl(params: CalendarEventParams): string {
    const { title, date, startTime, durationHours = 4, description, location } = params;

    const dtStart = toICSDate(date, startTime || '08:00');
    const dtEnd = addHours(date, startTime || '08:00', durationHours);

    const searchParams = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${dtStart}/${dtEnd}`,
        ...(description ? { details: description } : {}),
        ...(location ? { location } : {}),
    });

    return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}

/**
 * Generate an Outlook.com "add event" URL.
 */
export function outlookCalendarUrl(params: CalendarEventParams): string {
    const { title, date, startTime, durationHours = 4, description, location } = params;

    const [y, m, d] = date.split('-');
    const [h, min] = (startTime || '08:00').split(':');
    const startISO = `${y}-${m}-${d}T${h.padStart(2, '0')}:${min.padStart(2, '0')}:00`;

    const endDt = new Date(Number(y), Number(m) - 1, Number(d), Number(h) + durationHours, Number(min));
    const endISO = `${endDt.getFullYear()}-${String(endDt.getMonth() + 1).padStart(2, '0')}-${String(endDt.getDate()).padStart(2, '0')}T${String(endDt.getHours()).padStart(2, '0')}:${String(endDt.getMinutes()).padStart(2, '0')}:00`;

    const searchParams = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: title,
        startdt: startISO,
        enddt: endISO,
        ...(description ? { body: description } : {}),
        ...(location ? { location } : {}),
    });

    return `https://outlook.live.com/calendar/0/action/compose?${searchParams.toString()}`;
}
