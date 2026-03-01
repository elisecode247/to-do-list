/**
 * Checks if a given date string represents "tomorrow" in the user's local time zone.
 * @param {string} dateString - The ISO date string (e.g., "2025-10-05T14:48:00Z").
 * @returns {boolean}
 */
export function isDateTomorrow(dateString: string | Date | undefined): boolean {
    if (!dateString) return false;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const inputDate = new Date(dateString);

    if (isNaN(inputDate.getTime())) {
        console.error("Invalid date string provided.");
        return false;
    }
    return inputDate.toDateString() === tomorrow.toDateString();

}
