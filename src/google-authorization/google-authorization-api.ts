import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";

interface GoogleAuthCodeResponse {
    code: string;
}

export const connectGoogleCalendar = async (googleClientId: string): Promise<void> => {
    if (!window.google?.accounts.oauth2) {
        console.error("Google API not loaded");
        return;
    }
    window.google.accounts.oauth2.initCodeClient({
        client_id: googleClientId,
        scope: "https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar",
        ux_mode: "popup",
        callback: async ({ code }: GoogleAuthCodeResponse) => {
            await fetch(API_AUTH_URL + "/google/calendar", {
                method: "POST",
                headers: await authHeaders(),
                body: JSON.stringify({ code }),
            });
        },
    }).requestCode();
};

