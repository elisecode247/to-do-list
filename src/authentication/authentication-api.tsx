import { API_AUTH_URL, API_REFRESH_URL } from "app/constants";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRES_KEY } from "src/authentication/constants";

const SKEW_MS = 30_000; // 30s buffer before expiry

export async function loginWithGoogle(token: string): Promise<void> {
    try {
        const response = await fetch(API_AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        if (!data?.accessToken || !data?.refreshToken || !data?.expiresIn) {
            throw new Error("Invalid auth response from server");
        }

        persistTokens(data.accessToken, data.refreshToken, data.expiresIn);
    } catch (err) {
        console.error("Failed to authenticate:", err);
        throw new Error("Google authentication failed", { cause: err });
    }
}

export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
}

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_KEY) || 0);
    if (!expiresAt || Number.isNaN(expiresAt)) {
        logout();
        return false;
    }
    return Boolean(getAuthToken() && Date.now() < expiresAt - SKEW_MS);
}

let refreshPromise: Promise<string | null> | null = null;

export async function getValidAuthToken(): Promise<string | null> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_KEY) || 0);

    if (!expiresAt || Number.isNaN(expiresAt)) {
        logout();
        return null;
    }

    // Return token if still valid
    if (token && Date.now() < expiresAt - SKEW_MS) return token;

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

function persistTokens(access: string, refresh: string, expiresIn: number) {
    localStorage.setItem(AUTH_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(TOKEN_EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
}

export async function refreshAuthToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    const response = await fetch(API_REFRESH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        logout();
        return null;
    }

    try {
        const data = await response.json();
        if (!data?.accessToken || !data?.refreshToken || !data?.expiresIn) {
            throw new Error("Invalid refresh response from server");
        }
        persistTokens(data.accessToken, data.refreshToken, data.expiresIn);
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
