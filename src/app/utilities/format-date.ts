export const formatDate = (date: Date) => {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
}

export const formatLongDate = (date: string | Date): string => {
    let parsedDate: Date;

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        parsedDate = new Date(year, month - 1, day);
    } else {
        parsedDate = new Date(date);
    }

    if (Number.isNaN(parsedDate.getTime())) return '';

    return parsedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export const formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
        } else {
            console.warn('Invalid date string provided to formatDateForInput:', date);
            return '';
        }
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
