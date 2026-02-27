/**
 * Date utilities — timezone-safe helpers for Guatemala (UTC-6).
 *
 * NEVER use `new Date().toISOString().split('T')[0]` directly — it returns
 * the UTC date, which is wrong after 6 PM local time. Use these helpers instead.
 */

/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
export function localToday(): string {
    return formatLocalDate(new Date());
}

/** Formats any Date object as YYYY-MM-DD in the user's local timezone. */
export function formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
