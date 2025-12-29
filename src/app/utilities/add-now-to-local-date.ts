export function localDateWithNowTime(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const now = new Date();

    return new Date(
        y,
        m - 1,
        d,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    );
}
