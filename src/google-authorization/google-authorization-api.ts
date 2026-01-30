interface GoogleAuthCodeResponse {
    code: string;
}

export const connectGoogleCalendar = (googleClientId: string, accessToken: string): void => {
    if (!window.google?.accounts.oauth2) {
        console.error("Google API not loaded");
        return;
    }
    window.google.accounts.oauth2.initCodeClient({
        client_id: googleClientId,
        scope: "https://www.googleapis.com/auth/calendar.events",
        ux_mode: "popup",
        callback: async ({ code }: GoogleAuthCodeResponse) => {
            await fetch("/auth/google/calendar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ code }),
            });
        },
    }).requestCode();
};

