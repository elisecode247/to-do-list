export function getDaysFromNow(date1: Date) {
    const now = new Date();
  // Convert both dates to UTC timestamps to avoid time zone issues
  const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utcDate2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const millisecondsPerDay = 1000 * 60 * 60 * 24; // 86,400,000
  const timeDifferenceMs = Math.abs(utcDate2 - utcDate1); // Absolute difference
  const daysDifference = Math.floor(timeDifferenceMs / millisecondsPerDay);

  if (daysDifference === 0) return 'Today';
  if (daysDifference === 1) return 'Yesterday';
  return `${daysDifference} days ago`;
}
