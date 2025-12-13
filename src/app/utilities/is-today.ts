export function isToday(date: Date) {
    const today = new Date();
    console.log(today);

    return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )

}
