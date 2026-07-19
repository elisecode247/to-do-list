const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const prefix = `${encodeURIComponent(name)}=`;
    const entries = document.cookie.split(';');

    for (const entry of entries) {
        const trimmed = entry.trim();
        if (trimmed.startsWith(prefix)) {
            return decodeURIComponent(trimmed.slice(prefix.length));
        }
    }

    return null;
}

function setCookie(name: string, value: string) {
    if (typeof document === 'undefined') return;

    document.cookie = [
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
        'Path=/',
        'SameSite=Lax',
        'Secure',
    ].join('; ');
}

export function readPersistentSetting(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const local = localStorage.getItem(key);
        if (local !== null) return local;
    } catch {
        // Ignore storage access issues and fall back to cookies.
    }

    return getCookie(key);
}

export function writePersistentSetting(key: string, value: string) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage access issues and still write cookie fallback.
    }

    setCookie(key, value);
}

export function removePersistentSetting(key: string) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage access issues.
    }

    if (typeof document !== 'undefined') {
        document.cookie = [
            `${encodeURIComponent(key)}=`,
            'Max-Age=0',
            'Path=/',
            'SameSite=Lax',
            'Secure',
        ].join('; ');
    }
}

export async function requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
        return false;
    }

    try {
        if (await navigator.storage.persisted?.()) {
            return true;
        }
        return await navigator.storage.persist();
    } catch {
        return false;
    }
}
