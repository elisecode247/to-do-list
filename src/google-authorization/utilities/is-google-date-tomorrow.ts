/**
 * Checks if a given date string represents "tomorrow" in the user's local time zone.
 * Parses dateString for 2026-05-10T14:00:00-08:00 or 2026-05-10T22:00:00.000Z or 2026-05-10 formats, and compares to tomorrow's date.
 * Google shows date in format "2026-05-10" for all-day events, so we need to handle that case as well.
 * @param {string} dateString - The ISO date string (e.g., "2025-10-05T14:48:00Z" or "2025-10-05").
 * @returns {boolean}
 */

export function isGoogleDateTomorrow(dateString: string): boolean {
    if (!dateString) return false;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parse the date string, handling both ISO date (YYYY-MM-DD) and datetime formats
    const inputDate = new Date(dateString);

    if (isNaN(inputDate.getTime())) {
        return false;
    }

    // For date-only strings (like "2026-03-01"), JavaScript parses them as UTC midnight.
    // We need to extract just the date parts to compare correctly.
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})/;
    const match = dateString.match(datePattern);

    if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(match[3], 10);

        const parsedDate = new Date(year, month, day);
        const tomorrowNormalized = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

        return parsedDate.getTime() === tomorrowNormalized.getTime();
    }

    // Fallback to string comparison if date doesn't match the pattern
    return inputDate.toDateString() === tomorrow.toDateString();
}
