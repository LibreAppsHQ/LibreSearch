/** Date/time format keys exposed in Appearance settings. */
export type DateTimeFormat = 'mdy12' | 'mdy24' | 'dmy12' | 'dmy24' | 'ymd24';

const pad = (n: number) => String(n).padStart(2, '0');

export interface DateTimeOptions {
	showDate?: boolean;
	showSeconds?: boolean;
}

/** The date portion only, e.g. "5/26/2026". */
export function formatDate(date: Date, format: string): string {
	const Y = date.getFullYear();
	const M = date.getMonth() + 1;
	const D = date.getDate();

	if (format === 'dmy12' || format === 'dmy24') return `${D}/${M}/${Y}`;
	if (format === 'ymd24') return `${Y}-${pad(M)}-${pad(D)}`;
	return `${M}/${D}/${Y}`;
}

/** The time portion only, e.g. "3:04:09 PM" or "15:04". */
export function formatTime(date: Date, format: string, showSeconds = true): string {
	const h24 = date.getHours();
	const min = date.getMinutes();
	const sec = date.getSeconds();
	const secPart = showSeconds ? `:${pad(sec)}` : '';

	const is24h = format === 'mdy24' || format === 'dmy24' || format === 'ymd24';
	if (is24h) return `${pad(h24)}:${pad(min)}${secPart}`;

	const ampm = h24 >= 12 ? 'PM' : 'AM';
	const h12 = h24 % 12 || 12;
	return `${h12}:${pad(min)}${secPart} ${ampm}`;
}

/**
 * Format a Date according to the user's chosen Appearance format,
 * optionally including the date and/or seconds.
 */
export function formatDateTime(date: Date, format: string, opts: DateTimeOptions = {}): string {
	const { showDate = true, showSeconds = true } = opts;
	const timePart = formatTime(date, format, showSeconds);
	if (!showDate) return timePart;
	return `${formatDate(date, format)} · ${timePart}`;
}
