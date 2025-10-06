import { format, parse, parseISO, isValid } from "date-fns";

/**
 * Format a date for display as dd.MM.yyyy
 * Returns empty string for null/undefined/invalid dates
 */
export function formatDate(d?: string | Date | null): string {
    if (!d) return "";

    try {
        const date = normalizeToDate(d);
        if (!date || !isValid(date)) return "";
        return format(date, "dd.MM.yyyy");
    } catch {
        return "";
    }
}

/**
 * Format a date for API submission as yyyy-MM-dd
 * Returns undefined for null/undefined/invalid dates
 */
export function toApiDate(d?: Date | null): string | undefined {
    if (!d) return undefined;

    try {
        if (!isValid(d)) return undefined;
        return format(d, "yyyy-MM-dd");
    } catch {
        return undefined;
    }
}

/**
 * Parse a dd.MM.yyyy string to Date
 * Returns null for invalid inputs
 */
export function parseDate(value: string): Date | null {
    if (!value) return null;

    try {
        const parsed = parse(value, "dd.MM.yyyy", new Date());
        return isValid(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Convert API date string (yyyy-MM-dd or ISO) to Date
 * Returns null for invalid inputs
 */
export function fromApiDate(value?: string | null): Date | null {
    if (!value) return null;

    try {
        const trimmed = value.trim();
        if (!trimmed) return null;

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const parsed = parse(trimmed, "yyyy-MM-dd", new Date());
            return isValid(parsed) ? parsed : null;
        }

        const parsed = parseISO(trimmed);
        return isValid(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function normalizeToDate(d: string | Date): Date | null {
    if (d instanceof Date) {
        return d;
    }

    const trimmed = d.trim();
    if (!trimmed) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const parsed = parse(trimmed, "yyyy-MM-dd", new Date());
        return isValid(parsed) ? parsed : null;
    }

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
        const parsed = parse(trimmed, "dd.MM.yyyy", new Date());
        return isValid(parsed) ? parsed : null;
    }

    const parsed = parseISO(trimmed);
    if (isValid(parsed)) {
        return parsed;
    }

    const fallback = new Date(trimmed);
    return isValid(fallback) ? fallback : null;
}
