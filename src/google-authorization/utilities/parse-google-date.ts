/**
 * Helper to parse date strings correctly, handling date-only formats (YYYY-MM-DD)
 */
export function parseGoogleDate(dateString: string): Date {
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(datePattern);

    if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(match[3], 10);
        return new Date(year, month, day);
    }

    return new Date(dateString);
}
