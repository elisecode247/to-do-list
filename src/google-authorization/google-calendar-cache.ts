const CACHE_KEY = "googleCalendarStatus";
const TTL = 5 * 60 * 1000; // 5 minutes

type CacheValue = {
    connected: boolean;
    timestamp: number;
};

export function readCalendarCache(): boolean | null {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    try {
        const parsed: CacheValue = JSON.parse(raw);
        if (Date.now() - parsed.timestamp > TTL) return null;
        return parsed.connected;
    } catch {
        return null;
    }
}

export function writeCalendarCache(connected: boolean) {
    localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ connected, timestamp: Date.now() })
    );
}

export function clearCalendarCache() {
    localStorage.removeItem(CACHE_KEY);
}
