// Returns local datetime string with timezone offset, e.g. 2026-06-08T00:30:00-07:00.
export const formatGoogleEventDateTime = (date: string, time: string): string => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes, 0, 0);

    const offsetMinutes = -dateObj.getTimezoneOffset();
    const offsetSign = offsetMinutes >= 0 ? '+' : '-';
    const absoluteOffsetMinutes = Math.abs(offsetMinutes);
    const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(2, '0');
    const offsetMins = String(absoluteOffsetMinutes % 60).padStart(2, '0');

    const yyyy = String(dateObj.getFullYear());
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const ss = String(dateObj.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${offsetSign}${offsetHours}:${offsetMins}`;
};
