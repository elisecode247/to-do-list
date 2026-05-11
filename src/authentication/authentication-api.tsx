import { API_AUTH_URL, API_REFRESH_URL } from "app/constants";

const SKEW_MS = 30_000; // 30s buffer before expiry
let accessToken: string | null = null;
let expiresAtMs: number | null = null;

export async function loginWithGoogle(token: string): Promise<{email?: string}> {
    try {
        const response = await fetch(API_AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        if (!data?.accessToken || !data?.expiresIn || !data?.email) {
            throw new Error("Invalid auth response from server");
        }

        persistTokens(data.accessToken, data.expiresIn, data.email);
        return { email: data.email };
    } catch (err) {
        console.error("Failed to authenticate:", err);
        throw new Error("Google authentication failed", { cause: err });
    }
}

export async function logout(): Promise<void> {
    accessToken = null;
    expiresAtMs = null;
    localStorage.removeItem("email");
    await fetch(`${API_AUTH_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
}

export function getAuthToken(): string | null {
    return accessToken;
}

export function isAuthenticated(): boolean {
    if (!expiresAtMs || Number.isNaN(expiresAtMs)) {
        logout();
        return false;
    }
    return Boolean(getAuthToken() && Date.now() < expiresAtMs - SKEW_MS);
}

let refreshPromise: Promise<string | null> | null = null;

export async function getValidAuthToken(): Promise<string | null> {
    const token = accessToken;

    if (!expiresAtMs || Number.isNaN(expiresAtMs)) {
        // On page reload, expiry is null in memory. Try refresh via cookie.
        if (!refreshPromise) {
            refreshPromise = refreshAuthToken().finally(() => {
                refreshPromise = null;
            });
        }
        return refreshPromise.then(token => {
            if (!token) logout();
            return token;
        });
    }

    // Return token if still valid
    if (token && Date.now() < expiresAtMs - SKEW_MS) return token;

    // Only one refresh in progress at a time
    if (!refreshPromise) {
        refreshPromise = refreshAuthToken().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise.then(token => {
        if (!token) logout();
        return token;
    });
}

function persistTokens(access: string, expiresIn: number, email: string): void {
    accessToken = access;
    expiresAtMs = Date.now() + expiresIn * 1000;
    localStorage.setItem("email", email);
}

export async function refreshAuthToken(): Promise<string | null> {
    const response = await fetch(API_REFRESH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!response.ok) {
        // 401 is expected when user is logged out (no refresh token cookie)
        if (response.status !== 401) {
            console.error(`Refresh token request failed: ${response.status} ${response.statusText}`);
        }
        logout();
        return null;
    }

    try {
        const data = await response.json();
        if (!data?.accessToken || !data?.expiresIn) {
            throw new Error("Invalid refresh response from server");
        }
        persistTokens(data.accessToken, data.expiresIn, data.email ?? localStorage.getItem("email") ?? "");
        return data.accessToken;
    } catch {
        logout();
        return null;
    }
}


export async function authHeaders(): Promise<HeadersInit> {
    const token = await getValidAuthToken();
    if (!token) {
        logout();
        throw new Error("No valid auth token available");
    }
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}
