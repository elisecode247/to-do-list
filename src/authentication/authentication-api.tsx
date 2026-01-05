import { API_AUTH_URL } from "app/constants";
import { AUTH_TOKEN_KEY } from "src/authentication/constants";
// Exchange Google ID token for your backend auth token
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
        if (!data?.token) throw new Error("No auth token returned from server");

        localStorage.setItem(AUTH_TOKEN_KEY, data.token);

    } catch (err) {
        console.error("Failed to authenticate:", err);
        throw new Error("Google authentication failed", { cause: err });
    }
}

export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    return Boolean(getAuthToken());
}
