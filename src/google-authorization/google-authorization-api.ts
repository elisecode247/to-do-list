import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { GOOGLE_CALENDAR_SCOPE_REQUEST } from "./google-calendar-scopes";

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
        scope: GOOGLE_CALENDAR_SCOPE_REQUEST,
        include_granted_scopes: false,
        ux_mode: "popup",
        callback: async ({ code }: GoogleAuthCodeResponse) => {
            const response = await fetch(API_AUTH_URL + "/google/calendar", {
                method: "POST",
                headers: await authHeaders(),
                body: JSON.stringify({ code }),
            });
            if (!response.ok) {
                throw new Error(`Google Calendar connection failed: ${response.status}`);
            }
        },
    }).requestCode();
};
