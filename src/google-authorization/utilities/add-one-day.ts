// parameter format 2026-06-16
function addOneDay(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

export { addOneDay };
